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
  adminCount: number;
  ownerName: string | null;
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
  const [adminCount, setAdminCount] = useState(0);
  const [ownerName, setOwnerName] = useState<string | null>(null);
  const [refetchTrigger, setRefetchTrigger] = useState(0);

  const refetch = () => setRefetchTrigger(prev => prev + 1);

  useEffect(() => {
    async function fetchCommunity() {
      if (!slug) {
        setCommunity(null);
        setRole(null);
        setMemberCount(0);
        setAdminCount(0);
        setOwnerName(null);
        setLoading(false);
        return;
      }

      if (authLoading) return;

      setLoading(true);
      try {
        const { data: communityData, error: communityError } = await supabase
          .from("communities")
          .select("*")
          .eq("slug", slug)
          .single();

        if (communityError || !communityData) {
          // Try public view for non-members
          const { data: publicData } = await supabase
            .from("communities_public")
            .select("*")
            .eq("slug", slug)
            .single();

          if (publicData) {
            setCommunity(publicData as unknown as Community);
            setOwnerName(null);
            // Fetch member count via RPC (bypasses RLS)
            if (publicData.id) {
              const { data: countData } = await supabase.rpc('get_community_member_count' as any, { _community_id: publicData.id });
              setMemberCount(typeof countData === 'number' ? countData : 0);
            } else {
              setMemberCount(0);
            }
            setAdminCount(0);
            setRole(null);
            setLoading(false);
            return;
          }
          setCommunity(null);
          setRole(null);
          setMemberCount(0);
          setAdminCount(0);
          setOwnerName(null);
          setLoading(false);
          return;
        }

        setCommunity(communityData as Community);

        // Parallel fetch: owner profile, member count, admin count, user role
        const [ownerRes, countRes, adminRes, memberRes] = await Promise.all([
          supabase.from("profiles").select("full_name, username").eq("id", communityData.owner_id).single(),
          supabase.rpc('get_community_member_count' as any, { _community_id: communityData.id }),
          supabase.from("community_members").select("*", { count: "exact", head: true }).eq("community_id", communityData.id).eq("is_approved", true).in("role", ["owner", "admin"]),
          profile
            ? supabase.from("community_members").select("role, is_approved").eq("community_id", communityData.id).eq("user_id", profile.id).maybeSingle()
            : Promise.resolve({ data: null }),
        ]);

        setOwnerName(ownerRes.data?.full_name || ownerRes.data?.username || null);
        setMemberCount(typeof countRes.data === 'number' ? countRes.data : 0);
        setAdminCount(adminRes.count || 0);

        if (profile && memberRes.data?.is_approved) {
          setRole((memberRes.data?.role as CommunityRole) || null);
        } else {
          setRole(null);
        }
      } catch (error) {
        console.error("Error fetching community:", error);
        setCommunity(null);
        setRole(null);
        setMemberCount(0);
        setAdminCount(0);
        setOwnerName(null);
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
        adminCount,
        ownerName,
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
