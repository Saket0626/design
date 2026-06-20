import { useCallback, useRef, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useData } from "../context/DataContext";
import { CATALOG, getProduct } from "../lib/products";
import { uid } from "../lib/utils";
import type { PlacedProduct, Product, WorkshopRoom } from "../types";

const ROOM_BACKGROUNDS = [
  "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1200&h=800&fit=crop",
  "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=1200&h=800&fit=crop",
  "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1200&h=800&fit=crop",
  "https://images.unsplash.com/photo-1556912173-46c336c7fd55?w=1200&h=800&fit=crop",
];

type ProductCategory = Product["category"];

export function WorkshopPage() {
  const { roomId } = useParams<{ roomId?: string }>();
  const { user } = useAuth();
  const { workshops, saveWorkshop } = useData();
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLDivElement>(null);

  const existing = roomId ? workshops.find((w) => w.id === roomId) : undefined;

  const [roomName, setRoomName] = useState(existing?.name ?? "My virtual room");
  const [backgroundUrl, setBackgroundUrl] = useState(
    existing?.backgroundUrl ?? ROOM_BACKGROUNDS[0]
  );
  const [placed, setPlaced] = useState<PlacedProduct[]>(existing?.placedProducts ?? []);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<ProductCategory | "all">("all");
  const [notes, setNotes] = useState(existing?.notes ?? "");
  const [dragging, setDragging] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const roomDbId = existing?.id ?? uid();

  const selected = placed.find((p) => p.id === selectedId);
  const selectedProduct = selected ? getProduct(selected.productId) : undefined;

  const filteredCatalog =
    filter === "all" ? CATALOG : CATALOG.filter((p) => p.category === filter);

  const totalEstimate = placed.reduce((sum, pp) => {
    const prod = getProduct(pp.productId);
    return sum + (prod?.price ?? 0);
  }, 0);

  const addProduct = (product: Product) => {
    const newPlaced: PlacedProduct = {
      id: uid(),
      productId: product.id,
      x: 50,
      y: 50,
      scale: 1,
      rotation: 0,
    };
    setPlaced((prev) => [...prev, newPlaced]);
    setSelectedId(newPlaced.id);
  };

  const updatePlaced = (id: string, patch: Partial<PlacedProduct>) => {
    setPlaced((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  };

  const removePlaced = (id: string) => {
    setPlaced((prev) => prev.filter((p) => p.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  const handlePointerDown = (e: React.PointerEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedId(id);
    setDragging(id);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragging || !canvasRef.current) return;
      const rect = canvasRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      updatePlaced(dragging, {
        x: Math.max(0, Math.min(95, x)),
        y: Math.max(0, Math.min(95, y)),
      });
    },
    [dragging]
  );

  const handlePointerUp = () => setDragging(null);

  if (!user) return <Navigate to="/login" replace />;

  const handleSave = async () => {
    const room: WorkshopRoom = {
      id: roomDbId,
      userId: user.id,
      name: roomName,
      backgroundUrl,
      placedProducts: placed,
      notes,
      createdAt: existing?.createdAt ?? new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await saveWorkshop(room);
    setSaved(true);
    if (!roomId) navigate(`/workshop/${roomDbId}`, { replace: true });
    setTimeout(() => setSaved(false), 2000);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") setBackgroundUrl(reader.result);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex min-h-[calc(100dvh-3.5rem)] flex-col lg:flex-row">
      <aside className="w-full shrink-0 border-b border-sand bg-white lg:w-72 lg:border-b-0 lg:border-r">
        <div className="p-4">
          <h1 className="font-display text-2xl font-semibold text-forest">Virtual Workshop</h1>
          <p className="mt-1 text-xs text-charcoal/60">
            Place real products on your room photo — test LED lights, furniture & decor before you buy.
          </p>
        </div>

        <div className="flex gap-1 overflow-x-auto px-4 pb-2">
          {(["all", "lighting", "furniture", "decor", "textiles", "plants"] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium capitalize ${
                filter === f ? "bg-forest text-cream" : "bg-sand/50 text-charcoal"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="max-h-48 overflow-y-auto px-4 pb-4 lg:max-h-[calc(100dvh-12rem)]">
          <div className="grid grid-cols-2 gap-2">
            {filteredCatalog.map((product) => (
              <button
                key={product.id}
                type="button"
                onClick={() => addProduct(product)}
                className="rounded-xl border border-sand p-2 text-left transition hover:border-sage hover:bg-cream"
              >
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="mx-auto h-14 w-full object-contain"
                />
                <p className="mt-1 truncate text-xs font-medium">{product.name}</p>
                <p className="text-xs text-charcoal/50">${product.price}</p>
              </button>
            ))}
          </div>
        </div>
      </aside>

      <div className="flex flex-1 flex-col">
        <div className="flex flex-wrap items-center gap-3 border-b border-sand bg-cream/80 px-4 py-3">
          <input
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
            className="rounded-lg border border-sand bg-white px-3 py-1.5 text-sm font-medium"
          />
          <div className="flex gap-2">
            {ROOM_BACKGROUNDS.map((url) => (
              <button
                key={url}
                type="button"
                onClick={() => setBackgroundUrl(url)}
                className={`h-10 w-14 overflow-hidden rounded-lg border-2 ${
                  backgroundUrl === url ? "border-terracotta" : "border-transparent"
                }`}
              >
                <img src={url} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
          <label className="cursor-pointer rounded-lg border border-sand bg-white px-3 py-1.5 text-xs font-medium hover:bg-sand/30">
            Upload your room
            <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
          </label>
          <button
            type="button"
            onClick={handleSave}
            className="ml-auto rounded-full bg-terracotta px-5 py-1.5 text-sm font-medium text-cream"
          >
            {saved ? "Saved!" : "Save room"}
          </button>
        </div>

        <div
          ref={canvasRef}
          className="relative flex-1 min-h-[50vh] cursor-crosshair overflow-hidden bg-charcoal/5"
          onClick={() => setSelectedId(null)}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
        >
          <img
            src={backgroundUrl}
            alt="Room"
            className="absolute inset-0 h-full w-full object-cover select-none pointer-events-none"
            draggable={false}
          />

          {placed.map((pp) => {
            const product = getProduct(pp.productId);
            if (!product) return null;
            const isSelected = pp.id === selectedId;
            const w = (product.width * pp.scale) / 8;
            const h = (product.height * pp.scale) / 8;

            return (
              <div
                key={pp.id}
                role="presentation"
                className={`absolute touch-none ${isSelected ? "z-20 ring-2 ring-terracotta ring-offset-2" : "z-10"}`}
                style={{
                  left: `${pp.x}%`,
                  top: `${pp.y}%`,
                  width: `${w}%`,
                  height: `${h}%`,
                  transform: `translate(-50%, -50%) rotate(${pp.rotation}deg)`,
                  cursor: dragging === pp.id ? "grabbing" : "grab",
                }}
                onPointerDown={(e) => handlePointerDown(e, pp.id)}
                onClick={(e) => e.stopPropagation()}
              >
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="h-full w-full object-contain drop-shadow-lg pointer-events-none"
                  draggable={false}
                />
              </div>
            );
          })}
        </div>

        <div className="border-t border-sand bg-white p-4 lg:flex lg:gap-6">
          {selected && selectedProduct ? (
            <div className="flex-1">
              <h3 className="font-medium text-forest">{selectedProduct.name}</h3>
              <p className="text-sm text-charcoal/60">
                {selectedProduct.brand} · ${selectedProduct.price}
              </p>
              <div className="mt-3 flex flex-wrap gap-4">
                <label className="flex items-center gap-2 text-sm">
                  Scale
                  <input
                    type="range"
                    min="0.3"
                    max="2.5"
                    step="0.05"
                    value={selected.scale}
                    onChange={(e) =>
                      updatePlaced(selected.id, { scale: parseFloat(e.target.value) })
                    }
                  />
                </label>
                <label className="flex items-center gap-2 text-sm">
                  Rotate
                  <input
                    type="range"
                    min="-180"
                    max="180"
                    value={selected.rotation}
                    onChange={(e) =>
                      updatePlaced(selected.id, { rotation: parseInt(e.target.value, 10) })
                    }
                  />
                </label>
                <button
                  type="button"
                  onClick={() => removePlaced(selected.id)}
                  className="text-sm text-terracotta"
                >
                  Remove
                </button>
              </div>
            </div>
          ) : (
            <p className="flex-1 text-sm text-charcoal/60">
              Tap a product from the catalog, then drag it on your room. Select to resize or rotate.
            </p>
          )}
          <div className="mt-4 lg:mt-0 lg:text-right">
            <p className="text-xs text-charcoal/50">Virtual cart estimate</p>
            <p className="font-display text-2xl text-terracotta">${totalEstimate.toFixed(2)}</p>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notes for this room design..."
              rows={2}
              className="mt-2 w-full rounded-lg border border-sand px-3 py-2 text-sm lg:w-64"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
