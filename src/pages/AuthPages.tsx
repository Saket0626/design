import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function GoogleIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

function SupabaseWarning() {
  const { configured } = useAuth();
  if (configured) return null;
  return (
    <div className="mb-6 rounded-xl border border-terracotta/30 bg-terracotta/10 px-4 py-3 text-sm text-charcoal">
      Supabase is not configured. Add <code className="text-xs">VITE_SUPABASE_URL</code> and{" "}
      <code className="text-xs">VITE_SUPABASE_ANON_KEY</code> to a <code className="text-xs">.env</code>{" "}
      file (see README).
    </div>
  );
}

function GoogleButton({
  onClick,
  disabled,
  label,
}: {
  onClick: () => void;
  disabled: boolean;
  label: string;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="flex w-full items-center justify-center gap-3 rounded-xl border border-sand bg-white py-3 font-medium text-charcoal transition hover:bg-cream disabled:opacity-50"
    >
      <GoogleIcon />
      {label}
    </button>
  );
}

export function LoginPage() {
  const { signIn, signInWithGoogle, configured } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    const result = await signIn(email, password);
    setBusy(false);
    if (result.ok) navigate("/profile");
    else setError(result.error);
  };

  const handleGoogle = async () => {
    setBusy(true);
    setError("");
    const result = await signInWithGoogle();
    if (!result.ok) {
      setBusy(false);
      setError(result.error);
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <h1 className="font-display text-4xl font-semibold text-forest">Welcome back</h1>
      <p className="mt-2 text-charcoal/70">Sign in to manage your portfolio and workshop.</p>

      <SupabaseWarning />

      <GoogleButton
        label="Continue with Google"
        disabled={busy || !configured}
        onClick={handleGoogle}
      />

      <div className="my-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-sand" />
        <span className="text-xs text-charcoal/50">or email</span>
        <div className="h-px flex-1 bg-sand" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <p className="rounded-lg bg-terracotta/10 px-3 py-2 text-sm text-terracotta">{error}</p>
        )}
        <label className="block">
          <span className="text-sm font-medium text-charcoal">Email</span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-xl border border-sand bg-white px-4 py-2.5 outline-none focus:border-sage"
            placeholder="you@studio.com"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-charcoal">Password</span>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-xl border border-sand bg-white px-4 py-2.5 outline-none focus:border-sage"
          />
        </label>
        <button
          type="submit"
          disabled={busy || !configured}
          className="w-full rounded-xl bg-forest py-3 font-medium text-cream transition hover:bg-forest/90 disabled:opacity-50"
        >
          {busy ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <p className="mt-4 text-center text-sm">
        New here?{" "}
        <Link to="/signup" className="font-medium text-terracotta">
          Create account
        </Link>
      </p>
    </div>
  );
}

export function SignupPage() {
  const { signUp, signInWithGoogle, configured } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: "",
    displayName: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    const result = await signUp(form);
    setBusy(false);
    if (result.ok) navigate("/profile/edit");
    else setError(result.error);
  };

  const handleGoogle = async () => {
    setBusy(true);
    setError("");
    const result = await signInWithGoogle();
    if (!result.ok) {
      setBusy(false);
      setError(result.error);
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <h1 className="font-display text-4xl font-semibold text-forest">Join RoomCraft</h1>
      <p className="mt-2 text-charcoal/70">
        Build your designer site, showcase rooms, and test products virtually.
      </p>

      <SupabaseWarning />

      <GoogleButton
        label="Sign up with Google"
        disabled={busy || !configured}
        onClick={handleGoogle}
      />

      <div className="my-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-sand" />
        <span className="text-xs text-charcoal/50">or email</span>
        <div className="h-px flex-1 bg-sand" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <p className="rounded-lg bg-terracotta/10 px-3 py-2 text-sm text-terracotta">{error}</p>
        )}
        {(["displayName", "username", "email", "password"] as const).map((field) => (
          <label key={field} className="block">
            <span className="text-sm font-medium capitalize text-charcoal">
              {field === "displayName" ? "Display name" : field}
            </span>
            <input
              type={field === "password" ? "password" : field === "email" ? "email" : "text"}
              required
              value={form[field]}
              onChange={(e) => setForm({ ...form, [field]: e.target.value })}
              className="mt-1 w-full rounded-xl border border-sand bg-white px-4 py-2.5 outline-none focus:border-sage"
              placeholder={
                field === "username" ? "yourstudio" : field === "displayName" ? "Jane Doe" : ""
              }
            />
          </label>
        ))}
        <button
          type="submit"
          disabled={busy || !configured}
          className="w-full rounded-xl bg-terracotta py-3 font-medium text-cream transition hover:bg-terracotta/90 disabled:opacity-50"
        >
          {busy ? "Creating account…" : "Create account"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm">
        Already have an account?{" "}
        <Link to="/login" className="font-medium text-terracotta">
          Sign in
        </Link>
      </p>
    </div>
  );
}
