import { Suspense } from "react";
import { getSubscriptions } from "@/app/actions/subscriptions";
import { getCategories } from "@/app/actions/categories";
import { todayInBogota } from "@/lib/subscriptions";
import { PageShell } from "@/components/layout/page-shell";
import { NotifyButton } from "@/components/subscriptions/notify-button";
import { SubscriptionForm } from "@/components/subscriptions/subscription-form";
import { SubscriptionList } from "@/components/subscriptions/subscription-list";

async function SubscriptionsContent() {
  const [subs, categories] = await Promise.all([
    getSubscriptions(),
    getCategories(),
  ]);
  return (
    <>
      <SubscriptionList subs={subs} today={todayInBogota()} />
      <SubscriptionForm categories={categories} />
    </>
  );
}

export default function SubscriptionsPage() {
  return (
    <PageShell>
      <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
        Pagos recurrentes
      </h1>
      <NotifyButton publicKey={process.env.NEXT_VAPID_PUBLIC_KEY ?? ""} />
      <Suspense
        fallback={<div className="h-32 animate-pulse rounded-2xl bg-muted" />}
      >
        <SubscriptionsContent />
      </Suspense>
    </PageShell>
  );
}
