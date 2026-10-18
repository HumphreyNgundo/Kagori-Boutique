import type { Category, Product, Variant } from "@/lib/types";
import { photosFor } from "@/lib/seed/photos";

/* Prices are minor units: KES 6,500 -> 650000 */
const K = (shillings: number) => shillings * 100;

export const CATEGORIES: Category[] = [
  { id: "cat_wigs", slug: "wigs", name: "Wigs", tagline: "Human hair & premium HD lace units", family: "WIG", position: 1, active: true },
  { id: "cat_wig_acc", slug: "wig-accessories", name: "Wig Accessories", tagline: "Caps, glue, sprays & styling tools", family: "WIG_ACCESSORY", position: 2, active: true },
  { id: "cat_lashes", slug: "lashes", name: "Lashes", tagline: "Mink, volume & classic strips", family: "LASH", position: 3, active: true },
  { id: "cat_lash_acc", slug: "lash-accessories", name: "Lash Accessories", tagline: "Glue, applicators & aftercare", family: "LASH_ACCESSORY", position: 4, active: true },
  { id: "cat_heels", slug: "heels", name: "Heels", tagline: "Block, stiletto & kitten heels", family: "FOOTWEAR", position: 5, active: true },
  { id: "cat_flats", slug: "flat-shoes", name: "Flat Shoes", tagline: "All-day loafers, mules & sandals", family: "FOOTWEAR", position: 6, active: true },
  { id: "cat_doll", slug: "doll-shoes", name: "Doll Shoes", tagline: "Mary-janes & ballet pumps", family: "FOOTWEAR", position: 7, active: true },
  { id: "cat_sports", slug: "sports-shoes", name: "Sports Shoes", tagline: "Trainers & lifestyle sneakers", family: "FOOTWEAR", position: 8, active: true },
  { id: "cat_bags", slug: "handbags", name: "Handbags", tagline: "Totes, shoulder bags & clutches", family: "BAG", position: 9, active: true },
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

  /* ----------------------------------------------------------- LASHES */
  {
    id: "prd_mink", categoryId: "cat_lashes", slug: "siri-3d-mink-lashes",
    name: "Siri 3D Mink Lashes",
    summary: "Feather-light band, up to 20 wears.",
    description: "Hand-tied 3D faux mink on a cotton band that curves to the lash line. Reusable up to 20 times with gentle cleaning.",
    tags: ["mink", "reusable", "bestseller"], featured: true,
    variants: [
      [{ Style: "Natural", Length: "12mm" }, K(650), 45],
      [{ Style: "Volume", Length: "16mm" }, K(750), 38],
      [{ Style: "Dramatic", Length: "20mm" }, K(850), 20],
    ],
  },
  {
    id: "prd_magnetic", categoryId: "cat_lashes", slug: "magnetic-lash-set",
    name: "Magnetic Lash & Liner Set",
    summary: "No glue — five magnets per band.",
    description: "Two pairs plus a magnetic liner pen. Reposition as many times as you like, no drying time.",
    tags: ["magnetic", "glue free"],
    variants: [
      [{ Style: "Everyday duo" }, K(2200), 16],
      [{ Style: "Glam duo" }, K(2450), 9],
    ],
  },
  {
    id: "prd_cluster", categoryId: "cat_lashes", slug: "diy-cluster-lash-kit",
    name: "DIY Cluster Lash Kit",
    summary: "60 clusters, bond & seal — salon look at home.",
    description: "Segment clusters in mixed lengths with a 72-hour bond and sealant. Comes with a step card for first-timers.",
    tags: ["diy", "kit"],
    variants: [[{ Mix: "9–14mm" }, K(1950), 18], [{ Mix: "12–18mm" }, K(2100), 12]],
  },

  /* --------------------------------------------- LASH ACCESSORIES ---- */
  {
    id: "prd_lashglue", categoryId: "cat_lash_acc", slug: "clear-lash-adhesive",
    name: "Clear Lash Adhesive",
    summary: "Latex-free, dries clear in 10 seconds.",
    description: "Sensitive-eye formula that dries invisible and holds through a full day.",
    tags: ["essentials"],
    variants: [[{ Size: "5ml" }, K(380), 60], [{ Size: "10ml" }, K(620), 30]],
  },
  {
    id: "prd_applicator", categoryId: "cat_lash_acc", slug: "precision-lash-applicator",
    name: "Precision Lash Applicator",
    summary: "Curved steel tweezers with a non-slip grip.",
    description: "Angled tip that grips the band without crushing it. Comes with a cap.",
    tags: ["tools"],
    variants: [[{ Finish: "Rose gold" }, K(550), 34], [{ Finish: "Matte black" }, K(550), 28]],
  },
  {
    id: "prd_lashcleanser", categoryId: "cat_lash_acc", slug: "lash-cleanser-foam",
    name: "Lash Cleanser Foam",
    summary: "Oil-free foam that extends band life.",
    description: "Removes residue and mascara without dissolving the bond. Safe over extensions.",
    tags: ["aftercare"],
    variants: [[{ Size: "60ml" }, K(890), 25]],
  },

  /* ------------------------------------------------------------ HEELS */
  {
    id: "prd_blockheel", categoryId: "cat_heels", slug: "amani-block-heel-sandal",
    name: "Amani Block Heel Sandal",
    summary: "75mm block heel you can actually walk in.",
    description: "Padded footbed on a stable 75mm block heel with an adjustable ankle strap. The one pair that survives a wedding and the walk to the car park.",
    tags: ["comfort", "occasion"], featured: true, compareAt: K(5500),
    variants: [
      [{ Size: "36", Colour: "Nude" }, K(4200), 4],
      [{ Size: "37", Colour: "Nude" }, K(4200), 6],
      [{ Size: "38", Colour: "Nude" }, K(4200), 5],
      [{ Size: "39", Colour: "Black" }, K(4200), 3],
      [{ Size: "40", Colour: "Black" }, K(4200), 2],
    ],
  },
  {
    id: "prd_stiletto", categoryId: "cat_heels", slug: "nova-pointed-stiletto",
    name: "Nova Pointed Stiletto",
    summary: "100mm patent stiletto with a cushioned sole.",
    description: "A sharp pointed toe in patent finish, lined with memory foam at the ball of the foot.",
    tags: ["evening"],
    variants: [
      [{ Size: "37", Colour: "Black" }, K(5400), 3],
      [{ Size: "38", Colour: "Black" }, K(5400), 4],
      [{ Size: "39", Colour: "Red" }, K(5600), 2],
    ],
  },
  {
    id: "prd_kitten", categoryId: "cat_heels", slug: "mara-kitten-heel-mule",
    name: "Mara Kitten Heel Mule",
    summary: "50mm slip-on mule for the office.",
    description: "Square-toe mule with a 50mm heel. Slides on, stays quiet on tiled floors.",
    tags: ["office"],
    variants: [
      [{ Size: "37", Colour: "Cream" }, K(3800), 5],
      [{ Size: "38", Colour: "Cream" }, K(3800), 4],
      [{ Size: "39", Colour: "Taupe" }, K(3800), 3],
    ],
  },

  /* ------------------------------------------------------- FLAT SHOES */
  {
    id: "prd_loafer", categoryId: "cat_flats", slug: "imani-leather-loafer",
    name: "Imani Leather Loafer",
    summary: "Soft leather, rubber sole, zero break-in.",
    description: "Genuine leather upper on a flexible rubber sole. Wide-friendly fit that works from the office to the matatu.",
    tags: ["leather", "everyday"], featured: true,
    variants: [
      [{ Size: "36", Colour: "Tan" }, K(3600), 5],
      [{ Size: "37", Colour: "Tan" }, K(3600), 6],
      [{ Size: "38", Colour: "Black" }, K(3600), 7],
      [{ Size: "39", Colour: "Black" }, K(3600), 4],
      [{ Size: "40", Colour: "Black" }, K(3600), 2],
    ],
  },
  {
    id: "prd_slide", categoryId: "cat_flats", slug: "pwani-woven-slide",
    name: "Pwani Woven Slide",
    summary: "Hand-woven strap, cork-feel footbed.",
    description: "Open slide with a woven vegan strap and a moulded footbed. Coast-ready.",
    tags: ["sandal", "summer"],
    variants: [
      [{ Size: "37", Colour: "Natural" }, K(2400), 8],
      [{ Size: "38", Colour: "Natural" }, K(2400), 6],
      [{ Size: "39", Colour: "Black" }, K(2400), 5],
    ],
  },
  {
    id: "prd_pointedflat", categoryId: "cat_flats", slug: "kesi-pointed-flat",
    name: "Kesi Pointed Flat",
    summary: "Pointed toe without the heel.",
    description: "Elongating pointed flat in a matte finish with a padded insole.",
    tags: ["office"],
    variants: [
      [{ Size: "37", Colour: "Black" }, K(2900), 6],
      [{ Size: "38", Colour: "Nude" }, K(2900), 5],
      [{ Size: "39", Colour: "Nude" }, K(2900), 3],
    ],
  },

  /* ------------------------------------------------------- DOLL SHOES */
  {
    id: "prd_maryjane", categoryId: "cat_doll", slug: "lilo-mary-jane",
    name: "Lilo Mary Jane",
    summary: "Buckle strap, rounded toe, chunky sole.",
    description: "The doll-shoe silhouette on a chunky lug sole — playful but sturdy enough for daily wear.",
    tags: ["trending"], featured: true,
    variants: [
      [{ Size: "36", Colour: "Black" }, K(3300), 6],
      [{ Size: "37", Colour: "Black" }, K(3300), 7],
      [{ Size: "38", Colour: "Burgundy" }, K(3300), 4],
      [{ Size: "39", Colour: "Burgundy" }, K(3300), 2],
    ],
  },
  {
    id: "prd_ballet", categoryId: "cat_doll", slug: "sasa-ballet-pump",
    name: "Sasa Ballet Pump",
    summary: "Ribbon-tie ballet flat, feather-light.",
    description: "Classic ballet pump with an elastic ribbon tie and a whisper-thin sole.",
    tags: ["classic"],
    variants: [
      [{ Size: "36", Colour: "Blush" }, K(2600), 5],
      [{ Size: "37", Colour: "Blush" }, K(2600), 6],
      [{ Size: "38", Colour: "Black" }, K(2600), 4],
    ],
  },

  /* ----------------------------------------------------- SPORTS SHOES */
  {
    id: "prd_runner", categoryId: "cat_sports", slug: "kasi-mesh-runner",
    name: "Kasi Mesh Runner",
    summary: "Breathable mesh, 8mm drop, 240g.",
    description: "A genuine daily trainer — breathable knit upper, EVA midsole with an 8mm drop, and a rubber outsole that grips wet tarmac.",
    tags: ["running", "bestseller"], featured: true, compareAt: K(7500),
    variants: [
      [{ Size: "37", Colour: "White/Violet" }, K(6200), 4],
      [{ Size: "38", Colour: "White/Violet" }, K(6200), 6],
      [{ Size: "39", Colour: "All Black" }, K(6200), 5],
      [{ Size: "40", Colour: "All Black" }, K(6200), 3],
      [{ Size: "41", Colour: "All Black" }, K(6200), 2],
    ],
  },
  {
    id: "prd_court", categoryId: "cat_sports", slug: "rally-court-sneaker",
    name: "Rally Court Sneaker",
    summary: "Leather-look court shoe for off-duty days.",
    description: "Clean court silhouette with a cupsole and padded collar. Wipes clean.",
    tags: ["lifestyle"],
    variants: [
      [{ Size: "38", Colour: "White" }, K(4800), 7],
      [{ Size: "39", Colour: "White" }, K(4800), 5],
      [{ Size: "40", Colour: "White/Cyan" }, K(4900), 3],
    ],
  },
  {
    id: "prd_trainer", categoryId: "cat_sports", slug: "studio-cross-trainer",
    name: "Studio Cross Trainer",
    summary: "Flat, stable base for gym and HIIT.",
    description: "Low-drop trainer with a wide stable base for lifting and lateral work.",
    tags: ["gym"],
    variants: [
      [{ Size: "38", Colour: "Grey" }, K(5600), 4],
      [{ Size: "39", Colour: "Grey" }, K(5600), 3],
      [{ Size: "40", Colour: "Black/Cyan" }, K(5600), 2],
    ],
  },

  /* --------------------------------------------------------- HANDBAGS */
  {
    id: "prd_tote", categoryId: "cat_bags", slug: "sauti-structured-tote",
    name: "Sauti Structured Tote",
    summary: "Fits a 14\" laptop, holds its shape.",
    description: "A structured work tote in vegan leather with a laptop sleeve, two slip pockets and a detachable crossbody strap.",
    tags: ["work", "bestseller"], featured: true,
    variants: [
      [{ Colour: "Black" }, K(5200), 7],
      [{ Colour: "Tan" }, K(5200), 5],
      [{ Colour: "Plum" }, K(5400), 3],
    ],
  },
  {
    id: "prd_shoulder", categoryId: "cat_bags", slug: "dala-shoulder-bag",
    name: "Dala Shoulder Bag",
    summary: "Slouchy underarm bag with a zip top.",
    description: "Soft-body shoulder bag with a single strap that tucks under the arm. Lined, with an inner zip pocket.",
    tags: ["everyday"],
    variants: [
      [{ Colour: "Chocolate" }, K(3900), 6],
      [{ Colour: "Cream" }, K(3900), 4],
    ],
  },
  {
    id: "prd_clutch", categoryId: "cat_bags", slug: "noir-evening-clutch",
    name: "Noir Evening Clutch",
    summary: "Hard-shell clutch with a drop-in chain.",
    description: "Compact evening clutch with a satin lining and a chain that tucks inside to convert to a hand-held.",
    tags: ["evening", "occasion"],
    variants: [
      [{ Colour: "Black" }, K(2800), 8],
      [{ Colour: "Silver" }, K(3000), 4],
    ],
  },
  {
    id: "prd_crossbody", categoryId: "cat_bags", slug: "safari-mini-crossbody",
    name: "Safari Mini Crossbody",
    summary: "Phone, cards, lip balm. Nothing more.",
    description: "Minimal crossbody sized for the essentials, with an adjustable webbing strap.",
    tags: ["mini"],
    variants: [
      [{ Colour: "Olive" }, K(2200), 9],
      [{ Colour: "Black" }, K(2200), 11],
      [{ Colour: "Violet" }, K(2300), 5],
    ],
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
