import "server-only";
import type { Database } from "@/lib/types";
import { buildDatabase, SEED_VERSION } from "@/lib/seed";
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
