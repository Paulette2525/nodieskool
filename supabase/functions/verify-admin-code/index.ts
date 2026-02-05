 import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
 
 const corsHeaders = {
   "Access-Control-Allow-Origin": "*",
   "Access-Control-Allow-Headers":
     "authorization, x-client-info, apikey, content-type",
 };
 
 serve(async (req) => {
   if (req.method === "OPTIONS") {
     return new Response(null, { headers: corsHeaders });
   }
 
   try {
     const { code } = await req.json();
     
     if (!code || typeof code !== "string") {
       return new Response(
         JSON.stringify({ valid: false, error: "Code requis" }),
         { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
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
 
     return new Response(
       JSON.stringify({ valid: isValid }),
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