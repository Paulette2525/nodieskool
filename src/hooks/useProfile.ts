import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

interface UpdateProfileData {
  full_name?: string;
  username?: string;
  bio?: string;
  avatar_url?: string;
}

export function useProfile() {
  const { profile, refreshProfile } = useAuth();
  const queryClient = useQueryClient();

  const updateProfile = useMutation({
    mutationFn: async (data: UpdateProfileData) => {
      if (!profile) throw new Error("No profile found");

      const { error } = await supabase
        .from("profiles")
        .update({
          ...data,
          updated_at: new Date().toISOString(),
        })
        .eq("id", profile.id);

      if (error) throw error;
    },
    onSuccess: async () => {
      await refreshProfile();
      queryClient.invalidateQueries({ queryKey: ["leaderboard"] });
      toast.success("Profil mis à jour avec succès");
    },
    onError: (error: Error) => {
      toast.error(`Erreur: ${error.message}`);
    },
  });

  const updatePassword = useMutation({
    mutationFn: async ({ currentPassword, newPassword }: { currentPassword: string; newPassword: string }) => {
      // First verify current password by re-authenticating
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) throw new Error("Utilisateur non trouvé");

      // Update the password
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Mot de passe mis à jour avec succès");
    },
    onError: (error: Error) => {
      toast.error(`Erreur: ${error.message}`);
    },
  });

  return {
    profile,
    updateProfile,
    updatePassword,
  };
}
