export const QURAN_TOTAL = 603;
export const TARGET_MIN = 30;
export const TARGET_MAX = 50;
export const SUGGEST = 40;

// Next start page after a given end (wraps 603 -> 1). Falls back to start if no end.
export function nextStart(start, end) {
  const base = end ?? start;
  if (!base) return 1;
  return base >= QURAN_TOTAL ? 1 : base + 1;
}

export function suggestedEnd(start) {
  return Math.min(start + SUGGEST - 1, QURAN_TOTAL);
}

export function progressPercent(end) {
  if (!end) return 0;
  return Math.round((Math.min(end, QURAN_TOTAL) / QURAN_TOTAL) * 100);
}

// Reading history for the last N days
export function historyFromDays(days) {
  return (days || [])
    .filter((d) => d && (d.quran_start != null || d.quran_end != null))
    .map((d) => ({
      date: d.date,
      start: d.quran_start,
      end: d.quran_end,
      pages: d.quran_end != null && d.quran_start != null ? d.quran_end - d.quran_start + 1 : 0,
    }));
}
