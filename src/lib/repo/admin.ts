import "server-only";
import { read, write } from "@/lib/db";
import { randomId } from "@/lib/ids";
import { availableOf } from "@/lib/repo/catalog";
import { OPEN_STATUSES } from "@/lib/order-status";
import type { AuditLog, Database, ProductFamily, StoreSettings, User } from "@/lib/types";

function logAudit(db: Database, entry: Omit<AuditLog, "id" | "createdAt">) {
  db.audit.unshift({ ...entry, id: randomId("aud"), createdAt: new Date().toISOString() });
  db.audit = db.audit.slice(0, 500);
}

/* ---------------------------------------------------------- Dashboard */

export interface Kpis {
  revenue: number;
  orders: number;
  openOrders: number;
  averageOrder: number;
  unitsSold: number;
  lowStock: number;
  newCustomers: number;
  revenueSeries: { day: string; value: number }[];
  topProducts: { name: string; units: number; revenue: number }[];
  statusCounts: { status: string; count: number }[];
}

export async function dashboardKpis(days = 30): Promise<Kpis> {
  const db = await read();
  const since = Date.now() - days * 864e5;
  const inWindow = db.orders.filter((o) => Date.parse(o.createdAt) >= since);
  const earning = inWindow.filter((o) => o.status !== "CANCELLED");
  const revenue = earning.reduce((sum, o) => sum + o.total, 0);

  const itemsByOrder = new Map<string, typeof db.orderItems>();
  for (const item of db.orderItems) {
    const list = itemsByOrder.get(item.orderId) ?? [];
    list.push(item);
    itemsByOrder.set(item.orderId, list);
  }

  const byProduct = new Map<string, { name: string; units: number; revenue: number }>();
  let unitsSold = 0;
  for (const order of earning) {
    for (const item of itemsByOrder.get(order.id) ?? []) {
      unitsSold += item.quantity;
      const entry = byProduct.get(item.productId) ?? { name: item.name, units: 0, revenue: 0 };
      entry.units += item.quantity;
      entry.revenue += item.unitPrice * item.quantity;
      byProduct.set(item.productId, entry);
    }
  }

  // Daily revenue for the sparkline — dense, so empty days show as gaps not jumps.
  const buckets = new Map<string, number>();
  for (let i = days - 1; i >= 0; i--) {
    buckets.set(new Date(Date.now() - i * 864e5).toISOString().slice(0, 10), 0);
  }
  for (const order of earning) {
    const day = order.createdAt.slice(0, 10);
    if (buckets.has(day)) buckets.set(day, buckets.get(day)! + order.total);
  }

  const statusCounts = OPEN_STATUSES.map((status) => ({
    status,
    count: db.orders.filter((o) => o.status === status).length,
  }));

  return {
    revenue,
    orders: inWindow.length,
    openOrders: db.orders.filter((o) => OPEN_STATUSES.includes(o.status)).length,
    averageOrder: earning.length ? Math.round(revenue / earning.length) : 0,
    unitsSold,
    lowStock: db.variants.filter((v) => v.active && availableOf(v) <= v.lowStockThreshold).length,
    newCustomers: db.customers.filter((c) => Date.parse(c.createdAt) >= since).length,
    revenueSeries: [...buckets].map(([day, value]) => ({ day, value })),
    topProducts: [...byProduct.values()].sort((a, b) => b.revenue - a.revenue).slice(0, 5),
    statusCounts,
  };
}

/* ---------------------------------------------------------- Inventory */

export interface StockRow {
  variantId: string;
  productId: string;
  productName: string;
  categoryName: string;
  sku: string;
  optionsLabel: string;
  price: number;
  stock: number;
  reserved: number;
  available: number;
  low: boolean;
}

export async function stockRows(onlyLow = false): Promise<StockRow[]> {
  const db = await read();
  const products = new Map(db.products.map((p) => [p.id, p]));
  const categories = new Map(db.categories.map((c) => [c.id, c]));

  const rows = db.variants
    .filter((v) => v.active)
    .map((v) => {
      const product = products.get(v.productId)!;
      const available = availableOf(v);
      return {
        variantId: v.id,
        productId: v.productId,
        productName: product?.name ?? "—",
        categoryName: categories.get(product?.categoryId ?? "")?.name ?? "—",
        sku: v.sku,
        optionsLabel: Object.values(v.options).join(" · "),
        price: v.price,
        stock: v.stock,
        reserved: v.reserved,
        available,
        low: available <= v.lowStockThreshold,
      };
    })
    .sort((a, b) => Number(b.low) - Number(a.low) || a.productName.localeCompare(b.productName));

  return onlyLow ? rows.filter((r) => r.low) : rows;
}

export async function adjustStock(
  variantId: string,
  delta: number,
  reason: "RESTOCK" | "ADJUSTMENT",
  actor: Pick<User, "id" | "name">,
) {
  return write((db) => {
    const variant = db.variants.find((v) => v.id === variantId);
    if (!variant) return { ok: false as const, error: "Variant not found." };
    if (variant.stock + delta < variant.reserved) {
      return { ok: false as const, error: "That would drop stock below what is already reserved for orders." };
    }
    variant.stock = Math.max(0, variant.stock + delta);
    db.movements.unshift({
      id: randomId("stk"),
      variantId,
      delta,
      reason,
      reference: null,
      actorName: actor.name,
      createdAt: new Date().toISOString(),
    });
    db.audit.unshift({
      id: randomId("aud"),
      actorId: actor.id,
      actorName: actor.name,
      action: "inventory.adjusted",
      entity: "variant",
      entityId: variant.sku,
      meta: { delta, stock: variant.stock },
      createdAt: new Date().toISOString(),
    });
    return { ok: true as const };
  });
}

/* ------------------------------------------------- Products & people */

export async function toggleProduct(productId: string, actor: Pick<User, "id" | "name">) {
  return write((db) => {
    const product = db.products.find((p) => p.id === productId);
    if (!product) return { ok: false as const, error: "Product not found." };
    product.active = !product.active;
    db.audit.unshift({
      id: randomId("aud"),
      actorId: actor.id,
      actorName: actor.name,
      action: product.active ? "product.published" : "product.hidden",
      entity: "product",
      entityId: product.slug,
      meta: {},
      createdAt: new Date().toISOString(),
    });
    return { ok: true as const };
  });
}

export async function setProductPrice(variantId: string, price: number, actor: Pick<User, "id" | "name">) {
  return write((db) => {
    const variant = db.variants.find((v) => v.id === variantId);
    if (!variant) return { ok: false as const, error: "Variant not found." };
    if (!Number.isFinite(price) || price < 0) return { ok: false as const, error: "Enter a valid price." };
    const before = variant.price;
    variant.price = Math.round(price);
    const product = db.products.find((p) => p.id === variant.productId);
    if (product) {
      product.basePrice = Math.min(
        ...db.variants.filter((v) => v.productId === product.id && v.active).map((v) => v.price),
      );
    }
    db.audit.unshift({
      id: randomId("aud"),
      actorId: actor.id,
      actorName: actor.name,
      action: "product.repriced",
      entity: "variant",
      entityId: variant.sku,
      meta: { from: before, to: variant.price },
      createdAt: new Date().toISOString(),
    });
    return { ok: true as const };
  });
}

export async function listStaff() {
  const db = await read();
  return db.users.filter((u) => u.role !== "CUSTOMER");
}

export async function listRiders() {
  const db = await read();
  return db.users.filter((u) => u.role === "RIDER" && u.active);
}

export async function setStaffActive(userId: string, active: boolean, actor: Pick<User, "id" | "name">) {
  return write((db) => {
    const user = db.users.find((u) => u.id === userId);
    if (!user) return { ok: false as const, error: "User not found." };
    if (user.role === "OWNER") return { ok: false as const, error: "The owner account cannot be suspended." };
    user.active = active;
    db.audit.unshift({
      id: randomId("aud"),
      actorId: actor.id,
      actorName: actor.name,
      action: active ? "staff.reinstated" : "staff.suspended",
      entity: "user",
      entityId: user.email,
      meta: { role: user.role },
      createdAt: new Date().toISOString(),
    });
    return { ok: true as const };
  });
}

export async function listCustomers() {
  const db = await read();
  return db.customers
    .map((c) => {
      const orders = db.orders.filter((o) => o.customerId === c.id && o.status !== "CANCELLED");
      return {
        ...c,
        orderCount: orders.length,
        spend: orders.reduce((sum, o) => sum + o.total, 0),
        lastOrderAt: orders.map((o) => o.createdAt).sort().at(-1) ?? null,
      };
    })
    .sort((a, b) => b.spend - a.spend);
}

export async function listAudit(limit = 80) {
  const db = await read();
  return db.audit.slice(0, limit);
}

export async function listMovements(limit = 60) {
  const db = await read();
  const variants = new Map(db.variants.map((v) => [v.id, v]));
  const products = new Map(db.products.map((p) => [p.id, p]));
  return db.movements.slice(0, limit).map((m) => {
    const variant = variants.get(m.variantId);
    return {
      ...m,
      sku: variant?.sku ?? "—",
      productName: variant ? products.get(variant.productId)?.name ?? "—" : "—",
    };
  });
}

export async function saveSettings(patch: Partial<StoreSettings>, actor: Pick<User, "id" | "name">) {
  return write((db) => {
    db.settings = { ...db.settings, ...patch };
    db.audit.unshift({
      id: randomId("aud"),
      actorId: actor.id,
      actorName: actor.name,
      action: "settings.updated",
      entity: "store",
      entityId: "settings",
      meta: Object.fromEntries(Object.entries(patch).map(([k, v]) => [k, String(v)])),
      createdAt: new Date().toISOString(),
    });
    return { ok: true as const };
  });
}

/* ------------------------------------------------------------- Media */

/** Appends an uploaded image URL to a product; first upload becomes the hero. */
export async function attachProductImage(productId: string, url: string, actor: Pick<User, "id" | "name">) {
  return write((db) => {
    const product = db.products.find((p) => p.id === productId);
    if (!product) return { ok: false as const, error: "Product not found." };
    product.images = [...product.images, url];
    db.audit.unshift({
      id: randomId("aud"),
      actorId: actor.id,
      actorName: actor.name,
      action: "product.image_added",
      entity: "product",
      entityId: product.slug,
      meta: { images: product.images.length },
      createdAt: new Date().toISOString(),
    });
    return { ok: true as const };
  });
}

export async function removeProductImage(productId: string, url: string, actor: Pick<User, "id" | "name">) {
  return write((db) => {
    const product = db.products.find((p) => p.id === productId);
    if (!product) return { ok: false as const, error: "Product not found." };
    product.images = product.images.filter((i) => i !== url);
    db.audit.unshift({
      id: randomId("aud"),
      actorId: actor.id,
      actorName: actor.name,
      action: "product.image_removed",
      entity: "product",
      entityId: product.slug,
      meta: { images: product.images.length },
      createdAt: new Date().toISOString(),
    });
    return { ok: true as const };
  });
}

/** Promotes an image to position 0 — the one used on cards and search. */
export async function setHeroImage(productId: string, url: string, actor: Pick<User, "id" | "name">) {
  return write((db) => {
    const product = db.products.find((p) => p.id === productId);
    if (!product || !product.images.includes(url)) {
      return { ok: false as const, error: "Image not found on this product." };
    }
    product.images = [url, ...product.images.filter((i) => i !== url)];
    db.audit.unshift({
      id: randomId("aud"),
      actorId: actor.id,
      actorName: actor.name,
      action: "product.hero_set",
      entity: "product",
      entityId: product.slug,
      meta: {},
      createdAt: new Date().toISOString(),
    });
    return { ok: true as const };
  });
}

export async function getProductForAdmin(productId: string) {
  const db = await read();
  const product = db.products.find((p) => p.id === productId);
  if (!product) return null;
  return {
    product,
    category: db.categories.find((c) => c.id === product.categoryId)!,
    variants: db.variants.filter((v) => v.productId === product.id),
  };
}

export async function listProductsForAdmin() {
  const db = await read();
  const categories = new Map(db.categories.map((c) => [c.id, c]));
  return db.products
    .map((p) => {
      const variants = db.variants.filter((v) => v.productId === p.id);
      return {
        product: p,
        categoryName: categories.get(p.categoryId)?.name ?? "—",
        variantCount: variants.length,
        stock: variants.reduce((sum, v) => sum + Math.max(0, v.stock - v.reserved), 0),
        imageCount: p.images.length,
      };
    })
    .sort((a, b) => a.categoryName.localeCompare(b.categoryName) || a.product.name.localeCompare(b.product.name));
}

/* --------------------------------------------------- Catalogue CRUD */

/** Option axes offered when a new product is created, per category family. */
export const FAMILY_AXES: Record<ProductFamily, string[]> = {
  WIG: ["Length", "Density", "Colour"],
  WIG_ACCESSORY: ["Size"],
  LASH: ["Style", "Length"],
  LASH_ACCESSORY: ["Size"],
  FOOTWEAR: ["Size", "Colour"],
  BAG: ["Colour"],
};

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/["']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
}

function uniqueSlug(db: Database, base: string): string {
  const root = base || "product";
  let slug = root;
  let n = 2;
  while (db.products.some((p) => p.slug === slug)) slug = `${root}-${n++}`;
  return slug;
}

function makeSku(db: Database, slug: string, options: Record<string, string>): string {
  const head = slug.split("-").map((part) => part.slice(0, 3).toUpperCase()).join("").slice(0, 9);
  const tail = Object.values(options).join("-").replace(/[^a-zA-Z0-9]/g, "").toUpperCase().slice(0, 8);
  const root = `${head}-${tail || "STD"}`;
  let sku = `${root}-1`;
  let n = 2;
  while (db.variants.some((v) => v.sku === sku)) sku = `${root}-${n++}`;
  return sku;
}

/** Keeps the denormalised list price in step with the live variants. */
function recalcBasePrice(db: Database, productId: string) {
  const product = db.products.find((p) => p.id === productId);
  if (!product) return;
  const live = db.variants.filter((v) => v.productId === productId && v.active);
  if (live.length) product.basePrice = Math.min(...live.map((v) => v.price));
}

function cleanOptions(options: Record<string, string>): Record<string, string> {
  return Object.fromEntries(
    Object.entries(options)
      .map(([k, v]) => [k.trim(), v.trim()])
      .filter(([k, v]) => k && v),
  );
}

export interface NewProductInput {
  name: string;
  categoryId: string;
  summary: string;
  description: string;
  tags: string[];
  featured: boolean;
  options: Record<string, string>;
  price: number;
  stock: number;
}

export async function createProduct(input: NewProductInput, actor: Pick<User, "id" | "name">) {
  return write((db) => {
    const name = input.name.trim();
    if (name.length < 2) return { ok: false as const, error: "Give the product a name." };
    if (!db.categories.some((c) => c.id === input.categoryId)) {
      return { ok: false as const, error: "Choose a category." };
    }
    if (!Number.isFinite(input.price) || input.price <= 0) {
      return { ok: false as const, error: "Enter a selling price." };
    }
    if (!Number.isFinite(input.stock) || input.stock < 0) {
      return { ok: false as const, error: "Enter how many you have in stock." };
    }

    const slug = uniqueSlug(db, slugify(name));
    const productId = randomId("prd");
    const options = cleanOptions(input.options);
    const now = new Date().toISOString();

    db.products.push({
      id: productId,
      categoryId: input.categoryId,
      slug,
      name,
      summary: input.summary.trim(),
      description: input.description.trim(),
      basePrice: Math.round(input.price),
      compareAtPrice: null,
      tags: input.tags,
      images: [],
      featured: input.featured,
      active: true,
      createdAt: now,
    });

    const variantId = randomId("var");
    db.variants.push({
      id: variantId,
      productId,
      sku: makeSku(db, slug, options),
      options,
      price: Math.round(input.price),
      stock: Math.round(input.stock),
      reserved: 0,
      lowStockThreshold: 3,
      active: true,
    });

    // Opening stock is a ledger entry like any other, so the numbers reconcile.
    if (input.stock > 0) {
      db.movements.unshift({
        id: randomId("stk"),
        variantId,
        delta: Math.round(input.stock),
        reason: "RESTOCK",
        reference: "Opening stock",
        actorName: actor.name,
        createdAt: now,
      });
    }

    logAudit(db, {
      actorId: actor.id,
      actorName: actor.name,
      action: "product.created",
      entity: "product",
      entityId: slug,
      meta: { price: input.price, stock: input.stock },
    });

    return { ok: true as const, productId, slug };
  });
}

export async function updateProductDetails(
  productId: string,
  patch: { name: string; categoryId: string; summary: string; description: string; tags: string[]; featured: boolean },
  actor: Pick<User, "id" | "name">,
) {
  return write((db) => {
    const product = db.products.find((p) => p.id === productId);
    if (!product) return { ok: false as const, error: "Product not found." };
    if (patch.name.trim().length < 2) return { ok: false as const, error: "Give the product a name." };
    if (!db.categories.some((c) => c.id === patch.categoryId)) {
      return { ok: false as const, error: "Choose a category." };
    }

    product.name = patch.name.trim();
    product.categoryId = patch.categoryId;
    product.summary = patch.summary.trim();
    product.description = patch.description.trim();
    product.tags = patch.tags;
    product.featured = patch.featured;
    // The slug is deliberately left alone: links already shared must keep working.

    logAudit(db, {
      actorId: actor.id,
      actorName: actor.name,
      action: "product.updated",
      entity: "product",
      entityId: product.slug,
      meta: {},
    });
    return { ok: true as const };
  });
}

export async function addVariant(
  productId: string,
  input: { options: Record<string, string>; price: number; stock: number },
  actor: Pick<User, "id" | "name">,
) {
  return write((db) => {
    const product = db.products.find((p) => p.id === productId);
    if (!product) return { ok: false as const, error: "Product not found." };
    if (!Number.isFinite(input.price) || input.price <= 0) {
      return { ok: false as const, error: "Enter a selling price." };
    }
    if (!Number.isFinite(input.stock) || input.stock < 0) {
      return { ok: false as const, error: "Enter how many you have in stock." };
    }

    const options = cleanOptions(input.options);
    const signature = JSON.stringify(options);
    const clash = db.variants.find(
      (v) => v.productId === productId && JSON.stringify(cleanOptions(v.options)) === signature,
    );
    if (clash) {
      return {
        ok: false as const,
        error: clash.active
          ? "That combination already exists — edit its stock instead."
          : "That combination exists but is retired. Restore it rather than adding a duplicate.",
      };
    }

    const variantId = randomId("var");
    const now = new Date().toISOString();
    db.variants.push({
      id: variantId,
      productId,
      sku: makeSku(db, product.slug, options),
      options,
      price: Math.round(input.price),
      stock: Math.round(input.stock),
      reserved: 0,
      lowStockThreshold: 3,
      active: true,
    });

    if (input.stock > 0) {
      db.movements.unshift({
        id: randomId("stk"),
        variantId,
        delta: Math.round(input.stock),
        reason: "RESTOCK",
        reference: "Opening stock",
        actorName: actor.name,
        createdAt: now,
      });
    }

    recalcBasePrice(db, productId);
    logAudit(db, {
      actorId: actor.id,
      actorName: actor.name,
      action: "variant.added",
      entity: "product",
      entityId: product.slug,
      meta: { options: Object.values(options).join(" · "), stock: input.stock },
    });
    return { ok: true as const };
  });
}

/**
 * Removing stock lines is deliberately two-speed: a variant nobody ever bought
 * is deleted outright, one with sales history is retired so past orders keep
 * their line items. Same rule for products.
 */
export async function removeVariant(variantId: string, actor: Pick<User, "id" | "name">) {
  return write((db) => {
    const variant = db.variants.find((v) => v.id === variantId);
    if (!variant) return { ok: false as const, error: "Option not found." };
    if (variant.reserved > 0) {
      return { ok: false as const, error: "Units are held for open orders — finish or cancel those first." };
    }

    const siblings = db.variants.filter((v) => v.productId === variant.productId && v.active);
    if (siblings.length <= 1) {
      return { ok: false as const, error: "A product needs at least one option. Hide the whole product instead." };
    }

    const sold = db.orderItems.some((i) => i.variantId === variantId);
    if (sold) {
      variant.active = false;
    } else {
      db.variants = db.variants.filter((v) => v.id !== variantId);
      db.movements = db.movements.filter((m) => m.variantId !== variantId);
    }

    recalcBasePrice(db, variant.productId);
    const product = db.products.find((p) => p.id === variant.productId);
    logAudit(db, {
      actorId: actor.id,
      actorName: actor.name,
      action: sold ? "variant.retired" : "variant.deleted",
      entity: "product",
      entityId: product?.slug ?? variant.productId,
      meta: { sku: variant.sku },
    });
    return { ok: true as const, retained: sold };
  });
}

export async function restoreVariant(variantId: string, actor: Pick<User, "id" | "name">) {
  return write((db) => {
    const variant = db.variants.find((v) => v.id === variantId);
    if (!variant) return { ok: false as const, error: "Option not found." };
    variant.active = true;
    recalcBasePrice(db, variant.productId);
    logAudit(db, {
      actorId: actor.id,
      actorName: actor.name,
      action: "variant.restored",
      entity: "variant",
      entityId: variant.sku,
      meta: {},
    });
    return { ok: true as const };
  });
}

export async function removeProduct(productId: string, actor: Pick<User, "id" | "name">) {
  return write((db) => {
    const product = db.products.find((p) => p.id === productId);
    if (!product) return { ok: false as const, error: "Product not found." };

    const variantIds = db.variants.filter((v) => v.productId === productId).map((v) => v.id);
    if (db.variants.some((v) => v.productId === productId && v.reserved > 0)) {
      return { ok: false as const, error: "This product has stock held for open orders — clear those first." };
    }

    const sold = db.orderItems.some((i) => i.productId === productId);
    if (sold) {
      product.active = false;
    } else {
      db.products = db.products.filter((p) => p.id !== productId);
      db.variants = db.variants.filter((v) => v.productId !== productId);
      db.movements = db.movements.filter((m) => !variantIds.includes(m.variantId));
    }

    logAudit(db, {
      actorId: actor.id,
      actorName: actor.name,
      action: sold ? "product.archived" : "product.deleted",
      entity: "product",
      entityId: product.slug,
      meta: { hadSales: sold ? "yes" : "no" },
    });
    return { ok: true as const, retained: sold };
  });
}
