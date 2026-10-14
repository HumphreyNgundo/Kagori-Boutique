import type { Database } from "@/lib/types";

export interface PersistenceDriver {
  readonly name: string;
  /** Durable across instances & cold starts? Drives the banner in admin settings. */
  readonly durable: boolean;
  load(): Promise<Database | null>;
  save(db: Database): Promise<void>;
}

/* ------------------------------------------------------------------ */
/* In-memory: zero config, survives only the lambda instance.          */
/* ------------------------------------------------------------------ */

/**
 * Hangs off globalThis, not a module-level `let`: Next.js bundles server code
 * per route, so a plain module variable gives each route its own empty copy and
 * freshly placed orders disappear on the next page.
 */
const store = globalThis as typeof globalThis & { __kagorimMemory?: { db: Database | null } };
store.__kagorimMemory ??= { db: null };

export const memoryDriver: PersistenceDriver = {
  name: "in-memory",
  durable: false,
  async load() {
    return store.__kagorimMemory!.db;
  },
  async save(db) {
    store.__kagorimMemory!.db = db;
  },
};

/* ------------------------------------------------------------------ */
/* Vercel Blob: durable JSON document. One object, read-modify-write.  */
/* Fine at boutique volume; swap for Postgres (db/schema.sql) when      */
/* concurrent writes or reporting queries outgrow it.                   */
/* ------------------------------------------------------------------ */

const BLOB_KEY = "kagorim/state.json";

export const blobDriver: PersistenceDriver = {
  name: "vercel-blob",
  durable: true,
  async load() {
    const { list } = await import("@vercel/blob");
    const { blobs } = await list({ prefix: BLOB_KEY, limit: 1 });
    const hit = blobs.find((b) => b.pathname === BLOB_KEY);
    if (!hit) return null;
    const res = await fetch(hit.url, { cache: "no-store" });
    if (!res.ok) return null;
    return (await res.json()) as Database;
  },
  async save(db) {
    const { put } = await import("@vercel/blob");
    await put(BLOB_KEY, JSON.stringify(db), {
      access: "public",
      contentType: "application/json",
      addRandomSuffix: false,
      allowOverwrite: true,
      cacheControlMaxAge: 0,
    });
  },
};

export function selectDriver(): PersistenceDriver {
  return process.env.BLOB_READ_WRITE_TOKEN ? blobDriver : memoryDriver;
}
