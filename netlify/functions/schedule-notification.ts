type NetlifyEvent = {
  httpMethod?: string;
  headers?: Record<string, string | undefined>;
};

export const config = { schedule: "0 13,23 * * *" };

function json(statusCode: number, body: any) {
  return {
    statusCode,
    headers: { 'content-type': 'application/json; charset=utf-8' },
    body: JSON.stringify(body),
  };
}

function utcDayNumber(date: Date) {
  return Math.floor(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()) / 86400000);
}

function pickMessage(messages: string[], day: number) {
  const idx = day % messages.length;
  return messages[(idx + messages.length) % messages.length];
}

export const handler = async (event: NetlifyEvent) => {
  const method = event.httpMethod || 'GET';
  if (method === 'OPTIONS') return { statusCode: 204, headers: {}, body: '' };

  const now = new Date();
  const hour = now.getUTCHours();
  const minute = now.getUTCMinutes();
  const day = utcDayNumber(now);

  if (minute !== 0) return json(200, { ok: true, skipped: true, reason: 'not_top_of_hour' });

  const morningHourUtc = 13;
  const nightHourUtc = 23;

  let mode: 'morning' | 'night' | null = null;
  if (hour === morningHourUtc) mode = 'morning';
  if (hour === nightHourUtc) mode = 'night';
  if (!mode) return json(200, { ok: true, skipped: true, reason: 'not_scheduled_hour', hour });

  const morningMessages = [
    '🌟¿Ya viste qué carta te revela el Oráculo hoy?',
    '🌟 Tu mensaje del Oráculo ya está listo.',
    '🌟¿Qué tiene LUMINA para vos hoy? Descubrí tu carta.',
    '🌟 Un momento para vos: Mirá qué dice el Oráculo.',
  ];

  const nightMessages = [
    'Tu ritual nocturno te espera 🌙',
    'Cerrá el día con intención ✨',
    'Un momento para vos antes de dormir 🕯️',
    'El ritual de la noche está listo 🌟',
  ];

  const payload =
    mode === 'night'
      ? { title: 'LUMINA', body: pickMessage(nightMessages, day), url: '/ritual' }
      : { title: 'LUMINA', body: pickMessage(morningMessages, day), url: '/oracle' };

  const baseUrl =
    process.env.URL ||
    process.env.DEPLOY_PRIME_URL ||
    process.env.DEPLOY_URL ||
    process.env.SITE_URL ||
    'http://localhost:8888';

  const pushAdminToken = process.env.PUSH_ADMIN_TOKEN;
  const res = await fetch(`${baseUrl}/.netlify/functions/push-send`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      ...(pushAdminToken ? { authorization: `Bearer ${pushAdminToken}` } : {}),
    },
    body: JSON.stringify(payload),
  });

  let out: any = null;
  try {
    out = await res.json();
  } catch {
    out = null;
  }

  if (!res.ok) {
    return json(500, { ok: false, mode, status: res.status, response: out });
  }

  return json(200, { ok: true, mode, response: out });
};
