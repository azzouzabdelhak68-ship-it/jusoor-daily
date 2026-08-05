// /api/state — full dashboard bundle (self-heals today + tomorrow)
import { getDatabase } from '@netlify/database';
import { ok, withCors } from './_shared/respond.js';
import { prepDay, todayStr, tomorrowStr } from './_shared/prep.js';

async function main() {
  const db = getDatabase();

  const today = todayStr();
  const tomorrow = tomorrowStr();
  const from = new Date(Date.now() - 20 * 86400000).toISOString().slice(0, 10);

  // Ensure today + tomorrow rows exist (fetches prayer times + suggestions)
  const todayRow = await prepDay(db, today);
  const tomorrowRow = await prepDay(db, tomorrow);

  const [days, tasksToday, tasksTomorrow, books, plans, habits, splits, prs] = await Promise.all([
    db.sql`SELECT * FROM days WHERE date >= ${from} ORDER BY date ASC`,
    db.sql`SELECT * FROM tasks WHERE date = ${today} ORDER BY start_time ASC NULLS LAST, id ASC`,
    db.sql`SELECT * FROM tasks WHERE date = ${tomorrow} ORDER BY start_time ASC NULLS LAST, id ASC`,
    db.sql`SELECT * FROM books ORDER BY status ASC, title ASC`,
    db.sql`SELECT * FROM workout_plans ORDER BY id ASC`,
    db.sql`SELECT * FROM habits ORDER BY sort ASC, id ASC`,
    db.sql`SELECT * FROM splits ORDER BY updated_at DESC, id ASC`,
    db.sql`SELECT * FROM prs ORDER BY date DESC, id DESC LIMIT 300`,
  ]);

  const log = await db.sql`SELECT date, habit_id FROM habit_log WHERE date >= ${from}`;

  return ok({
    today,
    tomorrow,
    todayRow,
    tomorrowRow,
    days,
    tasksToday,
    tasksTomorrow,
    books,
    plans,
    habits,
    habitLog: log,
    splits,
    prs,
  });
}

export const handler = withCors(main);
