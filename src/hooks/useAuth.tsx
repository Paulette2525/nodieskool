import { useState, useEffect, createContext, useContext, ReactNode, useCallback, useRef } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface Profile {
  id: string;
  user_id: string;
  username: string;
  full_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  points: number;
  level: number;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  isAdmin: boolean;
  isModerator: boolean;
  loading: boolean;
  rolesLoaded: boolean;
  signUp: (email: string, password: string, username: string, fullName: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isModerator, setIsModerator] = useState(false);
  const [loading, setLoading] = useState(true);
  const [rolesLoaded, setRolesLoaded] = useState(false);
  const fetchingRef = useRef<string | null>(null);

  const fetchProfile = useCallback(async (userId: string) => {
    // Prevent duplicate fetches for same user
    if (fetchingRef.current === userId) return;
    fetchingRef.current = userId;
    setRolesLoaded(false);

    try {
      // Parallel fetch: profile + roles
      const [profileRes, rolesRes] = await Promise.all([
        supabase.from("profiles").select("*").eq("user_id", userId).single(),
        supabase.from("user_roles").select("role").eq("user_id", userId),
      ]);

      if (profileRes.data) {
        setProfile(profileRes.data as Profile);
      }

      const roles = rolesRes.data as Array<{ role: string }> | null;
      if (roles && roles.length > 0) {
        setIsAdmin(roles.some((r) => r.role === "admin"));
        setIsModerator(roles.some((r) => r.role === "moderator" || r.role === "admin"));
      } else {
        setIsAdmin(false);
        setIsModerator(false);
      }
    } catch (error) {
      console.error("Error fetching profile/roles:", error);
    }
    setRolesLoaded(true);
    fetchingRef.current = null;
  }, []);

  useEffect(() => {
    let mounted = true;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (!mounted) return;
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          // Use setTimeout to avoid blocking the auth state change
          setTimeout(() => {
            if (mounted) fetchProfile(session.user.id);
          }, 0);
        } else {
          setProfile(null);
          setIsAdmin(false);
          setIsModerator(false);
          setRolesLoaded(true);
        }
        setLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setRolesLoaded(true);
      }
      setLoading(false);
    }).catch(() => {
      if (!mounted) return;
      setRolesLoaded(true);
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  const signUp = async (email: string, password: string, username: string, fullName: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: { username, full_name: fullName },
      },
    });
    if (error) throw error;
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const signInWithGoogle = async () => {
    localStorage.setItem('oauth_pending', 'true');
    const { lovable } = await import("@/integrations/lovable/index");
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin + '/auth',
      extraParams: { prompt: "select_account" },
    });
    if (result.error) {
      localStorage.removeItem('oauth_pending');
      throw result.error;
    }
  };

  const refreshProfile = async () => {
    if (user) {
      fetchingRef.current = null; // Reset to allow re-fetch
      await fetchProfile(user.id);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user, session, profile, isAdmin, isModerator, loading, rolesLoaded,
        signUp, signIn, signOut, signInWithGoogle, refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
