import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ALL_SPECIALTIES, type Specialty } from "../types";

export function ProfileEditPage() {
  const { user, updateProfile } = useAuth();
  const [bio, setBio] = useState(user?.bio ?? "");
  const [displayName, setDisplayName] = useState(user?.displayName ?? "");
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl ?? "");
  const [specialties, setSpecialties] = useState<Specialty[]>(user?.specialties ?? []);
  const [saved, setSaved] = useState(false);

  if (!user) return <Navigate to="/login" replace />;

  const toggleSpecialty = (s: Specialty) => {
    setSpecialties((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({ bio, displayName, avatarUrl, specialties });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="mx-auto max-w-lg px-4 py-8 pb-24">
      <Link to="/profile" className="text-sm text-terracotta">
        ← Back to profile
      </Link>
      <h1 className="mt-4 font-display text-3xl font-semibold text-forest">Edit profile</h1>

      <form onSubmit={handleSave} className="mt-8 space-y-6">
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
          className="w-full rounded-xl bg-terracotta py-3 font-medium text-cream"
        >
          {saved ? "Saved!" : "Save profile"}
        </button>
      </form>
    </div>
  );
}
