import type { FeedPost, PortfolioProject, StyleCategory, User } from "../types";
import { storage, uid } from "./storage";

const DEMO_USER: User = {
  id: "demo-maya",
  username: "mayachen",
  displayName: "Maya Chen",
  email: "maya@example.com",
  password: "demo123",
  avatarUrl:
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop",
  bio: "Award-winning interior designer blending modern warmth with sustainable materials. 12 years transforming residential & boutique commercial spaces.",
  specialties: [
    "Space Planning",
    "Lighting Design",
    "Sustainable Materials",
    "Kitchen & Bath",
  ],
  createdAt: new Date().toISOString(),
};

export function seedDemoData(): void {
  if (storage.isSeeded()) return;

  const catModern: StyleCategory = {
    id: uid(),
    userId: DEMO_USER.id,
    name: "Modern Rustic",
    slug: "modern-rustic",
    description:
      "Clean lines meet reclaimed wood, matte black fixtures, and earthy textiles.",
    coverImage:
      "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800&h=600&fit=crop",
    createdAt: new Date().toISOString(),
  };

  const catCoastal: StyleCategory = {
    id: uid(),
    userId: DEMO_USER.id,
    name: "Coastal Minimal",
    slug: "coastal-minimal",
    description: "Airy palettes, natural light, and relaxed luxury by the sea.",
    coverImage:
      "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=800&h=600&fit=crop",
    createdAt: new Date().toISOString(),
  };

  const projects: PortfolioProject[] = [
    {
      id: uid(),
      categoryId: catModern.id,
      userId: DEMO_USER.id,
      title: "Willow Creek Living Room",
      description: "Reclaimed oak beams, linen sofa, brass pendants.",
      images: [
        "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=900&h=1200&fit=crop",
      ],
      roomType: "Living Room",
      tags: ["rustic", "warm", "open-plan"],
      createdAt: new Date().toISOString(),
    },
    {
      id: uid(),
      categoryId: catModern.id,
      userId: DEMO_USER.id,
      title: "Timberline Kitchen",
      description: "Matte black hardware on white oak cabinetry.",
      images: [
        "https://images.unsplash.com/photo-1556912173-46c336c7fd55?w=900&h=1200&fit=crop",
      ],
      roomType: "Kitchen",
      tags: ["kitchen", "modern-rustic"],
      createdAt: new Date().toISOString(),
    },
    {
      id: uid(),
      categoryId: catCoastal.id,
      userId: DEMO_USER.id,
      title: "Malibu Primary Suite",
      description: "Whitewashed walls, jute rug, ocean-view staging.",
      images: [
        "https://images.unsplash.com/photo-1616133522420-3dadae4b4ace?w=900&h=1200&fit=crop",
      ],
      roomType: "Bedroom",
      tags: ["coastal", "minimal"],
      createdAt: new Date().toISOString(),
    },
  ];

  const posts: FeedPost[] = projects.map((p, i) => ({
    id: uid(),
    userId: DEMO_USER.id,
    projectId: p.id,
    categoryId: p.categoryId,
    title: p.title,
    caption: p.description,
    mediaUrl: p.images[0],
    mediaType: "image" as const,
    likes: 1200 + i * 340,
    likedBy: [],
    createdAt: new Date(Date.now() - i * 86400000).toISOString(),
  }));

  const extraPosts: FeedPost[] = [
    {
      id: uid(),
      userId: "demo-alex",
      title: "LED Mood Lighting Test",
      caption: "Virtual workshop preview — warm LED strips before install.",
      mediaUrl:
        "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=900&h=1200&fit=crop",
      mediaType: "image",
      likes: 892,
      likedBy: [],
      createdAt: new Date().toISOString(),
    },
  ];

  const alex: User = {
    id: "demo-alex",
    username: "alexrivera",
    displayName: "Alex Rivera",
    email: "alex@example.com",
    password: "demo123",
    avatarUrl:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop",
    bio: "Lighting specialist & virtual staging expert. Try before you buy.",
    specialties: ["Lighting Design", "Staging", "Smart Home Integration"],
    createdAt: new Date().toISOString(),
  };

  storage.saveUsers([DEMO_USER, alex]);
  storage.saveCategories([catModern, catCoastal]);
  storage.saveProjects(projects);
  storage.savePosts([...posts, ...extraPosts]);
  storage.markSeeded();
}
