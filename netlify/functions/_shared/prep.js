// Prayer time + day preparation logic (shared by state + daily-prep functions)
import { TZ, LAT, LON, METHOD, QURAN_TOTAL, GYM_ROTATION } from './constants.js';

export function addMinutes(time, mins) {
  if (!time) return null;
  const [h, m] = time.split(':').map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return null;
  const total = (((h * 60 + m + mins) % 1440) + 1440) % 1440;
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
}

export function minutesToHHMM(total) {
  total = ((total % 1440) + 1440) % 1440;
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
}

export async function fetchPrayerTimes(dateStr) {
  const [y, m, d] = dateStr.split('-');
  const url = `https://api.aladhan.com/v1/timings/${d}-${m}-${y}?latitude=${LAT}&longitude=${LON}&method=${METHOD}&timezonestring=${encodeURIComponent(TZ)}`;
  const res = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!res.ok) throw new Error(`AlAdhan HTTP ${res.status}`);
  const json = await res.json();
  if (json.code !== 200) throw new Error(`AlAdhan error: ${json.status || 'unknown'}`);
  const t = json.data.timings;
  return {
    fajr: t.Fajr,
    dhuhr: t.Dhuhr,
    asr: t.Asr,
    maghrib: t.Maghrib,
    isha: t.Isha,
  };
}

export async function getDay(db, dateStr) {
  const rows = await db.sql`SELECT * FROM days WHERE date = ${dateStr}`;
  return rows[0] || null;
}

export async function upsertDay(db, dateStr, patch) {
  const cols = Object.keys(patch);
  if (!cols.length) return;
  const placeholders = cols.map((_, i) => `$${i + 2}`).join(', ');
  const sets = cols.map((c, i) => `${c} = $${i + 2}`).join(', ');
  await db.sql.unsafe(
    `INSERT INTO days (date, ${cols.join(', ')}) VALUES ($1, ${placeholders})
     ON CONFLICT (date) DO UPDATE SET ${sets}, updated_at = NOW()`,
    [dateStr, ...cols.map((c) => patch[c])]
  );
}

export async function computeQuranStart(db) {
  const rows = await db.sql`SELECT quran_start, quran_end FROM days WHERE quran_end IS NOT NULL ORDER BY date DESC LIMIT 1`;
  const last = rows[0];
  if (!last) return 1;
  const base = last.quran_end ?? last.quran_start;
  return base >= QURAN_TOTAL ? 1 : base + 1;
}

export async function getActiveSplit(db) {
  const rows = await db.sql`SELECT * FROM splits WHERE is_active ORDER BY updated_at DESC LIMIT 1`;
  return rows[0] || null;
}

export async function computeGymType(db) {
  const split = await getActiveSplit(db);
  const cycle = (split?.days || []).map((d) => d.label);
  if (!cycle.length) return GYM_ROTATION[0];
  const rows = await db.sql`SELECT gym_type FROM days WHERE gym_type IS NOT NULL ORDER BY date DESC LIMIT 1`;
  const last = rows[0]?.gym_type;
  if (!last) return cycle[0];
  const idx = cycle.indexOf(last);
  return cycle[(idx + 1) % cycle.length];
}

export function suggestedQuranEnd(start) {
  return Math.min(start + 39, QURAN_TOTAL);
}

async function taskExists(db, dateStr, title) {
  const rows = await db.sql`SELECT id FROM tasks WHERE date = ${dateStr} AND title = ${title} LIMIT 1`;
  return rows.length > 0;
}

async function insertTask(db, dateStr, task) {
  await db.sql`
    INSERT INTO tasks (date, title, project, start_time, end_time, priority, status, is_daily)
    VALUES (${dateStr}, ${task.title}, ${task.project || 'Jusoor'}, ${task.start_time || null}, ${task.end_time || null}, ${task.priority || 'Medium'}, 'todo', ${true})
  `;
}

export async function ensureDailyTasks(db, dateStr, day) {
  const qStart = day.quran_start || 1;
  const qEnd = suggestedQuranEnd(qStart);
  const routine = [
    { title: 'Wake up', start_time: day.wake_time, end_time: addMinutes(day.wake_time, 10) },
    { title: 'Fajr', start_time: day.fajr, end_time: addMinutes(day.fajr, 10) },
    { title: 'Jusoor — Deep Work', project: 'Jusoor', start_time: '08:00', end_time: '20:00' },
    { title: `Quran — pages ${qStart}–${qEnd}`, start_time: day.maghrib, end_time: day.isha },
    { title: 'Sleep — wind down', start_time: day.sleep_time, end_time: addMinutes(day.sleep_time, 10) },
  ];
  const gymType = day.gym_type;
  if (gymType && gymType !== 'Rest') {
    routine.push({ title: `Gym — ${gymType}`, project: 'Gym', start_time: '17:00', end_time: '18:30' });
  }
  for (const t of routine) {
    if (!(await taskExists(db, dateStr, t.title))) {
      await insertTask(db, dateStr, t);
    }
  }
}

// Full preparation for a single day: prayer times + suggestions + routine tasks.
// Returns the prepared day object.
export async function prepDay(db, dateStr) {
  const times = await fetchPrayerTimes(dateStr);
  const wake = addMinutes(times.fajr, -10);
  const sleep = addMinutes(times.isha, 90);

  const existing = await getDay(db, dateStr);
  const quranStart = existing?.quran_end
    ? existing.quran_start
    : await computeQuranStart(db);
  const gymType = await computeGymType(db);

  await upsertDay(db, dateStr, {
    fajr: times.fajr,
    dhuhr: times.dhuhr,
    asr: times.asr,
    maghrib: times.maghrib,
    isha: times.isha,
    wake_time: wake,
    sleep_time: sleep,
    quran_start: quranStart,
    gym_type: gymType,
  });

  const day = await getDay(db, dateStr);
  await ensureDailyTasks(db, dateStr, day);

  return { ...day, wake_time: wake, sleep_time: sleep, quran_start: quranStart, gym_type: gymType };
}

// Today in the configured timezone (returned as YYYY-MM-DD)
export function todayStr() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

// "Tomorrow" in the configured timezone (returned as YYYY-MM-DD)
export function tomorrowStr() {
  const [y, m, d] = todayStr().split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + 1));
  return dt.toISOString().slice(0, 10);
}
