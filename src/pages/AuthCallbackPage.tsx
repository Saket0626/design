import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { completeOAuthCallback } from "../lib/authCallback";
import { useAuth } from "../context/AuthContext";

export function AuthCallbackPage() {
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const [error, setError] = useState("");
  const [status, setStatus] = useState("Finishing sign in…");

  useEffect(() => {
    let cancelled = false;

    async function finishAuth() {
      try {
        setStatus("Confirming Google sign-in…");
        const { isNewUser } = await completeOAuthCallback();

        if (cancelled) return;

        setStatus("Loading your profile…");
        await refreshUser();

        if (cancelled) return;

        navigate(isNewUser ? "/profile/edit" : "/profile", { replace: true });
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
    <div className="flex min-h-[50vh] flex-col items-center justify-center px-4 text-center">
      {error ? (
        <>
          <p className="max-w-md text-terracotta">{error}</p>
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="mt-4 rounded-full bg-forest px-5 py-2 text-sm font-medium text-cream"
          >
            Back to login
          </button>
        </>
      ) : (
        <p className="text-charcoal/70">{status}</p>
      )}
    </div>
  );
}
