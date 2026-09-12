import { getMonthlySummary } from "@/app/actions/transactions";
import { getTransactions } from "@/app/actions/transactions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageShell } from "@/components/layout/page-shell";
import { TrendingDown, TrendingUp, ArrowRight } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { formatCurrency } from "@/lib/format";
import Link from "next/link";

export default async function HomePage() {
  const now = new Date();
  const [summary, recentTransactions] = await Promise.all([
    getMonthlySummary(),
    getTransactions(),
  ]);

  const recentFive = recentTransactions?.slice(0, 5) ?? [];
  const maxCat =
    summary.expensesByCategory.length > 0
      ? Math.max(...summary.expensesByCategory.map((c) => c.total))
      : 0;

  return (
    <PageShell wide>
      <div className="animate-rise space-y-0.5">
        <p className="text-sm capitalize text-muted-foreground">
          {format(now, "EEEE d 'de' MMMM", { locale: es })}
        </p>
        <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
          {format(now, "MMMM yyyy", { locale: es })}
        </h1>
      </div>

      <section
        className="animate-rise relative overflow-hidden rounded-2xl bg-primary px-5 py-6 text-primary-foreground shadow-lift sm:px-7 sm:py-8"
        style={{ animationDelay: "40ms" }}
      >
        <div
          className="pointer-events-none absolute inset-y-0 right-0 w-1/2 bg-[linear-gradient(115deg,transparent_20%,color-mix(in_oklch,var(--primary-foreground)_8%,transparent)_100%)]"
          aria-hidden
        />
        <p className="relative text-sm font-medium text-primary-foreground/80">
          Saldo disponible
        </p>
        <p className="font-display text-balance-hero relative mt-2 tabular-nums">
          {formatCurrency(summary.balance)}
        </p>
      </section>

      <div className="grid gap-5 lg:grid-cols-5 lg:items-start">
        <div className="space-y-5 lg:col-span-2">
          <div
            className="animate-rise grid grid-cols-2 gap-3"
            style={{ animationDelay: "80ms" }}
          >
            <div className="rounded-2xl bg-card p-4 shadow-soft ring-1 ring-border/60 sm:p-5">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-income/10">
                  <TrendingUp className="h-3.5 w-3.5 text-income" />
                </span>
                Ingresos
              </div>
              <p className="mt-2 text-lg font-bold tracking-tight text-income tabular-nums sm:text-xl">
                {formatCurrency(summary.totalIncome)}
              </p>
            </div>

            <div className="rounded-2xl bg-card p-4 shadow-soft ring-1 ring-border/60 sm:p-5">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-expense/10">
                  <TrendingDown className="h-3.5 w-3.5 text-expense" />
                </span>
                Gastos
              </div>
              <p className="mt-2 text-lg font-bold tracking-tight text-expense tabular-nums sm:text-xl">
                {formatCurrency(summary.totalExpenses)}
              </p>
            </div>
          </div>

          {summary.expensesByCategory.length > 0 && (
            <Card
              className="animate-rise shadow-soft ring-border/60"
              style={{ animationDelay: "120ms" }}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="text-sm font-semibold">
                    Gastos por categoría
                  </CardTitle>
                  <Link
                    href="/summary"
                    className="inline-flex min-h-9 items-center gap-0.5 text-xs font-medium text-primary hover:underline"
                  >
                    Ver todo
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="space-y-3.5">
                {summary.expensesByCategory
                  .sort((a, b) => b.total - a.total)
                  .slice(0, 5)
                  .map((cat) => (
                    <div key={cat.name} className="space-y-1.5">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-2.5">
                          <div
                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm"
                            style={{ backgroundColor: cat.color + "26" }}
                          >
                            <span aria-hidden>{cat.icon}</span>
                          </div>
                          <span className="truncate text-sm font-medium">
                            {cat.name}
                          </span>
                        </div>
                        <span className="shrink-0 text-sm font-semibold tabular-nums">
                          {formatCurrency(cat.total)}
                        </span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full transition-[width] duration-300"
                          style={{
                            width: `${maxCat > 0 ? (cat.total / maxCat) * 100 : 0}%`,
                            backgroundColor: cat.color,
                          }}
                        />
                      </div>
                    </div>
                  ))}
              </CardContent>
            </Card>
          )}
        </div>

        <div className="lg:col-span-3">
          {recentFive.length > 0 ? (
            <Card
              className="animate-rise shadow-soft ring-border/60"
              style={{ animationDelay: "160ms" }}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="text-sm font-semibold">
                    Últimos movimientos
                  </CardTitle>
                  <Link
                    href="/transactions"
                    className="inline-flex min-h-9 items-center gap-0.5 text-xs font-medium text-primary hover:underline"
                  >
                    Ver todos
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="space-y-1">
                {recentFive.map((t) => {
                  const cat = t.categories as {
                    name: string;
                    icon: string;
                    color: string;
                  };
                  return (
                    <div
                      key={t.id}
                      className="flex items-center justify-between gap-3 rounded-xl px-1 py-2.5 transition-colors hover:bg-muted/50"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <div
                          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-base sm:h-10 sm:w-10"
                          style={{ backgroundColor: cat.color + "26" }}
                        >
                          <span aria-hidden>{cat.icon}</span>
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">
                            {t.description || cat.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(t.date), "dd MMM", { locale: es })}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`shrink-0 text-sm font-semibold tabular-nums sm:text-base ${
                          t.type === "expense" ? "text-expense" : "text-income"
                        }`}
                      >
                        {t.type === "expense" ? "−" : "+"}
                        {formatCurrency(Number(t.amount))}
                      </span>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          ) : (
            <Card
              className="animate-rise shadow-soft"
              style={{ animationDelay: "160ms" }}
            >
              <CardContent className="flex flex-col items-center py-12 text-center sm:py-16">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted">
                  <TrendingUp className="h-5 w-5 text-muted-foreground" />
                </div>
                <p className="mt-3 text-sm font-medium">
                  Sin movimientos este mes
                </p>
                <p className="mt-1 max-w-xs text-xs text-muted-foreground">
                  Registrá tu primer ingreso o gasto
                </p>
                <Link
                  href="/transactions/new"
                  data-pressable
                  className="mt-4 inline-flex min-h-11 items-center rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-soft"
                >
                  Nuevo movimiento
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </PageShell>
  );
}
