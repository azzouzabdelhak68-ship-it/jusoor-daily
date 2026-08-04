// Client-side reminder engine (Browser Notifications API)
// Fires wake/prayer/quran/sleep/task reminders while the dashboard tab is open.
import { nowMinutes, minutesOf } from './time.js';
import { suggestedEnd } from './quran.js';

const LS_N = 'jusoor_last_notified';

function getLast() {
  try {
    return JSON.parse(localStorage.getItem(LS_N)) || {};
  } catch {
    return {};
  }
}

export async function requestPermission() {
  if (!('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  try {
    const p = await Notification.requestPermission();
    return p === 'granted';
  } catch {
    return false;
  }
}

export function permissionState() {
  return 'Notification' in window ? Notification.permission : 'unsupported';
}

// Build the list of today's reminder moments
function buildEvents(data) {
  if (!data || !data.todayRow) return [];
  const day = data.todayRow;
  const qStart = day.quran_start || 1;
  const qEnd = suggestedEnd(qStart);
  const ev = [];
  const P = (hhmm, id, title, body) => {
    const m = minutesOf(hhmm);
    if (m !== null) ev.push({ m, id, title, body });
  };
  P(day.wake_time, 'wake', '⏰ Wake up', 'Fajr is in ~10 minutes. يَا حَيُّ يَا قَيُّومُ');
  P(day.fajr, 'fajr', '🌅 Fajr', 'Time for Fajr prayer');
  P(day.dhuhr, 'dhuhr', '☀️ Dhuhr', 'Time for Dhuhr prayer');
  P(day.asr, 'asr', '🌤 Asr', 'Time for Asr prayer');
  P(day.maghrib, 'maghrib', '🌇 Maghrib', `Time for Quran — today's pages ${qStart}–${qEnd}`);
  P(day.isha, 'isha', '🌙 Isha', 'Time for Isha prayer');
  P(day.sleep_time, 'sleep', '😴 Wind down', 'Isha + 1h30 — prepare for sleep');
  for (const t of data.tasksToday || []) {
    if (t.status === 'done' || !t.start_time) continue;
    const m = minutesOf(t.start_time);
    if (m === null) continue;
    const rem = t.reminder_before || 0;
    ev.push({ m: m - rem, id: `task:${t.id}`, title: '⏱ Next task', body: `${t.title} at ${t.start_time} · ${t.project || 'Jusoor'}` });
  }
  return ev;
}

export function startReminderEngine(getData, enabled) {
  if (!('Notification' in window)) return () => {};
  const tick = () => {
    if (!enabled()) return;
    if (permissionState() !== 'granted') return;
    const data = getData();
    if (!data) return;
    const now = nowMinutes();
    const last = getLast();
    let changed = false;
    for (const ev of buildEvents(data)) {
      const key = `${data.today}:${ev.id}`;
      if (last[key]) continue;
      // Fire within a ±1 minute window of the target minute
      if (ev.m !== now && ev.m !== now + 1 && ev.m !== now - 1) continue;
      try {
        new Notification(ev.title, { body: ev.body, icon: '/icon.png' });
      } catch {
        /* ignore */
      }
      last[key] = Date.now();
      changed = true;
    }
    if (changed) {
      try {
        localStorage.setItem(LS_N, JSON.stringify(last));
      } catch {
        /* ignore */
      }
    }
  };
  tick();
  const iv = setInterval(tick, 20000);
  return () => clearInterval(iv);
}
