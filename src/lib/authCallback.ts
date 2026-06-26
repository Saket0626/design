import type { User as AuthUser } from "@supabase/supabase-js";
import { ensureProfileForUser, fetchProfile } from "./database";
import { requireSupabase } from "./supabase";
import type { User } from "../types";

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Completes Google/OAuth PKCE redirect at /auth/callback?code=...
 */
export async function completeOAuthCallback(): Promise<{
  profile: User;
  isNewUser: boolean;
}> {
  const client = requireSupabase();
  const params = new URLSearchParams(window.location.search);
  const code = params.get("code");
  const oauthError = params.get("error_description") ?? params.get("error");

  if (oauthError) {
    throw new Error(decodeURIComponent(oauthError.replace(/\+/g, " ")));
  }

  let codeExchangeError: Error | null = null;
  if (code) {
    const { error } = await client.auth.exchangeCodeForSession(code);
    codeExchangeError = error;
  }

  // Remove ?code= from URL so refresh does not retry a spent code
  window.history.replaceState({}, document.title, window.location.pathname);

  let session = null;
  for (let attempt = 0; attempt < 20; attempt++) {
    const {
      data: { session: current },
      error,
    } = await client.auth.getSession();
    if (error) throw error;
    if (current?.user) {
      session = current;
      break;
    }
    await delay(250);
  }

  if (!session?.user) {
    if (codeExchangeError) throw codeExchangeError;
    throw new Error("Sign-in timed out. Close this tab and try Google sign-in again.");
  }

  let profile: User | null = null;
  for (let attempt = 0; attempt < 10; attempt++) {
    profile = await fetchProfile(session.user.id);
    if (profile) break;
    await delay(350);
  }

  const isNewUser = !profile;
  if (!profile) {
    profile = await ensureProfileForUser(session.user as AuthUser);
  }

  return { profile, isNewUser };
}
