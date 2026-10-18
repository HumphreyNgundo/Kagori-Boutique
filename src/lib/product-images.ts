import { MEDIA_MANIFEST } from "@/lib/media-manifest";
import type { Product } from "@/lib/types";

/**
 * Photos committed to public/products/<slug>/ are defaults that ship with the
 * demo; anything staff upload from the console takes priority. Resolving at
 * read time means new defaults appear without re-seeding the store, so live
 * orders survive a catalogue photo drop.
 */
export function imagesOf(product: Pick<Product, "slug" | "images">): string[] {
  return product.images.length ? product.images : MEDIA_MANIFEST[product.slug] ?? [];
}

/** True when the product is showing repo defaults rather than uploads. */
export function usingDefaultImages(product: Pick<Product, "slug" | "images">): boolean {
  return product.images.length === 0 && (MEDIA_MANIFEST[product.slug]?.length ?? 0) > 0;
}
