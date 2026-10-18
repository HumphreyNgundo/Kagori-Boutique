import "server-only";
import type { Database } from "@/lib/types";
import { buildDatabase, SEED_VERSION } from "@/lib/seed";
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
 * Turns "what the driver returned" into "the database to use", and is the only
 * place allowed to seed. Seeding over live data loses real orders, so it happens
 * only when the store is genuinely empty or the seed version moved on.
 */
async function resolve(loaded: Database | null): Promise<Database> {
  if (loaded && loaded.version === SEED_VERSION) return loaded;

  // Stale snapshots from an older seed are discarded rather than merged —
  // partial shapes would surface as missing fields all over the UI.
  if (loaded) {
    const seeded = buildDatabase();
    await driver.save(seeded);
    return seeded;
  }

  // Empty store, but this instance has already served data from it: that is a
  // lost read, not a fresh install. Re-publish what we hold instead of wiping.
  if (cache.db) {
    await driver.save(cache.db);
    return cache.db;
  }

  const seeded = buildDatabase();
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
