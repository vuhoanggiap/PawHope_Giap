export function formatVnd(amount?: number | null) {
  return Number(amount ?? 0).toLocaleString("vi-VN") + " ₫";
}