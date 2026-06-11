import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  deleteCategoryRow,
  deleteWorkshopRow,
  fetchAllAppData,
  insertCategory,
  insertPost,
  insertProject,
  updateCategoryRow,
  updatePostLikes,
  upsertWorkshop,
} from "../lib/database";
import { isSupabaseConfigured } from "../lib/supabase";
import type {
  FeedPost,
  PortfolioProject,
  StyleCategory,
  User,
  WorkshopRoom,
} from "../types";
import { useAuth } from "./AuthContext";

interface DataContextValue {
  profiles: User[];
  categories: StyleCategory[];
  projects: PortfolioProject[];
  posts: FeedPost[];
  workshops: WorkshopRoom[];
  loading: boolean;
  refresh: () => Promise<void>;
  getProfile: (userId: string) => User | undefined;
  addCategory: (data: {
    name: string;
    description: string;
    coverImage: string;
  }) => Promise<StyleCategory>;
  updateCategory: (id: string, patch: Partial<StyleCategory>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  addProject: (
    data: Omit<PortfolioProject, "id" | "createdAt" | "userId">
  ) => Promise<PortfolioProject>;
  addPost: (
    data: Omit<FeedPost, "id" | "createdAt" | "likes" | "likedBy" | "userId">
  ) => Promise<void>;
  toggleLike: (postId: string, userId: string) => Promise<void>;
  saveWorkshop: (room: WorkshopRoom) => Promise<void>;
  deleteWorkshop: (id: string) => Promise<void>;
  getUserCategories: (userId: string) => StyleCategory[];
  getCategoryProjects: (categoryId: string) => PortfolioProject[];
}

const DataContext = createContext<DataContextValue | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const [profiles, setProfiles] = useState<User[]>([]);
  const [categories, setCategories] = useState<StyleCategory[]>([]);
  const [projects, setProjects] = useState<PortfolioProject[]>([]);
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [workshops, setWorkshops] = useState<WorkshopRoom[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (authLoading) {
      setLoading(true);
      return;
    }

    if (!isSupabaseConfigured()) {
      setProfiles([]);
      setCategories([]);
      setProjects([]);
      setPosts([]);
      setWorkshops([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const data = await fetchAllAppData(user?.id ?? null);
      setProfiles(data.profiles);
      setCategories(data.categories);
      setProjects(data.projects);
      setPosts(data.posts);
      setWorkshops(data.workshops);
    } finally {
      setLoading(false);
    }
  }, [authLoading, user?.id]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const getProfile = useCallback(
    (userId: string) => profiles.find((p) => p.id === userId),
    [profiles]
  );

  const addCategory = useCallback(
    async (data: { name: string; description: string; coverImage: string }) => {
      if (!user) throw new Error("Not signed in");
      const cat = await insertCategory(user.id, data);
      await refresh();
      return cat;
    },
    [user, refresh]
  );

  const updateCategory = useCallback(
    async (id: string, patch: Partial<StyleCategory>) => {
      await updateCategoryRow(id, {
        name: patch.name,
        description: patch.description,
        coverImage: patch.coverImage,
      });
      await refresh();
    },
    [refresh]
  );

  const deleteCategory = useCallback(
    async (id: string) => {
      await deleteCategoryRow(id);
      await refresh();
    },
    [refresh]
  );

  const addProject = useCallback(
    async (data: Omit<PortfolioProject, "id" | "createdAt" | "userId">) => {
      if (!user) throw new Error("Not signed in");
      const proj = await insertProject(user.id, data);
      await refresh();
      return proj;
    },
    [user, refresh]
  );

  const addPost = useCallback(
    async (data: Omit<FeedPost, "id" | "createdAt" | "likes" | "likedBy" | "userId">) => {
      if (!user) throw new Error("Not signed in");
      await insertPost(user.id, data);
      await refresh();
    },
    [user, refresh]
  );

  const toggleLike = useCallback(
    async (postId: string, userId: string) => {
      const post = posts.find((p) => p.id === postId);
      if (!post) return;

      const liked = post.likedBy.includes(userId);
      const likedBy = liked
        ? post.likedBy.filter((id) => id !== userId)
        : [...post.likedBy, userId];
      const likes = liked ? post.likes - 1 : post.likes + 1;

      await updatePostLikes(postId, likes, likedBy);
      await refresh();
    },
    [posts, refresh]
  );

  const saveWorkshop = useCallback(
    async (room: WorkshopRoom) => {
      await upsertWorkshop(room);
      await refresh();
    },
    [refresh]
  );

  const deleteWorkshop = useCallback(
    async (id: string) => {
      await deleteWorkshopRow(id);
      await refresh();
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
      profiles,
      categories,
      projects,
      posts,
      workshops,
      loading,
      refresh,
      getProfile,
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
      profiles,
      categories,
      projects,
      posts,
      workshops,
      loading,
      refresh,
      getProfile,
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
