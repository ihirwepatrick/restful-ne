import type { Period } from '@tzw/shared';

export function getPeriodRange(period: Period, anchor?: string): { from: Date; to: Date } {
  const date = anchor ? new Date(anchor) : new Date();
  const to = new Date(date);
  const from = new Date(date);

  if (period === 'daily') {
    from.setHours(0, 0, 0, 0);
    to.setHours(23, 59, 59, 999);
  } else if (period === '7d') {
    from.setDate(from.getDate() - 6);
    from.setHours(0, 0, 0, 0);
    to.setHours(23, 59, 59, 999);
  } else if (period === '30d') {
    from.setDate(from.getDate() - 29);
    from.setHours(0, 0, 0, 0);
    to.setHours(23, 59, 59, 999);
  } else if (period === '90d') {
    from.setDate(from.getDate() - 89);
    from.setHours(0, 0, 0, 0);
    to.setHours(23, 59, 59, 999);
  } else if (period === 'monthly') {
    from.setDate(1);
    from.setHours(0, 0, 0, 0);
    to.setMonth(to.getMonth() + 1, 0);
    to.setHours(23, 59, 59, 999);
  } else {
    from.setMonth(0, 1);
    from.setHours(0, 0, 0, 0);
    to.setMonth(11, 31);
    to.setHours(23, 59, 59, 999);
  }
  return { from, to };
}

export function getPreviousPeriodRange(period: Period, anchor?: string): { from: Date; to: Date } {
  const current = getPeriodRange(period, anchor);
  const durationMs = current.to.getTime() - current.from.getTime();
  const to = new Date(current.from.getTime() - 1);
  const from = new Date(to.getTime() - durationMs);
  return { from, to };
}

export function computeDelta(current: number, previous: number): { value: number; percent: number } {
  const value = current - previous;
  const percent =
    previous === 0 ? (current > 0 ? 100 : 0) : Math.round((value / previous) * 1000) / 10;
  return { value, percent };
}

export function eachDayInRange(from: Date, to: Date): string[] {
  const days: string[] = [];
  const cursor = new Date(from);
  cursor.setHours(0, 0, 0, 0);
  const end = new Date(to);
  end.setHours(0, 0, 0, 0);
  while (cursor <= end) {
    days.push(cursor.toISOString().slice(0, 10));
    cursor.setDate(cursor.getDate() + 1);
  }
  return days;
}
