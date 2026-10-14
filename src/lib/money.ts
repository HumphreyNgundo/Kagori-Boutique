/** All money is stored in minor units (KES cents) and formatted at the edge. */
export function formatMoney(minor: number, currency = "KES"): string {
  const major = minor / 100;
  const formatted = major.toLocaleString("en-KE", {
    minimumFractionDigits: major % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  });
  return `${currency} ${formatted}`;
}

export function ksh(minor: number): string {
  return formatMoney(minor, "KES");
}
