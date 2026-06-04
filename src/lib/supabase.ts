import { createClient, type SupabaseClient } from "@supabase/supabase-js";

declare global {
  interface Window {
    __RUNTIME_CONFIG__?: {
      VITE_SUPABASE_URL?: string;
      VITE_SUPABASE_ANON_KEY?: string;
    };
  }
}

function readConfig() {
  const runtime =
    typeof window !== "undefined" ? window.__RUNTIME_CONFIG__ : undefined;

  return {
    url: (import.meta.env.VITE_SUPABASE_URL || runtime?.VITE_SUPABASE_URL || "").trim(),
    anonKey: (
      import.meta.env.VITE_SUPABASE_ANON_KEY || runtime?.VITE_SUPABASE_ANON_KEY || ""
    ).trim(),
  };
}

let client: SupabaseClient | null = null;

export function isSupabaseConfigured(): boolean {
  const { url, anonKey } = readConfig();
  return Boolean(url && anonKey);
}

export function getSupabase(): SupabaseClient | null {
  if (client) return client;

  const { url, anonKey } = readConfig();
  if (!url || !anonKey) return null;

  client = createClient(url, anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      // OAuth code exchange runs explicitly in AuthCallbackPage
      detectSessionInUrl: false,
      flowType: "pkce",
    },
  });

  return client;
}

export function requireSupabase(): SupabaseClient {
  const sb = getSupabase();
  if (!sb) {
    throw new Error(
      "Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in Railway Variables (then redeploy), or in your local .env file."
    );
  }
  return sb;
}

/** @deprecated use getSupabase() */
export const supabase = null;
