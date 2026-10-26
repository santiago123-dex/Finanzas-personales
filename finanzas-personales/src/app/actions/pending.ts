"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { hashBankToken, newBankToken } from "@/lib/bank-token";
import { parseBankText } from "@/lib/parse-bank-text";

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  return { supabase, user };
}

export async function getPending() {
  const { supabase, user } = await requireUser();
  const { data, error } = await supabase
    .from("pending_transactions")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function countPending() {
  const { supabase, user } = await requireUser();
  const { count } = await supabase
    .from("pending_transactions")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id);
  return count ?? 0;
}

/** Pegar a mano el texto de una notificación o correo del banco. */
export async function addPendingFromText(text: string) {
  const { supabase, user } = await requireUser();
  const parsed = parseBankText(text);
  if (!parsed) return { ok: false as const, error: "No encontré un monto en el texto" };

  const { error } = await supabase.from("pending_transactions").insert({
    user_id: user.id,
    type: parsed.type,
    amount: parsed.amount,
    description: parsed.description,
    raw_text: text.slice(0, 2000),
  });
  if (error) throw error;
  revalidatePath("/pending");
  return { ok: true as const };
}

export async function confirmPending(
  id: string,
  data: {
    type: "expense" | "income";
    amount: number;
    description: string;
    category_id: string;
    date: string;
  }
) {
  const { supabase, user } = await requireUser();

  const { error: insertError } = await supabase
    .from("transactions")
    .insert({ ...data, user_id: user.id });
  if (insertError) throw insertError;

  const { error } = await supabase
    .from("pending_transactions")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);
  if (error) throw error;

  revalidatePath("/");
  revalidatePath("/summary");
  revalidatePath("/transactions");
  revalidatePath("/pending");
}

export async function discardPending(id: string) {
  const { supabase, user } = await requireUser();
  const { error } = await supabase
    .from("pending_transactions")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);
  if (error) throw error;
  revalidatePath("/pending");
}

/** Genera (o reemplaza) el token del Atajo. Se devuelve una sola vez. */
export async function generateBankToken() {
  const { supabase, user } = await requireUser();
  const token = newBankToken();
  const { error } = await supabase
    .from("bank_tokens")
    .upsert({ user_id: user.id, token_hash: hashBankToken(token) });
  if (error) throw error;
  return token;
}
