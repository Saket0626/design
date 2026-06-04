import type {
  FeedPost,
  PortfolioProject,
  StyleCategory,
  User,
  WorkshopRoom,
} from "../types";

const KEYS = {
  users: "roomcraft_users",
  session: "roomcraft_session",
  categories: "roomcraft_categories",
  projects: "roomcraft_projects",
  posts: "roomcraft_posts",
  workshops: "roomcraft_workshops",
  seeded: "roomcraft_seeded",
} as const;

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

export const storage = {
  getUsers: () => read<User[]>(KEYS.users, []),
  saveUsers: (users: User[]) => write(KEYS.users, users),

  getSession: () => read<string | null>(KEYS.session, null),
  setSession: (userId: string | null) =>
    userId ? write(KEYS.session, userId) : localStorage.removeItem(KEYS.session),

  getCategories: () => read<StyleCategory[]>(KEYS.categories, []),
  saveCategories: (c: StyleCategory[]) => write(KEYS.categories, c),

  getProjects: () => read<PortfolioProject[]>(KEYS.projects, []),
  saveProjects: (p: PortfolioProject[]) => write(KEYS.projects, p),

  getPosts: () => read<FeedPost[]>(KEYS.posts, []),
  savePosts: (p: FeedPost[]) => write(KEYS.posts, p),

  getWorkshops: () => read<WorkshopRoom[]>(KEYS.workshops, []),
  saveWorkshops: (w: WorkshopRoom[]) => write(KEYS.workshops, w),

  isSeeded: () => localStorage.getItem(KEYS.seeded) === "1",
  markSeeded: () => localStorage.setItem(KEYS.seeded, "1"),
};

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function uid(): string {
  return crypto.randomUUID();
}
