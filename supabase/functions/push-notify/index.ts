import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.0"

// Defina as chaves de ambiente que criaremos depois no Supabase:
// FIREBASE_PROJECT_ID
// FIREBASE_SERVICE_ACCOUNT_EMAIL
// FIREBASE_PRIVATE_KEY
import { createSign } from "https://deno.land/std@0.177.0/node/crypto.ts"; // Node crypto shim para Deno

// Helper para gerar o token do Firebase OAuth2 sem bibliotecas pesadas externas
async function getAccessToken(clientEmail: string, privateKey: string): Promise<string> {
  const header = { alg: "RS256", typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  const claim = {
    iss: clientEmail,
    scope: "https://www.googleapis.com/auth/firebase.messaging",
    aud: "https://oauth2.googleapis.com/token",
    exp: now + 3600,
    iat: now,
  };

  const toBase64Url = (obj: any) => btoa(JSON.stringify(obj)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  
  const signatureInput = `${toBase64Url(header)}.${toBase64Url(claim)}`;
  
  // Usando Crypto API do Deno/Node para assinar
  const sign = createSign('RSA-SHA256');
  sign.update(signatureInput);
  sign.end();
  
  const formattedKey = privateKey.replace(/\\n/g, '\n');
  const signature = sign.sign(formattedKey, 'base64').replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

  const jwt = `${signatureInput}.${signature}`;

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
  });

  const data = await res.json();
  if (!data.access_token) {
    console.error("Falha ao gerar o Firebase Token:", data);
    throw new Error("Failed to get Firebase access token");
  }
  return data.access_token;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { title, body, target } = await req.json();

    if (!title || !body) {
      return new Response(JSON.stringify({ error: "Missing title or body" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Initialize Supabase Client to fetch tokens
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch profiles that have a push_token
    let query = supabase.from('profiles').select('push_token').not('push_token', 'is', null);
    
    // Filtra por administradores e professores se o target for "admins"
    if (target === "admins") {
      query = query.in('role', ['admin', 'professor']);
    }

    const { data: profiles, error: dbError } = await query;

    if (dbError) throw dbError;
    if (!profiles || profiles.length === 0) {
      return new Response(JSON.stringify({ message: "No push tokens found" }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const tokens = profiles.map(p => p.push_token).filter(t => t && t.trim() !== "");

    if (tokens.length === 0) {
      return new Response(JSON.stringify({ message: "No valid push tokens found" }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const clientEmail = Deno.env.get("FIREBASE_SERVICE_ACCOUNT_EMAIL");
    const privateKey = Deno.env.get("FIREBASE_PRIVATE_KEY");
    const projectId = Deno.env.get("FIREBASE_PROJECT_ID");

    if (!clientEmail || !privateKey || !projectId) {
      return new Response(JSON.stringify({ error: "Missing Firebase config in Edge Function" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const accessToken = await getAccessToken(clientEmail, privateKey);

    // Send notifications via FCM v1 API
    const promises = tokens.map(token => 
      fetch(`https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          message: {
            token: token,
            notification: {
              title: title,
              body: body
            }
          }
        })
      })
    );

    const results = await Promise.all(promises);
    const statuses = await Promise.all(results.map(r => r.json()));

    return new Response(JSON.stringify({ 
      success: true, 
      sent: tokens.length,
      responses: statuses
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

  } catch (error) {
    console.error("Erro na função de push:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
