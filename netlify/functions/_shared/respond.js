// Shared HTTP helpers for Netlify Functions
export function ok(data, status = 200) {
  return {
    statusCode: status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, x-prep-token',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    },
    body: JSON.stringify(data),
  };
}

export function err(message, status = 500) {
  return ok({ error: message }, status);
}

export function parseBody(event) {
  if (!event.body) return {};
  try {
    return JSON.parse(event.body);
  } catch {
    return {};
  }
}

export function withCors(handler) {
  return async (event) => {
    if (event.httpMethod === 'OPTIONS') return ok({}, 200);
    try {
      return await handler(event);
    } catch (e) {
      console.error('Function error:', e);
      return err(e && e.message ? e.message : 'Internal error');
    }
  };
}
