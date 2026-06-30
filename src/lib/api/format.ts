export function formatApiDateTime(value: string | number | null | undefined): string {
  if (value == null) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toISOString().slice(0, 16).replace("T", " ");
}

export function formatApiDate(value: string | null | undefined): string {
  if (!value) return "";
  return value.slice(0, 10);
}

export function toNumber(value: unknown): number {
  return Number(value ?? 0);
}
