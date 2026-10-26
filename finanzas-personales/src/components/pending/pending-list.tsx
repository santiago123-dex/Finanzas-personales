"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, X } from "lucide-react";
import { confirmPending, discardPending } from "@/app/actions/pending";
import { formatCurrency } from "@/lib/format";
import { Card, CardContent } from "@/components/ui/card";

type Category = { id: string; name: string; icon: string };
type Pending = {
  id: string;
  type: "expense" | "income";
  amount: number | string;
  description: string;
  tx_date: string;
};

function PendingItem({
  item,
  categories,
}: {
  item: Pending;
  categories: Category[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const options = categories.filter((c) =>
    item.type === "income" ? c.name === "Ingresos" : c.name !== "Ingresos"
  );
  const [categoryId, setCategoryId] = useState(
    item.type === "income" ? (options[0]?.id ?? "") : ""
  );
  const [description, setDescription] = useState(item.description);

  function save() {
    if (!categoryId) return;
    startTransition(async () => {
      await confirmPending(item.id, {
        type: item.type,
        amount: Number(item.amount),
        description,
        category_id: categoryId,
        date: item.tx_date,
      });
      router.refresh();
    });
  }

  function discard() {
    startTransition(async () => {
      await discardPending(item.id);
      router.refresh();
    });
  }

  return (
    <Card className="shadow-soft ring-border/60">
      <CardContent className="space-y-3 pt-4">
        <div className="flex items-baseline justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            {item.type === "income" ? "Ingreso" : "Gasto"} · {item.tx_date}
          </p>
          <p
            className={`font-display text-2xl tabular-nums ${
              item.type === "income" ? "text-income" : "text-expense"
            }`}
          >
            {formatCurrency(Number(item.amount))}
          </p>
        </div>

        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Descripción"
          aria-label="Descripción"
          className="flex h-12 w-full rounded-xl border border-input bg-background px-4 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40 md:h-11 md:text-sm"
        />

        <div className="flex flex-wrap gap-2">
          {options.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setCategoryId(cat.id)}
              className={`min-h-11 rounded-xl border px-3 text-xs font-medium transition-colors ${
                categoryId === cat.id
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-border text-muted-foreground hover:bg-muted/60"
              }`}
            >
              <span aria-hidden>{cat.icon}</span> {cat.name}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={discard}
            disabled={isPending}
            className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl border border-border text-sm font-semibold text-muted-foreground hover:bg-muted disabled:opacity-50"
          >
            <X className="h-4 w-4" /> Descartar
          </button>
          <button
            type="button"
            onClick={save}
            disabled={isPending || !categoryId}
            className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl bg-primary text-sm font-semibold text-primary-foreground shadow-lift hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-50"
          >
            <Check className="h-4 w-4" /> Guardar
          </button>
        </div>
      </CardContent>
    </Card>
  );
}

export function PendingList({
  pending,
  categories,
}: {
  pending: Pending[];
  categories: Category[];
}) {
  if (pending.length === 0) {
    return (
      <p className="rounded-2xl bg-muted px-4 py-6 text-center text-sm text-muted-foreground">
        No hay movimientos por confirmar.
      </p>
    );
  }
  return (
    <div className="space-y-3">
      {pending.map((p) => (
        <PendingItem key={p.id} item={p} categories={categories} />
      ))}
    </div>
  );
}
