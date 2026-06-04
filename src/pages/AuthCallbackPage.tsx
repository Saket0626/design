import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { requireSupabase } from "../lib/supabase";

export function AuthCallbackPage() {
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function finishAuth() {
      try {
        const client = requireSupabase();
        const { error: sessionError } = await client.auth.getSession();
        if (sessionError) throw sessionError;

        await refreshUser();
        if (!cancelled) navigate("/profile", { replace: true });
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Could not complete sign in");
        }
      }
    }

    finishAuth();
    return () => {
      cancelled = true;
    };
  }, [navigate, refreshUser]);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center px-4">
      {error ? (
        <>
          <p className="text-terracotta">{error}</p>
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="mt-4 text-sm font-medium text-forest underline"
          >
            Back to login
          </button>
        </>
      ) : (
        <p className="text-charcoal/70">Finishing sign in…</p>
      )}
    </div>
  );
}
