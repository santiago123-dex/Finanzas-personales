"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createSubscription } from "@/app/actions/subscriptions";

type Category = { id: string; name: string; icon: string };

const inputClass =
  "flex h-12 w-full rounded-xl border border-input bg-background px-4 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40 md:h-11 md:text-sm";

export function SubscriptionForm({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDay, setDueDay] = useState("");
  const [categoryId, setCategoryId] = useState("");

  const options = categories.filter((c) => c.name !== "Ingresos");
  const valid = name.trim() && Number(amount) > 0 && dueDay && categoryId;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!valid) return;
    startTransition(async () => {
      await createSubscription({
        name: name.trim(),
        amount: Number(amount),
        due_day: Number(dueDay),
        category_id: categoryId,
      });
      setName("");
      setAmount("");
      setDueDay("");
      setCategoryId("");
      router.refresh();
    });
  }

  return (
    <form onSubmit={submit} className="space-y-3 rounded-2xl border border-border p-4">
      <h2 className="text-sm font-semibold">Nuevo pago recurrente</h2>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Ej: Plan del celular"
        aria-label="Nombre"
        className={inputClass}
      />
      <div className="grid grid-cols-2 gap-3">
        <input
          type="number"
          inputMode="decimal"
          min="0.01"
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Monto"
          aria-label="Monto"
          className={inputClass}
        />
        <input
          type="number"
          inputMode="numeric"
          min="1"
          max="31"
          value={dueDay}
          onChange={(e) => setDueDay(e.target.value)}
          placeholder="Día del mes"
          aria-label="Día del mes en que vence"
          className={inputClass}
        />
      </div>
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
      <button
        type="submit"
        disabled={isPending || !valid}
        className="min-h-11 w-full rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground disabled:pointer-events-none disabled:opacity-50"
      >
        {isPending ? "Guardando..." : "Agregar"}
      </button>
    </form>
  );
}
