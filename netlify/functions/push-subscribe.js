function buildHeaders() {
  return {
    'content-type': 'application/json; charset=utf-8',
    'access-control-allow-origin': '*',
    'access-control-allow-methods': 'POST, OPTIONS',
    'access-control-allow-headers': 'content-type, authorization',
  };
}

async function loadSupabase() {
  try {
    return require('@supabase/supabase-js');
  } catch {
    return await import('@supabase/supabase-js');
  }
}

exports.handler = async (event) => {
  const headers = buildHeaders();

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ ok: false, error: 'method_not_allowed' }) };
  }

  let body;
  try {
    body = event.body ? JSON.parse(event.body) : null;
  } catch {
    body = null;
  }

  const subscription = body?.subscription;
  const endpoint = subscription?.endpoint;
  const keys = subscription?.keys;

  if (!endpoint || !keys?.p256dh || !keys?.auth) {
    return { statusCode: 400, headers, body: JSON.stringify({ ok: false, error: 'invalid_subscription' }) };
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !supabaseServiceRoleKey) {
    return { statusCode: 500, headers, body: JSON.stringify({ ok: false, error: 'missing_supabase_env' }) };
  }

  try {
    const { createClient } = await loadSupabase();
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    });

    const { data: existing, error: existingErr } = await supabase
      .from('push_subscriptions')
      .select('id')
      .eq('subscription->>endpoint', endpoint)
      .maybeSingle();

    if (existingErr) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ ok: false, error: 'db_select_failed', message: existingErr.message }),
      };
    }

    if (existing?.id) {
      const { error: updErr } = await supabase.from('push_subscriptions').update({ subscription }).eq('id', existing.id);
      if (updErr) {
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ ok: false, error: 'db_update_failed', message: updErr.message }),
        };
      }
      return { statusCode: 200, headers, body: JSON.stringify({ ok: true, id: existing.id }) };
    }

    const { data: inserted, error: insErr } = await supabase
      .from('push_subscriptions')
      .insert({ subscription })
      .select('id')
      .single();

    if (insErr) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ ok: false, error: 'db_insert_failed', message: insErr.message }),
      };
    }

    return { statusCode: 200, headers, body: JSON.stringify({ ok: true, id: inserted?.id ?? null }) };
  } catch (err) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ ok: false, error: 'internal_error', message: err?.message || String(err) }),
    };
  }
};
