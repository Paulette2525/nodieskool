import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface CommunitySettings {
  community_name: string;
  community_description: string;
  welcome_message: string;
  primary_color: string;
  enable_notifications: boolean;
  enable_leaderboard: boolean;
  enable_gamification: boolean;
  require_email_verification: boolean;
  allow_public_profiles: boolean;
}

const defaultSettings: CommunitySettings = {
  community_name: "Growth Academy",
  community_description: "La communauté des entrepreneurs ambitieux",
  welcome_message: "Bienvenue dans notre communauté !",
  primary_color: "#8B5CF6",
  enable_notifications: true,
  enable_leaderboard: true,
  enable_gamification: true,
  require_email_verification: true,
  allow_public_profiles: true,
};

export function useSettings() {
  const queryClient = useQueryClient();

  const settingsQuery = useQuery({
    queryKey: ["community-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("community_settings")
        .select("setting_key, setting_value");

      if (error) throw error;

      const settings: CommunitySettings = { ...defaultSettings };

      data?.forEach((row) => {
        const key = row.setting_key as keyof CommunitySettings;
        const value = row.setting_value;

        if (key in settings) {
          if (typeof defaultSettings[key] === "boolean") {
            (settings as any)[key] = value === "true";
          } else {
            (settings as any)[key] = value ?? defaultSettings[key];
          }
        }
      });

      return settings;
    },
  });

  const updateSettings = useMutation({
    mutationFn: async (newSettings: Partial<CommunitySettings>) => {
      const updates = Object.entries(newSettings).map(([key, value]) => ({
        setting_key: key,
        setting_value: String(value),
      }));

      for (const update of updates) {
        const { error } = await supabase
          .from("community_settings")
          .update({ setting_value: update.setting_value })
          .eq("setting_key", update.setting_key);

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["community-settings"] });
      toast.success("Paramètres enregistrés !");
    },
    onError: (error) => {
      toast.error("Erreur: " + error.message);
    },
  });

  const exportData = useMutation({
    mutationFn: async () => {
      // Export members
      const { data: members } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      // Export posts
      const { data: posts } = await supabase
        .from("posts")
        .select("*")
        .order("created_at", { ascending: false });

      // Export courses
      const { data: courses } = await supabase
        .from("courses")
        .select("*")
        .order("order_index", { ascending: true });

      // Export events
      const { data: events } = await supabase
        .from("events")
        .select("*")
        .order("start_time", { ascending: false });

      const exportData = {
        exportDate: new Date().toISOString(),
        members: members ?? [],
        posts: posts ?? [],
        courses: courses ?? [],
        events: events ?? [],
      };

      // Download as JSON
      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `community-export-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    },
    onSuccess: () => {
      toast.success("Données exportées !");
    },
    onError: (error) => {
      toast.error("Erreur d'export: " + error.message);
    },
  });

  return {
    settings: settingsQuery.data ?? defaultSettings,
    isLoading: settingsQuery.isLoading,
    updateSettings,
    exportData,
  };
}
