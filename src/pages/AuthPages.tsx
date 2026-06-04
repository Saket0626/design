import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function LoginPage() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = signIn(email, password);
    if (result.ok) navigate("/profile");
    else setError(result.error ?? "Login failed");
  };

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <h1 className="font-display text-4xl font-semibold text-forest">Welcome back</h1>
      <p className="mt-2 text-charcoal/70">Sign in to manage your portfolio and workshop.</p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
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
          className="w-full rounded-xl bg-forest py-3 font-medium text-cream transition hover:bg-forest/90"
        >
          Sign in
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-charcoal/60">
        Demo: <button type="button" className="text-terracotta underline" onClick={() => { setEmail("maya@example.com"); setPassword("demo123"); }}>maya@example.com</button>
      </p>
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
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: "",
    displayName: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = signUp(form);
    if (result.ok) navigate("/profile/edit");
    else setError(result.error ?? "Signup failed");
  };

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <h1 className="font-display text-4xl font-semibold text-forest">Join RoomCraft</h1>
      <p className="mt-2 text-charcoal/70">
        Build your designer site, showcase rooms, and test products virtually.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
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
          className="w-full rounded-xl bg-terracotta py-3 font-medium text-cream transition hover:bg-terracotta/90"
        >
          Create account
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
