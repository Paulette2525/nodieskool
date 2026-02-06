import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION_MINUTES = 15;
const SESSION_DURATION_HOURS = 24;

// Generate cryptographically secure token
function generateSecureToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { code, action, sessionToken } = body;
    
    // Get client IP from headers
    const clientIP = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || 
                     req.headers.get("x-real-ip") || 
                     "unknown";

    // Create Supabase client with service role
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Handle session validation
    if (action === "validate") {
      if (!sessionToken) {
        return new Response(
          JSON.stringify({ valid: false }),
          { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      const { data: session, error } = await supabase
        .from("admin_sessions")
        .select("*")
        .eq("session_token", sessionToken)
        .eq("is_valid", true)
        .gt("expires_at", new Date().toISOString())
        .single();

      if (error || !session) {
        return new Response(
          JSON.stringify({ valid: false }),
          { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      // Optionally check IP matches (extra security)
      if (session.ip_address !== clientIP) {
        console.warn(`Session IP mismatch: expected ${session.ip_address}, got ${clientIP}`);
        // We allow this but log it - could be VPN changes, etc.
      }

      return new Response(
        JSON.stringify({ valid: true }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Handle logout
    if (action === "logout") {
      if (sessionToken) {
        await supabase
          .from("admin_sessions")
          .update({ is_valid: false })
          .eq("session_token", sessionToken);
      }
      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Handle code verification (existing logic)
    if (!code || typeof code !== "string") {
      return new Response(
        JSON.stringify({ valid: false, error: "Code requis" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Clean up old attempts (older than lockout duration)
    const cutoffTime = new Date(Date.now() - LOCKOUT_DURATION_MINUTES * 60 * 1000).toISOString();
    await supabase
      .from("admin_code_attempts")
      .delete()
      .lt("attempted_at", cutoffTime);

    // Clean up expired sessions
    await supabase
      .from("admin_sessions")
      .delete()
      .lt("expires_at", new Date().toISOString());

    // Check recent failed attempts for this IP
    const { data: recentAttempts, error: attemptError } = await supabase
      .from("admin_code_attempts")
      .select("id")
      .eq("ip_address", clientIP)
      .eq("was_successful", false)
      .gte("attempted_at", cutoffTime);

    if (attemptError) {
      console.error("Error checking attempts:", attemptError);
    }

    const failedAttemptCount = recentAttempts?.length || 0;

    // Rate limit check
    if (failedAttemptCount >= MAX_ATTEMPTS) {
      console.warn(`Rate limit exceeded for IP: ${clientIP}`);
      return new Response(
        JSON.stringify({ 
          valid: false, 
          error: `Trop de tentatives. Réessayez dans ${LOCKOUT_DURATION_MINUTES} minutes.`,
          locked: true 
        }),
        { status: 429, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const adminCode = Deno.env.get("ADMIN_ACCESS_CODE");
    
    if (!adminCode) {
      console.error("ADMIN_ACCESS_CODE not configured");
      return new Response(
        JSON.stringify({ valid: false, error: "Code non configuré" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const isValid = code === adminCode;

    // Log the attempt
    const { error: insertError } = await supabase
      .from("admin_code_attempts")
      .insert({
        ip_address: clientIP,
        was_successful: isValid,
      });

    if (insertError) {
      console.error("Error logging attempt:", insertError);
    }

    if (!isValid) {
      const remainingAttempts = MAX_ATTEMPTS - failedAttemptCount - 1;
      return new Response(
        JSON.stringify({ 
          valid: false, 
          error: remainingAttempts > 0 
            ? `Code incorrect. ${remainingAttempts} tentative(s) restante(s).`
            : `Code incorrect. Compte verrouillé pour ${LOCKOUT_DURATION_MINUTES} minutes.`
        }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Code is valid - create server-side session
    const newSessionToken = generateSecureToken();
    const expiresAt = new Date(Date.now() + SESSION_DURATION_HOURS * 60 * 60 * 1000).toISOString();

    const { error: sessionError } = await supabase
      .from("admin_sessions")
      .insert({
        session_token: newSessionToken,
        ip_address: clientIP,
        expires_at: expiresAt,
        is_valid: true,
      });

    if (sessionError) {
      console.error("Error creating session:", sessionError);
      return new Response(
        JSON.stringify({ valid: false, error: "Erreur création session" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    return new Response(
      JSON.stringify({ valid: true, sessionToken: newSessionToken }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error) {
    console.error("Error verifying admin code:", error);
    return new Response(
      JSON.stringify({ valid: false, error: "Erreur serveur" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
