import { PageShell } from "@/components/layout/page-shell";

export default function DashboardLoading() {
  return (
    <PageShell wide>
      <div className="space-y-2">
        <div className="h-4 w-36 animate-pulse rounded-md bg-muted" />
        <div className="h-7 w-44 animate-pulse rounded-md bg-muted" />
      </div>
      <div className="h-28 animate-pulse rounded-2xl bg-primary/20 sm:h-32" />
      <div className="grid gap-5 lg:grid-cols-5">
        <div className="space-y-5 lg:col-span-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="h-24 animate-pulse rounded-2xl bg-muted" />
            <div className="h-24 animate-pulse rounded-2xl bg-muted" />
          </div>
          <div className="h-40 animate-pulse rounded-2xl bg-muted" />
        </div>
        <div className="h-56 animate-pulse rounded-2xl bg-muted lg:col-span-3" />
      </div>
    </PageShell>
  );
}
