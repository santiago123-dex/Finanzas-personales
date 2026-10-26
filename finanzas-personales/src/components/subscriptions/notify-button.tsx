"use client";

import { useEffect, useState } from "react";
import { Bell, BellOff } from "lucide-react";
import { savePushSubscription } from "@/app/actions/subscriptions";

type State = "checking" | "unsupported" | "off" | "denied" | "on";

function urlBase64ToUint8Array(base64: string) {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const raw = atob((base64 + padding).replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from(raw, (c) => c.charCodeAt(0));
}

export function NotifyButton() {
  const [state, setState] = useState<State>("checking");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (async () => {
      if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
        setState("unsupported");
        return;
      }
      if (Notification.permission === "denied") {
        setState("denied");
        return;
      }
      const reg = await navigator.serviceWorker.ready;
      const existing = await reg.pushManager.getSubscription();
      setState(existing && Notification.permission === "granted" ? "on" : "off");
    })().catch(() => setState("unsupported"));
  }, []);

  async function enable() {
    setBusy(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setState(permission === "denied" ? "denied" : "off");
        return;
      }
      const reg = await navigator.serviceWorker.ready;
      const sub =
        (await reg.pushManager.getSubscription()) ??
        (await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(
            process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? ""
          ),
        }));
      const json = sub.toJSON();
      await savePushSubscription({
        endpoint: sub.endpoint,
        p256dh: json.keys?.p256dh ?? "",
        auth: json.keys?.auth ?? "",
      });
      setState("on");
    } catch (error) {
      console.error(error);
      setState("off");
    } finally {
      setBusy(false);
    }
  }

  if (state === "checking") return null;

  if (state === "on") {
    return (
      <p className="flex items-center gap-2 rounded-2xl bg-muted px-4 py-3 text-sm text-muted-foreground">
        <Bell className="h-4 w-4" /> Avisos activados en este dispositivo
      </p>
    );
  }

  if (state === "unsupported" || state === "denied") {
    return (
      <p className="flex items-start gap-2 rounded-2xl bg-muted px-4 py-3 text-sm text-muted-foreground">
        <BellOff className="mt-0.5 h-4 w-4 shrink-0" />
        {state === "denied"
          ? "Bloqueaste las notificaciones. Actívalas en Ajustes del iPhone → Notificaciones → Finanzas."
          : "Para recibir avisos en iPhone, agrega la app a la pantalla de inicio (Compartir → Agregar a pantalla de inicio) y ábrela desde ahí."}
      </p>
    );
  }

  return (
    <button
      type="button"
      onClick={enable}
      disabled={busy}
      className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-lift disabled:opacity-50"
    >
      <Bell className="h-4 w-4" /> Activar avisos de vencimiento
    </button>
  );
}
