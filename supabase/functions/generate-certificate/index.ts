import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface CertificateRequest {
  courseId: string;
  userId: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { courseId, userId }: CertificateRequest = await req.json();

    if (!courseId || !userId) {
      throw new Error("Missing courseId or userId");
    }

    // Verify user has completed the course
    const { data: course, error: courseError } = await supabase
      .from("courses")
      .select(`
        id,
        title,
        modules!inner(
          id,
          lessons!inner(id)
        )
      `)
      .eq("id", courseId)
      .single();

    if (courseError) throw courseError;

    // Get all lesson IDs from the course
    const lessonIds: string[] = [];
    course.modules.forEach((module: any) => {
      module.lessons.forEach((lesson: any) => {
        lessonIds.push(lesson.id);
      });
    });

    // Check user's progress
    const { data: progress, error: progressError } = await supabase
      .from("lesson_progress")
      .select("lesson_id")
      .eq("user_id", userId)
      .in("lesson_id", lessonIds);

    if (progressError) throw progressError;

    const completedLessonIds = progress.map((p) => p.lesson_id);
    const allCompleted = lessonIds.every((id) => completedLessonIds.includes(id));

    if (!allCompleted) {
      throw new Error("Course not completed. Please complete all lessons first.");
    }

    // Check if certificate already exists
    const { data: existingCert } = await supabase
      .from("certificates")
      .select("*")
      .eq("user_id", userId)
      .eq("course_id", courseId)
      .single();

    if (existingCert) {
      return new Response(
        JSON.stringify({
          success: true,
          certificate: existingCert,
          message: "Certificate already exists",
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Generate certificate number
    const { data: certNumber } = await supabase.rpc("generate_certificate_number");

    // Get user profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, username")
      .eq("id", userId)
      .single();

    // Create certificate
    const { data: certificate, error: certError } = await supabase
      .from("certificates")
      .insert({
        user_id: userId,
        course_id: courseId,
        certificate_number: certNumber,
      })
      .select()
      .single();

    if (certError) throw certError;

    // Award bonus points for completing a course
    await supabase.rpc("update_user_points", {
      _user_id: userId,
      _points: 50,
      _reason: `Certification obtenue: ${course.title}`,
    });

    // Create notification
    await supabase.rpc("create_notification", {
      _user_id: userId,
      _type: "badge",
      _title: "Certificat obtenu !",
      _message: `Félicitations ! Vous avez obtenu le certificat pour "${course.title}"`,
      _reference_id: certificate.id,
    });

    return new Response(
      JSON.stringify({
        success: true,
        certificate: {
          ...certificate,
          course_title: course.title,
          user_name: profile?.full_name || profile?.username,
        },
        message: "Certificate generated successfully",
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error generating certificate:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
