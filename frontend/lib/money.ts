/** Format amount as Thai Baht (e.g. ฿1,290). */
export function formatBaht(amount: number | string | null | undefined): string {
  const value = Number(amount ?? 0);
  if (Number.isNaN(value)) {
    return "฿0";
  }

  return new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
    maximumFractionDigits: value % 1 === 0 ? 0 : 2,
  }).format(value);
}
