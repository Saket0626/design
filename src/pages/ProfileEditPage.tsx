import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ALL_SPECIALTIES, type Specialty } from "../types";

export function ProfileEditPage() {
  const { user, loading, updateProfile } = useAuth();
  const [bio, setBio] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!user) return;
    setBio(user.bio);
    setDisplayName(user.displayName);
    setUsername(user.username);
    setAvatarUrl(user.avatarUrl);
    setSpecialties(user.specialties);
  }, [user]);

  if (loading) {
    return <div className="px-4 py-16 text-center text-charcoal/60">Loading your profile...</div>;
  }
  if (!user) return <Navigate to="/login" replace />;

  const toggleSpecialty = (s: Specialty) => {
    setSpecialties((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    const result = await updateProfile({
      bio,
      displayName,
      username,
      avatarUrl,
      specialties,
    });
    setBusy(false);
    if (result.ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="mx-auto max-w-lg px-4 py-8 pb-24">
      <Link to="/profile" className="text-sm text-terracotta">
        ← Back to profile
      </Link>
      <h1 className="mt-4 font-display text-3xl font-semibold text-forest">Edit profile</h1>
      <p className="mt-1 text-sm text-charcoal/60">
        Google sign-in users: set your public @username here.
      </p>

      <form onSubmit={handleSave} className="mt-8 space-y-6">
        {error && (
          <p className="rounded-lg bg-terracotta/10 px-3 py-2 text-sm text-terracotta">{error}</p>
        )}
        <label className="block">
          <span className="text-sm font-medium">Username (public URL)</span>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value.toLowerCase())}
            className="mt-1 w-full rounded-xl border border-sand bg-white px-4 py-2.5"
            placeholder="yourstudio"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium">Display name</span>
          <input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="mt-1 w-full rounded-xl border border-sand bg-white px-4 py-2.5"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium">Avatar URL</span>
          <input
            value={avatarUrl}
            onChange={(e) => setAvatarUrl(e.target.value)}
            className="mt-1 w-full rounded-xl border border-sand bg-white px-4 py-2.5"
            placeholder="https://..."
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium">Bio</span>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={4}
            className="mt-1 w-full rounded-xl border border-sand bg-white px-4 py-2.5"
            placeholder="Tell clients what you're great at..."
          />
        </label>

        <fieldset>
          <legend className="text-sm font-medium">Specialties — what you&apos;re great at</legend>
          <div className="mt-3 flex flex-wrap gap-2">
            {ALL_SPECIALTIES.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => toggleSpecialty(s)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                  specialties.includes(s)
                    ? "bg-forest text-cream"
                    : "bg-sand/60 text-charcoal hover:bg-sand"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </fieldset>

        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-xl bg-terracotta py-3 font-medium text-cream disabled:opacity-50"
        >
          {saved ? "Saved!" : busy ? "Saving…" : "Save profile"}
        </button>
      </form>
    </div>
  );
}
