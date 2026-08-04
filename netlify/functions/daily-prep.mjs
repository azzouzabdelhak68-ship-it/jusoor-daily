// /api/daily-prep — run by GitHub Actions at 23:55 GMT+1 (or manually)
// Prepares "tomorrow": prayer times, wake/sleep, quran start, gym rotation, routine tasks.
// Guarded by X-Prep-Token header.
import { getDatabase } from '@netlify/database';
import { ok, err, parseBody, withCors } from './_shared/respond.js';
import { prepDay, todayStr, tomorrowStr } from './_shared/prep.js';

async function main(event) {
  if (event.httpMethod !== 'POST') return err('Method not allowed', 405);

  // Secret guard: PREP_TOKEN env var must match the header (or be unset in dev)
  const expected = process.env.PREP_TOKEN;
  const provided = event.headers['x-prep-token'] || '';
  if (expected && provided !== expected) {
    return err('Unauthorized', 401);
  }

  const body = parseBody(event);
  const db = getDatabase();
  const date = body.date || tomorrowStr();

  try {
    const day = await prepDay(db, date);
    const summary = {
      prepared_date: date,
      today: todayStr(),
      fajr: day.fajr,
      wake_time: day.wake_time,
      sleep_time: day.sleep_time,
      quran_start: day.quran_start,
      gym_type: day.gym_type,
    };

    // Optional phone push via ntfy.sh
    if (process.env.NTFY_TOPIC) {
      const msg =
        `📅 ${date}\n` +
        `🌅 Fajr ${day.fajr} · wake ${day.wake_time}\n` +
        `📖 Quran start page ${day.quran_start}\n` +
        `💪 Gym: ${day.gym_type}\n` +
        `😴 Sleep ${day.sleep_time}`;
      try {
        await fetch(`https://ntfy.sh/${process.env.NTFY_TOPIC}`, {
          method: 'POST',
          body: msg,
          headers: { Title: 'Jusoor Daily — Tomorrow is ready' },
        });
      } catch (e) {
        console.error('ntfy push failed:', e.message);
      }
    }

    return ok(summary);
  } catch (e) {
    console.error('daily-prep failed:', e);
    return err(e && e.message ? e.message : 'Prep failed');
  }
}

export const handler = withCors(main);
