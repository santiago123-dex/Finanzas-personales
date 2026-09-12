import { Wallet } from "lucide-react";
import type { ReactNode } from "react";

type AuthShellProps = {
  title: string;
  subtitle: string;
  panelHeadline: string;
  panelSupport: string;
  children: ReactNode;
  footer: ReactNode;
};

export function AuthShell({
  title,
  subtitle,
  panelHeadline,
  panelSupport,
  children,
  footer,
}: AuthShellProps) {
  return (
    <div className="auth-mono grid min-h-dvh bg-background text-foreground lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
      <aside
        className="relative hidden overflow-hidden bg-foreground text-background lg:flex lg:flex-col lg:justify-between lg:px-14 lg:py-12 xl:px-16 xl:py-14"
      >
        <div
          className="auth-ledger-lines pointer-events-none absolute inset-0 opacity-[0.12]"
          aria-hidden
        />

        <div className="relative flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-md border border-background/25">
            <Wallet className="h-4 w-4" strokeWidth={2} aria-hidden />
          </span>
          <span className="text-[0.9375rem] font-semibold tracking-tight">
            Finanzas
          </span>
        </div>

        <div className="relative max-w-[22rem] space-y-5">
          <p className="font-display text-[clamp(2rem,2.4vw+1.1rem,2.75rem)] leading-[1.12] text-balance">
            {panelHeadline}
          </p>
          <p className="max-w-[28ch] text-[0.9375rem] leading-relaxed text-background/70">
            {panelSupport}
          </p>
        </div>

        <p className="relative text-[0.6875rem] uppercase tracking-[0.14em] text-background/45">
          Libro personal
        </p>
      </aside>

      <main className="relative flex min-h-dvh items-center justify-center px-5 py-10 sm:px-8 sm:py-12">
        <div className="auth-form-enter relative w-full max-w-[22rem]">
          <div className="mb-8 flex flex-col items-start">
            <span className="mb-5 flex h-10 w-10 items-center justify-center rounded-md border border-foreground bg-foreground text-background lg:hidden">
              <Wallet className="h-4 w-4" strokeWidth={2} aria-hidden />
            </span>
            <h1 className="text-[1.625rem] font-semibold tracking-tight sm:text-[1.75rem]">
              {title}
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {subtitle}
            </p>
          </div>

          {children}

          <div className="mt-8 text-sm text-muted-foreground">{footer}</div>
        </div>
      </main>
    </div>
  );
}
