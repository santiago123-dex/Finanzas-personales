"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createTransaction } from "@/app/actions/transactions";
import { getCategories } from "@/app/actions/categories";
import { Card, CardContent } from "@/components/ui/card";
import { PageShell } from "@/components/layout/page-shell";
import { ArrowLeft, Check } from "lucide-react";
import Link from "next/link";

type Category = {
  id: string;
  name: string;
  icon: string;
  color: string;
  is_default: boolean;
};

export default function NewTransactionPage() {
  const router = useRouter();
  const [type, setType] = useState<"expense" | "income">("expense");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getCategories().then(setCategories);
  }, []);

  const filteredCategories = categories.filter(
    (c) =>
      (type === "income" && c.name === "Ingresos") ||
      (type === "expense" && c.name !== "Ingresos")
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!categoryId || !amount) return;

    setLoading(true);
    try {
      await createTransaction({
        type,
        amount: parseFloat(amount),
        description,
        category_id: categoryId,
        date,
      });
      router.push("/");
      router.refresh();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <PageShell>
      <div className="flex items-center gap-3">
        <Link
          href="/"
          aria-label="Volver"
          className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
          Nuevo movimiento
        </h1>
      </div>

      <Card className="animate-rise overflow-hidden shadow-soft ring-border/60">
        <CardContent className="space-y-5 pt-5 sm:pt-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-1 rounded-xl bg-muted p-1">
              <button
                type="button"
                onClick={() => {
                  setType("expense");
                  setCategoryId("");
                }}
                className={`min-h-11 rounded-lg px-3 py-2.5 text-sm font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 ${
                  type === "expense"
                    ? "bg-card text-expense shadow-soft"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Gasto
              </button>
              <button
                type="button"
                onClick={() => {
                  setType("income");
                  setCategoryId("");
                }}
                className={`min-h-11 rounded-lg px-3 py-2.5 text-sm font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 ${
                  type === "income"
                    ? "bg-card text-income shadow-soft"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Ingreso
              </button>
            </div>

            <div className="space-y-2">
              <label htmlFor="amount" className="text-sm font-medium">
                Monto
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-display text-2xl text-muted-foreground">
                  $
                </span>
                <input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  inputMode="decimal"
                  autoFocus
                  className="font-display flex h-16 w-full rounded-xl border border-input bg-background pl-10 pr-4 text-3xl tracking-tight tabular-nums outline-none transition-colors placeholder:text-muted-foreground/40 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40 sm:h-14 sm:text-2xl"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Categoría</label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {filteredCategories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategoryId(cat.id)}
                    className={`relative flex min-h-[4.5rem] flex-col items-center justify-center gap-1.5 rounded-xl border p-3 text-xs font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 ${
                      categoryId === cat.id
                        ? "border-primary bg-primary/5 text-primary shadow-soft"
                        : "border-border text-muted-foreground hover:border-primary/30 hover:bg-muted/60"
                    }`}
                  >
                    <span className="text-2xl" aria-hidden>
                      {cat.icon}
                    </span>
                    <span className="text-center leading-tight">{cat.name}</span>
                    {categoryId === cat.id && (
                      <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                        <Check className="h-3 w-3" />
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium">
                Descripción{" "}
                <span className="font-normal text-muted-foreground">(opcional)</span>
              </label>
              <input
                id="description"
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ej: Compré pan en el kiosco"
                className="flex h-12 w-full rounded-xl border border-input bg-background px-4 text-base outline-none transition-colors placeholder:text-muted-foreground/50 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40 md:h-11 md:text-sm"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="date" className="text-sm font-medium">
                Fecha
              </label>
              <input
                id="date"
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="flex h-12 w-full rounded-xl border border-input bg-background px-4 text-base outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40 md:h-11 md:text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !categoryId || !amount}
              data-pressable
              className="w-full rounded-xl bg-primary px-4 py-3.5 text-sm font-semibold text-primary-foreground shadow-lift transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50"
            >
              {loading ? "Guardando..." : "Guardar movimiento"}
            </button>
          </form>
        </CardContent>
      </Card>
    </PageShell>
  );
}
