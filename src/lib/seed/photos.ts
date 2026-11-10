/**
 * Product and category photography, addressed by URL so it lives in the
 * product record rather than in the repository.
 *
 * Each entry is a Pexels or Unsplash CDN URL with the crop applied by their
 * image pipeline, so no binaries are committed and nothing is processed at
 * build time. Staff uploads (Vercel Blob) overwrite these the moment a real
 * photo is added from the console. Sources are listed in
 * docs/PHOTO-CREDITS.md.
 */

const SQUARE = "w=1100&h=1100&fit=crop&crop=entropy&fm=webp&q=82";

const square = (id: string) => `https://images.unsplash.com/${id}?${SQUARE}`;

/** Pexels applies its own crop; the id is the number in the photo's URL. */
const pexels = (id: number) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=1100&h=1100&fit=crop`;

export const PRODUCT_PHOTOS: Record<string, string[]> = {
  /* Frontal wigs */
  "aria-body-wave-hd-frontal": [square("photo-1522337360788-8b13dee7a37e")],
  "tiana-bone-straight-frontal": [pexels(18348405)],

  /* Closure wigs */
  "nia-blunt-cut-closure-bob": [pexels(17320163)],
  "zuri-deep-wave-closure": [pexels(4724468)],

  /* Headband wigs */
  "amara-kinky-curly-headband": [square("photo-1519699047748-de8e457a634e")],
  "lulu-water-wave-headband": [pexels(14730872)],

  /* Extensions */
  "bello-body-wave-bundles": [pexels(14730868)],
  "clip-in-straight-extensions": [pexels(14730876)],
  "drawstring-ponytail-extension": [pexels(14730877)],
  "kinky-curly-bundle-deal": [pexels(15868320)],

  /* Haircare */
  "wig-revive-shampoo-conditioner": [pexels(7428102)],
  "argan-hair-scalp-serum": [pexels(28994388)],
  "leave-in-detangling-spray": [pexels(7428103)],
  "edge-control-gel": [pexels(7428098)],

  /* Hair accessories */
  "stocking-wig-caps-5pack": [pexels(14730864)],
  "hold-me-lace-bond-kit": [pexels(7428099)],
  "collapsible-wig-stand": [pexels(6923259)],
  "satin-bonnet-scrunchie-set": [pexels(7897135)],
  "edge-brush-band-set": [square("photo-1527799820374-dcf8d9d4a388")],
};

/**
 * Shelf imagery for the storefront. Categories are fixed site furniture rather
 * than editable records, so these stay in code.
 */
export const CATEGORY_PHOTOS: Record<string, string> = {
  wigs: pexels(13439624),
  extensions: pexels(14730867),
  haircare: pexels(8467970),
  "hair-accessories": pexels(7897135),
};

/**
 * The three ways we cut a wig. These are tags on the product rather than
 * categories of their own — the shelves stay four, the way the tabs read.
 */
export const WIG_TYPE_PHOTOS: Record<string, string> = {
  "headband-wigs": pexels(17533400),
  "closure-wigs": pexels(17320165),
  "frontal-wigs": pexels(36288157),
};

/** Landing page lead image — the shop's own packaging. */
export const HERO_PHOTO = "/brand/hero-bags.webp";

export function photosFor(slug: string): string[] {
  return PRODUCT_PHOTOS[slug] ?? [];
}

export function categoryPhoto(slug: string): string | null {
  return CATEGORY_PHOTOS[slug] ?? null;
}
