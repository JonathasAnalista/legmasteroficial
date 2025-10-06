export function parseDateBR(value) {
  const [datePart] = String(value || '').split(', ');
  const [day, month, year] = (datePart || '').split('/');
  if (!day || !month || !year) return null;
  return new Date(`${year}-${month}-${day}`);
}

export function startOfDay(date) {
  if (!date) return null;
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

export function differenceInDays(base, target) {
  if (!base || !target) return Number.POSITIVE_INFINITY;
  const baseDay = startOfDay(base);
  const targetDay = startOfDay(target);
  if (!baseDay || !targetDay) return Number.POSITIVE_INFINITY;
  const diffMs = baseDay.getTime() - targetDay.getTime();
  return diffMs / (24 * 60 * 60 * 1000);
}

export function toISODate(date) {
  return date ? date.toISOString().split('T')[0] : null;
}
