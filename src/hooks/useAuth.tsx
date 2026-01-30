// Auth context and provider for user authentication and role management
import { useState, useEffect, createContext, useContext, ReactNode } from "react";
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

  const withTimeout = async <T,>(promise: PromiseLike<T>, ms: number, label: string): Promise<T> => {
    let timeoutId: number | undefined;
    const timeout = new Promise<never>((_, reject) => {
      timeoutId = window.setTimeout(() => reject(new Error(`${label} timed out`)), ms);
    });

    try {
      return await Promise.race([Promise.resolve(promise as unknown as T), timeout]);
    } finally {
      if (timeoutId) window.clearTimeout(timeoutId);
    }
  };

  const fetchProfile = async (userId: string) => {
    setRolesLoaded(false);
    try {
      const profileRes = await withTimeout(
        supabase.from("profiles").select("*").eq("user_id", userId).single(),
        8000,
        "fetchProfile(profiles)"
      );

      const profileData = (profileRes as any)?.data as Profile | null | undefined;

      if (profileData) {
        setProfile(profileData);
      }

      // Check roles
      const rolesRes = await withTimeout(
        supabase.from("user_roles").select("role").eq("user_id", userId),
        8000,
        "fetchProfile(user_roles)"
      );

      const roles = (rolesRes as any)?.data as Array<{ role: string }> | null | undefined;

      if (roles && roles.length > 0) {
        const hasAdmin = roles.some((r) => r.role === "admin");
        const hasMod = roles.some((r) => r.role === "moderator" || r.role === "admin");
        setIsAdmin(hasAdmin);
        setIsModerator(hasMod);
      } else {
        setIsAdmin(false);
        setIsModerator(false);
      }
      setRolesLoaded(true);
    } catch (error) {
      console.error("Error fetching profile/roles:", error);
      setRolesLoaded(true);
    }
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          // Do not block rendering on profile/role fetch
          void fetchProfile(session.user.id);
        } else {
          setProfile(null);
          setIsAdmin(false);
          setIsModerator(false);
          setRolesLoaded(true);
        }
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        void fetchProfile(session.user.id);
      } else {
        setRolesLoaded(true);
      }
      setLoading(false);
    }).catch((err) => {
      console.error("Error getting session:", err);
      setRolesLoaded(true);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, username: string, fullName: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: {
          username,
          full_name: fullName,
        },
      },
    });

    if (error) throw error;

    // Create profile
    if (data.user) {
      const { error: profileError } = await supabase.from("profiles").insert({
        user_id: data.user.id,
        username,
        full_name: fullName,
      });

      if (profileError) throw profileError;

      // Assign member role
      const { error: roleError } = await supabase.from("user_roles").insert({
        user_id: data.user.id,
        role: "member",
      });

      if (roleError) throw roleError;
    }
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        isAdmin,
        isModerator,
        loading,
        rolesLoaded,
        signUp,
        signIn,
        signOut,
        refreshProfile,
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
