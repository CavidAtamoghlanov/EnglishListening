import { toLocalDateKey } from "../../../utils/date";

const dayMs = 86_400_000;

export function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * dayMs);
}

export function startOfLocalDay(date = new Date()): Date {
  return new Date(`${toLocalDateKey(date)}T00:00:00`);
}

export function isDue(isoDate: string, now = new Date()): boolean {
  const dueTime = new Date(isoDate).getTime();
  return Number.isFinite(dueTime) && dueTime <= now.getTime();
}

export function isToday(isoDate: string, now = new Date()): boolean {
  return toLocalDateKey(new Date(isoDate)) === toLocalDateKey(now);
}

export function dueTodayIso(now = new Date()): string {
  return startOfLocalDay(now).toISOString();
}

export function dueInDaysIso(days: number, now = new Date()): string {
  return startOfLocalDay(addDays(now, days)).toISOString();
}
