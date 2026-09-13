import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForms } from "@/components/auth/login-forms";
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
      subtitle="Entrá con tu código o tu contraseña."
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
          <span className="mt-2 block">
            ¿Te registraste y te falta el código?{" "}
            <Link
              href="/verify"
              className="font-medium text-foreground underline decoration-foreground/25 underline-offset-4 transition-colors hover:decoration-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              Verificalo acá
            </Link>
          </span>
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

      <LoginForms />
    </AuthShell>
  );
}
