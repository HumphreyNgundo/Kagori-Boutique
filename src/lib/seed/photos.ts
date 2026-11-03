/**
 * Product and category photography, addressed by URL so it lives in the
 * product record rather than in the repository.
 *
 * Each entry is an Unsplash CDN URL with the crop applied by their image
 * pipeline, so no binaries are committed and nothing is processed at build
 * time. Staff uploads (Vercel Blob) overwrite these the moment a real photo is
 * added from the console. Sources are listed in docs/PHOTO-CREDITS.md.
 */

const SQUARE = "w=1100&h=1100&fit=crop&crop=entropy&fm=webp&q=82";
const WIDE = "w=1400&h=1000&fit=crop&crop=entropy&fm=webp&q=82";

const square = (id: string) => `https://images.unsplash.com/${id}?${SQUARE}`;

/** Pexels applies its own crop; the id is the number in the photo's URL. */
const pexels = (id: number) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=1100&h=1100&fit=crop`;
const wide = (id: string) => `https://images.unsplash.com/${id}?${WIDE}`;

export const PRODUCT_PHOTOS: Record<string, string[]> = {
  /* Wigs */
  "aria-body-wave-hd-lace": [square("photo-1522337360788-8b13dee7a37e")],
  "nia-blunt-cut-bob": [pexels(17320165)],
  "zawadi-kinky-curly-u-part": [square("photo-1519699047748-de8e457a634e")],
  "lulu-pixie-cut": [square("photo-1492106087820-71f1a00d2b11")],

  /* Wig accessories */
  "stocking-wig-cap-5pack": [square("photo-1522337094846-8a818192de1f")],
  "hold-me-lace-glue": [square("photo-1620331311520-246422fd82f9")],
  "collapsible-wig-stand": [square("photo-1527799820374-dcf8d9d4a388")],

  /* Lashes */
  "siri-3d-mink-lashes": [square("photo-1487412947147-5cebf100ffc2")],
  "magnetic-lash-set": [square("photo-1596462502278-27bfdc403348")],
  "diy-cluster-lash-kit": [square("photo-1512496015851-a90fb38ba796")],

  /* Lash accessories */
  "clear-lash-adhesive": [square("photo-1571781926291-c477ebfd024b")],
  "precision-lash-applicator": [square("photo-1516975080664-ed2fc6a32937")],
  "lash-cleanser-foam": [square("photo-1600857544200-b2f666a9a2ec")],





  /* Handbags */
  "sauti-structured-tote": [
    square("photo-1584917865442-de89df76afd3"),
    square("photo-1591561954557-26941169b49e"),
  ],
  "dala-shoulder-bag": [square("photo-1590874103328-eac38a683ce7")],
  "noir-evening-clutch": [square("photo-1566150905458-1bf1fc113f0d")],
  "safari-mini-crossbody": [square("photo-1594223274512-ad4803739b7c")],
};

/**
 * Shelf imagery for the storefront. Categories are fixed site furniture rather
 * than editable records, so these stay in code.
 */
export const CATEGORY_PHOTOS: Record<string, string> = {
  wigs: square("photo-1554519515-242161756769"),
  "wig-accessories": square("photo-1527799820374-dcf8d9d4a388"),
  lashes: square("photo-1487412947147-5cebf100ffc2"),
  "lash-accessories": square("photo-1596462502278-27bfdc403348"),
  handbags: square("photo-1591561954557-26941169b49e"),
};

/** Landing page lead image. */
export const HERO_PHOTO = wide("photo-1534452203293-494d7ddbf7e0");

export function photosFor(slug: string): string[] {
  return PRODUCT_PHOTOS[slug] ?? [];
}

export function categoryPhoto(slug: string): string | null {
  return CATEGORY_PHOTOS[slug] ?? null;
}
