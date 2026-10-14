import "server-only";
import { read, write } from "@/lib/db";
import { randomId } from "@/lib/ids";
import { availableOf } from "@/lib/repo/catalog";
import { OPEN_STATUSES } from "@/lib/order-status";
import type { StoreSettings, User } from "@/lib/types";

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
