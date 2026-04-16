function buildHeaders() {
  return {
    'content-type': 'application/json; charset=utf-8',
    'access-control-allow-origin': '*',
    'access-control-allow-methods': 'POST, OPTIONS',
    'access-control-allow-headers': 'content-type, authorization',
  };
}

async function loadWebPush() {
  try {
    return require('web-push');
  } catch {
    return await import('web-push');
  }
}

async function loadSupabase() {
  try {
    return require('@supabase/supabase-js');
  } catch {
    return await import('@supabase/supabase-js');
  }
}

function isGone(err) {
  const code = err?.statusCode ?? err?.status ?? err?.code;
  return code === 404 || code === 410;
}

async function mapLimit(items, limit, fn) {
  const results = [];
  let idx = 0;
  const workers = new Array(Math.max(1, limit)).fill(0).map(async () => {
    while (idx < items.length) {
      const current = idx;
      idx += 1;
      results[current] = await fn(items[current], current);
    }
  });
  await Promise.all(workers);
  return results;
}

exports.handler = async (event) => {
  const headers = buildHeaders();

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ ok: false, error: 'method_not_allowed' }) };
  }

  const adminToken = process.env.PUSH_ADMIN_TOKEN;
  if (adminToken) {
    const auth = event.headers?.authorization || event.headers?.Authorization || '';
    if (auth !== `Bearer ${adminToken}`) {
      const email = event.clientContext?.user?.email;
      if (email !== 'disalejandracastro@gmail.com') {
        return { statusCode: 401, headers, body: JSON.stringify({ ok: false, error: 'unauthorized' }) };
      }
    }
  }

  let body;
  try {
    body = event.body ? JSON.parse(event.body) : null;
  } catch {
    body = null;
  }

  const payload = {
    title: body?.title || 'LUMINA',
    body: body?.body || '',
    url: body?.url || '/oracle',
  };

  const endpointFilter = body?.endpoint || null;

  const supabaseUrl = process.env.SUPABASE_URL || 'https://pinicckryrstfhedtfbta.supabase.co';
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !supabaseServiceRoleKey) {
    return { statusCode: 500, headers, body: JSON.stringify({ ok: false, error: 'missing_supabase_env' }) };
  }

  const vapidPublicKey = process.env.VAPID_PUBLIC_KEY;
  const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
  if (!vapidPublicKey || !vapidPrivateKey) {
    return { statusCode: 500, headers, body: JSON.stringify({ ok: false, error: 'missing_vapid_env' }) };
  }

  const vapidSubject = process.env.VAPID_SUBJECT || 'mailto:hello@lumina.app';
  try {
    const webPush = await loadWebPush();
    const { createClient } = await loadSupabase();

    webPush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);

    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    });

    let query = supabase.from('push_subscriptions').select('id, subscription');
    if (endpointFilter) query = query.eq('subscription->>endpoint', endpointFilter);

    const { data: rows, error: selErr } = await query;
    if (selErr) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ ok: false, error: 'db_select_failed', message: selErr.message }),
      };
    }

    const subs = (rows || []).filter((r) => !!r?.subscription?.endpoint);
    let sent = 0;
    let removed = 0;
    let failed = 0;

    const bodyJson = JSON.stringify(payload);

    await mapLimit(subs, 10, async (row) => {
      try {
        await webPush.sendNotification(row.subscription, bodyJson);
        sent += 1;
      } catch (err) {
        if (isGone(err)) {
          removed += 1;
          try {
            await supabase.from('push_subscriptions').delete().eq('id', row.id);
          } catch {}
        } else {
          failed += 1;
        }
      }
    });

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ ok: true, total: subs.length, sent, removed, failed }),
  };
  } catch (err) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ ok: false, error: 'internal_error', message: err?.message || String(err) }),
    };
  }
};
