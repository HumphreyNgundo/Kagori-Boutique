import "server-only";
import { read } from "@/lib/db";
import { imagesOf } from "@/lib/product-images";
import type { Category, Product, Variant } from "@/lib/types";

export interface ProductCard {
  product: Product;
  category: Category;
  variants: Variant[];
  fromPrice: number;
  available: number;
  optionAxes: Record<string, string[]>;
}

export function availableOf(v: Variant): number {
  return Math.max(0, v.stock - v.reserved);
}

function toCard(product: Product, category: Category, variants: Variant[]): ProductCard {
  const live = variants.filter((v) => v.active);
  const withPhotos = { ...product, images: imagesOf(product) };
  const axes: Record<string, string[]> = {};
  for (const v of live) {
    for (const [key, value] of Object.entries(v.options)) {
      axes[key] ??= [];
      if (!axes[key].includes(value)) axes[key].push(value);
    }
  }
  return {
    product: withPhotos,
    category,
    variants: live,
    fromPrice: live.length ? Math.min(...live.map((v) => v.price)) : withPhotos.basePrice,
    available: live.reduce((sum, v) => sum + availableOf(v), 0),
    optionAxes: axes,
  };
}

export async function listCategories(): Promise<Category[]> {
  const db = await read();
  return db.categories.filter((c) => c.active).sort((a, b) => a.position - b.position);
}

export async function getCategory(slug: string): Promise<Category | null> {
  const db = await read();
  return db.categories.find((c) => c.slug === slug && c.active) ?? null;
}

export interface CatalogQuery {
  categorySlug?: string;
  q?: string;
  sort?: "featured" | "price-asc" | "price-desc" | "newest";
  inStockOnly?: boolean;
  maxPrice?: number;
  option?: string; // "Size:38" — one facet is plenty for a boutique
}

export async function listProducts(query: CatalogQuery = {}): Promise<ProductCard[]> {
  const db = await read();
  const byCategory = new Map(db.categories.map((c) => [c.id, c]));
  const variantsOf = new Map<string, Variant[]>();
  for (const v of db.variants) {
    const list = variantsOf.get(v.productId) ?? [];
    list.push(v);
    variantsOf.set(v.productId, list);
  }

  let cards = db.products
    .filter((p) => p.active)
    .map((p) => toCard(p, byCategory.get(p.categoryId)!, variantsOf.get(p.id) ?? []))
    .filter((c) => c.category?.active);

  if (query.categorySlug) cards = cards.filter((c) => c.category.slug === query.categorySlug);

  if (query.q) {
    const needle = query.q.toLowerCase().trim();
    cards = cards.filter((c) =>
      [c.product.name, c.product.summary, c.category.name, ...c.product.tags]
        .join(" ")
        .toLowerCase()
        .includes(needle),
    );
  }

  if (query.inStockOnly) cards = cards.filter((c) => c.available > 0);
  if (query.maxPrice) cards = cards.filter((c) => c.fromPrice <= query.maxPrice!);

  if (query.option) {
    const [axis, value] = query.option.split(":");
    cards = cards.filter((c) => c.variants.some((v) => v.options[axis] === value && availableOf(v) > 0));
  }

  switch (query.sort) {
    case "price-asc":
      cards.sort((a, b) => a.fromPrice - b.fromPrice);
      break;
    case "price-desc":
      cards.sort((a, b) => b.fromPrice - a.fromPrice);
      break;
    case "newest":
      cards.sort((a, b) => b.product.createdAt.localeCompare(a.product.createdAt));
      break;
    default:
      cards.sort((a, b) => Number(b.product.featured) - Number(a.product.featured) || a.product.name.localeCompare(b.product.name));
  }

  return cards;
}

export async function getProduct(slug: string): Promise<ProductCard | null> {
  const db = await read();
  const product = db.products.find((p) => p.slug === slug && p.active);
  if (!product) return null;
  const category = db.categories.find((c) => c.id === product.categoryId);
  if (!category) return null;
  return toCard(product, category, db.variants.filter((v) => v.productId === product.id));
}

export async function relatedProducts(card: ProductCard, limit = 4): Promise<ProductCard[]> {
  const siblings = await listProducts({ categorySlug: card.category.slug });
  return siblings.filter((c) => c.product.id !== card.product.id).slice(0, limit);
}

/** Facet values across a result set, for the filter rail. */
export function facetsOf(cards: ProductCard[]): Record<string, string[]> {
  const out: Record<string, Set<string>> = {};
  for (const card of cards) {
    for (const [axis, values] of Object.entries(card.optionAxes)) {
      out[axis] ??= new Set();
      values.forEach((v) => out[axis].add(v));
    }
  }
  return Object.fromEntries(
    Object.entries(out)
      .filter(([, set]) => set.size > 1)
      .map(([axis, set]) => [
        axis,
        [...set].sort((a, b) => (Number(a) && Number(b) ? Number(a) - Number(b) : a.localeCompare(b))),
      ]),
  );
}

export async function getSettings() {
  return (await read()).settings;
}

export async function listZones() {
  const db = await read();
  return db.zones.filter((z) => z.active);
}
