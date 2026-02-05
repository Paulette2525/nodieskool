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
 }
 
 const CommunityContext = createContext<CommunityContextType | undefined>(undefined);
 
 export function CommunityProvider({ children }: { children: ReactNode }) {
   const { slug } = useParams<{ slug: string }>();
   const { profile } = useAuth();
   const [community, setCommunity] = useState<Community | null>(null);
   const [role, setRole] = useState<CommunityRole>(null);
   const [loading, setLoading] = useState(true);
 
   useEffect(() => {
     async function fetchCommunity() {
       if (!slug) {
         setCommunity(null);
         setRole(null);
         setLoading(false);
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
           setLoading(false);
           return;
         }
 
         setCommunity(communityData as Community);
 
         // Fetch user role if authenticated
         if (profile) {
           const { data: memberData } = await supabase
             .from("community_members")
             .select("role")
             .eq("community_id", communityData.id)
             .eq("user_id", profile.id)
             .maybeSingle();
 
           setRole((memberData?.role as CommunityRole) || null);
         } else {
           setRole(null);
         }
       } catch (error) {
         console.error("Error fetching community:", error);
         setCommunity(null);
         setRole(null);
       }
       setLoading(false);
     }
 
     fetchCommunity();
   }, [slug, profile?.id]);
 
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