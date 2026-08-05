// /api/splits — adaptive workout splits, PR tracking, and schedule forecast.
import { getDatabase } from '@netlify/database';
import { ok, err, parseBody, withCors } from './_shared/respond.js';
import { getActiveSplit, todayStr } from './_shared/prep.js';

function addDaysISO(dateStr, n) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + n));
  return dt.toISOString().slice(0, 10);
}

// Forecast the next `n` calendar days' split labels (incl. rest days) from today's gym_type.
async function forecast(db, n) {
  const split = await getActiveSplit(db);
  const cycle = (split?.days || []).map((d) => ({ label: d.label, rest: !!d.rest }));
  if (!cycle.length) return [];
  const today = todayStr();
  const rows = await db.sql`SELECT gym_type FROM days WHERE gym_type IS NOT NULL ORDER BY date DESC LIMIT 1`;
  const last = rows[0]?.gym_type;
  let idx = cycle.findIndex((d) => d.label === last);
  if (idx === -1) idx = 0;
  const out = [];
  for (let i = 1; i <= n; i++) {
    idx = (idx + 1) % cycle.length;
    out.push({ date: addDaysISO(today, i), label: cycle[idx].label, rest: cycle[idx].rest });
  }
  return out;
}

async function main(event) {
  const db = getDatabase();
  const method = event.httpMethod;
  const q = event.queryStringParameters || {};

  if (method === 'GET') {
    const splits = await db.sql`SELECT * FROM splits ORDER BY updated_at DESC, id ASC`;
    const prs = await db.sql`SELECT * FROM prs ORDER BY date DESC, id DESC LIMIT 300`;
    let forecastList = [];
    if (q.forecast) {
      const n = Math.min(parseInt(q.forecast, 10) || 14, 90);
      forecastList = await forecast(db, n);
    }
    return ok({ splits, prs, forecast: forecastList });
  }

  if (method === 'POST') {
    const body = parseBody(event);

    if (body.action === 'pr') {
      if (!body.exercise_name) return err('exercise_name required', 400);
      const rows = await db.sql`
        INSERT INTO prs (date, exercise_name, weight, reps)
        VALUES (${body.date || todayStr()}, ${body.exercise_name}, ${Number(body.weight) || 0}, ${Number(body.reps) || 1})
        RETURNING *
      `;
      return ok(rows[0]);
    }

    if (body.action === 'forecast') {
      const n = Math.min(parseInt(body.days, 10) || 14, 90);
      return ok(await forecast(db, n));
    }

    // Create / update a split.
    if (!Array.isArray(body.days)) return err('days (array) required', 400);
    const days = JSON.stringify(body.days);
    if (body.id) {
      await db.sql`UPDATE splits SET name = ${body.name || 'My Split'}, days = ${days}::jsonb, updated_at = NOW() WHERE id = ${Number(body.id)}`;
      if (body.is_active) await db.sql`UPDATE splits SET is_active = FALSE WHERE id <> ${Number(body.id)}`;
      const rows = await db.sql`SELECT * FROM splits WHERE id = ${Number(body.id)}`;
      return ok(rows[0]);
    }
    const rows = await db.sql`
      INSERT INTO splits (name, days, is_active)
      VALUES (${body.name || 'My Split'}, ${days}::jsonb, ${!!body.is_active})
      RETURNING *
    `;
    if (body.is_active) await db.sql`UPDATE splits SET is_active = FALSE WHERE id <> ${rows[0].id}`;
    return ok(rows[0]);
  }

  if (method === 'PUT') {
    const body = parseBody(event);
    if (!body.id) return err('Missing id', 400);
    const sets = [];
    const vals = [];
    if (body.patch) {
      if (body.patch.name !== undefined) { sets.push(`name = $${sets.length + 1}`); vals.push(body.patch.name); }
      if (body.patch.days !== undefined) { sets.push(`days = $${sets.length + 1}::jsonb`); vals.push(JSON.stringify(body.patch.days)); }
      if (body.patch.is_active !== undefined) { sets.push(`is_active = $${sets.length + 1}`); vals.push(!!body.patch.is_active); }
    }
    if (sets.length) {
      sets.push(`updated_at = NOW()`);
      vals.push(body.id);
      await db.sql.unsafe(`UPDATE splits SET ${sets.join(', ')} WHERE id = $${vals.length}`, vals);
      if (body.patch?.is_active) await db.sql`UPDATE splits SET is_active = FALSE WHERE id <> ${Number(body.id)}`;
    }
    const rows = await db.sql`SELECT * FROM splits WHERE id = ${Number(body.id)}`;
    return ok(rows[0]);
  }

  if (method === 'DELETE') {
    const id = parseBody(event).id ?? q.id;
    if (!id) return err('Missing id', 400);
    await db.sql`DELETE FROM splits WHERE id = ${Number(id)}`;
    return ok({ id: Number(id), deleted: true });
  }

  return err('Method not allowed', 405);
}

export const handler = withCors(main);
