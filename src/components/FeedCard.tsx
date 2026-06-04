import { Link } from "react-router-dom";
import type { FeedPost } from "../types";
import { useAuth } from "../context/AuthContext";
import { useData } from "../context/DataContext";

interface FeedCardProps {
  post: FeedPost;
}

export function FeedCard({ post }: FeedCardProps) {
  const { user } = useAuth();
  const { toggleLike, getProfile } = useData();
  const author = getProfile(post.userId);
  const liked = user ? post.likedBy.includes(user.id) : false;

  const formatLikes = (n: number) =>
    n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);

  const handleLike = () => {
    if (user) toggleLike(post.id, user.id);
  };

  return (
    <section className="relative h-dvh w-full shrink-0 snap-start">
      <img
        src={post.mediaUrl}
        alt={post.title}
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-transparent to-ink/20" />

      <div className="absolute right-3 bottom-24 flex flex-col items-center gap-5 sm:right-6">
        {author && (
          <Link to={`/designer/${author.username}`} className="relative">
            <img
              src={author.avatarUrl}
              alt={author.displayName}
              className="h-12 w-12 rounded-full border-2 border-cream object-cover"
            />
            <span className="absolute -bottom-1 left-1/2 flex h-5 w-5 -translate-x-1/2 items-center justify-center rounded-full bg-terracotta text-xs text-cream">
              +
            </span>
          </Link>
        )}
        <button
          type="button"
          onClick={handleLike}
          className="flex flex-col items-center gap-1 text-cream"
        >
          <span className={`text-2xl ${liked ? "text-terracotta" : ""}`}>
            {liked ? "♥" : "♡"}
          </span>
          <span className="text-xs font-medium">{formatLikes(post.likes)}</span>
        </button>
        <Link
          to={author ? `/designer/${author.username}` : "#"}
          className="flex flex-col items-center gap-1 text-cream"
        >
          <span className="text-2xl">◎</span>
          <span className="text-xs">View</span>
        </Link>
        <Link to="/workshop" className="flex flex-col items-center gap-1 text-cream">
          <span className="text-2xl">◫</span>
          <span className="text-xs">Try</span>
        </Link>
      </div>

      <div className="absolute bottom-20 left-4 right-20 text-left sm:bottom-8 sm:left-8 sm:max-w-md">
        {author && (
          <Link
            to={`/designer/${author.username}`}
            className="font-display text-lg font-semibold text-cream"
          >
            @{author.username}
          </Link>
        )}
        <h2 className="mt-1 font-display text-xl text-cream">{post.title}</h2>
        <p className="mt-1 line-clamp-2 text-sm text-cream/80">{post.caption}</p>
      </div>
    </section>
  );
}
