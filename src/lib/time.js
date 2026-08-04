// Timezone-aware helpers (Africa/Algiers, UTC+1, no DST)
export const TZ = 'Africa/Algiers';

export function todayStr() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

export function addDaysISO(dateStr, n) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + n));
  return dt.toISOString().slice(0, 10);
}

export function yesterdayStr() {
  return addDaysISO(todayStr(), -1);
}

export function nowMinutes() {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: TZ,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date()).split(':');
  return Number(parts[0]) * 60 + Number(parts[1]);
}

export function minutesOf(hhmm) {
  if (!hhmm) return null;
  const [h, m] = hhmm.split(':').map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return null;
  return h * 60 + m;
}

export function hm(total) {
  total = ((Math.round(total) % 1440) + 1440) % 1440;
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
}

export function fmtClock() {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: TZ,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(new Date());
}

export function fmtDateNice(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: 'UTC',
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date(Date.UTC(y, m - 1, d)));
}

export function greet() {
  const m = nowMinutes();
  if (m < 12 * 60) return 'Good Morning';
  if (m < 17 * 60) return 'Good Afternoon';
  if (m < 21 * 60) return 'Good Evening';
  return 'Good Night';
}

export function fmtDuration(totalMin) {
  const h = Math.floor(totalMin / 60);
  const m = Math.round(totalMin % 60);
  return h ? `${h}h ${m}m` : `${m}m`;
}

export function countdownLabel(targetMin) {
  const now = nowMinutes();
  const diff = targetMin - now;
  if (diff < 0) return { done: true, label: 'Passed', mins: -diff };
  return { done: false, label: `${Math.floor(diff / 60)}h ${diff % 60}m`, mins: diff };
}

// "Now" rounded to the minute, as minutes, accounting for cross-midnight
export function minutesUntil(hhmm) {
  const t = minutesOf(hhmm);
  if (t === null) return null;
  return ((t - nowMinutes()) % 1440 + 1440) % 1440;
}
