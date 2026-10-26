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
