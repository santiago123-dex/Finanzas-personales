import { login } from "@/app/actions/auth";
import { AuthShell } from "@/components/auth/auth-shell";
import Link from "next/link";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const params = await searchParams;

  return (
    <AuthShell
      title="Iniciá sesión"
      subtitle="Continuá con tu libro personal."
      panelHeadline="Un libro claro para tu plata del mes."
      panelSupport="Ingresos, gastos y saldo en un solo lugar — sin ruido."
      footer={
        <>
          ¿No tenés cuenta?{" "}
          <Link
            href="/register"
            className="font-medium text-foreground underline decoration-foreground/25 underline-offset-4 transition-colors hover:decoration-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            Registrate
          </Link>
        </>
      }
    >
      {params.error ? (
        <div
          role="alert"
          className="mb-5 border border-foreground/15 bg-foreground/[0.04] px-3.5 py-3 text-sm text-foreground"
        >
          {params.error}
        </div>
      ) : null}

      {params.message ? (
        <div
          role="status"
          className="mb-5 border border-foreground/15 bg-foreground/[0.04] px-3.5 py-3 text-sm text-foreground"
        >
          {params.message}
        </div>
      ) : null}

      <form action={login} className="space-y-5">
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
            className="auth-field"
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
            autoComplete="current-password"
            placeholder="••••••••"
            className="auth-field"
          />
        </div>

        <button type="submit" data-pressable className="auth-submit">
          Iniciar sesión
        </button>
      </form>
    </AuthShell>
  );
}
