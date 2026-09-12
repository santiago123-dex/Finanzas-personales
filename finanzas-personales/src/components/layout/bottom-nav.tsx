"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { isNavActive, navItems } from "./nav-items";

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/50 bg-background/90 backdrop-blur-xl backdrop-saturate-150 supports-[backdrop-filter]:bg-background/75 md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      aria-label="Navegación principal"
    >
      <div className="mx-auto flex h-16 max-w-lg items-center justify-around px-1">
        {navItems.map((item) => {
          const active = isNavActive(pathname, item.href);

          if (item.primary) {
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-label="Nuevo movimiento"
                data-pressable
                className="relative -mt-5 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lift transition-transform duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                <item.icon className="h-6 w-6" strokeWidth={2.5} />
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
                "relative flex min-h-11 min-w-[3.5rem] flex-col items-center justify-center gap-0.5 rounded-xl px-2.5 py-1.5 text-[10px] font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
                active
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {active && (
                <span
                  className="absolute -top-0.5 h-0.5 w-4 rounded-full bg-primary"
                  aria-hidden
                />
              )}
              <item.icon
                className="h-5 w-5"
                strokeWidth={active ? 2.4 : 1.9}
              />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
