export type Specialty =
  | "Space Planning"
  | "Color Theory"
  | "Lighting Design"
  | "Sustainable Materials"
  | "Kitchen & Bath"
  | "Commercial Spaces"
  | "Staging"
  | "Custom Furniture"
  | "Vintage Restoration"
  | "Smart Home Integration";

export const ALL_SPECIALTIES: Specialty[] = [
  "Space Planning",
  "Color Theory",
  "Lighting Design",
  "Sustainable Materials",
  "Kitchen & Bath",
  "Commercial Spaces",
  "Staging",
  "Custom Furniture",
  "Vintage Restoration",
  "Smart Home Integration",
];

export interface User {
  id: string;
  username: string;
  displayName: string;
  email: string;
  password: string;
  avatarUrl: string;
  bio: string;
  specialties: Specialty[];
  createdAt: string;
}

export interface StyleCategory {
  id: string;
  userId: string;
  name: string;
  slug: string;
  description: string;
  coverImage: string;
  createdAt: string;
}

export interface PortfolioProject {
  id: string;
  categoryId: string;
  userId: string;
  title: string;
  description: string;
  images: string[];
  roomType: string;
  tags: string[];
  createdAt: string;
}

export interface FeedPost {
  id: string;
  userId: string;
  projectId?: string;
  categoryId?: string;
  title: string;
  caption: string;
  mediaUrl: string;
  mediaType: "image" | "video";
  likes: number;
  likedBy: string[];
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: "lighting" | "furniture" | "decor" | "textiles" | "plants";
  price: number;
  imageUrl: string;
  width: number;
  height: number;
}

export interface PlacedProduct {
  id: string;
  productId: string;
  x: number;
  y: number;
  scale: number;
  rotation: number;
}

export interface WorkshopRoom {
  id: string;
  userId: string;
  name: string;
  backgroundUrl: string;
  placedProducts: PlacedProduct[];
  notes: string;
  createdAt: string;
  updatedAt: string;
}
