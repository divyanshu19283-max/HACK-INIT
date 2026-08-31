/**
 * Deterministic date formatting.
 *
 * `toLocaleDateString()` depends on the runtime locale, which differs between
 * the SSR worker and the browser (31/8/2026 vs 8/31/2026) and causes React
 * hydration mismatches. These helpers always produce the same string.
 */
export function formatDateISO(date: Date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

/** e.g. "31 Aug 2026" — stable across server and client (UTC based). */
const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export function formatDateShort(date: Date = new Date()): string {
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${day} ${MONTHS[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
}
