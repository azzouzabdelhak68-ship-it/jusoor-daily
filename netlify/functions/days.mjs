// /api/days — daily log rows: read, ensure, and update
import { getDatabase } from '@netlify/database';
import { ok, err, parseBody, withCors } from './_shared/respond.js';
import { getDay, prepDay, upsertDay } from './_shared/prep.js';

async function main(event) {
  const db = getDatabase();
  const method = event.httpMethod;
  const q = event.queryStringParameters || {};

  if (method === 'GET') {
    if (q.from && q.to) {
      const rows = await db.sql`SELECT * FROM days WHERE date >= ${q.from} AND date <= ${q.to} ORDER BY date ASC`;
      return ok(rows);
    }
    if (q.date) {
      let row = await getDay(db, q.date);
      if (!row && q.ensure === 'true') {
        row = await prepDay(db, q.date);
      }
      return ok(row);
    }
    return ok([]);
  }

  if (method === 'POST' || method === 'PUT') {
    const body = parseBody(event);
    if (!body.date) return err('Missing date', 400);

    if (body.ensure) {
      const row = await prepDay(db, body.date);
      return ok(row);
    }

    const patch = body.patch || body;
    delete patch.date;
    const allow = [
      'fajr', 'dhuhr', 'asr', 'maghrib', 'isha',
      'wake_time', 'sleep_time',
      'quran_start', 'quran_end',
      'gym_type', 'gym_done', 'cardio_min',
      'book_pages', 'mood', 'weight', 'steps', 'calories', 'notes',
    ];
    const clean = {};
    for (const k of allow) {
      if (patch[k] !== undefined) clean[k] = patch[k];
    }
    await upsertDay(db, body.date, clean);
    return ok(await getDay(db, body.date));
  }

  return err('Method not allowed', 405);
}

export const handler = withCors(main);
