import { createClient } from "@/lib/supabase/server";
import { logout } from "@/app/actions/auth";
import { BottomNav } from "@/components/layout/bottom-nav";
import { SideNav } from "@/components/layout/side-nav";
import { LogOut, Wallet } from "lucide-react";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="flex min-h-dvh bg-background">
      <SideNav />

      <div className="flex min-w-0 flex-1 flex-col">
        <header
          className="sticky top-0 z-40 border-b border-border/50 bg-background/85 backdrop-blur-xl backdrop-saturate-150 supports-[backdrop-filter]:bg-background/70"
          style={{ paddingTop: "env(safe-area-inset-top)" }}
        >
          <div className="mx-auto flex h-14 w-full max-w-lg items-center justify-between px-4 sm:px-5 md:max-w-3xl md:px-8 lg:max-w-5xl lg:px-10">
            <div className="flex items-center gap-2.5 md:hidden">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-soft">
                <Wallet className="h-4 w-4" strokeWidth={2.25} />
              </span>
              <span className="text-[15px] font-semibold tracking-tight text-foreground">
                Finanzas
              </span>
            </div>
            <p className="hidden text-sm font-medium text-muted-foreground md:block">
              Tu libro del mes
            </p>
            <div className="flex items-center gap-1.5">
              {user?.email && (
                <span className="hidden max-w-[180px] truncate text-xs text-muted-foreground sm:inline lg:max-w-[240px]">
                  {user.email}
                </span>
              )}
              <form action={logout}>
                <button
                  type="submit"
                  className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg text-muted-foreground transition-colors duration-150 hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                  title="Cerrar sesión"
                  aria-label="Cerrar sesión"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </form>
            </div>
          </div>
        </header>

        <main className="flex-1 pb-[calc(5.5rem+env(safe-area-inset-bottom))] md:pb-8">
          {children}
        </main>

        <BottomNav />
      </div>
    </div>
  );
}
