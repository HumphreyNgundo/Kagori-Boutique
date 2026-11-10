import type { Category, Product, Variant } from "@/lib/types";
import { photosFor } from "@/lib/seed/photos";

/* Prices are minor units: KES 6,500 -> 650000 */
const K = (shillings: number) => shillings * 100;

/**
 * Four shelves, in the order the tabs read: All · Wigs · Extensions ·
 * Haircare · Hair accessories. Wigs are cut three ways — headband, closure
 * and frontal — which are tags on the product rather than shelves of their
 * own, so the top-level navigation stays short.
 */
export const CATEGORIES: Category[] = [
  { id: "cat_wigs", slug: "wigs", name: "Wigs", tagline: "Headband, closure & frontal units", family: "WIG", position: 1, active: true },
  { id: "cat_extensions", slug: "extensions", name: "Extensions", tagline: "Bundles, clip-ins & ponytails", family: "EXTENSION", position: 2, active: true },
  { id: "cat_haircare", slug: "haircare", name: "Haircare", tagline: "Wash, oil & keep every unit soft", family: "HAIRCARE", position: 3, active: true },
  { id: "cat_hair_acc", slug: "hair-accessories", name: "Hair Accessories", tagline: "Caps, bonnets, stands & bond", family: "HAIR_ACCESSORY", position: 4, active: true },
];

/** The wig types, in the order they are shown. Each is a product tag. */
export const WIG_TYPES: { tag: string; name: string; blurb: string }[] = [
  { tag: "headband-wigs", name: "Headband wigs", blurb: "No glue, no lace — slip it on and go." },
  { tag: "closure-wigs", name: "Closure wigs", blurb: "4x4 and 5x5 closures with a natural parting." },
  { tag: "frontal-wigs", name: "Frontal wigs", blurb: "13x4 and 13x6 HD lace that melts." },
];

interface Spec {
  id: string;
  categoryId: string;
  slug: string;
  name: string;
  summary: string;
  description: string;
  tags: string[];
  featured?: boolean;
  compareAt?: number;
  /** [options, price, stock] */
  variants: [Record<string, string>, number, number][];
}

const SPECS: Spec[] = [
  /* ---------------------------------------------------- FRONTAL WIGS */
  {
    id: "prd_bodywave", categoryId: "cat_wigs", slug: "aria-body-wave-hd-frontal",
    name: "Aria Body Wave HD Frontal Wig",
    summary: "13x4 HD lace frontal, 180% density, bleached knots.",
    description:
      "Our best-selling unit. 100% human hair on a melt-free HD lace frontal, pre-plucked with bleached knots so it sits flat from day one. Can be dyed, straightened and reinstalled — with care it holds up for 12+ months.",
    tags: ["frontal-wigs", "human hair", "hd lace", "bestseller"], featured: true, compareAt: K(18500),
    variants: [
      [{ Length: '16"', Density: "180%", Colour: "Natural Black" }, K(14500), 6],
      [{ Length: '18"', Density: "180%", Colour: "Natural Black" }, K(16200), 5],
      [{ Length: '20"', Density: "180%", Colour: "Natural Black" }, K(17900), 3],
      [{ Length: '18"', Density: "180%", Colour: "Honey Blonde" }, K(18400), 2],
    ],
  },
  {
    id: "prd_straight", categoryId: "cat_wigs", slug: "tiana-bone-straight-frontal",
    name: "Tiana Bone Straight Frontal Wig",
    summary: "13x6 HD lace, silk-pressed bone straight finish.",
    description:
      "A 13x6 frontal with a deep parting space, pressed bone straight and ready to wear out of the box. Holds the press through Nairobi humidity and reverts to its own wave after a wash.",
    tags: ["frontal-wigs", "human hair", "hd lace"], featured: true,
    variants: [
      [{ Length: '18"', Density: "180%", Colour: "Natural Black" }, K(17500), 4],
      [{ Length: '22"', Density: "200%", Colour: "Natural Black" }, K(21500), 3],
      [{ Length: '22"', Density: "200%", Colour: "Dark Brown" }, K(22400), 2],
    ],
  },

  /* ---------------------------------------------------- CLOSURE WIGS */
  {
    id: "prd_bob", categoryId: "cat_wigs", slug: "nia-blunt-cut-closure-bob",
    name: "Nia Blunt Cut Closure Bob",
    summary: "Glueless 4x4 closure bob — office-ready in five minutes.",
    description:
      "A wear-and-go glueless bob on an adjustable band with built-in combs. Straight blunt cut that frames the jaw, light enough for daily wear in Nairobi heat.",
    tags: ["closure-wigs", "glueless", "beginner friendly"], featured: true,
    variants: [
      [{ Length: '10"', Density: "150%", Colour: "Natural Black" }, K(8500), 8],
      [{ Length: '12"', Density: "150%", Colour: "Natural Black" }, K(9400), 7],
      [{ Length: '12"', Density: "150%", Colour: "Burgundy" }, K(9900), 3],
    ],
  },
  {
    id: "prd_deepwave", categoryId: "cat_wigs", slug: "zuri-deep-wave-closure",
    name: "Zuri Deep Wave 5x5 Closure Wig",
    summary: "5x5 HD closure with a defined deep wave.",
    description:
      "A full-bodied deep wave on a 5x5 HD closure — enough parting space to switch sides, with none of the frontal upkeep. Curls spring back after a wash with a sulphate-free cleanser.",
    tags: ["closure-wigs", "human hair"],
    variants: [
      [{ Length: '16"', Density: "180%", Colour: "Natural Black" }, K(12500), 5],
      [{ Length: '20"', Density: "180%", Colour: "Natural Black" }, K(14800), 3],
    ],
  },

  /* --------------------------------------------------- HEADBAND WIGS */
  {
    id: "prd_curly", categoryId: "cat_wigs", slug: "amara-kinky-curly-headband",
    name: "Amara Kinky Curly Headband Wig",
    summary: "Blends with 4C leave-out. No glue, no lace.",
    description:
      "A headband unit built for natural 4C texture — leave out your edges, slip it on, done. Comes with two interchangeable bands, black and satin-print.",
    tags: ["headband-wigs", "natural texture", "protective style"], featured: true,
    variants: [
      [{ Length: '14"', Density: "150%", Colour: "Natural Black" }, K(6900), 9],
      [{ Length: '16"', Density: "150%", Colour: "Natural Black" }, K(7600), 4],
      [{ Length: '18"', Density: "180%", Colour: "Dark Brown" }, K(8800), 2],
    ],
  },
  {
    id: "prd_waterwave", categoryId: "cat_wigs", slug: "lulu-water-wave-headband",
    name: "Lulu Water Wave Headband Wig",
    summary: "Beach-wave unit you can wear straight from the box.",
    description:
      "Soft water-wave fibre blended for daily wear and travel. Shake it out, settle the band and go — ideal as a second unit while your install rests.",
    tags: ["headband-wigs", "low maintenance", "budget"],
    variants: [
      [{ Length: '14"', Density: "150%", Colour: "Natural Black" }, K(4500), 12],
      [{ Length: '16"', Density: "150%", Colour: "Ginger" }, K(4900), 6],
    ],
  },

  /* ------------------------------------------------------- EXTENSIONS */
  {
    id: "prd_bundles", categoryId: "cat_extensions", slug: "bello-body-wave-bundles",
    name: "Bello Body Wave Bundles",
    summary: "Single-donor wefts, double-stitched, per bundle.",
    description:
      "Sold by the bundle so you can build the install you want. Double-stitched wefts that do not shed, from one donor so the texture matches across lengths.",
    tags: ["bundles", "human hair", "bestseller"], featured: true,
    variants: [
      [{ Length: '14"', Texture: "Body Wave", Colour: "Natural Black" }, K(3500), 14],
      [{ Length: '18"', Texture: "Body Wave", Colour: "Natural Black" }, K(4800), 10],
      [{ Length: '22"', Texture: "Body Wave", Colour: "Natural Black" }, K(6400), 6],
    ],
  },
  {
    id: "prd_clipin", categoryId: "cat_extensions", slug: "clip-in-straight-extensions",
    name: "Clip-In Straight Extensions (7 pieces)",
    summary: "Seven wefts, 16 clips — in and out in minutes.",
    description:
      "A full seven-piece set with silicone-lined clips that grip without pulling. Straight finish that blends with relaxed or pressed hair.",
    tags: ["clip-ins", "beginner friendly"],
    variants: [
      [{ Length: '16"', Texture: "Straight", Colour: "Natural Black" }, K(4200), 9],
      [{ Length: '20"', Texture: "Straight", Colour: "Natural Black" }, K(5400), 5],
      [{ Length: '20"', Texture: "Straight", Colour: "Dark Brown" }, K(5600), 3],
    ],
  },
  {
    id: "prd_ponytail", categoryId: "cat_extensions", slug: "drawstring-ponytail-extension",
    name: "Drawstring Ponytail Extension",
    summary: "Sleek ponytail on a drawstring and two combs.",
    description:
      "Pull it on over your own bun, tighten the drawstring and wrap the band. The fastest way to a finished look on a work morning.",
    tags: ["ponytail", "quick style"], featured: true,
    variants: [
      [{ Length: '18"', Texture: "Straight", Colour: "Natural Black" }, K(2500), 18],
      [{ Length: '22"', Texture: "Curly", Colour: "Natural Black" }, K(2900), 11],
    ],
  },
  {
    id: "prd_bundledeal", categoryId: "cat_extensions", slug: "kinky-curly-bundle-deal",
    name: "Kinky Curly Bundle Deal (3 + closure)",
    summary: "Three bundles and a 4x4 closure, priced as a set.",
    description:
      "Everything a full sew-in needs in one box: three matched kinky-curly bundles and a 4x4 closure, at less than the four bought apart.",
    tags: ["bundles", "deal"], compareAt: K(12500),
    variants: [
      [{ Length: '16"', Texture: "Kinky Curly", Colour: "Natural Black" }, K(9500), 5],
      [{ Length: '20"', Texture: "Kinky Curly", Colour: "Natural Black" }, K(11900), 3],
    ],
  },

  /* --------------------------------------------------------- HAIRCARE */
  {
    id: "prd_shampoo", categoryId: "cat_haircare", slug: "wig-revive-shampoo-conditioner",
    name: "Wig Revive Shampoo & Conditioner Set",
    summary: "Sulphate-free pair that keeps a unit soft, not stiff.",
    description:
      "A gentle wash built for human-hair units: no sulphates to strip the cuticle, and a conditioner light enough that the hair does not go limp.",
    tags: ["wash day", "essentials"], featured: true,
    variants: [
      [{ Size: "250ml pair" }, K(1850), 20],
      [{ Size: "500ml pair" }, K(2900), 12],
    ],
  },
  {
    id: "prd_serum", categoryId: "cat_haircare", slug: "argan-hair-scalp-serum",
    name: "Argan Hair & Scalp Serum",
    summary: "Light oil that adds shine without the grease.",
    description: "Argan and jojoba in a dropper bottle. A few drops through the mid-lengths revives a dull unit; on your own scalp it settles itch under a cap.",
    tags: ["aftercare"],
    variants: [[{ Size: "60ml" }, K(950), 30], [{ Size: "120ml" }, K(1600), 16]],
  },
  {
    id: "prd_leavein", categoryId: "cat_haircare", slug: "leave-in-detangling-spray",
    name: "Leave-In Detangling Spray",
    summary: "Works the knots out of a curly unit without shedding.",
    description: "Spray through damp hair and comb from the ends up. Slip enough to detangle kinky and deep-wave textures without pulling the weft.",
    tags: ["wash day"],
    variants: [[{ Size: "200ml" }, K(890), 26]],
  },
  {
    id: "prd_edgegel", categoryId: "cat_haircare", slug: "edge-control-gel",
    name: "Edge Control Gel",
    summary: "All-day hold with no white flaking.",
    description: "A firm but non-crunchy hold for laying edges over a headband or under a frontal. Washes out clean with water.",
    tags: ["styling", "bestseller"],
    variants: [[{ Size: "60g" }, K(450), 48], [{ Size: "120g" }, K(750), 25]],
  },

  /* ------------------------------------------------- HAIR ACCESSORIES */
  {
    id: "prd_wigcap", categoryId: "cat_hair_acc", slug: "stocking-wig-caps-5pack",
    name: "Stocking Wig Caps (5 pack)",
    summary: "Breathable nylon caps that hold braids flat.",
    description: "Five-pack of stretch caps in two shades. Keeps cornrows compressed so your unit lies flat and the lace blends.",
    tags: ["essentials"],
    variants: [
      [{ Shade: "Black" }, K(450), 40],
      [{ Shade: "Brown" }, K(450), 25],
    ],
  },
  {
    id: "prd_lacegel", categoryId: "cat_hair_acc", slug: "hold-me-lace-bond-kit",
    name: "Hold Me Lace Bond & Melt Kit",
    summary: "Waterproof bond, melt spray and edge brush in one box.",
    description: "Latex-free bond rated for 5–7 days of hold, paired with a melt spray and a dual-ended edge brush. Humidity-tested for the coast.",
    tags: ["kit", "bestseller"], featured: true,
    variants: [
      [{ Size: "38ml kit" }, K(1850), 22],
      [{ Size: "75ml pro kit" }, K(2950), 11],
    ],
  },
  {
    id: "prd_wigstand", categoryId: "cat_hair_acc", slug: "collapsible-wig-stand",
    name: "Collapsible Wig Stand",
    summary: "Folds flat — keeps units in shape between wears.",
    description: "Lightweight tripod stand with a vented mannequin head. Folds into a travel pouch.",
    tags: ["storage"],
    variants: [[{ Size: "Tripod + head" }, K(1600), 14]],
  },
  {
    id: "prd_bonnet", categoryId: "cat_hair_acc", slug: "satin-bonnet-scrunchie-set",
    name: "Satin Bonnet & Scrunchie Set",
    summary: "Sleep in it — your unit lasts twice as long.",
    description: "A double-lined satin bonnet with a soft elastic that does not mark your forehead, plus two matching scrunchies.",
    tags: ["aftercare", "sleep"],
    variants: [
      [{ Shade: "Blush Pink" }, K(750), 30],
      [{ Shade: "Midnight Navy" }, K(750), 18],
    ],
  },
  {
    id: "prd_edgebrush", categoryId: "cat_hair_acc", slug: "edge-brush-band-set",
    name: "Edge Brush & Elastic Band Set",
    summary: "Dual-ended brush with two melting bands.",
    description: "A boar-bristle edge brush with a rat-tail end for parting, and two elastic bands for melting the lace down while the bond sets.",
    tags: ["tools"],
    variants: [[{ Size: "Brush + 2 bands" }, K(550), 34]],
  },
];

function skuFor(slug: string, options: Record<string, string>, index: number): string {
  const base = slug.split("-").map((p) => p.slice(0, 3).toUpperCase()).join("").slice(0, 9);
  const tail = Object.values(options).join("-").replace(/[^a-zA-Z0-9]/g, "").toUpperCase().slice(0, 8);
  return `${base}-${tail || "STD"}-${index + 1}`;
}

export function buildCatalog(): { products: Product[]; variants: Variant[] } {
  const products: Product[] = [];
  const variants: Variant[] = [];
  const createdBase = Date.parse("2026-01-08T09:00:00.000Z");

  SPECS.forEach((spec, pi) => {
    const prices = spec.variants.map(([, price]) => price);
    products.push({
      id: spec.id,
      categoryId: spec.categoryId,
      slug: spec.slug,
      name: spec.name,
      summary: spec.summary,
      description: spec.description,
      basePrice: Math.min(...prices),
      compareAtPrice: spec.compareAt ?? null,
      tags: spec.tags,
      images: photosFor(spec.slug),
      featured: spec.featured ?? false,
      active: true,
      createdAt: new Date(createdBase + pi * 36e5).toISOString(),
    });

    spec.variants.forEach(([options, price, stock], vi) => {
      variants.push({
        id: `${spec.id}_v${vi + 1}`,
        productId: spec.id,
        sku: skuFor(spec.slug, options, vi),
        options,
        price,
        stock,
        reserved: 0,
        lowStockThreshold: 3,
        active: true,
      });
    });
  });

  return { products, variants };
}
