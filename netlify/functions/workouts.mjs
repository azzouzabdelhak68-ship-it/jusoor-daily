// /api/workouts — workout plan templates CRUD
import { getDatabase } from '@netlify/database';
import { ok, err, parseBody, withCors } from './_shared/respond.js';

async function main(event) {
  const db = getDatabase();
  const method = event.httpMethod;
  const q = event.queryStringParameters || {};

  if (method === 'GET') {
    const rows = await db.sql`SELECT * FROM workout_plans ORDER BY id ASC`;
    return ok(rows);
  }

  if (method === 'POST') {
    const body = parseBody(event);
    if (!body.type) return err('type required', 400);
    const rows = await db.sql`
      INSERT INTO workout_plans (type, name, exercises, duration_min)
      VALUES (${body.type}, ${body.name || body.type + ' Day'}, ${JSON.stringify(body.exercises || [])}, ${body.duration_min || 60})
      RETURNING *
    `;
    return ok(rows[0]);
  }

  if (method === 'PUT') {
    const body = parseBody(event);
    if (!body.id) return err('Missing id', 400);
    const allow = ['type', 'name', 'exercises', 'duration_min'];
    const sets = [];
    const vals = [];
    for (const k of allow) {
      if (body.patch && body.patch[k] !== undefined) {
        sets.push(`${k} = $${sets.length + 1}`);
        vals.push(k === 'exercises' ? JSON.stringify(body.patch[k]) : body.patch[k]);
      }
    }
    if (!sets.length) return err('Nothing to update', 400);
    vals.push(body.id);
    const rows = await db.sql.unsafe(
      `UPDATE workout_plans SET ${sets.join(', ')} WHERE id = $${vals.length} RETURNING *`,
      vals
    );
    return ok(rows[0]);
  }

  if (method === 'DELETE') {
    const body = parseBody(event);
    const id = body.id ?? q.id;
    if (!id) return err('Missing id', 400);
    await db.sql`DELETE FROM workout_plans WHERE id = ${Number(id)}`;
    return ok({ id: Number(id), deleted: true });
  }

  return err('Method not allowed', 405);
}

export const handler = withCors(main);
