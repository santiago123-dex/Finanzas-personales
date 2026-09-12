"use client";

import { useState, useEffect } from "react";
import { getMonthlySummary } from "@/app/actions/transactions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageShell } from "@/components/layout/page-shell";
import {
  TrendingDown,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { format, subMonths, addMonths } from "date-fns";
import { es } from "date-fns/locale";
import { formatCurrency } from "@/lib/format";

type CategorySummary = { name: string; icon: string; color: string; total: number };
type MonthlyData = {
  totalExpenses: number;
  totalIncome: number;
  balance: number;
  expensesByCategory: CategorySummary[];
};

function PieChart({ data }: { data: CategorySummary[] }) {
  const total = data.reduce((sum, d) => sum + d.total, 0);
  if (total === 0) return null;

  const sorted = [...data].sort((a, b) => b.total - a.total);
  const percents = sorted.map((item) => (item.total / total) * 100);
  const segments = sorted.map((item, i) => ({
    item,
    percent: percents[i],
    offset: percents.slice(0, i).reduce((sum, p) => sum + p, 0),
  }));

  return (
    <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-start">
      <div className="relative h-40 w-40 shrink-0 sm:h-36 sm:w-36">
        <svg viewBox="0 0 36 36" className="cat-swatch h-full w-full -rotate-90">
          {segments.map(({ item, percent, offset }, i) => (
            <circle
              key={i}
              cx="18"
              cy="18"
              r="15.915"
              fill="none"
              stroke={item.color}
              strokeWidth="3.2"
              strokeLinecap="round"
              strokeDasharray={`${percent} ${100 - percent}`}
              strokeDashoffset={-offset}
            />
          ))}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[10px] text-muted-foreground">Total</span>
          <span className="text-xs font-bold tabular-nums">
            {formatCurrency(total)}
          </span>
        </div>
      </div>
      <div className="w-full min-w-0 flex-1 space-y-2">
        {sorted.map((item) => (
          <div key={item.name} className="flex items-center gap-2 text-xs sm:text-sm">
            <div
              className="cat-swatch h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <span className="truncate text-muted-foreground">
              <span aria-hidden>{item.icon}</span> {item.name}
            </span>
            <span className="ml-auto shrink-0 font-semibold tabular-nums">
              {formatCurrency(item.total)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function SummaryPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [data, setData] = useState<MonthlyData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getMonthlySummary(currentDate.getFullYear(), currentDate.getMonth() + 1)
      .then((result) => {
        if (!cancelled) setData(result);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [currentDate]);

  function changeMonth(next: Date) {
    setLoading(true);
    setCurrentDate(next);
  }

  const maxCategory = data
    ? Math.max(...data.expensesByCategory.map((c) => c.total), 0)
    : 0;

  return (
    <PageShell wide>
      <div className="animate-rise flex items-center justify-between rounded-2xl bg-card p-1.5 shadow-soft ring-1 ring-border/60">
        <button
          onClick={() => changeMonth(subMonths(currentDate, 1))}
          className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
          aria-label="Mes anterior"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div className="text-center">
          <h1 className="text-base font-semibold capitalize tracking-tight sm:text-lg">
            {format(currentDate, "MMMM yyyy", { locale: es })}
          </h1>
          <p className="text-[11px] text-muted-foreground">Resumen mensual</p>
        </div>
        <button
          onClick={() => changeMonth(addMonths(currentDate, 1))}
          className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
          aria-label="Mes siguiente"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          <div className="h-28 animate-pulse rounded-2xl bg-muted" />
          <div className="grid grid-cols-2 gap-3">
            <div className="h-24 animate-pulse rounded-2xl bg-muted" />
            <div className="h-24 animate-pulse rounded-2xl bg-muted" />
          </div>
        </div>
      ) : !data ? (
        <div className="flex items-center justify-center rounded-2xl bg-card py-12 shadow-soft ring-1 ring-border/60">
          <p className="text-sm text-muted-foreground">Error al cargar datos</p>
        </div>
      ) : (
        <>
          <section className="animate-rise overflow-hidden rounded-2xl bg-primary px-5 py-6 text-primary-foreground shadow-lift sm:px-7 sm:py-8">
            <p className="text-sm font-medium text-primary-foreground/80">
              Saldo del mes
            </p>
            <p className="font-display text-balance-hero mt-2 tabular-nums">
              {formatCurrency(data.balance)}
            </p>
          </section>

          <div className="grid gap-5 lg:grid-cols-5 lg:items-start">
            <div className="space-y-5 lg:col-span-2">
              <div className="animate-rise grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-card p-4 shadow-soft ring-1 ring-border/60 sm:p-5">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <TrendingUp className="h-4 w-4 text-income" />
                    Ingresos
                  </div>
                  <p className="mt-2 text-lg font-bold text-income tabular-nums">
                    {formatCurrency(data.totalIncome)}
                  </p>
                </div>

                <div className="rounded-2xl bg-card p-4 shadow-soft ring-1 ring-border/60 sm:p-5">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <TrendingDown className="h-4 w-4 text-expense" />
                    Gastos
                  </div>
                  <p className="mt-2 text-lg font-bold text-expense tabular-nums">
                    {formatCurrency(data.totalExpenses)}
                  </p>
                </div>
              </div>

              {data.expensesByCategory.length > 0 && (
                <Card
                  className="animate-rise shadow-soft ring-border/60"
                  style={{ animationDelay: "80ms" }}
                >
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold">
                      Distribución de gastos
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <PieChart data={data.expensesByCategory} />
                  </CardContent>
                </Card>
              )}
            </div>

            {data.expensesByCategory.length > 0 && (
              <Card
                className="animate-rise shadow-soft ring-border/60 lg:col-span-3"
                style={{ animationDelay: "120ms" }}
              >
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold">
                    Gastos por categoría
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3.5">
                  {[...data.expensesByCategory]
                    .sort((a, b) => b.total - a.total)
                    .map((c) => (
                      <div key={c.name} className="space-y-1.5">
                        <div className="flex items-center justify-between gap-2 text-sm">
                          <span className="flex min-w-0 items-center gap-2 truncate">
                            <span aria-hidden>{c.icon}</span>
                            <span className="truncate font-medium">{c.name}</span>
                          </span>
                          <span className="shrink-0 font-semibold tabular-nums">
                            {formatCurrency(c.total)}
                          </span>
                        </div>
                        <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                          <div
                            className="cat-swatch h-full rounded-full"
                            style={{
                              width: `${
                                maxCategory > 0
                                  ? (c.total / maxCategory) * 100
                                  : 0
                              }%`,
                              backgroundColor: c.color,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                </CardContent>
              </Card>
            )}
          </div>
        </>
      )}
    </PageShell>
  );
}
