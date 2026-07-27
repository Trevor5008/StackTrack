export function formatCurrency(
  value: number,
  currency: string,
  showSign = false,
): string {
  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(Math.abs(value));

  if (!showSign || value === 0) return value < 0 ? `-${formatted}` : formatted;
  return `${value > 0 ? '+' : '-'}${formatted}`;
}

export function formatDate(date: string): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${date}T00:00:00Z`));
}

export function formatHours(hours: number): string {
  return `${Number.isInteger(hours) ? hours : hours.toFixed(1)} hr`;
}
