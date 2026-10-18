/**
 * Product photography, addressed by URL so it lives in the product record
 * rather than in the repository.
 *
 * Each entry is an Unsplash CDN URL with the crop applied by their image
 * pipeline — square, WebP, 1100px — so no binaries are committed and no
 * build step processes images. Staff uploads (Vercel Blob) overwrite these
 * the moment a real photo is added from the console.
 *
 * Every photo was inspected before being listed; anything showing another
 * brand's logo was rejected. Sources are credited in docs/PHOTO-CREDITS.md.
 */

const CROP = "w=1100&h=1100&fit=crop&crop=entropy&fm=webp&q=82";

const unsplash = (id: string) => `https://images.unsplash.com/${id}?${CROP}`;

export const PRODUCT_PHOTOS: Record<string, string[]> = {
  "aria-body-wave-hd-lace": [unsplash("photo-1522337360788-8b13dee7a37e")],
  "amani-block-heel-sandal": [
    unsplash("photo-1535043934128-cf0b28d52f95"),
    unsplash("photo-1543163521-1bf539c55dd2"),
  ],
  "nova-pointed-stiletto": [
    unsplash("photo-1596703263926-eb0762ee17e4"),
    unsplash("photo-1573100925118-870b8efc799d"),
  ],
  "mara-kitten-heel-mule": [
    unsplash("photo-1518049362265-d5b2a6467637"),
    unsplash("photo-1515347619252-60a4bf4fff4f"),
  ],
  "sauti-structured-tote": [unsplash("photo-1584917865442-de89df76afd3")],
  "dala-shoulder-bag": [unsplash("photo-1590874103328-eac38a683ce7")],
  "noir-evening-clutch": [unsplash("photo-1566150905458-1bf1fc113f0d")],
  "safari-mini-crossbody": [unsplash("photo-1594223274512-ad4803739b7c")],
  "kasi-mesh-runner": [unsplash("photo-1560769629-975ec94e6a86")],
  "imani-leather-loafer": [unsplash("photo-1533867617858-e7b97e060509")],
};

export function photosFor(slug: string): string[] {
  return PRODUCT_PHOTOS[slug] ?? [];
}
