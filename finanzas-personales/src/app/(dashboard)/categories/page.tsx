"use client";

import { useState, useEffect } from "react";
import { getCategories, createCategory, deleteCategory } from "@/app/actions/categories";
import { Card, CardContent } from "@/components/ui/card";
import { PageShell } from "@/components/layout/page-shell";
import { Plus, Trash2, Tags } from "lucide-react";

type Category = {
  id: string;
  name: string;
  icon: string;
  color: string;
  is_default: boolean;
};

const EMOJI_OPTIONS = [
  "🍔", "🚗", "🎮", "💊", "💡", "👕", "🏠", "📚", "💰", "📦",
  "🛒", "☕", "🎬", "✈️", "🏋️", "🐕", "🎵", "📱", "💻", "🎁",
];

const COLOR_OPTIONS = [
  "#111111", "#262626", "#3D3D3D", "#525252", "#666666",
  "#7A7A7A", "#8F8F8F", "#A3A3A3", "#1A1A1A", "#2E2E2E",
  "#454545", "#595959", "#6E6E6E", "#828282", "#969696",
];

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("📦");
  const [color, setColor] = useState("#262626");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getCategories().then(setCategories);
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    try {
      await createCategory({ name: name.trim(), icon, color, is_default: false });
      const updated = await getCategories();
      setCategories(updated);
      setName("");
      setIcon("📦");
      setColor("#262626");
      setShowForm(false);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteCategory(id);
      const updated = await getCategories();
      setCategories(updated);
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <PageShell>
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
          Categorías
        </h1>
        <button
          onClick={() => setShowForm(!showForm)}
          data-pressable
          className="inline-flex min-h-11 items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 text-xs font-semibold text-primary-foreground shadow-soft transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
        >
          <Plus className="h-3.5 w-3.5" />
          Nueva
        </button>
      </div>

      {showForm && (
        <Card className="animate-scale-in shadow-soft ring-border/60">
          <CardContent className="pt-5">
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Nombre</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej: Supermercado"
                  className="flex h-12 w-full rounded-xl border border-input bg-background px-3.5 text-base outline-none transition-colors placeholder:text-muted-foreground/60 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40 md:h-11 md:text-sm"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Ícono</label>
                <div className="grid grid-cols-5 gap-2 sm:grid-cols-8">
                  {EMOJI_OPTIONS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setIcon(emoji)}
                      className={`inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl border text-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 ${
                        icon === emoji
                          ? "border-primary bg-primary/10"
                          : "border-border hover:bg-muted"
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Color</label>
                <div className="flex flex-wrap gap-2">
                  {COLOR_OPTIONS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      aria-label={`Color ${c}`}
                      className={`h-10 w-10 rounded-full border-2 transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 sm:h-8 sm:w-8 ${
                        color === c ? "scale-110 border-foreground" : "border-transparent"
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="submit"
                  disabled={loading || !name.trim()}
                  data-pressable
                  className="flex-1 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-soft hover:bg-primary/90 disabled:opacity-50"
                >
                  {loading ? "Creando..." : "Crear"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="rounded-xl border border-border px-4 py-2.5 text-sm font-medium hover:bg-muted"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {categories.length === 0 ? (
        <Card className="shadow-soft">
          <CardContent className="flex flex-col items-center py-14 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted">
              <Tags className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="mt-3 text-sm font-medium">Sin categorías</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Creá una para clasificar tus movimientos
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="overflow-hidden rounded-2xl bg-card shadow-soft ring-1 ring-border/60">
          {categories.map((cat, i) => (
            <div
              key={cat.id}
              className={`flex items-center justify-between gap-3 px-3.5 py-3.5 ${
                i > 0 ? "border-t border-border/50" : ""
              }`}
            >
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted text-lg">
                  <span aria-hidden>{cat.icon}</span>
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{cat.name}</p>
                  {cat.is_default && (
                    <p className="text-xs text-muted-foreground">Predeterminada</p>
                  )}
                </div>
              </div>
              {!cat.is_default && (
                <button
                  onClick={() => handleDelete(cat.id)}
                  aria-label={`Eliminar ${cat.name}`}
                  className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </PageShell>
  );
}
