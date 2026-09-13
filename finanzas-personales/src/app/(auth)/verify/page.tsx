import { AuthShell } from "@/components/auth/auth-shell";
import { VerifyForm } from "@/components/auth/verify-form";
import Link from "next/link";

export default async function VerifyPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string; error?: string; message?: string }>;
}) {
  const params = await searchParams;

  return (
    <AuthShell
      title="Verificá tu email"
      subtitle="Ingresá el código para entrar más rápido."
      panelHeadline="Un código y adentro."
      panelSupport="Sin vueltas: confirmás tu email y arrancás con tu libro."
      footer={
        <>
          ¿Te equivocaste de email?{" "}
          <Link
            href="/register"
            className="font-medium text-foreground underline decoration-foreground/25 underline-offset-4 transition-colors hover:decoration-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            Volvé al registro
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

      <VerifyForm email={params.email ?? ""} />
    </AuthShell>
  );
}
