import { getTransactions } from "@/app/actions/transactions";
import { Card, CardContent } from "@/components/ui/card";
import { PageShell } from "@/components/layout/page-shell";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import Link from "next/link";
import { Plus, Inbox } from "lucide-react";
import { formatCurrency } from "@/lib/format";

export default async function TransactionsPage() {
  const transactions = await getTransactions();

  type TransactionRow = (typeof transactions)[number];

  const grouped = transactions?.reduce(
    (acc: Record<string, TransactionRow[]>, t: TransactionRow) => {
      const dateKey = t.date;
      if (!acc[dateKey]) acc[dateKey] = [];
      acc[dateKey].push(t);
      return acc;
    },
    {} as Record<string, TransactionRow[]>
  );

  return (
    <PageShell>
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
          Movimientos
        </h1>
        <Link
          href="/transactions/new"
          data-pressable
          className="inline-flex min-h-11 items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 text-xs font-semibold text-primary-foreground shadow-soft transition-colors hover:bg-primary/90 md:hidden"
        >
          <Plus className="h-3.5 w-3.5" />
          Nuevo
        </Link>
      </div>

      {!grouped || Object.keys(grouped).length === 0 ? (
        <Card className="animate-scale-in shadow-soft">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
              <Inbox className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="mt-4 text-sm font-medium">No hay movimientos todavía</p>
            <p className="mt-1 text-xs text-muted-foreground">
              El historial de ingresos y gastos aparece acá
            </p>
            <Link
              href="/transactions/new"
              className="mt-4 inline-flex min-h-11 items-center text-sm font-medium text-primary hover:underline"
            >
              Registrar primer movimiento
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped)
            .sort(([a], [b]) => b.localeCompare(a))
            .map(([dateKey, items]) => (
              <div key={dateKey} className="space-y-2">
                <h2 className="px-0.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {format(
                    new Date(dateKey + "T12:00:00"),
                    "EEEE dd 'de' MMMM",
                    { locale: es }
                  )}
                </h2>
                <div className="overflow-hidden rounded-2xl bg-card shadow-soft ring-1 ring-border/60">
                  {items.map((t, i) => {
                    const cat = t.categories as {
                      name: string;
                      icon: string;
                      color: string;
                    };
                    return (
                      <div
                        key={t.id}
                        className={`flex min-h-14 items-center justify-between gap-3 px-3.5 py-3.5 ${
                          i > 0 ? "border-t border-border/50" : ""
                        }`}
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <div
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg"
                            style={{ backgroundColor: cat.color + "26" }}
                          >
                            <span aria-hidden>{cat.icon}</span>
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium">
                              {t.description || cat.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {cat.name}
                            </p>
                          </div>
                        </div>
                        <span
                          className={`shrink-0 text-sm font-semibold tabular-nums ${
                            t.type === "expense" ? "text-expense" : "text-income"
                          }`}
                        >
                          {t.type === "expense" ? "−" : "+"}
                          {formatCurrency(Number(t.amount))}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
        </div>
      )}
    </PageShell>
  );
}
