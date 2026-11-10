import type { Database } from "@/lib/types";

/**
 * `load()` returns null only when the store is **definitively empty** — a first
 * boot. Anything else (network failure, a bad read) throws, because the caller
 * seeds on null and a seed written over live data destroys real orders.
 */
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
const store = globalThis as typeof globalThis & { __belloMemory?: { db: Database | null } };
store.__belloMemory ??= { db: null };

export const memoryDriver: PersistenceDriver = {
  name: "in-memory",
  durable: false,
  async load() {
    return store.__belloMemory!.db;
  },
  async save(db) {
    store.__belloMemory!.db = db;
  },
};

/* ------------------------------------------------------------------ */
/* Vercel Blob: durable JSON document. One object, read-modify-write.  */
/* Fine at boutique volume; swap for Postgres (db/schema.sql) when      */
/* concurrent writes or reporting queries outgrow it.                   */
/* ------------------------------------------------------------------ */

const BLOB_KEY = "bello-beauty/state.json";

/**
 * The blob is read by its deterministic public URL rather than by `list()`.
 * `list()` is eventually consistent: for a few seconds after a write it can
 * report nothing, which earlier read as "empty store" and re-seeded over live
 * orders. The store id is the third segment of the read-write token
 * (`vercel_blob_rw_<storeId>_<secret>`), which is how the SDK addresses blobs too.
 */
function publicBlobUrl(): string | null {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) return null;
  const storeId = token.split("_")[3];
  if (!storeId) return null;
  return `https://${storeId}.public.blob.vercel-storage.com/${BLOB_KEY}`;
}

/**
 * Next.js signals control flow by throwing: a prerender that touches a no-store
 * fetch, a redirect, a notFound. Those errors carry a `digest` and the framework
 * matches on the object it threw, so they must propagate untouched — wrapping
 * one in a new Error turns "render this route dynamically" into a build failure.
 */
function isFrameworkSignal(error: unknown): boolean {
  return typeof (error as { digest?: unknown } | null)?.digest === "string";
}

async function fetchSnapshot(url: string): Promise<Response> {
  try {
    return await fetch(url, { cache: "no-store" });
  } catch (cause) {
    if (isFrameworkSignal(cause)) throw cause;
    // One retry: a single dropped connection must not look like an empty store.
    try {
      return await fetch(url, { cache: "no-store" });
    } catch (retry) {
      if (isFrameworkSignal(retry)) throw retry;
      throw cause;
    }
  }
}

export const blobDriver: PersistenceDriver = {
  name: "vercel-blob",
  durable: true,
  async load() {
    const url = publicBlobUrl();
    if (!url) throw new Error("BLOB_READ_WRITE_TOKEN is malformed — cannot address the store.");

    const res = await fetchSnapshot(url);
    if (res.status === 404) {
      // Confirm with the authoritative API before concluding the store is empty.
      const { head } = await import("@vercel/blob");
      const existing = await head(BLOB_KEY).catch(() => null);
      if (!existing) return null;
      const retry = await fetchSnapshot(existing.url);
      if (!retry.ok) throw new Error(`Blob exists but could not be read (${retry.status}).`);
      return (await retry.json()) as Database;
    }
    if (!res.ok) throw new Error(`Blob read failed with ${res.status}.`);
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
