import "server-only";
import type { Database } from "@/lib/types";
import { buildDatabase, SEED_VERSION } from "@/lib/seed";
import { CATEGORIES, buildCatalog } from "@/lib/seed/catalog";
import { photosFor } from "@/lib/seed/photos";
import { selectDriver, type PersistenceDriver } from "@/lib/db/driver";

/**
 * Single read-modify-write access point for the whole app.
 *
 * Every repository goes through `read()` / `write()`, which is the seam that
 * keeps the demo honest: today it is a JSON document (Vercel Blob, or memory
 * when no token is configured), tomorrow it is Postgres (db/schema.sql) and
 * only this file changes.
 */

const CACHE_TTL_MS = 3_000;

interface Cache {
  db: Database | null;
  at: number;
  inflight: Promise<Database> | null;
}

// Hangs off globalThis so Next.js dev hot-reloads don't reset the store.
const g = globalThis as typeof globalThis & { __kagorim?: Cache };
const cache: Cache = (g.__kagorim ??= { db: null, at: 0, inflight: null });

export const driver: PersistenceDriver = selectDriver();

/**
 * One-time fixes applied to a snapshot written by an older build. Each runs
 * once and records itself, so a store that predates a change catches up
 * without re-seeding — which would throw away real orders.
 */
function applyPhotos(db: Database): boolean {
  let changed = false;
  for (const product of db.products) {
    if (product.images.length) continue;
    const photos = photosFor(product.slug);
    if (!photos.length) continue;
    product.images = [...photos];
    changed = true;
  }
  return changed;
}

const MIGRATIONS: { id: string; apply: (db: Database) => boolean }[] = [
  {
    // Photos moved from files shipped in the repo to URLs on the product record.
    id: "product-photos-v1",
    apply: applyPhotos,
  },
  {
    // The remaining catalogue got photography too.
    id: "product-photos-v2",
    apply: applyPhotos,
  },
  {
    // The shop trades under the brand on the logo, and the home page now
    // carries an about panel, so the settings record needs those fields.
    id: "store-identity-v1",
    apply(db) {
      const defaults = buildDatabase().settings;
      let changed = false;
      if (db.settings.storeName === "Kagorim Boutique") {
        db.settings.storeName = defaults.storeName;
        changed = true;
      }
      for (const key of ["tagline", "address", "hours"] as const) {
        if (!db.settings[key]) {
          db.settings[key] = defaults[key];
          changed = true;
        }
      }
      if (!db.subscribers) {
        db.subscribers = [];
        changed = true;
      }
      return changed;
    },
  },
  {
    // The shop stopped carrying footwear. Existing records are retired rather
    // than deleted: past orders reference these products, and reports read
    // through them. They stay in the console, marked hidden, and can be
    // brought back by publishing them again.
    id: "retire-footwear-v1",
    apply(db) {
      const shelves = new Set(["heels", "flat-shoes", "doll-shoes", "sports-shoes"]);
      let changed = false;

      const retiredIds = new Set<string>();
      for (const category of db.categories) {
        if (!shelves.has(category.slug)) continue;
        retiredIds.add(category.id);
        if (category.active) {
          category.active = false;
          changed = true;
        }
      }

      for (const product of db.products) {
        if (!retiredIds.has(product.categoryId) || !product.active) continue;
        product.active = false;
        changed = true;
      }

      return changed;
    },
  },
  {
    // A wig on a mannequin head replaced modelled hair on the bob. This one
    // overwrites rather than fills, so it only touches that product and only
    // where the record still holds the photo it is replacing.
    id: "wig-mannequin-v1",
    apply(db) {
      const product = db.products.find((p) => p.slug === "nia-blunt-cut-bob");
      const replacement = photosFor("nia-blunt-cut-bob");
      if (!product || !replacement.length) return false;
      const isStock = product.images.every((url) => url.includes("images.unsplash.com"));
      if (!product.images.length || !isStock) return false;
      product.images = [...replacement];
      return true;
    },
  },
  {
    // The shop now centres on hair: lashes, lash accessories and handbags come
    // off the storefront and Extensions and Wig Care take their place. As with
    // footwear, the old shelves are retired rather than deleted so past orders
    // and reports still resolve, and staff can publish them again.
    id: "extensions-wig-care-v1",
    apply(db) {
      const retired = new Set(["lashes", "lash-accessories", "handbags"]);
      let changed = false;

      const retiredIds = new Set<string>();
      for (const category of db.categories) {
        if (!retired.has(category.slug)) continue;
        retiredIds.add(category.id);
        if (category.active) {
          category.active = false;
          changed = true;
        }
      }
      for (const product of db.products) {
        if (!retiredIds.has(product.categoryId) || !product.active) continue;
        product.active = false;
        changed = true;
      }

      const added = new Set(["extensions", "wig-care"]);
      const addedIds = new Set<string>();
      for (const category of CATEGORIES) {
        if (!added.has(category.slug)) continue;
        addedIds.add(category.id);
        if (db.categories.some((c) => c.slug === category.slug)) continue;
        db.categories.push({ ...category });
        changed = true;
      }

      const catalog = buildCatalog();
      const now = new Date().toISOString();
      for (const product of catalog.products) {
        if (!addedIds.has(product.categoryId)) continue;
        if (db.products.some((p) => p.slug === product.slug || p.id === product.id)) continue;
        db.products.push({ ...product, createdAt: now });
        for (const variant of catalog.variants) {
          if (variant.productId !== product.id) continue;
          if (db.variants.some((v) => v.id === variant.id || v.sku === variant.sku)) continue;
          db.variants.push({ ...variant });
        }
        changed = true;
      }

      return changed;
    },
  },
  {
    // The tagline feeds the hero and the footer. Older stores still carry copy
    // that mentions shoes and "no account needed"; anything staff wrote
    // themselves is left alone.
    id: "tagline-hair-v1",
    apply(db) {
      const current = db.settings.tagline ?? "";
      const outdated =
        /shoes|no account needed/i.test(current) ||
        current === "Wigs, lashes and handbags, picked for Nairobi and delivered countrywide.";
      if (!outdated) return false;
      db.settings.tagline = buildDatabase().settings.tagline;
      return true;
    },
  },
];


async function migrate(db: Database): Promise<Database> {
  const applied = new Set(db.migrations ?? []);
  let dirty = false;

  for (const migration of MIGRATIONS) {
    if (applied.has(migration.id)) continue;
    migration.apply(db);
    applied.add(migration.id);
    dirty = true;
  }

  if (dirty) {
    db.migrations = [...applied];
    db.savedAt = new Date().toISOString();
    await driver.save(db);
  }
  return db;
}

/**
 * Turns "what the driver returned" into "the database to use", and is the only
 * place allowed to seed. Seeding over live data loses real orders, so it happens
 * only when the store is genuinely empty or the seed version moved on.
 */
async function resolve(loaded: Database | null): Promise<Database> {
  if (loaded && loaded.version === SEED_VERSION) return migrate(loaded);

  // Stale snapshots from an older seed are discarded rather than merged —
  // partial shapes would surface as missing fields all over the UI.
  if (loaded) return freshSeed();

  // Empty store, but this instance has already served data from it: that is a
  // lost read, not a fresh install. Re-publish what we hold instead of wiping.
  if (cache.db) {
    await driver.save(cache.db);
    return cache.db;
  }

  return freshSeed();
}

/** A new store starts already carrying every migration. */
async function freshSeed(): Promise<Database> {
  const seeded = buildDatabase();
  seeded.migrations = MIGRATIONS.map((m) => m.id);
  await driver.save(seeded);
  return seeded;
}

async function hydrate(): Promise<Database> {
  return resolve(await driver.load());
}

/** Cached snapshot — good enough for rendering pages. */
export async function read(): Promise<Database> {
  const fresh = cache.db && Date.now() - cache.at < CACHE_TTL_MS;
  if (fresh && cache.db) return cache.db;
  if (!cache.inflight) {
    cache.inflight = hydrate().then((db) => {
      cache.db = db;
      cache.at = Date.now();
      cache.inflight = null;
      return db;
    });
  }
  return cache.inflight;
}

/** Bypasses the cache — used before every mutation. */
export async function readFresh(): Promise<Database> {
  const db = await resolve(await driver.load());
  cache.db = db;
  cache.at = Date.now();
  return db;
}

/**
 * Read-modify-write. The mutator receives a fresh snapshot and may return a
 * value; the snapshot is persisted afterwards.
 */
export async function write<T>(mutator: (db: Database) => T | Promise<T>): Promise<T> {
  const db = await readFresh();
  const result = await mutator(db);
  db.savedAt = new Date().toISOString();
  await driver.save(db);
  cache.db = db;
  cache.at = Date.now();
  return result;
}

/** Wipes persisted state and re-seeds. Owner-only, exposed in admin settings. */
export async function resetStore(): Promise<void> {
  const seeded = buildDatabase();
  await driver.save(seeded);
  cache.db = seeded;
  cache.at = Date.now();
}
