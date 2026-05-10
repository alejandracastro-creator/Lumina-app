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

async function loadExpoServerSdk() {
  try {
    return require('expo-server-sdk');
  } catch {
    return await import('expo-server-sdk');
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

  const adminToken = process.env.PUSH_ADMIN_TOKEN;
  const auth = event.headers?.authorization || event.headers?.Authorization || '';
  const email = event.clientContext?.user?.email;
  const isAdminEmail = email === 'disalejandracastro@gmail.com';
  const hasAdminToken = !!adminToken && auth === `Bearer ${adminToken}`;
  if (!hasAdminToken && !isAdminEmail) {
    return { statusCode: 401, headers, body: JSON.stringify({ ok: false, error: 'unauthorized' }) };
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

  const tokenFilter = body?.expoPushToken || body?.token || null;

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !supabaseServiceRoleKey) {
    return { statusCode: 500, headers, body: JSON.stringify({ ok: false, error: 'missing_supabase_env' }) };
  }
  if (!/^https?:\/\//i.test(String(supabaseUrl))) {
    return { statusCode: 500, headers, body: JSON.stringify({ ok: false, error: 'invalid_supabase_url' }) };
  }

  try {
    const { createClient } = await loadSupabase();
    const { Expo } = await loadExpoServerSdk();

    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    });

    let query = supabase.from('phone_notifications').select('id, expo_push_token, user_id');
    if (tokenFilter) query = query.eq('expo_push_token', tokenFilter);

    const { data: rows, error: selErr } = await query;
    if (selErr) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ ok: false, error: 'db_select_failed', message: selErr.message }),
      };
    }

    const allTokens = (rows || [])
      .map((r) => (typeof r?.expo_push_token === 'string' ? r.expo_push_token.trim() : null))
      .filter(Boolean);
    const expoTokens = allTokens.filter((t) => Expo.isExpoPushToken(t));

    const expo = new Expo(process.env.EXPO_ACCESS_TOKEN ? { accessToken: process.env.EXPO_ACCESS_TOKEN } : {});
    const messages = expoTokens.map((t) => ({
      to: t,
      title: payload.title,
      body: payload.body,
      data: { url: payload.url },
      sound: 'default',
      channelId: 'default',
    }));

    const chunks = expo.chunkPushNotifications(messages);
    const tickets = [];
    const receiptIdToToken = {};
    const deletedTokens = [];
    for (const chunk of chunks) {
      const chunkTickets = await expo.sendPushNotificationsAsync(chunk);
      for (let i = 0; i < chunkTickets.length; i += 1) {
        const ticket = chunkTickets[i];
        const token = chunk[i]?.to;
        if (ticket?.status === 'ok' && ticket?.id && token) {
          receiptIdToToken[ticket.id] = token;
        }
        if (ticket?.status === 'error' && token && ticket?.details?.error === 'DeviceNotRegistered') {
          try {
            await supabase.from('phone_notifications').delete().eq('expo_push_token', token);
            deletedTokens.push(token);
          } catch {}
        }
      }
      tickets.push(...chunkTickets);
    }

    const receiptIds = tickets
      .map((t) => (t && t.status === 'ok' && t.id ? t.id : null))
      .filter(Boolean);

    if (receiptIds.length) {
      const receiptChunks = expo.chunkPushNotificationReceiptIds(receiptIds);
      for (const chunk of receiptChunks) {
        const receipts = await expo.getPushNotificationReceiptsAsync(chunk);
        const failedReceiptIds = Object.keys(receipts || {}).filter((id) => receipts[id]?.status === 'error');
        if (!failedReceiptIds.length) continue;
        for (const id of failedReceiptIds) {
          const errDetails = receipts[id]?.details;
          const errorCode = errDetails?.error;
          const token = receiptIdToToken[id];
          if (errorCode === 'DeviceNotRegistered' && token) {
            try {
              await supabase.from('phone_notifications').delete().eq('expo_push_token', token);
              deletedTokens.push(token);
            } catch {}
          }
        }
      }
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        ok: true,
        total: rows?.length ?? 0,
        tokens: allTokens.length,
        expoTokens: expoTokens.length,
        tickets: tickets.length,
        deletedTokens,
      }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ ok: false, error: 'internal_error', message: err?.message || String(err) }),
    };
  }
};
