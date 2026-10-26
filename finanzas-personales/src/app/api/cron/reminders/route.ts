import { NextResponse, type NextRequest } from "next/server";
import webpush from "web-push";
import { createAdminClient } from "@/lib/supabase/admin";
import { dueReminder, hourInBogota, todayInBogota } from "@/lib/subscriptions";

// Un GitHub Action lo llama cada hora con Authorization: Bearer CRON_SECRET.
// Cada pago avisa un día antes y el mismo día, desde la hora que eligió.
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
  const today = todayInBogota();
  const hour = hourInBogota();

  const { data: subs, error } = await admin.from("recurring_payments").select("*");
  if (error) {
    return NextResponse.json({ error: "No se pudo leer" }, { status: 500 });
  }

  let due = 0;
  let sent = 0;
  for (const sub of subs ?? []) {
    const reminder = dueReminder(sub, today, hour);
    if (!reminder) continue;
    due++;

    const { data: devices } = await admin
      .from("push_subscriptions")
      .select("*")
      .eq("user_id", sub.user_id);

    const payload = JSON.stringify({
      title:
        reminder.kind === "same"
          ? `Hoy vence: ${sub.name}`
          : `Mañana vence: ${sub.name}`,
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

    // Sin dispositivos no se marca: llegará en cuanto se activen los avisos.
    if (!devices?.length) continue;
    await admin
      .from("recurring_payments")
      .update({ last_reminder: reminder.key })
      .eq("id", sub.id);
  }

  return NextResponse.json({ ok: true, hour, due, sent });
}
