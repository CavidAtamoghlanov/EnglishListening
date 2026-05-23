export function toLocalDateKey(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function formatFriendlyDate(isoDate: string | null | undefined): string {
  if (!isoDate) {
    return "No practice yet";
  }

  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) {
    return "No practice yet";
  }

  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function daysBetween(dateA: string, dateB: string): number {
  const a = new Date(`${dateA}T00:00:00`);
  const b = new Date(`${dateB}T00:00:00`);
  const diff = b.getTime() - a.getTime();
  return Math.round(diff / 86_400_000);
}
