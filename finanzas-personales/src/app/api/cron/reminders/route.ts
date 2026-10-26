import { NextResponse, type NextRequest } from "next/server";
import webpush from "web-push";
import { createAdminClient } from "@/lib/supabase/admin";
import { addDays, dueDateInMonth, todayInBogota } from "@/lib/subscriptions";

// Vercel Cron llama esto una vez al día con Authorization: Bearer CRON_SECRET.
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const publicKey = process.env.NEXT_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  if (!publicKey || !privateKey) {
    return NextResponse.json({ error: "Faltan claves VAPID" }, { status: 500 });
  }
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT ?? "mailto:admin@example.com",
    publicKey,
    privateKey
  );

  const admin = createAdminClient();
  const tomorrow = addDays(todayInBogota(), 1);
  const tomorrowMonth = tomorrow.slice(0, 7);

  const { data: subs, error } = await admin.from("recurring_payments").select("*");
  if (error) {
    return NextResponse.json({ error: "No se pudo leer" }, { status: 500 });
  }

  const due = (subs ?? []).filter(
    (s) =>
      dueDateInMonth(tomorrow, s.due_day) === tomorrow &&
      !(s.last_paid_on && s.last_paid_on.slice(0, 7) === tomorrowMonth)
  );

  let sent = 0;
  for (const sub of due) {
    const { data: devices } = await admin
      .from("push_subscriptions")
      .select("*")
      .eq("user_id", sub.user_id);

    const payload = JSON.stringify({
      title: `Mañana vence: ${sub.name}`,
      body: `Pago de $${Number(sub.amount).toLocaleString("es-CO")}`,
      url: "/subscriptions",
    });

    for (const d of devices ?? []) {
      try {
        await webpush.sendNotification(
          { endpoint: d.endpoint, keys: { p256dh: d.p256dh, auth: d.auth } },
          payload
        );
        sent++;
      } catch (err) {
        const status = (err as { statusCode?: number }).statusCode;
        if (status === 404 || status === 410) {
          await admin.from("push_subscriptions").delete().eq("id", d.id);
        }
      }
    }
  }

  return NextResponse.json({ ok: true, due: due.length, sent });
}
