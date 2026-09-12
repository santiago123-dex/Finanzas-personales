import { register } from "@/app/actions/auth";
import { Wallet } from "lucide-react";
import Link from "next/link";

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const params = await searchParams;
  return (
    <div className="grid min-h-dvh bg-background lg:grid-cols-2">
      <aside className="relative hidden overflow-hidden bg-primary text-primary-foreground lg:flex lg:flex-col lg:justify-between lg:p-12 xl:p-16">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_color-mix(in_oklch,var(--primary-foreground)_14%,transparent),_transparent_55%)]"
          aria-hidden
        />
        <div className="relative flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-foreground/15">
            <Wallet className="h-5 w-5" strokeWidth={2.25} />
          </span>
          <span className="text-lg font-semibold tracking-tight">Finanzas</span>
        </div>
        <div className="relative max-w-md space-y-4">
          <p className="font-display text-4xl leading-tight xl:text-5xl">
            Empezá a ordenar tu plata hoy.
          </p>
          <p className="text-sm text-primary-foreground/75 xl:text-base">
            Creá tu cuenta y llevá el mes con claridad.
          </p>
        </div>
        <p className="relative text-xs text-primary-foreground/55">
          Libro personal · calm ledger
        </p>
      </aside>

      <div className="relative flex items-center justify-center overflow-hidden p-4 sm:p-8">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_color-mix(in_oklch,var(--primary)_12%,transparent),_transparent_55%)] lg:hidden"
          aria-hidden
        />

        <div className="relative w-full max-w-sm space-y-7">
          <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
            <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lift lg:hidden">
              <Wallet className="h-5 w-5" strokeWidth={2.25} />
            </span>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Crear cuenta
            </h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Empezá a ordenar tu plata
            </p>
          </div>

          {params.error && (
            <div
              role="alert"
              className="rounded-xl border border-destructive/20 bg-destructive/10 px-3.5 py-3 text-sm text-destructive"
            >
              {params.error}
            </div>
          )}

          <form
            action={register}
            className="space-y-4 rounded-2xl bg-card p-5 shadow-soft ring-1 ring-border/60 sm:p-6"
          >
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="tu@email.com"
                className="flex h-12 w-full rounded-xl border border-input bg-background px-3.5 text-base outline-none transition-colors placeholder:text-muted-foreground/60 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40 md:text-sm"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Contraseña
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                minLength={6}
                autoComplete="new-password"
                placeholder="Mínimo 6 caracteres"
                className="flex h-12 w-full rounded-xl border border-input bg-background px-3.5 text-base outline-none transition-colors placeholder:text-muted-foreground/60 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40 md:text-sm"
              />
            </div>

            <button
              type="submit"
              data-pressable
              className="w-full rounded-xl bg-primary px-4 py-3.5 text-sm font-semibold text-primary-foreground shadow-soft transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
            >
              Crear cuenta
            </button>
          </form>

          <p className="text-center text-sm text-muted-foreground lg:text-left">
            ¿Ya tenés cuenta?{" "}
            <Link
              href="/login"
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              Iniciá sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
