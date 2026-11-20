const DAY = 86_400_000;

export function daysAgo(n: number, from = new Date()): Date {
  return new Date(from.getTime() - n * DAY);
}

export function addYears(iso: string, years: number): string {
  const d = new Date(iso);
  d.setFullYear(d.getFullYear() + years);
  return d.toISOString();
}

export function daysUntil(iso: string, from = new Date()): number {
  return Math.ceil((new Date(iso).getTime() - from.getTime()) / DAY);
}

export function fmtDate(iso: string): string {
  // Date-only strings (YYYY-MM-DD) are read as local dates, not UTC midnight.
  const d = /^\d{4}-\d{2}-\d{2}$/.test(iso) ? new Date(`${iso}T12:00:00`) : new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function fmtMonthYear(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

export function ageFrom(dob: string, from = new Date()): number {
  const d = new Date(`${dob}T12:00:00`);
  let age = from.getFullYear() - d.getFullYear();
  const m = from.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && from.getDate() < d.getDate())) age--;
  return age;
}

export type RxStatus = "current" | "expiring" | "expired";

export const EXPIRING_WINDOW_DAYS = 60;

export function rxStatus(expiresAt: string, from = new Date()): RxStatus {
  const left = daysUntil(expiresAt, from);
  if (left < 0) return "expired";
  if (left <= EXPIRING_WINDOW_DAYS) return "expiring";
  return "current";
}
