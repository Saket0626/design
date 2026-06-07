import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  ensureProfileForUser,
  fetchProfile,
  isUsernameAvailable,
  updateProfile as updateProfileDb,
} from "../lib/database";
import { isSupabaseConfigured, requireSupabase } from "../lib/supabase";
import type { Specialty, User } from "../types";

type AuthResult = { ok: true } | { ok: false; error: string };

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  configured: boolean;
  signUp: (data: {
    username: string;
    displayName: string;
    email: string;
    password: string;
  }) => Promise<AuthResult>;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signInWithGoogle: () => Promise<AuthResult>;
  signOut: () => Promise<void>;
  updateProfile: (
    patch: Partial<Pick<User, "bio" | "specialties" | "avatarUrl" | "displayName" | "username">>
  ) => Promise<AuthResult>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

async function loadUserFromSession(): Promise<User | null> {
  const client = requireSupabase();
  const {
    data: { session },
  } = await client.auth.getSession();
  if (!session?.user) return null;

  let profile = await fetchProfile(session.user.id);
  if (!profile) {
    profile = await ensureProfileForUser(session.user);
  }
  return profile;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      setUser(null);
      return;
    }
    const profile = await loadUserFromSession();
    setUser(profile);
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setLoading(false);
      return;
    }

    const client = requireSupabase();

    refreshUser().finally(() => setLoading(false));

    const {
      data: { subscription },
    } = client.auth.onAuthStateChange(async () => {
      await refreshUser();
    });

    return () => subscription.unsubscribe();
  }, [refreshUser]);

  const signUp = useCallback(
    async (data: {
      username: string;
      displayName: string;
      email: string;
      password: string;
    }): Promise<AuthResult> => {
      if (!isSupabaseConfigured()) {
        return {
          ok: false,
          error:
            "Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in Railway Variables, then redeploy.",
        };
      }

      const username = data.username.toLowerCase().replace(/[^a-z0-9]/g, "");
      if (username.length < 3) {
        return { ok: false, error: "Username must be at least 3 characters (letters/numbers only)" };
      }

      try {
        const available = await isUsernameAvailable(username);
        if (!available) return { ok: false, error: "Username is already taken" };

        const client = requireSupabase();
        const { data: authData, error } = await client.auth.signUp({
          email: data.email,
          password: data.password,
          options: {
            data: {
              username,
              display_name: data.displayName,
              avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
            },
          },
        });

        if (error) return { ok: false, error: error.message };
        if (!authData.user) return { ok: false, error: "Sign up failed" };

        if (!authData.session) {
          setUser(null);
          return {
            ok: false,
            error: "Account created. Check your email to confirm, then sign in.",
          };
        }

        // Profile is created by DB trigger; brief wait then fetch
        let profile: User | null = null;
        for (let i = 0; i < 5; i++) {
          profile = await fetchProfile(authData.user.id);
          if (profile) break;
          await new Promise((r) => setTimeout(r, 400));
        }

        if (!profile) {
          return {
            ok: false,
            error: "Account created. Check your email to confirm, then sign in.",
          };
        }

        setUser(profile);
        return { ok: true };
      } catch (e) {
        return { ok: false, error: e instanceof Error ? e.message : "Sign up failed" };
      }
    },
    []
  );

  const signIn = useCallback(async (email: string, password: string): Promise<AuthResult> => {
    if (!isSupabaseConfigured()) {
      return {
        ok: false,
        error:
          "Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in Railway Variables, then redeploy.",
      };
    }

    try {
      const { error } = await requireSupabase().auth.signInWithPassword({ email, password });
      if (error) return { ok: false, error: error.message };

      const profile = await loadUserFromSession();
      if (!profile) return { ok: false, error: "Profile not found. Try again in a moment." };
      setUser(profile);
      return { ok: true };
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : "Sign in failed" };
    }
  }, []);

  const signInWithGoogle = useCallback(async (): Promise<AuthResult> => {
    if (!isSupabaseConfigured()) {
      return {
        ok: false,
        error:
          "Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in Railway Variables, then redeploy.",
      };
    }

    try {
      const { error } = await requireSupabase().auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) return { ok: false, error: error.message };
      return { ok: true };
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : "Google sign-in failed" };
    }
  }, []);

  const signOut = useCallback(async () => {
    if (isSupabaseConfigured()) {
      await requireSupabase().auth.signOut();
    }
    setUser(null);
  }, []);

  const updateProfile = useCallback(
    async (
      patch: Partial<Pick<User, "bio" | "specialties" | "avatarUrl" | "displayName" | "username">>
    ): Promise<AuthResult> => {
      if (!user) return { ok: false, error: "Not signed in" };

      try {
        if (patch.username && patch.username !== user.username) {
          const normalized = patch.username.toLowerCase().replace(/[^a-z0-9]/g, "");
          if (normalized.length < 3) {
            return { ok: false, error: "Username must be at least 3 characters" };
          }
          const available = await isUsernameAvailable(normalized);
          if (!available) return { ok: false, error: "Username is already taken" };
          patch = { ...patch, username: normalized };
        }

        const updated = await updateProfileDb(user.id, patch);
        setUser(updated);
        return { ok: true };
      } catch (e) {
        return { ok: false, error: e instanceof Error ? e.message : "Update failed" };
      }
    },
    [user]
  );

  const value = useMemo(
    () => ({
      user,
      loading,
      configured: isSupabaseConfigured(),
      signUp,
      signIn,
      signInWithGoogle,
      signOut,
      updateProfile,
      refreshUser,
    }),
    [user, loading, signUp, signIn, signInWithGoogle, signOut, updateProfile, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export type { Specialty };
