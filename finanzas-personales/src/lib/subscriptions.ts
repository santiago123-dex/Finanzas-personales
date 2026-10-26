// Fechas como "YYYY-MM-DD" en hora de Colombia, para que el aviso no
// dependa de la zona horaria del servidor (Vercel corre en UTC).
const TZ = "America/Bogota";

export function todayInBogota(now = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(now);
}

export function addDays(date: string, days: number): string {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/** Vencimiento de `dueDay` en el mes de `ref` (31 en febrero → 28/29). */
export function dueDateInMonth(ref: string, dueDay: number): string {
  const [y, m] = ref.split("-").map(Number);
  const lastDay = new Date(Date.UTC(y, m, 0)).getUTCDate();
  const day = Math.min(dueDay, lastDay);
  return `${y}-${String(m).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function hourInBogota(now = new Date()): number {
  const h = new Intl.DateTimeFormat("en-GB", {
    timeZone: TZ,
    hour: "2-digit",
    hour12: false,
  }).format(now);
  return Number(h) % 24;
}

export type ReminderKind = "before" | "same";

/**
 * Qué aviso toca enviar ahora: "before" (el día anterior al vencimiento)
 * o "same" (el mismo día), a partir de la hora elegida. Devuelve la clave
 * del aviso para no repetirlo, o null si no toca nada.
 */
export function dueReminder(
  sub: {
    due_day: number;
    notify_hour: number;
    last_paid_on: string | null;
    last_reminder: string | null;
  },
  today: string,
  hour: number
): { kind: ReminderKind; key: string } | null {
  if (hour < sub.notify_hour) return null;

  const candidates: [ReminderKind, string][] = [
    ["same", today],
    ["before", addDays(today, 1)],
  ];
  for (const [kind, day] of candidates) {
    if (dueDateInMonth(day, sub.due_day) !== day) continue;
    // Si ya se pagó el ciclo de ese mes, no se avisa.
    if (sub.last_paid_on && sub.last_paid_on.slice(0, 7) === day.slice(0, 7)) {
      return null;
    }
    const key = `${day}:${kind}`;
    return sub.last_reminder === key ? null : { kind, key };
  }
  return null;
}

export type SubscriptionStatus = {
  dueDate: string;
  daysLeft: number;
  paid: boolean;
};

/**
 * Próximo vencimiento: si ya se pagó el ciclo de este mes, apunta al mes
 * siguiente; si no, a este mes (y puede estar vencido).
 */
export function subscriptionStatus(
  dueDay: number,
  lastPaidOn: string | null,
  today: string
): SubscriptionStatus {
  const thisMonth = today.slice(0, 7);
  const paid = !!lastPaidOn && lastPaidOn.slice(0, 7) === thisMonth;
  const nextMonthRef = addDays(`${thisMonth}-28`, 5);
  const dueDate = dueDateInMonth(paid ? nextMonthRef : today, dueDay);
  const daysLeft = Math.round(
    (Date.parse(`${dueDate}T00:00:00Z`) - Date.parse(`${today}T00:00:00Z`)) /
      86_400_000
  );
  return { dueDate, daysLeft, paid };
}
