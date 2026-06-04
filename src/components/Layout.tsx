import { Link, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const navItems = [
  { to: "/", label: "Feed", icon: "▶" },
  { to: "/explore", label: "Explore", icon: "◎" },
  { to: "/workshop", label: "Workshop", icon: "◫" },
  { to: "/profile", label: "Profile", icon: "◉" },
];

export function Layout() {
  const { pathname } = useLocation();
  const { user } = useAuth();
  const isFeed = pathname === "/";

  return (
    <div className={`min-h-dvh flex flex-col ${isFeed ? "bg-ink" : "bg-cream"}`}>
      {!isFeed && (
        <header className="sticky top-0 z-40 border-b border-sand/80 bg-cream/95 backdrop-blur-sm">
          <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
            <Link to="/" className="font-display text-2xl font-semibold tracking-tight text-forest">
              RoomCraft
            </Link>
            <nav className="hidden gap-6 sm:flex">
              {navItems.slice(1).map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`text-sm font-medium transition-colors ${
                    pathname.startsWith(item.to)
                      ? "text-terracotta"
                      : "text-charcoal/70 hover:text-charcoal"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            {user ? (
              <Link to={`/designer/${user.username}`} className="flex items-center gap-2">
                <img
                  src={user.avatarUrl}
                  alt=""
                  className="h-8 w-8 rounded-full object-cover ring-2 ring-sand"
                />
              </Link>
            ) : (
              <Link
                to="/login"
                className="rounded-full bg-forest px-4 py-1.5 text-sm font-medium text-cream"
              >
                Sign in
              </Link>
            )}
          </div>
        </header>
      )}

      <main className={`flex-1 ${isFeed ? "" : "mx-auto w-full max-w-6xl"}`}>
        <Outlet />
      </main>

      <nav
        className={`fixed bottom-0 left-0 right-0 z-50 border-t sm:hidden ${
          isFeed
            ? "border-white/10 bg-ink/90 backdrop-blur-md"
            : "border-sand bg-cream/95 backdrop-blur-sm"
        }`}
      >
        <div className="flex justify-around py-2">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 text-xs ${
                (item.to === "/" ? pathname === "/" : pathname.startsWith(item.to))
                  ? isFeed
                    ? "text-terracotta"
                    : "text-terracotta font-semibold"
                  : isFeed
                    ? "text-cream/60"
                    : "text-charcoal/50"
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </div>
      </nav>

      {!isFeed && <div className="h-16 sm:hidden" />}
      {isFeed && <div className="h-16 sm:hidden" />}
    </div>
  );
}
