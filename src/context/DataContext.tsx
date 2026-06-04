import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { storage, slugify, uid } from "../lib/storage";
import type {
  FeedPost,
  PortfolioProject,
  StyleCategory,
  WorkshopRoom,
} from "../types";
import { useAuth } from "./AuthContext";

interface DataContextValue {
  categories: StyleCategory[];
  projects: PortfolioProject[];
  posts: FeedPost[];
  workshops: WorkshopRoom[];
  refresh: () => void;
  addCategory: (data: { name: string; description: string; coverImage: string }) => StyleCategory;
  updateCategory: (id: string, patch: Partial<StyleCategory>) => void;
  deleteCategory: (id: string) => void;
  addProject: (data: Omit<PortfolioProject, "id" | "createdAt" | "userId">) => PortfolioProject;
  addPost: (data: Omit<FeedPost, "id" | "createdAt" | "likes" | "likedBy" | "userId">) => void;
  toggleLike: (postId: string, userId: string) => void;
  saveWorkshop: (room: WorkshopRoom) => void;
  deleteWorkshop: (id: string) => void;
  getUserCategories: (userId: string) => StyleCategory[];
  getCategoryProjects: (categoryId: string) => PortfolioProject[];
}

const DataContext = createContext<DataContextValue | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [categories, setCategories] = useState<StyleCategory[]>([]);
  const [projects, setProjects] = useState<PortfolioProject[]>([]);
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [workshops, setWorkshops] = useState<WorkshopRoom[]>([]);

  const refresh = useCallback(() => {
    setCategories(storage.getCategories());
    setProjects(storage.getProjects());
    setPosts(storage.getPosts().sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)));
    setWorkshops(storage.getWorkshops());
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh, user]);

  const addCategory = useCallback(
    (data: { name: string; description: string; coverImage: string }) => {
      if (!user) throw new Error("Not signed in");
      const cat: StyleCategory = {
        id: uid(),
        userId: user.id,
        name: data.name,
        slug: slugify(data.name),
        description: data.description,
        coverImage: data.coverImage,
        createdAt: new Date().toISOString(),
      };
      const next = [...storage.getCategories(), cat];
      storage.saveCategories(next);
      refresh();
      return cat;
    },
    [user, refresh]
  );

  const updateCategory = useCallback(
    (id: string, patch: Partial<StyleCategory>) => {
      const next = storage.getCategories().map((c) =>
        c.id === id
          ? { ...c, ...patch, slug: patch.name ? slugify(patch.name) : c.slug }
          : c
      );
      storage.saveCategories(next);
      refresh();
    },
    [refresh]
  );

  const deleteCategory = useCallback(
    (id: string) => {
      storage.saveCategories(storage.getCategories().filter((c) => c.id !== id));
      storage.saveProjects(storage.getProjects().filter((p) => p.categoryId !== id));
      refresh();
    },
    [refresh]
  );

  const addProject = useCallback(
    (data: Omit<PortfolioProject, "id" | "createdAt" | "userId">) => {
      if (!user) throw new Error("Not signed in");
      const proj: PortfolioProject = {
        ...data,
        id: uid(),
        userId: user.id,
        createdAt: new Date().toISOString(),
      };
      storage.saveProjects([...storage.getProjects(), proj]);
      refresh();
      return proj;
    },
    [user, refresh]
  );

  const addPost = useCallback(
    (data: Omit<FeedPost, "id" | "createdAt" | "likes" | "likedBy" | "userId">) => {
      if (!user) throw new Error("Not signed in");
      const post: FeedPost = {
        ...data,
        id: uid(),
        userId: user.id,
        likes: 0,
        likedBy: [],
        createdAt: new Date().toISOString(),
      };
      storage.savePosts([...storage.getPosts(), post]);
      refresh();
    },
    [user, refresh]
  );

  const toggleLike = useCallback(
    (postId: string, userId: string) => {
      const next = storage.getPosts().map((p) => {
        if (p.id !== postId) return p;
        const liked = p.likedBy.includes(userId);
        return {
          ...p,
          likedBy: liked ? p.likedBy.filter((id) => id !== userId) : [...p.likedBy, userId],
          likes: liked ? p.likes - 1 : p.likes + 1,
        };
      });
      storage.savePosts(next);
      refresh();
    },
    [refresh]
  );

  const saveWorkshop = useCallback(
    (room: WorkshopRoom) => {
      const existing = storage.getWorkshops();
      const idx = existing.findIndex((w) => w.id === room.id);
      const next =
        idx >= 0
          ? existing.map((w, i) => (i === idx ? room : w))
          : [...existing, room];
      storage.saveWorkshops(next);
      refresh();
    },
    [refresh]
  );

  const deleteWorkshop = useCallback(
    (id: string) => {
      storage.saveWorkshops(storage.getWorkshops().filter((w) => w.id !== id));
      refresh();
    },
    [refresh]
  );

  const getUserCategories = useCallback(
    (userId: string) => categories.filter((c) => c.userId === userId),
    [categories]
  );

  const getCategoryProjects = useCallback(
    (categoryId: string) => projects.filter((p) => p.categoryId === categoryId),
    [projects]
  );

  const value = useMemo(
    () => ({
      categories,
      projects,
      posts,
      workshops,
      refresh,
      addCategory,
      updateCategory,
      deleteCategory,
      addProject,
      addPost,
      toggleLike,
      saveWorkshop,
      deleteWorkshop,
      getUserCategories,
      getCategoryProjects,
    }),
    [
      categories,
      projects,
      posts,
      workshops,
      refresh,
      addCategory,
      updateCategory,
      deleteCategory,
      addProject,
      addPost,
      toggleLike,
      saveWorkshop,
      deleteWorkshop,
      getUserCategories,
      getCategoryProjects,
    ]
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used within DataProvider");
  return ctx;
}
