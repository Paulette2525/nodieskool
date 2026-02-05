import { createContext, useContext, ReactNode, useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface Community {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logo_url: string | null;
  cover_url: string | null;
  primary_color: string | null;
  is_public: boolean;
  is_active: boolean;
  owner_id: string;
  created_at: string;
}

export type CommunityRole = "owner" | "admin" | "moderator" | "member" | null;

interface CommunityContextType {
  community: Community | null;
  communityId: string | null;
  role: CommunityRole;
  isOwner: boolean;
  isAdmin: boolean;
  isModerator: boolean;
  isMember: boolean;
  loading: boolean;
  memberCount: number;
  refetch: () => void;
}

const CommunityContext = createContext<CommunityContextType | undefined>(undefined);

export function CommunityProvider({ children }: { children: ReactNode }) {
  const { slug } = useParams<{ slug: string }>();
  const { profile, loading: authLoading } = useAuth();
  const [community, setCommunity] = useState<Community | null>(null);
  const [role, setRole] = useState<CommunityRole>(null);
  const [loading, setLoading] = useState(true);
  const [memberCount, setMemberCount] = useState(0);
  const [refetchTrigger, setRefetchTrigger] = useState(0);

  const refetch = () => setRefetchTrigger(prev => prev + 1);

  useEffect(() => {
    async function fetchCommunity() {
      if (!slug) {
        setCommunity(null);
        setRole(null);
        setMemberCount(0);
        setLoading(false);
        return;
      }

      // Wait for auth to settle before checking membership
      if (authLoading) {
        return;
      }

      setLoading(true);
      try {
        // Fetch community by slug
        const { data: communityData, error: communityError } = await supabase
          .from("communities")
          .select("*")
          .eq("slug", slug)
          .single();

        if (communityError || !communityData) {
          setCommunity(null);
          setRole(null);
          setMemberCount(0);
          setLoading(false);
          return;
        }

        setCommunity(communityData as Community);

        // Fetch member count
        const { count } = await supabase
          .from("community_members")
          .select("*", { count: "exact", head: true })
          .eq("community_id", communityData.id)
          .eq("is_approved", true);

        setMemberCount(count || 0);

        // Fetch user role if authenticated
        if (profile) {
          const { data: memberData } = await supabase
            .from("community_members")
            .select("role, is_approved")
            .eq("community_id", communityData.id)
            .eq("user_id", profile.id)
            .maybeSingle();

          // Only set role if the member is approved
          if (memberData?.is_approved) {
            setRole((memberData?.role as CommunityRole) || null);
          } else {
            setRole(null);
          }
        } else {
          setRole(null);
        }
      } catch (error) {
        console.error("Error fetching community:", error);
        setCommunity(null);
        setRole(null);
        setMemberCount(0);
      }
      setLoading(false);
    }

    fetchCommunity();
  }, [slug, profile?.id, authLoading, refetchTrigger]);

  const isOwner = role === "owner";
  const isAdmin = role === "owner" || role === "admin";
  const isModerator = role === "owner" || role === "admin" || role === "moderator";
  const isMember = role !== null;

  return (
    <CommunityContext.Provider
      value={{
        community,
        communityId: community?.id || null,
        role,
        isOwner,
        isAdmin,
        isModerator,
        isMember,
        loading,
        memberCount,
        refetch,
      }}
    >
      {children}
    </CommunityContext.Provider>
  );
}

export function useCommunityContext() {
  const context = useContext(CommunityContext);
  if (context === undefined) {
    throw new Error("useCommunityContext must be used within a CommunityProvider");
  }
  return context;
}