import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// ── Base64url helpers ──────────────────────────────────────────────────
function b64url(buf: ArrayBuffer | Uint8Array): string {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  let s = '';
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function b64urlDecode(str: string): Uint8Array {
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4) str += '=';
  const bin = atob(str);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

function concat(...arrs: Uint8Array[]): Uint8Array {
  const len = arrs.reduce((s, a) => s + a.length, 0);
  const out = new Uint8Array(len);
  let off = 0;
  for (const a of arrs) { out.set(a, off); off += a.length; }
  return out;
}

// ── HKDF (extract + expand) via HMAC-SHA-256 ──────────────────────────
async function hkdf(salt: Uint8Array, ikm: Uint8Array, info: Uint8Array, len: number): Promise<Uint8Array> {
  const prkKey = await crypto.subtle.importKey('raw', salt.length ? salt : new Uint8Array(32), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const prk = new Uint8Array(await crypto.subtle.sign('HMAC', prkKey, ikm));
  const expandKey = await crypto.subtle.importKey('raw', prk, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  let prev = new Uint8Array(0);
  let out = new Uint8Array(0);
  let c = 1;
  while (out.length < len) {
    const hmac = new Uint8Array(await crypto.subtle.sign('HMAC', expandKey, concat(prev, info, new Uint8Array([c]))));
    out = concat(out, hmac);
    prev = hmac;
    c++;
  }
  return out.slice(0, len);
}

// ── Encrypt payload (RFC 8291 / aes128gcm) ────────────────────────────
async function encryptPayload(payload: string, p256dhB64: string, authB64: string) {
  const clientPub = b64urlDecode(p256dhB64);
  const clientAuth = b64urlDecode(authB64);
  const salt = crypto.getRandomValues(new Uint8Array(16));

  // Ephemeral ECDH key pair
  const serverKP = await crypto.subtle.generateKey({ name: 'ECDH', namedCurve: 'P-256' }, true, ['deriveBits']);
  const serverPubRaw = new Uint8Array(await crypto.subtle.exportKey('raw', serverKP.publicKey));

  // Import client public key
  const clientKey = await crypto.subtle.importKey('raw', clientPub, { name: 'ECDH', namedCurve: 'P-256' }, false, []);

  // Shared secret
  const shared = new Uint8Array(await crypto.subtle.deriveBits({ name: 'ECDH', public: clientKey }, serverKP.privateKey, 256));

  const enc = new TextEncoder();

  // IKM = HKDF(clientAuth, shared, "WebPush: info\0" + clientPub + serverPub, 32)
  const ikmInfo = concat(enc.encode('WebPush: info\0'), clientPub, serverPubRaw);
  const ikm = await hkdf(clientAuth, shared, ikmInfo, 32);

  // CEK = HKDF(salt, ikm, "Content-Encoding: aes128gcm\0", 16)
  const cek = await hkdf(salt, ikm, enc.encode('Content-Encoding: aes128gcm\0'), 16);

  // Nonce = HKDF(salt, ikm, "Content-Encoding: nonce\0", 12)
  const nonce = await hkdf(salt, ikm, enc.encode('Content-Encoding: nonce\0'), 12);

  // Pad plaintext + delimiter 0x02
  const plain = concat(enc.encode(payload), new Uint8Array([2]));

  // AES-128-GCM encrypt
  const aesKey = await crypto.subtle.importKey('raw', cek, 'AES-GCM', false, ['encrypt']);
  const encrypted = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv: nonce }, aesKey, plain));

  // aes128gcm header: salt(16) + rs(4) + idlen(1) + keyid(serverPub, 65) + ciphertext
  const rs = new Uint8Array(4);
  new DataView(rs.buffer).setUint32(0, 4096);
  return concat(salt, rs, new Uint8Array([65]), serverPubRaw, encrypted);
}

// ── VAPID authorization header ────────────────────────────────────────
async function vapidAuth(endpoint: string, privKeyB64: string, pubKeyB64: string) {
  const url = new URL(endpoint);
  const aud = `${url.protocol}//${url.host}`;
  const exp = Math.floor(Date.now() / 1000) + 12 * 3600;

  const header = b64url(new TextEncoder().encode(JSON.stringify({ typ: 'JWT', alg: 'ES256' })));
  const payload = b64url(new TextEncoder().encode(JSON.stringify({ aud, exp, sub: 'mailto:contact@collonie.com' })));
  const unsigned = `${header}.${payload}`;

  const privBytes = b64urlDecode(privKeyB64);
  const pubBytes = b64urlDecode(pubKeyB64);

  const jwk: JsonWebKey = {
    kty: 'EC',
    crv: 'P-256',
    x: b64url(pubBytes.slice(1, 33)),
    y: b64url(pubBytes.slice(33, 65)),
    d: b64url(privBytes),
  };

  const key = await crypto.subtle.importKey('jwk', jwk, { name: 'ECDSA', namedCurve: 'P-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign({ name: 'ECDSA', hash: 'SHA-256' }, key, new TextEncoder().encode(unsigned));
  const jwt = `${unsigned}.${b64url(sig)}`;

  return `vapid t=${jwt}, k=${pubKeyB64}`;
}

// ── Send push to one subscription ─────────────────────────────────────
async function sendPush(
  sub: { endpoint: string; p256dh: string; auth: string },
  payload: string,
  privKey: string,
  pubKey: string
): Promise<'ok' | 'expired' | 'error'> {
  try {
    const body = await encryptPayload(payload, sub.p256dh, sub.auth);
    const authorization = await vapidAuth(sub.endpoint, privKey, pubKey);

    const res = await fetch(sub.endpoint, {
      method: 'POST',
      headers: {
        Authorization: authorization,
        'Content-Type': 'application/octet-stream',
        'Content-Encoding': 'aes128gcm',
        TTL: '86400',
        Urgency: 'high',
      },
      body,
    });

    if (res.status === 201 || res.status === 200) return 'ok';
    if (res.status === 404 || res.status === 410) return 'expired';

    const text = await res.text();
    console.error(`Push ${res.status}: ${text}`);
    return 'error';
  } catch (e) {
    console.error('Push error:', e);
    return 'error';
  }
}

// ── Main handler ──────────────────────────────────────────────────────
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const { user_id, title, message, reference_id } = await req.json();
    if (!user_id || !title) {
      return new Response(JSON.stringify({ error: 'Missing user_id or title' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const vapidPriv = Deno.env.get('VAPID_PRIVATE_KEY')!;
    const vapidPub = Deno.env.get('VAPID_PUBLIC_KEY')!;

    const { data: subs, error } = await supabase
      .from('push_subscriptions')
      .select('*')
      .eq('user_id', user_id);

    if (error) throw error;
    if (!subs?.length) {
      return new Response(JSON.stringify({ sent: 0 }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const payload = JSON.stringify({
      title,
      body: message || '',
      icon: '/pwa-192x192.png',
      badge: '/pwa-192x192.png',
      data: { url: '/dashboard' },
    });

    let sent = 0;
    const expired: string[] = [];

    for (const sub of subs) {
      const result = await sendPush(
        { endpoint: sub.endpoint, p256dh: sub.p256dh, auth: sub.auth },
        payload,
        vapidPriv,
        vapidPub
      );
      if (result === 'ok') sent++;
      else if (result === 'expired') expired.push(sub.id);
    }

    if (expired.length) {
      await supabase.from('push_subscriptions').delete().in('id', expired);
    }

    return new Response(JSON.stringify({ sent, expired: expired.length }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('Error:', e);
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
