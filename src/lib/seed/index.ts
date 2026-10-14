import type {
  Coupon,
  Customer,
  Database,
  DeliveryZone,
  Order,
  OrderEvent,
  OrderItem,
  StockMovement,
  StoreSettings,
  Variant,
} from "@/lib/types";
import { CATEGORIES, buildCatalog } from "@/lib/seed/catalog";
import { buildUsers } from "@/lib/seed/users";

export const ZONES: DeliveryZone[] = [
  { id: "zone_pickup", name: "Pickup — Kagorim Shop, Nairobi CBD", fee: 0, etaHours: 4, method: "PICKUP", active: true },
  { id: "zone_cbd", name: "Nairobi CBD & Westlands", fee: 20000, etaHours: 6, method: "DELIVERY", active: true },
  { id: "zone_nairobi", name: "Greater Nairobi (Kasarani, Rongai, Ruiru…)", fee: 30000, etaHours: 24, method: "DELIVERY", active: true },
  { id: "zone_upcountry", name: "Upcountry courier (Mombasa, Kisumu, Eldoret…)", fee: 45000, etaHours: 72, method: "DELIVERY", active: true },
];

export const COUPONS: Coupon[] = [
  { code: "KARIBU10", kind: "PERCENT", value: 10, minSubtotal: 200000, active: true, expiresAt: null },
  { code: "LIPA500", kind: "FIXED", value: 50000, minSubtotal: 500000, active: true, expiresAt: null },
];

export const SETTINGS: StoreSettings = {
  storeName: "Kagorim Boutique",
  currency: "KES",
  whatsapp: "254712000000",
  supportPhone: "0712 000 000",
  freeDeliveryOver: 1000000, // free delivery over KES 10,000
  mpesaEnabled: true,
  cardEnabled: true,
  codEnabled: true,
};

/* ------------------------------------------------------------------ */
/* Demo order history — deterministic so the dashboard always looks    */
/* alive on a cold start, but never random between two page loads.     */
/* ------------------------------------------------------------------ */

function mulberry32(seed: number) {
  return function next() {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const CUSTOMER_SEEDS: [string, string, string | null][] = [
  ["Aisha Noor", "0722111222", "shopper@example.com"],
  ["Faith Chebet", "0733445566", "faith.c@example.com"],
  ["Lydia Akinyi", "0701223344", null],
  ["Tabitha Mumo", "0745998877", "tmumo@example.com"],
  ["Joy Wairimu", "0716334455", null],
  ["Esther Kilonzo", "0729887766", "esther.k@example.com"],
  ["Sharon Atieno", "0754112233", null],
  ["Naomi Jepkosgei", "0768443322", "naomi.j@example.com"],
];

const NOTES = [
  "Please call when you reach the gate.",
  "",
  "Gift wrap if possible 🙏",
  "",
  "Deliver after 5pm, I'm at work.",
  "",
];

type Pipeline = { status: Order["status"]; paid: boolean; steps: [Order["status"], string][] };

const PIPELINES: Pipeline[] = [
  {
    status: "DELIVERED", paid: true,
    steps: [
      ["PENDING_PAYMENT", "Order placed via self-checkout."],
      ["CONFIRMED", "M-Pesa payment confirmed."],
      ["PACKED", "Items picked and packed."],
      ["DISPATCHED", "Handed to rider."],
      ["DELIVERED", "Delivered and signed for."],
    ],
  },
  {
    status: "DISPATCHED", paid: true,
    steps: [
      ["PENDING_PAYMENT", "Order placed via self-checkout."],
      ["CONFIRMED", "M-Pesa payment confirmed."],
      ["PACKED", "Items picked and packed."],
      ["DISPATCHED", "Rider on the way."],
    ],
  },
  {
    status: "PACKED", paid: true,
    steps: [
      ["PENDING_PAYMENT", "Order placed via self-checkout."],
      ["CONFIRMED", "Payment confirmed."],
      ["PACKED", "Packed, waiting for rider."],
    ],
  },
  {
    status: "CONFIRMED", paid: true,
    steps: [
      ["PENDING_PAYMENT", "Order placed via self-checkout."],
      ["CONFIRMED", "Payment confirmed."],
    ],
  },
  {
    status: "READY_FOR_PICKUP", paid: true,
    steps: [
      ["PENDING_PAYMENT", "Order placed via self-checkout."],
      ["CONFIRMED", "Payment confirmed."],
      ["PACKED", "Packed for collection."],
      ["READY_FOR_PICKUP", "Ready at the CBD shop."],
    ],
  },
  {
    status: "PENDING_PAYMENT", paid: false,
    steps: [["PENDING_PAYMENT", "Awaiting M-Pesa confirmation."]],
  },
  {
    status: "CANCELLED", paid: false,
    steps: [
      ["PENDING_PAYMENT", "Order placed via self-checkout."],
      ["CANCELLED", "Customer cancelled — wrong size ordered."],
    ],
  },
];

const CODES = [
  "KGB-7F3Q2A", "KGB-M4R8TK", "KGB-P9XD2V", "KGB-H6CN4L", "KGB-T2WY8B",
  "KGB-Z5KQ7M", "KGB-B8VJ3R", "KGB-Q4LT6N", "KGB-D7SH9P", "KGB-F3GM5W",
  "KGB-X9BR4C", "KGB-K6ND2T", "KGB-V2PQ8H", "KGB-N5TJ7Z",
];

function buildHistory(variants: Variant[], now: number) {
  const rnd = mulberry32(20260214);
  const customers: Customer[] = CUSTOMER_SEEDS.map(([name, phone, email], i) => ({
    id: `cus_${i + 1}`,
    name,
    phone,
    email,
    userId: i === 0 ? "usr_customer" : null,
    createdAt: new Date(now - (60 - i * 3) * 864e5).toISOString(),
    notes: null,
  }));

  const orders: Order[] = [];
  const items: OrderItem[] = [];
  const events: OrderEvent[] = [];
  const movements: StockMovement[] = [];
  const sellable = variants.filter((v) => v.stock > 1);

  CODES.forEach((code, i) => {
    const pipeline = PIPELINES[i % PIPELINES.length];
    const customer = customers[Math.floor(rnd() * customers.length)];
    const placedAt = now - Math.floor(rnd() * 20 + i * 1.8) * 36e5 * 24 * 0.1 - i * 36e5 * 38;
    const orderId = `ord_${i + 1}`;
    const lineCount = 1 + Math.floor(rnd() * 2.6);

    let subtotal = 0;
    const used = new Set<string>();
    for (let l = 0; l < lineCount; l++) {
      const variant = sellable[Math.floor(rnd() * sellable.length)];
      if (used.has(variant.id)) continue;
      used.add(variant.id);
      const quantity = rnd() > 0.78 ? 2 : 1;
      subtotal += variant.price * quantity;
      items.push({
        id: `oit_${orderId}_${l}`,
        orderId,
        variantId: variant.id,
        productId: variant.productId,
        name: "", // filled by the caller, which has the product names
        optionsLabel: Object.values(variant.options).join(" · "),
        sku: variant.sku,
        unitPrice: variant.price,
        quantity,
      });
      if (pipeline.paid) {
        movements.push({
          id: `stk_${orderId}_${l}`,
          variantId: variant.id,
          delta: -quantity,
          reason: "SALE",
          reference: code,
          actorName: "System",
          createdAt: new Date(placedAt + 36e5).toISOString(),
        });
      }
    }

    const pickup = pipeline.status === "READY_FOR_PICKUP";
    const zone = pickup ? ZONES[0] : ZONES[1 + Math.floor(rnd() * 3)];
    const deliveryFee = subtotal >= SETTINGS.freeDeliveryOver && !pickup ? 0 : zone.fee;
    const method: Order["paymentMethod"] = pipeline.paid ? (rnd() > 0.25 ? "MPESA" : "CARD") : "MPESA";

    orders.push({
      id: orderId,
      code,
      customerId: customer.id,
      status: pipeline.status,
      fulfilment: zone.method,
      zoneId: zone.id,
      address: zone.method === "DELIVERY" ? "Westlands, Nairobi — Rhapta Road, Apt 4B" : null,
      deliveryFee,
      subtotal,
      discount: 0,
      total: subtotal + deliveryFee,
      paymentMethod: method,
      paymentStatus: pipeline.paid ? "PAID" : pipeline.status === "CANCELLED" ? "FAILED" : "PENDING",
      paymentRef: pipeline.paid ? `R${code.slice(4)}${i}` : null,
      couponCode: null,
      customerNote: NOTES[i % NOTES.length] || null,
      riderId: ["DISPATCHED", "DELIVERED"].includes(pipeline.status) ? "usr_rider" : null,
      createdAt: new Date(placedAt).toISOString(),
      updatedAt: new Date(placedAt + pipeline.steps.length * 18e5).toISOString(),
    });

    pipeline.steps.forEach(([status, note], si) => {
      events.push({
        id: `evt_${orderId}_${si}`,
        orderId,
        status,
        note,
        actorId: si === 0 ? null : "usr_fulfil",
        actorName: si === 0 ? "System" : "Dennis Mwangi",
        createdAt: new Date(placedAt + si * 18e5).toISOString(),
      });
    });
  });

  return { customers, orders, items, events, movements };
}

/** `now` defaults to the moment of seeding so demo history is always recent. */
export function buildDatabase(now = Date.now()): Database {
  const { products, variants } = buildCatalog();
  const history = buildHistory(variants, now);
  const productName = new Map(products.map((p) => [p.id, p.name]));

  const orderItems = history.items.map((item) => ({
    ...item,
    name: productName.get(item.productId) ?? "Item",
  }));

  // Reflect sold stock so the inventory numbers tie out with order history.
  const byVariant = new Map<string, number>();
  for (const m of history.movements) {
    byVariant.set(m.variantId, (byVariant.get(m.variantId) ?? 0) + m.delta);
  }
  const adjusted = variants.map((v) => ({
    ...v,
    stock: Math.max(0, v.stock + (byVariant.get(v.id) ?? 0)),
  }));

  return {
    users: buildUsers(),
    categories: CATEGORIES,
    products,
    variants: adjusted,
    customers: history.customers,
    orders: history.orders,
    orderItems,
    orderEvents: history.events,
    zones: ZONES,
    coupons: COUPONS,
    movements: history.movements,
    audit: [
      {
        id: "aud_seed",
        actorId: null,
        actorName: "System",
        action: "store.seeded",
        entity: "store",
        entityId: "kagorim",
        meta: { products: products.length, orders: history.orders.length },
        createdAt: new Date(now).toISOString(),
      },
    ],
    settings: SETTINGS,
  };
}
