 import { useQuery } from "@tanstack/react-query";
 import { supabase } from "@/integrations/supabase/client";
 import { useAuth } from "./useAuth";
 
 export interface Subscription {
   id: string;
   user_id: string;
   plan: "free" | "pro" | "business";
   status: "active" | "canceled" | "past_due" | "trialing";
   stripe_customer_id: string | null;
   stripe_subscription_id: string | null;
   current_period_start: string | null;
   current_period_end: string | null;
 }
 
 export interface SubscriptionPlan {
   id: string;
   name: string;
   price_monthly: number;
   price_yearly: number;
   max_communities: number;
   max_members_per_community: number;
   features: string[];
   is_active: boolean;
 }
 
 export function useSubscription() {
   const { profile } = useAuth();
 
   const subscriptionQuery = useQuery({
     queryKey: ["subscription", profile?.id],
     queryFn: async () => {
       if (!profile) return null;
 
       const { data, error } = await supabase
         .from("subscriptions")
         .select("*")
         .eq("user_id", profile.id)
         .maybeSingle();
 
       if (error) throw error;
       return data as Subscription | null;
     },
     enabled: !!profile,
   });
 
   const plansQuery = useQuery({
     queryKey: ["subscription-plans"],
     queryFn: async () => {
       const { data, error } = await supabase
         .from("subscription_plans")
         .select("*")
         .eq("is_active", true)
         .order("price_monthly");
 
       if (error) throw error;
       return data as SubscriptionPlan[];
     },
   });
 
   const subscription = subscriptionQuery.data;
   const currentPlan = subscription?.plan || "free";
   const isActive = subscription?.status === "active";
 
   // Get limits based on plan
   const getPlanLimits = () => {
     const plan = plansQuery.data?.find((p) => p.id === currentPlan);
     return {
       maxCommunities: plan?.max_communities ?? 1,
       maxMembersPerCommunity: plan?.max_members_per_community ?? 100,
     };
   };
 
   return {
     subscription,
     plans: plansQuery.data ?? [],
     currentPlan,
     isActive,
     limits: getPlanLimits(),
     isLoading: subscriptionQuery.isLoading,
     isLoadingPlans: plansQuery.isLoading,
   };
 }