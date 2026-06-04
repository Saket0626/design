import { Link, useParams } from "react-router-dom";
import { useData } from "../context/DataContext";
import { storage } from "../lib/storage";
import { useAuth } from "../context/AuthContext";

export function DesignerPage() {
  const { username } = useParams<{ username: string }>();
  const { getUserCategories, projects } = useData();
  const { user: currentUser } = useAuth();

  const designer = storage.getUsers().find((u) => u.username === username);
  if (!designer) {
    return (
      <div className="px-4 py-16 text-center">
        <p>Designer not found.</p>
        <Link to="/explore">Browse designers</Link>
      </div>
    );
  }

  const categories = getUserCategories(designer.id);
  const allProjects = projects.filter((p) => p.userId === designer.id);
  const isSelf = currentUser?.id === designer.id;

  return (
    <div className="pb-24">
      <div className="bg-forest px-4 py-12 text-cream sm:px-8">
        <div className="mx-auto flex max-w-4xl flex-col items-center gap-6 sm:flex-row sm:items-start">
          <img
            src={designer.avatarUrl}
            alt=""
            className="h-28 w-28 rounded-full object-cover ring-4 ring-cream/20"
          />
          <div className="text-center sm:text-left">
            <h1 className="font-display text-4xl font-semibold">{designer.displayName}</h1>
            <p className="text-cream/70">@{designer.username}</p>
            <p className="mt-4 max-w-xl">{designer.bio}</p>
            <div className="mt-4 flex flex-wrap justify-center gap-2 sm:justify-start">
              {designer.specialties.map((s) => (
                <span
                  key={s}
                  className="rounded-full bg-cream/15 px-3 py-1 text-xs font-medium"
                >
                  {s}
                </span>
              ))}
            </div>
            {isSelf && (
              <Link
                to="/profile/edit"
                className="mt-6 inline-block rounded-full border border-cream/40 px-5 py-2 text-sm"
              >
                Edit your site
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-10">
        <h2 className="font-display text-2xl text-forest">Portfolio categories</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/category/${cat.slug}`}
              className="flex gap-4 overflow-hidden rounded-2xl border border-sand bg-white p-3 transition hover:border-sage"
            >
              <img
                src={cat.coverImage}
                alt=""
                className="h-24 w-24 shrink-0 rounded-xl object-cover"
              />
              <div>
                <h3 className="font-display text-lg font-semibold">{cat.name}</h3>
                <p className="line-clamp-2 text-sm text-charcoal/60">{cat.description}</p>
              </div>
            </Link>
          ))}
        </div>

        {allProjects.length > 0 && (
          <>
            <h2 className="mt-12 font-display text-2xl text-forest">All work</h2>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {allProjects.map((p) => (
                <div key={p.id} className="overflow-hidden rounded-xl">
                  <img src={p.images[0]} alt={p.title} className="aspect-square object-cover" />
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
