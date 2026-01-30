import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

interface Certificate {
  id: string;
  user_id: string;
  course_id: string;
  certificate_number: string;
  issued_at: string;
  course?: {
    id: string;
    title: string;
  };
}

export function useCertificates() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  // Fetch user's certificates
  const { data: certificates = [], isLoading } = useQuery({
    queryKey: ["certificates", profile?.id],
    queryFn: async () => {
      if (!profile) return [];

      const { data, error } = await supabase
        .from("certificates")
        .select(`
          *,
          course:courses(id, title)
        `)
        .eq("user_id", profile.id)
        .order("issued_at", { ascending: false });

      if (error) throw error;
      return data as Certificate[];
    },
    enabled: !!profile,
  });

  // Generate a certificate
  const generateCertificate = useMutation({
    mutationFn: async (courseId: string) => {
      if (!profile) throw new Error("Must be logged in");

      const { data, error } = await supabase.functions.invoke("generate-certificate", {
        body: {
          courseId,
          userId: profile.id,
        },
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error);

      return data.certificate;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["certificates"] });
      toast.success("Certificat généré avec succès !");
    },
    onError: (error: Error) => {
      toast.error(`Erreur: ${error.message}`);
    },
  });

  const hasCertificate = (courseId: string) => {
    return certificates.some((c) => c.course_id === courseId);
  };

  const getCertificate = (courseId: string) => {
    return certificates.find((c) => c.course_id === courseId);
  };

  return {
    certificates,
    isLoading,
    generateCertificate,
    hasCertificate,
    getCertificate,
  };
}
