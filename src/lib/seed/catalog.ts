import type { Category, Product, Variant } from "@/lib/types";
import { photosFor } from "@/lib/seed/photos";

/* Prices are minor units: KES 6,500 -> 650000 */
const K = (shillings: number) => shillings * 100;

export const CATEGORIES: Category[] = [
  { id: "cat_wigs", slug: "wigs", name: "Wigs", tagline: "Human hair & premium HD lace units", family: "WIG", position: 1, active: true },
  { id: "cat_wig_acc", slug: "wig-accessories", name: "Wig Accessories", tagline: "Caps, glue, sprays & styling tools", family: "WIG_ACCESSORY", position: 2, active: true },
  { id: "cat_extensions", slug: "extensions", name: "Extensions", tagline: "Clip-ins, bundles, tape-ins & bulk hair", family: "EXTENSION", position: 3, active: true },
  { id: "cat_wig_care", slug: "wig-care", name: "Wig Care", tagline: "Wash, detangle, protect & store", family: "WIG_CARE", position: 4, active: true },
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
  /* ------------------------------------------------------------- WIGS */
  {
    id: "prd_bodywave", categoryId: "cat_wigs", slug: "aria-body-wave-hd-lace",
    name: "Aria Body Wave HD Lace Wig",
    summary: "13x4 HD lace frontal, 180% density, bleached knots.",
    description:
      "Our best-selling unit. Ethically sourced 100% human hair on a melt-free HD lace frontal, pre-plucked with bleached knots so it sits flat from day one. Can be dyed, straightened and reinstalled — with care it holds up for 12+ months.",
    tags: ["human hair", "hd lace", "bestseller"], featured: true, compareAt: K(14500),
    variants: [
      [{ Length: '16"', Density: "180%", Colour: "Natural Black" }, K(11500), 6],
      [{ Length: '18"', Density: "180%", Colour: "Natural Black" }, K(12900), 5],
      [{ Length: '20"', Density: "180%", Colour: "Natural Black" }, K(14200), 3],
      [{ Length: '18"', Density: "180%", Colour: "Honey Blonde" }, K(14900), 2],
    ],
  },
  {
    id: "prd_bob", categoryId: "cat_wigs", slug: "nia-blunt-cut-bob",
    name: "Nia Blunt Cut Bob",
    summary: "Glueless 4x4 closure bob — office-ready in five minutes.",
    description:
      "A wear-and-go glueless bob on an adjustable band with built-in combs. Straight blunt cut that frames the jaw, light enough for daily wear in Nairobi heat.",
    tags: ["glueless", "beginner friendly"], featured: true,
    variants: [
      [{ Length: '10"', Density: "150%", Colour: "Natural Black" }, K(7500), 8],
      [{ Length: '12"', Density: "150%", Colour: "Natural Black" }, K(8200), 7],
      [{ Length: '12"', Density: "150%", Colour: "Burgundy" }, K(8900), 3],
    ],
  },
  {
    id: "prd_curly", categoryId: "cat_wigs", slug: "zawadi-kinky-curly-u-part",
    name: "Zawadi Kinky Curly U-Part",
    summary: "Blends with 4C leave-out. No glue, no lace.",
    description:
      "A U-part unit built for natural 4C texture — leave out your edges, clip in, done. Curl pattern springs back after washing with a sulphate-free cleanser.",
    tags: ["natural texture", "protective style"],
    variants: [
      [{ Length: '14"', Density: "150%", Colour: "Natural Black" }, K(6900), 9],
      [{ Length: '16"', Density: "150%", Colour: "Natural Black" }, K(7600), 4],
      [{ Length: '18"', Density: "180%", Colour: "Dark Brown" }, K(8800), 2],
    ],
  },
  {
    id: "prd_pixie", categoryId: "cat_wigs", slug: "lulu-pixie-cut",
    name: "Lulu Pixie Cut",
    summary: "Featherweight synthetic pixie, heat-safe to 180°C.",
    description:
      "Low-maintenance synthetic fibre that holds its shape through the rains. Shake it out and go — ideal as a second unit for travel or the gym.",
    tags: ["synthetic", "low maintenance", "budget"],
    variants: [
      [{ Length: '6"', Density: "130%", Colour: "Natural Black" }, K(3200), 12],
      [{ Length: '6"', Density: "130%", Colour: "Ginger" }, K(3400), 6],
    ],
  },

  /* -------------------------------------------------- WIG ACCESSORIES */
  {
    id: "prd_wigcap", categoryId: "cat_wig_acc", slug: "stocking-wig-cap-5pack",
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
    id: "prd_lacegel", categoryId: "cat_wig_acc", slug: "hold-me-lace-glue",
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
    id: "prd_wigstand", categoryId: "cat_wig_acc", slug: "collapsible-wig-stand",
    name: "Collapsible Wig Stand",
    summary: "Folds flat — keeps units in shape between wears.",
    description: "Lightweight tripod stand with a vented mannequin head. Folds into a travel pouch.",
    tags: ["storage"],
    variants: [[{ Type: "Tripod + head" }, K(1600), 14]],
  },

  /* ------------------------------------------------------- EXTENSIONS */
  {
    id: "prd_clipin", categoryId: "cat_extensions", slug: "kesi-clip-in-straight-set",
    name: "Kesi Clip-In Straight Set",
    summary: "Seven wefts, 16 clips — full volume in ten minutes.",
    description:
      "100% human hair on lace-backed wefts with silicone-lined clips that grip without pulling. Blend with relaxed or silk-pressed hair, take out at night, reuse for months.",
    tags: ["human hair", "clip-in", "bestseller"], featured: true,
    variants: [
      [{ Length: '16"', Colour: "Natural Black" }, K(6800), 7],
      [{ Length: '20"', Colour: "Natural Black" }, K(8400), 5],
      [{ Length: '20"', Colour: "Dark Brown" }, K(8600), 3],
    ],
  },
  {
    id: "prd_bundles", categoryId: "cat_extensions", slug: "imani-body-wave-bundles",
    name: "Imani Body Wave Bundles (3 pack)",
    summary: "Three double-wefted bundles for a full sew-in.",
    description:
      "Raw-cuticle-aligned body wave that resists tangling and holds its pattern after washing. Three bundles cover a full head; pair with a closure for a natural parting.",
    tags: ["human hair", "sew-in"], featured: true, compareAt: K(13500),
    variants: [
      [{ Length: '16" x3', Colour: "Natural Black" }, K(9800), 6],
      [{ Length: '18" x3', Colour: "Natural Black" }, K(11200), 4],
      [{ Length: '22" x3', Colour: "Natural Black" }, K(13200), 2],
    ],
  },
  {
    id: "prd_tapein", categoryId: "cat_extensions", slug: "neema-tape-in-extensions",
    name: "Neema Tape-In Extensions",
    summary: "Flat, invisible wefts that lie close to the scalp.",
    description:
      "Twenty pre-taped wefts with medical-grade adhesive, salon-installed in under an hour and worn for six to eight weeks before a move-up.",
    tags: ["human hair", "tape-in"],
    variants: [
      [{ Length: '18"', Colour: "Natural Black" }, K(7900), 5],
      [{ Length: '18"', Colour: "Honey Blonde" }, K(8500), 2],
    ],
  },
  {
    id: "prd_kinkybulk", categoryId: "cat_extensions", slug: "afro-kinky-bulk-hair",
    name: "Afro Kinky Bulk Hair",
    summary: "Matches 4C texture for twists, locs and crochet.",
    description:
      "Soft kinky bulk that blends with natural hair for Marley twists, faux locs and crochet styles. Lightweight, so long installs stay comfortable.",
    tags: ["natural texture", "protective style", "budget"],
    variants: [
      [{ Length: '12"', Colour: "Natural Black" }, K(1200), 30],
      [{ Length: '16"', Colour: "Natural Black" }, K(1500), 24],
      [{ Length: '16"', Colour: "Dark Brown" }, K(1500), 12],
    ],
  },

  /* -------------------------------------------------------- WIG CARE */
  {
    id: "prd_wigwash", categoryId: "cat_wig_care", slug: "silk-wash-shampoo-conditioner",
    name: "Silk Wash Shampoo & Conditioner Duo",
    summary: "Sulphate-free — keeps units soft and colour true.",
    description:
      "A gentle cleanse and a slip-rich conditioner made for human hair units and extensions. Lifts product build-up without stripping, so curls spring back and colour lasts.",
    tags: ["aftercare", "bestseller"], featured: true,
    variants: [
      [{ Size: "250ml duo" }, K(1650), 20],
      [{ Size: "500ml duo" }, K(2800), 10],
    ],
  },
  {
    id: "prd_leavein", categoryId: "cat_wig_care", slug: "revive-leave-in-spray",
    name: "Revive Leave-In Detangling Spray",
    summary: "Melts knots, tames frizz, adds shine.",
    description:
      "Spritz on damp or dry hair before combing. Lightweight enough for lace fronts, rich enough to bring a tired unit back to life between washes.",
    tags: ["aftercare"],
    variants: [[{ Size: "150ml" }, K(950), 26], [{ Size: "300ml" }, K(1600), 14]],
  },
  {
    id: "prd_heatshield", categoryId: "cat_wig_care", slug: "heat-shield-protectant",
    name: "Heat Shield Protectant",
    summary: "Protects to 230°C before flat-ironing or curling.",
    description:
      "Thermal protection for human hair units and extensions. Sprays on fine, dries without residue and keeps ends from frying.",
    tags: ["styling"],
    variants: [[{ Size: "120ml" }, K(1100), 18]],
  },
  {
    id: "prd_wigbrush", categoryId: "cat_wig_care", slug: "wide-tooth-detangling-set",
    name: "Wide-Tooth Comb & Loop Brush Set",
    summary: "Detangle without shedding or stretching the lace.",
    description:
      "A seamless wide-tooth comb for wet hair and a loop-bristle brush that glides through wefts without snagging knots.",
    tags: ["tools"],
    variants: [[{ Size: "Two-piece set" }, K(780), 30]],
  },
  {
    id: "prd_satinbag", categoryId: "cat_wig_care", slug: "satin-wig-storage-bag",
    name: "Satin Wig Storage Bag",
    summary: "Zip-up satin bag with a hanger — no frizz, no dust.",
    description:
      "Stores a unit hanging at full length so curls and lace keep their shape between wears. Fits up to 28 inches.",
    tags: ["storage"],
    variants: [[{ Size: 'Up to 28"' }, K(1350), 16]],
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
