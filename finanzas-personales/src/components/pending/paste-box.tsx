"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { addPendingFromText } from "@/app/actions/pending";

export function PasteBox() {
  const router = useRouter();
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function submit() {
    setError("");
    startTransition(async () => {
      const res = await addPendingFromText(text);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setText("");
      router.refresh();
    });
  }

  return (
    <section className="space-y-2">
      <h2 className="text-sm font-semibold">Pegar texto del banco</h2>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={3}
        placeholder="Ej: Compraste $25.000 en Rappi con tu tarjeta Nu"
        className="w-full rounded-xl border border-input bg-background p-3 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40 md:text-sm"
      />
      {error && <p className="text-sm text-expense">{error}</p>}
      <button
        type="button"
        onClick={submit}
        disabled={isPending || !text.trim()}
        className="min-h-11 w-full rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground disabled:pointer-events-none disabled:opacity-50"
      >
        Detectar movimiento
      </button>
    </section>
  );
}
