"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Wallet } from "lucide-react";
import { cn } from "@/lib/utils";
import { isNavActive, navItems } from "./nav-items";

export function SideNav() {
  const pathname = usePathname();

  return (
    <aside
      className="sticky top-0 hidden h-dvh w-56 shrink-0 flex-col border-r border-border/60 bg-surface/80 px-3 py-5 backdrop-blur-sm md:flex lg:w-60"
      aria-label="Navegación principal"
    >
      <div className="mb-8 flex items-center gap-2.5 px-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-soft">
          <Wallet className="h-4 w-4" strokeWidth={2.25} />
        </span>
        <div className="min-w-0">
          <p className="text-[15px] font-semibold tracking-tight text-foreground">
            Finanzas
          </p>
          <p className="text-[11px] text-muted-foreground">Libro personal</p>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1">
        {navItems.map((item) => {
          const active = isNavActive(pathname, item.href);

          if (item.primary) {
            return (
              <Link
                key={item.href}
                href={item.href}
                data-pressable
                className="mb-2 mt-1 flex items-center justify-center gap-2 rounded-xl bg-primary px-3 py-2.5 text-sm font-semibold text-primary-foreground shadow-soft transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
              >
                <item.icon className="h-4 w-4" strokeWidth={2.4} />
                Nuevo movimiento
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              data-pressable
              className={cn(
                "flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
                active
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted/80 hover:text-foreground"
              )}
            >
              <item.icon
                className="h-5 w-5"
                strokeWidth={active ? 2.4 : 1.9}
              />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
