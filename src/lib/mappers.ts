import type {
  FeedPost,
  PortfolioProject,
  Specialty,
  StyleCategory,
  User,
  WorkshopRoom,
} from "../types";
import type { PlacedProduct } from "../types";

export type ProfileRow = {
  id: string;
  username: string;
  display_name: string;
  email: string;
  avatar_url: string;
  bio: string;
  specialties: string[];
  created_at: string;
};

export type CategoryRow = {
  id: string;
  user_id: string;
  name: string;
  slug: string;
  description: string;
  cover_image: string;
  created_at: string;
};

export type ProjectRow = {
  id: string;
  category_id: string;
  user_id: string;
  title: string;
  description: string;
  images: string[];
  room_type: string;
  tags: string[];
  created_at: string;
};

export type PostRow = {
  id: string;
  user_id: string;
  project_id: string | null;
  category_id: string | null;
  title: string;
  caption: string;
  media_url: string;
  media_type: string;
  likes: number;
  liked_by: string[];
  created_at: string;
};

export type WorkshopRow = {
  id: string;
  user_id: string;
  name: string;
  background_url: string;
  placed_products: PlacedProduct[];
  notes: string;
  created_at: string;
  updated_at: string;
};

export function mapProfile(row: ProfileRow): User {
  return {
    id: row.id,
    username: row.username,
    displayName: row.display_name,
    email: row.email,
    avatarUrl: row.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${row.username}`,
    bio: row.bio,
    specialties: row.specialties as Specialty[],
    createdAt: row.created_at,
  };
}

export function mapCategory(row: CategoryRow): StyleCategory {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    coverImage: row.cover_image,
    createdAt: row.created_at,
  };
}

export function mapProject(row: ProjectRow): PortfolioProject {
  return {
    id: row.id,
    categoryId: row.category_id,
    userId: row.user_id,
    title: row.title,
    description: row.description,
    images: row.images,
    roomType: row.room_type,
    tags: row.tags,
    createdAt: row.created_at,
  };
}

export function mapPost(row: PostRow): FeedPost {
  return {
    id: row.id,
    userId: row.user_id,
    projectId: row.project_id ?? undefined,
    categoryId: row.category_id ?? undefined,
    title: row.title,
    caption: row.caption,
    mediaUrl: row.media_url,
    mediaType: row.media_type as "image" | "video",
    likes: row.likes,
    likedBy: row.liked_by,
    createdAt: row.created_at,
  };
}

export function mapWorkshop(row: WorkshopRow): WorkshopRoom {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    backgroundUrl: row.background_url,
    placedProducts: row.placed_products ?? [],
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
