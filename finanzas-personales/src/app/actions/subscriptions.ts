"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { todayInBogota } from "@/lib/subscriptions";

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  return { supabase, user };
}

export async function getSubscriptions() {
  const { supabase, user } = await requireUser();
  const { data, error } = await supabase
    .from("recurring_payments")
    .select("*, categories(name, icon)")
    .eq("user_id", user.id)
    .order("due_day");
  if (error) throw error;
  return data ?? [];
}

export async function createSubscription(input: {
  name: string;
  amount: number;
  due_day: number;
  category_id: string;
  notify_hour: number;
}) {
  const { supabase, user } = await requireUser();
  // Si el día de este mes ya pasó, el ciclo arranca en el mes siguiente
  // en vez de aparecer como "vencido" recién creado.
  const today = todayInBogota();
  const alreadyPassed = input.due_day < Number(today.slice(8, 10));
  const { error } = await supabase.from("recurring_payments").insert({
    ...input,
    user_id: user.id,
    last_paid_on: alreadyPassed ? today : null,
  });
  if (error) throw error;
  revalidatePath("/subscriptions");
}

export async function updateNotifyHour(id: string, notifyHour: number) {
  const { supabase, user } = await requireUser();
  const { error } = await supabase
    .from("recurring_payments")
    .update({ notify_hour: notifyHour })
    .eq("id", id)
    .eq("user_id", user.id);
  if (error) throw error;
  revalidatePath("/subscriptions");
}

export async function deleteSubscription(id: string) {
  const { supabase, user } = await requireUser();
  const { error } = await supabase
    .from("recurring_payments")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);
  if (error) throw error;
  revalidatePath("/subscriptions");
}

/** Marca el pago del mes y lo registra como gasto en el libro. */
export async function markSubscriptionPaid(id: string) {
  const { supabase, user } = await requireUser();
  const { data: sub, error: readError } = await supabase
    .from("recurring_payments")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();
  if (readError) throw readError;

  const today = todayInBogota();
  const { error: txError } = await supabase.from("transactions").insert({
    user_id: user.id,
    category_id: sub.category_id,
    type: "expense",
    amount: sub.amount,
    description: sub.name,
    date: today,
  });
  if (txError) throw txError;

  const { error } = await supabase
    .from("recurring_payments")
    .update({ last_paid_on: today })
    .eq("id", id)
    .eq("user_id", user.id);
  if (error) throw error;

  revalidatePath("/");
  revalidatePath("/summary");
  revalidatePath("/transactions");
  revalidatePath("/subscriptions");
}

export async function savePushSubscription(sub: {
  endpoint: string;
  p256dh: string;
  auth: string;
}) {
  const { supabase, user } = await requireUser();
  const { error } = await supabase
    .from("push_subscriptions")
    .upsert({ ...sub, user_id: user.id }, { onConflict: "endpoint" });
  if (error) throw error;
}
