import { Link } from "react-router-dom";
import { useData } from "../context/DataContext";
import { categoryPath } from "../lib/categoryRoutes";

export function ExplorePage() {
  const { profiles, categories, loading } = useData();

  if (loading) {
    return (
      <div className="px-4 py-16 text-center text-charcoal/60">Loading designers…</div>
    );
  }

  return (
    <div className="px-4 py-8 pb-24">
      <h1 className="font-display text-4xl font-semibold text-forest">Explore designers</h1>
      <p className="mt-2 text-charcoal/70">
        Discover interior designers, their specialties, and style portfolios.
      </p>

      <section className="mt-10">
        <h2 className="font-display text-xl text-forest">Designers</h2>
        {profiles.length === 0 ? (
          <p className="mt-4 text-charcoal/60">No designers yet. Be the first to sign up!</p>
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {profiles.map((u) => (
              <Link
                key={u.id}
                to={`/designer/${u.username}`}
                className="flex items-center gap-4 rounded-2xl border border-sand bg-white p-4 transition hover:border-sage"
              >
                <img src={u.avatarUrl} alt="" className="h-16 w-16 rounded-full object-cover" />
                <div>
                  <h3 className="font-display text-lg font-semibold">{u.displayName}</h3>
                  <p className="text-sm text-charcoal/60">@{u.username}</p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {u.specialties.slice(0, 3).map((s) => (
                      <span key={s} className="rounded bg-sage/10 px-2 py-0.5 text-xs text-forest">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="mt-12">
        <h2 className="font-display text-xl text-forest">Style categories</h2>
        {categories.length === 0 ? (
          <p className="mt-4 text-charcoal/60">No categories yet.</p>
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((cat) => {
              const owner = profiles.find((u) => u.id === cat.userId);
              return (
                <Link
                  key={cat.id}
                  to={categoryPath(cat)}
                  className="overflow-hidden rounded-2xl border border-sand"
                >
                  <img src={cat.coverImage} alt="" className="aspect-[4/3] w-full object-cover" />
                  <div className="bg-white p-4">
                    <h3 className="font-display font-semibold">{cat.name}</h3>
                    {owner && <p className="text-xs text-charcoal/50">@{owner.username}</p>}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
