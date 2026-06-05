import type { User as AuthUser } from "@supabase/supabase-js";
import { requireSupabase } from "./supabase";
import {
  mapCategory,
  mapPost,
  mapProfile,
  mapProject,
  mapWorkshop,
  type CategoryRow,
  type PostRow,
  type ProfileRow,
  type ProjectRow,
  type WorkshopRow,
} from "./mappers";
import { slugify } from "./utils";
import type {
  FeedPost,
  PortfolioProject,
  Specialty,
  StyleCategory,
  User,
  WorkshopRoom,
} from "../types";

function baseUsernameFromAuth(authUser: AuthUser): string {
  const meta = authUser.user_metadata ?? {};
  let base = String(
    meta.username ??
      meta.preferred_username ??
      authUser.email?.split("@")[0] ??
      "user"
  )
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

  if (base.length < 3) base = "user";
  return base;
}

export async function ensureProfileForUser(authUser: AuthUser): Promise<User> {
  const existing = await fetchProfile(authUser.id);
  if (existing) return existing;

  let username = baseUsernameFromAuth(authUser);
  let suffix = 0;
  while (!(await isUsernameAvailable(username))) {
    suffix += 1;
    username = `${baseUsernameFromAuth(authUser)}${suffix}`;
  }

  const meta = authUser.user_metadata ?? {};
  const displayName = String(
    meta.display_name ?? meta.full_name ?? meta.name ?? username
  );
  const avatarUrl = String(
    meta.avatar_url ??
      meta.picture ??
      `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`
  );

  const { data, error } = await requireSupabase()
    .from("profiles")
    .insert({
      id: authUser.id,
      username,
      display_name: displayName,
      email: authUser.email ?? "",
      avatar_url: avatarUrl,
      bio: "",
      specialties: [],
    })
    .select()
    .single();

  if (error) {
    const retry = await fetchProfile(authUser.id);
    if (retry) return retry;
    throw error;
  }

  return mapProfile(data as ProfileRow);
}

export async function fetchProfile(userId: string): Promise<User | null> {
  const { data, error } = await requireSupabase()
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (error) throw error;
  return data ? mapProfile(data as ProfileRow) : null;
}

export async function fetchProfileByUsername(username: string): Promise<User | null> {
  const { data, error } = await requireSupabase()
    .from("profiles")
    .select("*")
    .eq("username", username)
    .maybeSingle();

  if (error) throw error;
  return data ? mapProfile(data as ProfileRow) : null;
}

export async function fetchAllProfiles(): Promise<User[]> {
  const { data, error } = await requireSupabase()
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data as ProfileRow[]).map(mapProfile);
}

export async function isUsernameAvailable(username: string): Promise<boolean> {
  const { data, error } = await requireSupabase()
    .from("profiles")
    .select("id")
    .eq("username", username.toLowerCase())
    .maybeSingle();

  if (error) throw error;
  return !data;
}

export async function updateProfile(
  userId: string,
  patch: Partial<{
    bio: string;
    specialties: Specialty[];
    avatarUrl: string;
    displayName: string;
    username: string;
  }>
): Promise<User> {
  const row: Record<string, unknown> = {};
  if (patch.bio !== undefined) row.bio = patch.bio;
  if (patch.specialties !== undefined) row.specialties = patch.specialties;
  if (patch.avatarUrl !== undefined) row.avatar_url = patch.avatarUrl;
  if (patch.displayName !== undefined) row.display_name = patch.displayName;
  if (patch.username !== undefined) row.username = patch.username.toLowerCase();

  const { data, error } = await requireSupabase()
    .from("profiles")
    .update(row)
    .eq("id", userId)
    .select()
    .single();

  if (error) throw error;
  return mapProfile(data as ProfileRow);
}

export async function fetchCategories(): Promise<StyleCategory[]> {
  const { data, error } = await requireSupabase().from("style_categories").select("*");
  if (error) throw error;
  return (data as CategoryRow[]).map(mapCategory);
}

export async function insertCategory(
  userId: string,
  input: { name: string; description: string; coverImage: string }
): Promise<StyleCategory> {
  const { data, error } = await requireSupabase()
    .from("style_categories")
    .insert({
      user_id: userId,
      name: input.name,
      slug: slugify(input.name),
      description: input.description,
      cover_image: input.coverImage,
    })
    .select()
    .single();

  if (error) throw error;
  return mapCategory(data as CategoryRow);
}

export async function updateCategoryRow(
  id: string,
  patch: Partial<{ name: string; description: string; coverImage: string }>
): Promise<void> {
  const row: Record<string, unknown> = {};
  if (patch.name !== undefined) {
    row.name = patch.name;
    row.slug = slugify(patch.name);
  }
  if (patch.description !== undefined) row.description = patch.description;
  if (patch.coverImage !== undefined) row.cover_image = patch.coverImage;

  const { error } = await requireSupabase().from("style_categories").update(row).eq("id", id);
  if (error) throw error;
}

export async function deleteCategoryRow(id: string): Promise<void> {
  const { error } = await requireSupabase().from("style_categories").delete().eq("id", id);
  if (error) throw error;
}

export async function fetchProjects(): Promise<PortfolioProject[]> {
  const { data, error } = await requireSupabase().from("portfolio_projects").select("*");
  if (error) throw error;
  return (data as ProjectRow[]).map(mapProject);
}

export async function insertProject(
  userId: string,
  input: Omit<PortfolioProject, "id" | "createdAt" | "userId">
): Promise<PortfolioProject> {
  const { data, error } = await requireSupabase()
    .from("portfolio_projects")
    .insert({
      user_id: userId,
      category_id: input.categoryId,
      title: input.title,
      description: input.description,
      images: input.images,
      room_type: input.roomType,
      tags: input.tags,
    })
    .select()
    .single();

  if (error) throw error;
  return mapProject(data as ProjectRow);
}

export async function fetchPosts(): Promise<FeedPost[]> {
  const { data, error } = await requireSupabase()
    .from("feed_posts")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data as PostRow[]).map(mapPost);
}

export async function insertPost(
  userId: string,
  input: Omit<FeedPost, "id" | "createdAt" | "likes" | "likedBy" | "userId">
): Promise<FeedPost> {
  const { data, error } = await requireSupabase()
    .from("feed_posts")
    .insert({
      user_id: userId,
      project_id: input.projectId ?? null,
      category_id: input.categoryId ?? null,
      title: input.title,
      caption: input.caption,
      media_url: input.mediaUrl,
      media_type: input.mediaType,
      likes: 0,
      liked_by: [],
    })
    .select()
    .single();

  if (error) throw error;
  return mapPost(data as PostRow);
}

export async function togglePostLike(postId: string): Promise<void> {
  const { error } = await requireSupabase().rpc("toggle_feed_post_like", {
    target_post_id: postId,
  });

  if (error) throw error;
}

export async function fetchWorkshopsForUser(userId: string): Promise<WorkshopRoom[]> {
  const { data, error } = await requireSupabase()
    .from("workshops")
    .select("*")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });

  if (error) throw error;
  return (data as WorkshopRow[]).map(mapWorkshop);
}

export async function fetchAllWorkshops(): Promise<WorkshopRoom[]> {
  const { data, error } = await requireSupabase()
    .from("workshops")
    .select("*")
    .order("updated_at", { ascending: false });

  if (error) throw error;
  return (data as WorkshopRow[]).map(mapWorkshop);
}

export async function upsertWorkshop(room: WorkshopRoom): Promise<WorkshopRoom> {
  const { data, error } = await requireSupabase()
    .from("workshops")
    .upsert({
      id: room.id,
      user_id: room.userId,
      name: room.name,
      background_url: room.backgroundUrl,
      placed_products: room.placedProducts,
      notes: room.notes,
      created_at: room.createdAt,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;
  return mapWorkshop(data as WorkshopRow);
}

export async function deleteWorkshopRow(id: string): Promise<void> {
  const { error } = await requireSupabase().from("workshops").delete().eq("id", id);
  if (error) throw error;
}

export async function fetchAllAppData(userId: string | null) {
  const [profiles, categories, projects, posts, workshops] = await Promise.all([
    fetchAllProfiles(),
    fetchCategories(),
    fetchProjects(),
    fetchPosts(),
    userId ? fetchWorkshopsForUser(userId) : Promise.resolve([] as WorkshopRoom[]),
  ]);
  return { profiles, categories, projects, posts, workshops };
}
