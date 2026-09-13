import { createClient } from "@/lib/supabase/server";
import { logout } from "@/app/actions/auth";
import { redirect } from "next/navigation";
import { PageShell } from "@/components/layout/page-shell";
import { Card, CardContent } from "@/components/ui/card";
import { SetPinForm } from "@/components/auth/set-pin-form";
import { KeyRound } from "lucide-react";

export default async function SetPinPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-dvh bg-background">
      <PageShell>
        <div className="animate-rise mx-auto w-full max-w-sm space-y-5 py-8">
          <div className="space-y-2 text-center">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-soft">
              <KeyRound className="h-5 w-5" strokeWidth={2.25} />
            </span>
            <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
              Creá tu código rápido
            </h1>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Con este código de 4 o 6 dígitos vas a entrar sin escribir tu
              contraseña.
            </p>
          </div>

          <Card className="shadow-soft ring-border/60">
            <CardContent className="pt-5">
              {params.error ? (
                <div
                  role="alert"
                  className="mb-5 border border-foreground/15 bg-foreground/[0.04] px-3.5 py-3 text-sm text-foreground"
                >
                  {params.error}
                </div>
              ) : null}
              <SetPinForm />
            </CardContent>
          </Card>

          <form action={logout} className="text-center">
            <button
              type="submit"
              className="min-h-9 text-xs font-medium text-muted-foreground underline decoration-foreground/25 underline-offset-4 transition-colors hover:text-foreground hover:decoration-foreground"
            >
              Salir y usar otra cuenta
            </button>
          </form>
        </div>
      </PageShell>
    </div>
  );
}
