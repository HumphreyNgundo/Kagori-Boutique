/**
 * Kagorim Boutique — canonical domain model.
 * Mirrors db/schema.sql one-to-one so the persistence driver can be swapped
 * (in-memory / Vercel Blob today, Postgres tomorrow) without touching callers.
 */

/* ------------------------------------------------------------------ */
/* Identity & access                                                   */
/* ------------------------------------------------------------------ */

export type Role = "OWNER" | "MANAGER" | "SALES" | "FULFILMENT" | "RIDER" | "CUSTOMER";

export interface User {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  role: Role;
  passwordHash: string;
  active: boolean;
  createdAt: string;
  lastLoginAt: string | null;
}

/* ------------------------------------------------------------------ */
/* Catalog                                                             */
/* ------------------------------------------------------------------ */

/** Attribute families drive which variant options a product exposes. */
export type ProductFamily = "WIG" | "WIG_ACCESSORY" | "LASH" | "LASH_ACCESSORY" | "FOOTWEAR" | "BAG";

export interface Category {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  family: ProductFamily;
  /** Ordering weight on the storefront. */
  position: number;
  active: boolean;
}

export interface Product {
  id: string;
  categoryId: string;
  slug: string;
  name: string;
  summary: string;
  description: string;
  /** Lowest variant price, denormalised for list views (cents, KES). */
  basePrice: number;
  compareAtPrice: number | null;
  tags: string[];
  /** Object-store or /public URLs. Empty -> generated studio art. */
  images: string[];
  featured: boolean;
  active: boolean;
  createdAt: string;
}

/** Option axes differ per family: wigs use length/colour, shoes use size/colour. */
export interface Variant {
  id: string;
  productId: string;
  sku: string;
  /** e.g. { size: "38", colour: "Nude" } or { length: '18"', density: "150%" } */
  options: Record<string, string>;
  price: number;
  stock: number;
  /** Stock committed to unfulfilled orders; available = stock - reserved. */
  reserved: number;
  lowStockThreshold: number;
  active: boolean;
}

/* ------------------------------------------------------------------ */
/* Customers & orders                                                  */
/* ------------------------------------------------------------------ */

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  /** Set when the shopper also has a login; guests stay null. */
  userId: string | null;
  createdAt: string;
  notes: string | null;
}

export type OrderStatus =
  | "PENDING_PAYMENT"
  | "CONFIRMED"
  | "PACKED"
  | "DISPATCHED"
  | "READY_FOR_PICKUP"
  | "DELIVERED"
  | "CANCELLED";

export type PaymentMethod = "MPESA" | "CARD" | "ON_DELIVERY";
export type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "REFUNDED";
export type FulfilmentMethod = "DELIVERY" | "PICKUP";

export interface OrderItem {
  id: string;
  orderId: string;
  variantId: string;
  productId: string;
  /** Snapshot — catalogue edits must never rewrite history. */
  name: string;
  optionsLabel: string;
  sku: string;
  unitPrice: number;
  quantity: number;
}

export interface OrderEvent {
  id: string;
  orderId: string;
  status: OrderStatus;
  note: string;
  /** null = system/automated transition. */
  actorId: string | null;
  actorName: string;
  createdAt: string;
}

export interface Order {
  id: string;
  /** Human-facing tracking code, e.g. KGB-7F3Q2A. */
  code: string;
  customerId: string;
  status: OrderStatus;
  fulfilment: FulfilmentMethod;
  zoneId: string;
  address: string | null;
  deliveryFee: number;
  subtotal: number;
  discount: number;
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  paymentRef: string | null;
  couponCode: string | null;
  customerNote: string | null;
  riderId: string | null;
  createdAt: string;
  updatedAt: string;
}

/* ------------------------------------------------------------------ */
/* Operations                                                          */
/* ------------------------------------------------------------------ */

export interface DeliveryZone {
  id: string;
  name: string;
  fee: number;
  etaHours: number;
  method: FulfilmentMethod;
  active: boolean;
}

export interface Coupon {
  code: string;
  kind: "PERCENT" | "FIXED";
  value: number;
  minSubtotal: number;
  active: boolean;
  expiresAt: string | null;
}

/** Append-only stock movements — the auditable source of truth for inventory. */
export interface StockMovement {
  id: string;
  variantId: string;
  delta: number;
  reason: "RESTOCK" | "SALE" | "RELEASE" | "ADJUSTMENT";
  reference: string | null;
  actorName: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  actorId: string | null;
  actorName: string;
  action: string;
  entity: string;
  entityId: string;
  meta: Record<string, string | number | null>;
  createdAt: string;
}

export interface StoreSettings {
  storeName: string;
  currency: string;
  whatsapp: string;
  supportPhone: string;
  freeDeliveryOver: number;
  mpesaEnabled: boolean;
  cardEnabled: boolean;
  codEnabled: boolean;
}

/* ------------------------------------------------------------------ */
/* Cart (cookie-resident, never persisted server-side)                 */
/* ------------------------------------------------------------------ */

export interface CartLine {
  variantId: string;
  quantity: number;
}

export interface Cart {
  lines: CartLine[];
  coupon: string | null;
}

/** A cart line resolved against the live catalogue for rendering. */
export interface HydratedLine {
  variantId: string;
  quantity: number;
  product: Product;
  variant: Variant;
  category: Category;
  optionsLabel: string;
  lineTotal: number;
  available: number;
}

export interface Database {
  /** Bumped when the seed itself changes; a mismatch re-seeds the store. */
  version: number;
  /** Set on every persisted write — lets /api/health reveal a lost snapshot. */
  savedAt?: string;
  users: User[];
  categories: Category[];
  products: Product[];
  variants: Variant[];
  customers: Customer[];
  orders: Order[];
  orderItems: OrderItem[];
  orderEvents: OrderEvent[];
  zones: DeliveryZone[];
  coupons: Coupon[];
  movements: StockMovement[];
  audit: AuditLog[];
  settings: StoreSettings;
}
