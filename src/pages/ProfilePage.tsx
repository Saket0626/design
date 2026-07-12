import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useData } from "../context/DataContext";

export function ProfilePage() {
  const { user, loading } = useAuth();
  const { getUserCategories, workshops } = useData();

  if (loading) {
    return <div className="px-4 py-16 text-center text-charcoal/60">Loading your profile...</div>;
  }
  if (!user) return <Navigate to="/login" replace />;

  const categories = getUserCategories(user.id);
  const myWorkshops = workshops.filter((w) => w.userId === user.id);

  return (
    <div className="px-4 py-8 pb-24">
      <div className="flex flex-col items-center text-center sm:flex-row sm:items-start sm:gap-8 sm:text-left">
        <img
          src={user.avatarUrl}
          alt=""
          className="h-24 w-24 rounded-full object-cover ring-4 ring-sand"
        />
        <div className="mt-4 flex-1 sm:mt-0">
          <h1 className="font-display text-3xl font-semibold text-forest">{user.displayName}</h1>
          <p className="text-charcoal/60">@{user.username}</p>
          <p className="mt-3 max-w-lg text-charcoal/80">{user.bio || "Add a bio to tell clients about your work."}</p>
          {user.specialties.length > 0 && (
            <div className="mt-4 flex flex-wrap justify-center gap-2 sm:justify-start">
              {user.specialties.map((s) => (
                <span
                  key={s}
                  className="rounded-full bg-sage/15 px-3 py-1 text-xs font-medium text-forest"
                >
                  {s}
                </span>
              ))}
            </div>
          )}
          <div className="mt-6 flex flex-wrap justify-center gap-3 sm:justify-start">
            <Link
              to="/profile/edit"
              className="rounded-full border border-sand px-5 py-2 text-sm font-medium hover:bg-sand/50"
            >
              Edit profile
            </Link>
            <Link
              to={`/designer/${user.username}`}
              className="rounded-full bg-forest px-5 py-2 text-sm font-medium text-cream"
            >
              Public page
            </Link>
            <Link
              to="/workshop"
              className="rounded-full bg-terracotta px-5 py-2 text-sm font-medium text-cream"
            >
              Open workshop
            </Link>
          </div>
        </div>
      </div>

      <section className="mt-12">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl text-forest">Style categories</h2>
          <Link to="/profile/categories/new" className="text-sm font-medium text-terracotta">
            + Add category
          </Link>
        </div>
        {categories.length === 0 ? (
          <p className="mt-4 rounded-xl border border-dashed border-sand p-8 text-center text-charcoal/60">
            Create sub-categories like &quot;Modern Rustic&quot; to organize your portfolio.
          </p>
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/category/${cat.slug}`}
                className="group overflow-hidden rounded-2xl border border-sand bg-white transition hover:shadow-lg"
              >
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src={cat.coverImage}
                    alt={cat.name}
                    className="h-full w-full object-cover transition group-hover:scale-105"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-display text-lg font-semibold">{cat.name}</h3>
                  <p className="mt-1 line-clamp-2 text-sm text-charcoal/60">{cat.description}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="mt-12">
        <h2 className="font-display text-2xl text-forest">Saved workshops</h2>
        {myWorkshops.length === 0 ? (
          <p className="mt-4 text-charcoal/60">
            Design virtual rooms in the{" "}
            <Link to="/workshop" className="text-terracotta underline">
              workshop
            </Link>{" "}
            — place real products on your room photos before buying.
          </p>
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {myWorkshops.map((w) => (
              <Link
                key={w.id}
                to={`/workshop/${w.id}`}
                className="overflow-hidden rounded-2xl border border-sand"
              >
                <img src={w.backgroundUrl} alt={w.name} className="aspect-video w-full object-cover" />
                <p className="p-3 font-medium">{w.name}</p>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
