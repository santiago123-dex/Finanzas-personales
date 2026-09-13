"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

type TransactionInsert = Database["public"]["Tables"]["transactions"]["Insert"];
type TransactionUpdate = Database["public"]["Tables"]["transactions"]["Update"];

type SummaryRow = {
  amount: number | string;
  type: string;
  categories: unknown;
};

function summarize(rows: SummaryRow[]) {
  const totalExpenses =
    rows
      ?.filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + Number(t.amount), 0) ?? 0;

  const totalIncome =
    rows
      ?.filter((t) => t.type === "income")
      .reduce((sum, t) => sum + Number(t.amount), 0) ?? 0;

  const expensesByCategory = rows
    ?.filter((t) => t.type === "expense")
    .reduce(
      (acc, t) => {
        const cat = t.categories as unknown as {
          name: string;
          icon: string;
          color: string;
        };
        const key = cat.name;
        if (!acc[key]) {
          acc[key] = {
            name: key,
            icon: cat.icon,
            color: cat.color,
            total: 0,
          };
        }
        acc[key].total += Number(t.amount);
        return acc;
      },
      {} as Record<
        string,
        { name: string; icon: string; color: string; total: number }
      >
    );

  return {
    totalExpenses,
    totalIncome,
    balance: totalIncome - totalExpenses,
    expensesByCategory: Object.values(
      (expensesByCategory ?? {}) as Record<
        string,
        { name: string; icon: string; color: string; total: number }
      >
    ),
  };
}

function monthRange(year?: number, month?: number) {
  const now = new Date();
  const targetYear = year ?? now.getFullYear();
  const targetMonth = month ?? now.getMonth() + 1;

  const startDate = `${targetYear}-${String(targetMonth).padStart(2, "0")}-01`;
  const endDate = new Date(targetYear, targetMonth, 0).toISOString().split("T")[0];
  return { startDate, endDate };
}

export async function getTransactions(year?: number, month?: number) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  const { startDate, endDate } = monthRange(year, month);

  const { data, error } = await supabase
    .from("transactions")
    .select("*, categories(name, icon, color)")
    .eq("user_id", user.id)
    .gte("date", startDate)
    .lte("date", endDate)
    .order("date", { ascending: false });

  if (error) throw error;
  return data;
}

export async function getMonthlySummary(year?: number, month?: number) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  const { startDate, endDate } = monthRange(year, month);

  const { data, error } = await supabase
    .from("transactions")
    .select("amount, type, categories(name, icon, color)")
    .eq("user_id", user.id)
    .gte("date", startDate)
    .lte("date", endDate);

  if (error) throw error;

  return summarize(data ?? []);
}

/**
 * Datos de la home en UNA sola query: antes eran 2 roundtrips
 * (getMonthlySummary + getTransactions, cada uno con su propio
 * getUser). En el arranque de la PWA eso duplicaba la espera.
 */
export async function getDashboardData(year?: number, month?: number) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  const { startDate, endDate } = monthRange(year, month);

  const { data, error } = await supabase
    .from("transactions")
    .select("*, categories(name, icon, color)")
    .eq("user_id", user.id)
    .gte("date", startDate)
    .lte("date", endDate)
    .order("date", { ascending: false });

  if (error) throw error;

  return {
    summary: summarize(data ?? []),
    recent: (data ?? []).slice(0, 5),
  };
}

export async function createTransaction(
  transaction: Omit<TransactionInsert, "user_id">
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase.from("transactions").insert({
    ...transaction,
    user_id: user.id,
  });

  if (error) throw error;
  revalidatePath("/");
  revalidatePath("/summary");
}

export async function updateTransaction(id: string, transaction: TransactionUpdate) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase
    .from("transactions")
    .update(transaction)
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) throw error;
  revalidatePath("/");
  revalidatePath("/summary");
}

export async function deleteTransaction(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase
    .from("transactions")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) throw error;
  revalidatePath("/");
  revalidatePath("/summary");
}
