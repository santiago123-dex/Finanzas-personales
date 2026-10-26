import Link from "next/link";
import { Inbox } from "lucide-react";
import { countPending } from "@/app/actions/pending";

export async function PendingBanner() {
  const count = await countPending();
  if (count === 0) return null;
  return (
    <Link
      href="/pending"
      className="flex min-h-11 items-center gap-2 rounded-2xl bg-primary/10 px-4 text-sm font-medium text-primary"
    >
      <Inbox className="h-4 w-4" />
      {count === 1
        ? "1 movimiento del banco por confirmar"
        : `${count} movimientos del banco por confirmar`}
    </Link>
  );
}
