"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Trash2 } from "lucide-react";
import {
  deleteSubscription,
  markSubscriptionPaid,
} from "@/app/actions/subscriptions";
import { subscriptionStatus } from "@/lib/subscriptions";
import { formatCurrency } from "@/lib/format";
import { Card, CardContent } from "@/components/ui/card";

type Sub = {
  id: string;
  name: string;
  amount: number | string;
  due_day: number;
  last_paid_on: string | null;
  categories: { name: string; icon: string } | null;
};

function dueLabel(daysLeft: number, paid: boolean) {
  if (daysLeft < 0) return `Vencido hace ${-daysLeft} ${daysLeft === -1 ? "día" : "días"}`;
  if (daysLeft === 0) return "Vence hoy";
  if (daysLeft === 1) return "Vence mañana";
  return paid ? `Próximo en ${daysLeft} días` : `Vence en ${daysLeft} días`;
}

function Item({ sub, today }: { sub: Sub; today: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const status = subscriptionStatus(sub.due_day, sub.last_paid_on, today);
  const urgent = !status.paid && status.daysLeft <= 1;

  function run(action: () => Promise<void>) {
    startTransition(async () => {
      await action();
      router.refresh();
    });
  }

  return (
    <Card className="shadow-soft ring-border/60">
      <CardContent className="space-y-3 pt-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate font-medium">
              <span aria-hidden>{sub.categories?.icon}</span> {sub.name}
            </p>
            <p
              className={`text-sm ${
                urgent ? "font-medium text-expense" : "text-muted-foreground"
              }`}
            >
              {dueLabel(status.daysLeft, status.paid)} · día {sub.due_day}
            </p>
          </div>
          <p className="font-display text-xl tabular-nums">
            {formatCurrency(Number(sub.amount))}
          </p>
        </div>
        <div className="grid grid-cols-[1fr_auto] gap-2">
          <button
            type="button"
            disabled={isPending || status.paid}
            onClick={() => run(() => markSubscriptionPaid(sub.id))}
            className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl bg-primary text-sm font-semibold text-primary-foreground disabled:pointer-events-none disabled:opacity-50"
          >
            <Check className="h-4 w-4" />
            {status.paid ? "Pagado este mes" : "Marcar como pagado"}
          </button>
          <button
            type="button"
            disabled={isPending}
            aria-label={`Eliminar ${sub.name}`}
            onClick={() => {
              if (confirm(`¿Eliminar "${sub.name}"?`)) {
                run(() => deleteSubscription(sub.id));
              }
            }}
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl border border-border text-muted-foreground hover:bg-muted disabled:opacity-50"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </CardContent>
    </Card>
  );
}

export function SubscriptionList({
  subs,
  today,
}: {
  subs: Sub[];
  today: string;
}) {
  if (subs.length === 0) {
    return (
      <p className="rounded-2xl bg-muted px-4 py-6 text-center text-sm text-muted-foreground">
        Aún no tienes pagos recurrentes.
      </p>
    );
  }
  const sorted = [...subs].sort(
    (a, b) =>
      subscriptionStatus(a.due_day, a.last_paid_on, today).daysLeft -
      subscriptionStatus(b.due_day, b.last_paid_on, today).daysLeft
  );
  return (
    <div className="space-y-3">
      {sorted.map((s) => (
        <Item key={s.id} sub={s} today={today} />
      ))}
    </div>
  );
}
