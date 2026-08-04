// /api/habits — habits + per-day completion log
import { getDatabase } from '@netlify/database';
import { ok, err, parseBody, withCors } from './_shared/respond.js';

async function main(event) {
  const db = getDatabase();
  const method = event.httpMethod;
  const q = event.queryStringParameters || {};

  if (method === 'GET') {
    const habits = await db.sql`SELECT * FROM habits ORDER BY sort ASC, id ASC`;
    if (q.days) {
      const from = q.from || new Date(Date.now() - Number(q.days) * 86400000).toISOString().slice(0, 10);
      const log = await db.sql`SELECT date, habit_id FROM habit_log WHERE date >= ${from}`;
      return ok({ habits, log });
    }
    return ok(habits);
  }

  if (method === 'POST') {
    const body = parseBody(event);
    if (body.toggle && body.date && body.habit_id) {
      const existing = await db.sql`SELECT id FROM habit_log WHERE date = ${body.date} AND habit_id = ${Number(body.habit_id)}`;
      if (existing.length) {
        await db.sql`DELETE FROM habit_log WHERE date = ${body.date} AND habit_id = ${Number(body.habit_id)}`;
        return ok({ date: body.date, habit_id: Number(body.habit_id), done: false });
      }
      await db.sql`INSERT INTO habit_log (date, habit_id) VALUES (${body.date}, ${Number(body.habit_id)})`;
      return ok({ date: body.date, habit_id: Number(body.habit_id), done: true });
    }
    if (!body.name) return err('name required', 400);
    const rows = await db.sql`
      INSERT INTO habits (name, icon, color, sort) VALUES (${body.name}, ${body.icon || '●'}, ${body.color || '#ef4444'}, ${body.sort || 0}) RETURNING *
    `;
    return ok(rows[0]);
  }

  if (method === 'PUT') {
    const body = parseBody(event);
    if (!body.id) return err('Missing id', 400);
    const allow = ['name', 'icon', 'color', 'sort'];
    const sets = [];
    const vals = [];
    for (const k of allow) {
      if (body.patch && body.patch[k] !== undefined) {
        sets.push(`${k} = $${sets.length + 1}`);
        vals.push(body.patch[k]);
      }
    }
    if (!sets.length) return err('Nothing to update', 400);
    vals.push(body.id);
    const rows = await db.sql.unsafe(`UPDATE habits SET ${sets.join(', ')} WHERE id = $${vals.length} RETURNING *`, vals);
    return ok(rows[0]);
  }

  if (method === 'DELETE') {
    const body = parseBody(event);
    const id = body.id ?? q.id;
    if (!id) return err('Missing id', 400);
    await db.sql`DELETE FROM habits WHERE id = ${Number(id)}`;
    return ok({ id: Number(id), deleted: true });
  }

  return err('Method not allowed', 405);
}

export const handler = withCors(main);
