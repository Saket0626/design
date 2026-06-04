import { useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useData } from "../context/DataContext";
import { storage } from "../lib/storage";

const ROOM_PRESETS = [
  "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1556912173-46c336c7fd55?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800&h=600&fit=crop",
];

export function NewCategoryPage() {
  const { user } = useAuth();
  const { addCategory } = useData();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [coverImage, setCoverImage] = useState(ROOM_PRESETS[0]);

  if (!user) return <Navigate to="/login" replace />;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cat = addCategory({ name, description, coverImage });
    window.location.href = `/category/${cat.slug}`;
  };

  return (
    <div className="mx-auto max-w-lg px-4 py-8 pb-24">
      <Link to="/profile" className="text-sm text-terracotta">
        ← Profile
      </Link>
      <h1 className="mt-4 font-display text-3xl font-semibold text-forest">New style category</h1>
      <p className="mt-2 text-charcoal/70">
        e.g. Modern Rustic, Coastal Minimal — a portfolio section for one design direction.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <label className="block">
          <span className="text-sm font-medium">Category name</span>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full rounded-xl border border-sand bg-white px-4 py-2.5"
            placeholder="Modern Rustic"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium">Description</span>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="mt-1 w-full rounded-xl border border-sand bg-white px-4 py-2.5"
          />
        </label>
        <div>
          <span className="text-sm font-medium">Cover image</span>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {ROOM_PRESETS.map((url) => (
              <button
                key={url}
                type="button"
                onClick={() => setCoverImage(url)}
                className={`overflow-hidden rounded-xl border-2 ${
                  coverImage === url ? "border-terracotta" : "border-transparent"
                }`}
              >
                <img src={url} alt="" className="aspect-video w-full object-cover" />
              </button>
            ))}
          </div>
          <input
            value={coverImage}
            onChange={(e) => setCoverImage(e.target.value)}
            className="mt-2 w-full rounded-xl border border-sand bg-white px-4 py-2 text-sm"
            placeholder="Or paste image URL"
          />
        </div>
        <button type="submit" className="w-full rounded-xl bg-forest py-3 font-medium text-cream">
          Create category
        </button>
      </form>
    </div>
  );
}

export function CategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const { categories, getCategoryProjects, addProject, addPost } = useData();
  const [showAdd, setShowAdd] = useState(false);
  const [projForm, setProjForm] = useState({
    title: "",
    description: "",
    roomType: "Living Room",
    image: ROOM_PRESETS[0],
  });

  const category = categories.find((c) => c.slug === slug);
  if (!category) {
    return (
      <div className="px-4 py-16 text-center">
        <p>Category not found.</p>
        <Link to="/explore" className="text-terracotta">
          Explore designers
        </Link>
      </div>
    );
  }

  const owner = storage.getUsers().find((u) => u.id === category.userId);
  const projects = getCategoryProjects(category.id);
  const isOwner = user?.id === category.userId;

  const handleAddProject = (e: React.FormEvent) => {
    e.preventDefault();
    const proj = addProject({
      categoryId: category.id,
      title: projForm.title,
      description: projForm.description,
      images: [projForm.image],
      roomType: projForm.roomType,
      tags: [],
    });
    addPost({
      title: proj.title,
      caption: proj.description,
      mediaUrl: proj.images[0],
      mediaType: "image",
      projectId: proj.id,
      categoryId: category.id,
    });
    setShowAdd(false);
    setProjForm({ title: "", description: "", roomType: "Living Room", image: ROOM_PRESETS[0] });
  };

  return (
    <div className="pb-24">
      <div className="relative aspect-[21/9] max-h-80 overflow-hidden">
        <img src={category.coverImage} alt="" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/70 to-transparent" />
        <div className="absolute bottom-6 left-4 right-4 text-cream sm:left-8">
          <h1 className="font-display text-4xl font-semibold">{category.name}</h1>
          {owner && (
            <Link to={`/designer/${owner.username}`} className="mt-1 inline-block text-cream/80">
              by @{owner.username}
            </Link>
          )}
          <p className="mt-2 max-w-xl text-sm text-cream/90">{category.description}</p>
        </div>
      </div>

      <div className="px-4 py-8">
        {isOwner && (
          <button
            type="button"
            onClick={() => setShowAdd(!showAdd)}
            className="mb-6 rounded-full bg-terracotta px-5 py-2 text-sm font-medium text-cream"
          >
            + Add project to this category
          </button>
        )}

        {showAdd && (
          <form
            onSubmit={handleAddProject}
            className="mb-8 rounded-2xl border border-sand bg-white p-6 space-y-4"
          >
            <input
              required
              placeholder="Project title"
              value={projForm.title}
              onChange={(e) => setProjForm({ ...projForm, title: e.target.value })}
              className="w-full rounded-xl border border-sand px-4 py-2"
            />
            <textarea
              placeholder="Description"
              value={projForm.description}
              onChange={(e) => setProjForm({ ...projForm, description: e.target.value })}
              className="w-full rounded-xl border border-sand px-4 py-2"
            />
            <select
              value={projForm.roomType}
              onChange={(e) => setProjForm({ ...projForm, roomType: e.target.value })}
              className="w-full rounded-xl border border-sand px-4 py-2"
            >
              {["Living Room", "Bedroom", "Kitchen", "Bathroom", "Office", "Dining"].map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>
            <button type="submit" className="rounded-xl bg-forest px-6 py-2 text-cream">
              Publish to feed & portfolio
            </button>
          </form>
        )}

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p) => (
            <article key={p.id} className="overflow-hidden rounded-2xl border border-sand bg-white">
              <img src={p.images[0]} alt={p.title} className="aspect-[3/4] w-full object-cover" />
              <div className="p-4">
                <span className="text-xs font-medium text-sage">{p.roomType}</span>
                <h3 className="font-display text-lg font-semibold">{p.title}</h3>
                <p className="mt-1 text-sm text-charcoal/60">{p.description}</p>
              </div>
            </article>
          ))}
        </div>
        {projects.length === 0 && (
          <p className="text-center text-charcoal/60 py-12">No projects in this category yet.</p>
        )}
      </div>
    </div>
  );
}
