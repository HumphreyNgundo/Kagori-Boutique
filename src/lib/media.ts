import "server-only";
import type { Product } from "@/lib/types";

/**
 * Single seam for product imagery.
 *
 *  1. Photos committed to public/products/<slug>/ (see that folder's README)
 *     are picked up by `npm run media:manifest` and land in product.images.
 *  2. Photos uploaded by staff from the admin console go to Vercel Blob and
 *     are appended to the same array.
 *  3. Anything with no image renders generated studio art.
 *
 * Moving to Cloudinary / S3 / MinIO later means changing `uploadProductImage`
 * here and nothing else.
 */

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/avif"];

export function heroImage(product: Pick<Product, "images">): string | null {
  return product.images[0] ?? null;
}

export function mediaConfigured(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

export async function uploadProductImage(
  slug: string,
  file: File,
): Promise<{ ok: true; url: string } | { ok: false; error: string }> {
  if (!mediaConfigured()) {
    return { ok: false, error: "Image storage isn't configured — add a Vercel Blob store to this project." };
  }
  if (!ALLOWED.includes(file.type)) {
    return { ok: false, error: "Use a JPG, PNG, WebP or AVIF file." };
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return { ok: false, error: "That image is over 5MB — compress it first." };
  }

  const { put } = await import("@vercel/blob");
  const extension = file.type.split("/")[1].replace("jpeg", "jpg");
  const blob = await put(`products/${slug}/${Date.now()}.${extension}`, file, {
    access: "public",
    contentType: file.type,
    addRandomSuffix: true,
    cacheControlMaxAge: 60 * 60 * 24 * 365,
  });
  return { ok: true, url: blob.url };
}
