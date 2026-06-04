import { Link } from "react-router-dom";
import { FeedCard } from "../components/FeedCard";
import { useAuth } from "../context/AuthContext";
import { useData } from "../context/DataContext";

export function FeedPage() {
  const { posts } = useData();
  const { user } = useAuth();

  return (
    <div className="relative">
      <div className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 py-3 sm:px-6">
        <span className="font-display text-xl font-semibold text-cream">RoomCraft</span>
        <div className="flex gap-3">
          <Link
            to="/explore"
            className="rounded-full bg-white/10 px-3 py-1 text-sm text-cream backdrop-blur"
          >
            Explore
          </Link>
          {user ? (
            <Link to="/profile">
              <img src={user.avatarUrl} alt="" className="h-8 w-8 rounded-full ring-2 ring-cream/30" />
            </Link>
          ) : (
            <Link
              to="/login"
              className="rounded-full bg-terracotta px-3 py-1 text-sm font-medium text-cream"
            >
              Join
            </Link>
          )}
        </div>
      </div>

      <div className="snap-feed hide-scrollbar">
        {posts.length === 0 ? (
          <section className="flex h-dvh flex-col items-center justify-center gap-4 px-6 text-cream">
            <p className="font-display text-2xl">No designs yet</p>
            <Link to="/signup" className="rounded-full bg-terracotta px-6 py-2 font-medium">
              Be the first designer
            </Link>
          </section>
        ) : (
          posts.map((post) => <FeedCard key={post.id} post={post} />)
        )}
      </div>
    </div>
  );
}
