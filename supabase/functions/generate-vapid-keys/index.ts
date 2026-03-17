const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function uint8ToBase64url(bytes: Uint8Array): string {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64urlToUint8(str: string): Uint8Array {
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4) str += '=';
  const binary = atob(str);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const keyPair = await crypto.subtle.generateKey(
    { name: 'ECDSA', namedCurve: 'P-256' },
    true,
    ['sign', 'verify']
  );

  const publicKeyRaw = new Uint8Array(await crypto.subtle.exportKey('raw', keyPair.publicKey));
  const jwk = await crypto.subtle.exportKey('jwk', keyPair.privateKey) as JsonWebKey;
  const privateKeyRaw = base64urlToUint8(jwk.d!);

  return new Response(JSON.stringify({
    publicKey: uint8ToBase64url(publicKeyRaw),
    privateKey: uint8ToBase64url(privateKeyRaw),
    info: "Store publicKey in frontend code and privateKey as VAPID_PRIVATE_KEY secret. Also store publicKey as VAPID_PUBLIC_KEY secret."
  }, null, 2), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
});
