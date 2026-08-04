// /api/tasks — task CRUD
import { getDatabase } from '@netlify/database';
import { ok, err, parseBody, withCors } from './_shared/respond.js';

async function main(event) {
  const db = getDatabase();
  const method = event.httpMethod;
  const q = event.queryStringParameters || {};

  if (method === 'GET') {
    if (q.from && q.to) {
      const rows = await db.sql`SELECT * FROM tasks WHERE date >= ${q.from} AND date <= ${q.to} ORDER BY date ASC, start_time ASC NULLS LAST, id ASC`;
      return ok(rows);
    }
    if (q.date) {
      const rows = await db.sql`SELECT * FROM tasks WHERE date = ${q.date} ORDER BY start_time ASC NULLS LAST, id ASC`;
      return ok(rows);
    }
    if (q.id) {
      const rows = await db.sql`SELECT * FROM tasks WHERE id = ${Number(q.id)}`;
      return ok(rows[0] || null);
    }
    const rows = await db.sql`SELECT * FROM tasks ORDER BY date DESC, id DESC LIMIT 200`;
    return ok(rows);
  }

  if (method === 'POST') {
    const body = parseBody(event);
    if (!body.date || !body.title) return err('date and title required', 400);
    const rows = await db.sql`
      INSERT INTO tasks (date, title, project, start_time, end_time, priority, status, is_daily, reminder_before)
      VALUES (${body.date}, ${body.title}, ${body.project || 'Jusoor'}, ${body.start_time || null}, ${body.end_time || null}, ${body.priority || 'Medium'}, ${body.status || 'todo'}, ${!!body.is_daily}, ${body.reminder_before || 0})
      RETURNING *
    `;
    return ok(rows[0]);
  }

  if (method === 'PUT') {
    const body = parseBody(event);
    if (!body.id) return err('Missing id', 400);
    const allow = ['title', 'project', 'start_time', 'end_time', 'priority', 'status', 'is_daily', 'reminder_before', 'date'];
    const sets = [];
    const vals = [];
    for (const k of allow) {
      if (body.patch && body.patch[k] !== undefined) {
        sets.push(`${k} = $${sets.length + 1}`);
        vals.push(body.patch[k]);
      } else if (!body.patch && body[k] !== undefined) {
        sets.push(`${k} = $${sets.length + 1}`);
        vals.push(body[k]);
      }
    }
    if (!sets.length) return err('Nothing to update', 400);
    vals.push(body.id);
    const rows = await db.sql.unsafe(
      `UPDATE tasks SET ${sets.join(', ')} WHERE id = $${vals.length} RETURNING *`,
      vals
    );
    return ok(rows[0]);
  }

  if (method === 'DELETE') {
    const body = parseBody(event);
    const id = body.id ?? q.id;
    if (!id) return err('Missing id', 400);
    await db.sql`DELETE FROM tasks WHERE id = ${Number(id)}`;
    return ok({ id: Number(id), deleted: true });
  }

  return err('Method not allowed', 405);
}

export const handler = withCors(main);
