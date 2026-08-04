// /api/books — book library CRUD
import { getDatabase } from '@netlify/database';
import { ok, err, parseBody, withCors } from './_shared/respond.js';

async function main(event) {
  const db = getDatabase();
  const method = event.httpMethod;
  const q = event.queryStringParameters || {};

  if (method === 'GET') {
    const rows = await db.sql`SELECT * FROM books ORDER BY status ASC, title ASC`;
    return ok(rows);
  }

  if (method === 'POST') {
    const body = parseBody(event);
    if (!body.title) return err('title required', 400);
    const rows = await db.sql`
      INSERT INTO books (title, author, total_pages, current_page, status, daily_target)
      VALUES (${body.title}, ${body.author || ''}, ${body.total_pages || 0}, ${body.current_page || 0}, ${body.status || 'To Read'}, ${body.daily_target || 15})
      RETURNING *
    `;
    return ok(rows[0]);
  }

  if (method === 'PUT') {
    const body = parseBody(event);
    if (!body.id) return err('Missing id', 400);
    const allow = ['title', 'author', 'total_pages', 'current_page', 'status', 'daily_target'];
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
    const rows = await db.sql.unsafe(
      `UPDATE books SET ${sets.join(', ')} WHERE id = $${vals.length} RETURNING *`,
      vals
    );
    return ok(rows[0]);
  }

  if (method === 'DELETE') {
    const body = parseBody(event);
    const id = body.id ?? q.id;
    if (!id) return err('Missing id', 400);
    await db.sql`DELETE FROM books WHERE id = ${Number(id)}`;
    return ok({ id: Number(id), deleted: true });
  }

  return err('Method not allowed', 405);
}

export const handler = withCors(main);
