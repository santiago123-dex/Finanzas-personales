"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, Trash2, Loader2 } from "lucide-react";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";
import { deleteTransaction } from "@/app/actions/transactions";

type CategoryInfo = {
  name: string;
  icon: string;
  color: string;
};

type ExpandableTransactionProps = {
  id?: string;
  type: "expense" | "income" | string;
  amount: number | string;
  description: string | null;
  dateLabel: string;
  category: CategoryInfo;
  /** Variante visual: "list" (lista agrupada de /transactions) o "plain" (dashboard) */
  variant?: "list" | "plain";
  showDivider?: boolean;
};

export function ExpandableTransaction({
  id,
  type,
  amount,
  description,
  dateLabel,
  category,
  variant = "plain",
  showDivider = false,
}: ExpandableTransactionProps) {
  const [expanded, setExpanded] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();

  const title = description?.trim() ? description.trim() : category.name;
  const hasCustomDescription =
    !!description?.trim() && description.trim() !== category.name;
  const isExpense = type === "expense";

  return (
    <div
      className={cn(
        variant === "list" && showDivider && "border-t border-border/50",
        variant === "plain" && "rounded-xl"
      )}
    >
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
        title={expanded ? "Ocultar descripción" : "Ver descripción"}
        className={cn(
          "flex w-full items-center justify-between gap-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
          variant === "list" && "min-h-14 px-3.5 py-3.5 hover:bg-muted/50",
          variant === "plain" && "px-1 py-2.5 hover:bg-muted/50 rounded-xl"
        )}
      >
        <span className="flex min-w-0 flex-1 items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted text-lg sm:h-10 sm:w-10">
            <span aria-hidden>{category.icon}</span>
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-medium">{title}</span>
            <span className="block truncate text-xs text-muted-foreground">
              {category.name} · {dateLabel}
            </span>
          </span>
        </span>
        <span className="flex shrink-0 items-center gap-1.5">
          <span
            className={cn(
              "text-sm font-semibold tabular-nums",
              isExpense ? "text-expense" : "text-income"
            )}
          >
            {isExpense ? "−" : "+"}
            {formatCurrency(Number(amount))}
          </span>
          <ChevronDown
            className={cn(
              "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200",
              expanded && "rotate-180"
            )}
            aria-hidden
          />
        </span>
      </button>

      {expanded && (
        <div className="animate-scale-in px-3.5 pb-3.5 pl-[4.25rem] pr-3.5 sm:pl-[4.25rem]">
          <div className="rounded-xl bg-muted/60 px-3 py-2.5">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Descripción
            </p>
            {hasCustomDescription ? (
              <p className="mt-1 break-words text-sm leading-relaxed">
                {description!.trim()}
              </p>
            ) : (
              <p className="mt-1 text-sm italic text-muted-foreground">
                Sin descripción agregada
              </p>
            )}
          </div>
          {id &&
            (confirming ? (
              <div className="mt-2 flex items-center gap-2">
                <button
                  type="button"
                  disabled={deleting}
                  onClick={async () => {
                    setDeleting(true);
                    try {
                      await deleteTransaction(id);
                      router.refresh();
                    } catch (e) {
                      console.error(e);
                      setDeleting(false);
                    }
                  }}
                  className="inline-flex min-h-9 flex-1 items-center justify-center gap-1.5 rounded-xl bg-destructive px-3 text-xs font-semibold text-white transition-opacity disabled:opacity-60 dark:text-black"
                >
                  {deleting ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="h-3.5 w-3.5" />
                  )}
                  {deleting ? "Borrando..." : "Sí, borrar"}
                </button>
                <button
                  type="button"
                  disabled={deleting}
                  onClick={() => setConfirming(false)}
                  className="inline-flex min-h-9 items-center justify-center rounded-xl bg-muted px-3 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground disabled:opacity-60"
                >
                  Cancelar
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirming(true)}
                className="mt-2 inline-flex min-h-9 items-center gap-1.5 rounded-xl px-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-expense/10 hover:text-expense"
                aria-label="Borrar movimiento"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Borrar
              </button>
            ))}
        </div>
      )}
    </div>
  );
}
