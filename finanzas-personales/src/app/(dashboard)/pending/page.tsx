import { Suspense } from "react";
import { getPending } from "@/app/actions/pending";
import { getCategories } from "@/app/actions/categories";
import { PageShell } from "@/components/layout/page-shell";
import { PendingList } from "@/components/pending/pending-list";
import { PasteBox } from "@/components/pending/paste-box";
import { ShortcutSetup } from "@/components/pending/shortcut-setup";

async function PendingContent() {
  const [pending, categories] = await Promise.all([
    getPending(),
    getCategories(),
  ]);
  return <PendingList pending={pending} categories={categories} />;
}

export default function PendingPage() {
  return (
    <PageShell>
      <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
        Por confirmar
      </h1>
      <Suspense
        fallback={<div className="h-32 animate-pulse rounded-2xl bg-muted" />}
      >
        <PendingContent />
      </Suspense>
      <PasteBox />
      <ShortcutSetup />
    </PageShell>
  );
}
