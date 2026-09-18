"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";

type CategoryInfo = {
  name: string;
  icon: string;
  color: string;
};

type ExpandableTransactionProps = {
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
  type,
  amount,
  description,
  dateLabel,
  category,
  variant = "plain",
  showDivider = false,
}: ExpandableTransactionProps) {
  const [expanded, setExpanded] = useState(false);

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
        </div>
      )}
    </div>
  );
}
