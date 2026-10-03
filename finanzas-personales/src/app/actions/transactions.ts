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

function cumulativeBalance(rows: Pick<SummaryRow, "amount" | "type">[]) {
  return rows.reduce(
    (sum, t) =>
      sum + (t.type === "income" ? Number(t.amount) : -Number(t.amount)),
    0
  );
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

  // Traemos todo el historial hasta fin del mes pedido para que el saldo
  // sea acumulado y no se reinicie a cero cada mes.
  const { data, error } = await supabase
    .from("transactions")
    .select("amount, type, date, categories(name, icon, color)")
    .eq("user_id", user.id)
    .lte("date", endDate);

  if (error) throw error;

  const rows = data ?? [];
  const monthlyRows = rows.filter((t) => t.date >= startDate);
  const monthly = summarize(monthlyRows);

  return {
    ...monthly,
    balance: cumulativeBalance(rows),
  };
}

/**
 * Datos de la home en UNA sola query: trae el historial acumulado hasta
 * fin del mes pedido y deriva en JS el resumen mensual + saldo total.
 * Así el saldo no se reinicia cada mes: solo baja si gastás.
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
    .lte("date", endDate)
    .order("date", { ascending: false });

  if (error) throw error;

  const rows = data ?? [];
  const monthlyRows = rows.filter((t) => t.date >= startDate);
  const monthly = summarize(monthlyRows);

  return {
    summary: {
      ...monthly,
      balance: cumulativeBalance(rows),
    },
    recent: monthlyRows.slice(0, 5),
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
