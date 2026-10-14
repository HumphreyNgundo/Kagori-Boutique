import "server-only";
import { read, write } from "@/lib/db";
import { randomId, trackingCode, mpesaRef } from "@/lib/ids";
import { applyCoupon } from "@/lib/cart";
import { nextStatuses as computeNext, OPEN_STATUSES as OPEN, STATUS_LABELS } from "@/lib/order-status";
import type {
  AuditLog,
  Customer,
  Database,
  FulfilmentMethod,
  Order,
  OrderEvent,
  OrderItem,
  OrderStatus,
  PaymentMethod,
  User,
} from "@/lib/types";

export { TRANSITIONS, OPEN_STATUSES, nextStatuses, STATUS_LABELS } from "@/lib/order-status";

/* ------------------------------------------------------------------ */
/* Reads                                                               */
/* ------------------------------------------------------------------ */

export interface OrderDetail {
  order: Order;
  items: OrderItem[];
  events: OrderEvent[];
  customer: Customer;
  zoneName: string;
  riderName: string | null;
}

function detailFrom(db: Database, order: Order): OrderDetail {
  return {
    order,
    items: db.orderItems.filter((i) => i.orderId === order.id),
    events: db.orderEvents
      .filter((e) => e.orderId === order.id)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
    customer: db.customers.find((c) => c.id === order.customerId)!,
    zoneName: db.zones.find((z) => z.id === order.zoneId)?.name ?? "—",
    riderName: order.riderId ? db.users.find((u) => u.id === order.riderId)?.name ?? null : null,
  };
}

export async function getOrderByCode(code: string): Promise<OrderDetail | null> {
  const db = await read();
  const order = db.orders.find((o) => o.code.toUpperCase() === code.toUpperCase().trim());
  return order ? detailFrom(db, order) : null;
}

export async function getOrderById(id: string): Promise<OrderDetail | null> {
  const db = await read();
  const order = db.orders.find((o) => o.id === id);
  return order ? detailFrom(db, order) : null;
}

export async function getOrdersByCodes(codes: string[]): Promise<OrderDetail[]> {
  const db = await read();
  return db.orders
    .filter((o) => codes.includes(o.code))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map((o) => detailFrom(db, o));
}

export interface OrderFilter {
  status?: OrderStatus | "OPEN" | "ALL";
  q?: string;
  riderId?: string;
  customerId?: string;
}

export async function listOrders(filter: OrderFilter = {}): Promise<OrderDetail[]> {
  const db = await read();
  let orders = [...db.orders];

  if (filter.status && filter.status !== "ALL") {
    orders =
      filter.status === "OPEN"
        ? orders.filter((o) => OPEN.includes(o.status))
        : orders.filter((o) => o.status === filter.status);
  }
  if (filter.riderId) orders = orders.filter((o) => o.riderId === filter.riderId);
  if (filter.customerId) orders = orders.filter((o) => o.customerId === filter.customerId);

  if (filter.q) {
    const needle = filter.q.toLowerCase().trim();
    const customers = new Map(db.customers.map((c) => [c.id, c]));
    orders = orders.filter((o) => {
      const c = customers.get(o.customerId);
      return [o.code, c?.name, c?.phone, o.paymentRef].join(" ").toLowerCase().includes(needle);
    });
  }

  return orders
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map((o) => detailFrom(db, o));
}

/* ------------------------------------------------------------------ */
/* Writes                                                              */
/* ------------------------------------------------------------------ */

function logAudit(db: Database, entry: Omit<AuditLog, "id" | "createdAt">) {
  db.audit.unshift({ ...entry, id: randomId("aud"), createdAt: new Date().toISOString() });
  db.audit = db.audit.slice(0, 500);
}

/** Commit reserved units: stock leaves the shelf and the ledger records it. */
function commitStock(db: Database, order: Order, actorName: string) {
  for (const item of db.orderItems.filter((i) => i.orderId === order.id)) {
    const variant = db.variants.find((v) => v.id === item.variantId);
    if (!variant) continue;
    variant.reserved = Math.max(0, variant.reserved - item.quantity);
    variant.stock = Math.max(0, variant.stock - item.quantity);
    db.movements.unshift({
      id: randomId("stk"),
      variantId: variant.id,
      delta: -item.quantity,
      reason: "SALE",
      reference: order.code,
      actorName,
      createdAt: new Date().toISOString(),
    });
  }
}

/** Give reserved units back when an unpaid order dies. */
function releaseStock(db: Database, order: Order, actorName: string) {
  for (const item of db.orderItems.filter((i) => i.orderId === order.id)) {
    const variant = db.variants.find((v) => v.id === item.variantId);
    if (!variant) continue;
    variant.reserved = Math.max(0, variant.reserved - item.quantity);
    db.movements.unshift({
      id: randomId("stk"),
      variantId: variant.id,
      delta: item.quantity,
      reason: "RELEASE",
      reference: order.code,
      actorName,
      createdAt: new Date().toISOString(),
    });
  }
}

function pushEvent(
  db: Database,
  orderId: string,
  status: OrderStatus,
  note: string,
  actor: { id: string | null; name: string },
) {
  db.orderEvents.push({
    id: randomId("evt"),
    orderId,
    status,
    note,
    actorId: actor.id,
    actorName: actor.name,
    createdAt: new Date().toISOString(),
  });
}

export interface PlaceOrderInput {
  lines: { variantId: string; quantity: number }[];
  couponCode: string | null;
  name: string;
  phone: string;
  email: string | null;
  zoneId: string;
  address: string | null;
  paymentMethod: PaymentMethod;
  note: string | null;
}

export type PlaceOrderResult =
  | { ok: true; code: string; status: OrderStatus }
  | { ok: false; error: string };

export async function placeOrder(input: PlaceOrderInput): Promise<PlaceOrderResult> {
  return write((db) => {
    if (!input.lines.length) return { ok: false as const, error: "Your basket is empty." };

    const zone = db.zones.find((z) => z.id === input.zoneId && z.active);
    if (!zone) return { ok: false as const, error: "Choose a delivery option." };

    const fulfilment: FulfilmentMethod = zone.method;
    if (fulfilment === "DELIVERY" && !input.address?.trim()) {
      return { ok: false as const, error: "We need a delivery address." };
    }

    // Re-check availability inside the write — the page may be stale.
    const resolved = [];
    for (const line of input.lines) {
      const variant = db.variants.find((v) => v.id === line.variantId && v.active);
      if (!variant) return { ok: false as const, error: "An item in your basket is no longer available." };
      const product = db.products.find((p) => p.id === variant.productId);
      if (!product) return { ok: false as const, error: "An item in your basket is no longer available." };
      const available = variant.stock - variant.reserved;
      if (available < line.quantity) {
        return {
          ok: false as const,
          error: `${product.name} — only ${available} left. Adjust the quantity and try again.`,
        };
      }
      resolved.push({ variant, product, quantity: line.quantity });
    }

    const subtotal = resolved.reduce((sum, r) => sum + r.variant.price * r.quantity, 0);
    const coupon = input.couponCode ? db.coupons.find((c) => c.code === input.couponCode) ?? null : null;
    const discount = applyCoupon(subtotal, coupon);
    const freeDelivery = subtotal >= db.settings.freeDeliveryOver;
    const deliveryFee = fulfilment === "PICKUP" || freeDelivery ? 0 : zone.fee;

    if (input.paymentMethod === "ON_DELIVERY" && !db.settings.codEnabled) {
      return { ok: false as const, error: "Pay on delivery is currently unavailable." };
    }

    // One customer record per phone number — repeat shoppers get history.
    const phone = input.phone.trim();
    let customer = db.customers.find((c) => c.phone === phone);
    if (!customer) {
      customer = {
        id: randomId("cus"),
        name: input.name.trim(),
        phone,
        email: input.email?.trim() || null,
        userId: null,
        createdAt: new Date().toISOString(),
        notes: null,
      };
      db.customers.push(customer);
    } else {
      customer.name = input.name.trim() || customer.name;
      if (input.email?.trim()) customer.email = input.email.trim();
    }

    const code = trackingCode();
    const orderId = randomId("ord");
    const now = new Date().toISOString();
    const instantPay = input.paymentMethod !== "ON_DELIVERY";

    const order: Order = {
      id: orderId,
      code,
      customerId: customer.id,
      status: instantPay ? "PENDING_PAYMENT" : "CONFIRMED",
      fulfilment,
      zoneId: zone.id,
      address: fulfilment === "DELIVERY" ? input.address!.trim() : null,
      deliveryFee,
      subtotal,
      discount,
      total: subtotal - discount + deliveryFee,
      paymentMethod: input.paymentMethod,
      paymentStatus: "PENDING",
      paymentRef: null,
      couponCode: discount > 0 ? coupon!.code : null,
      customerNote: input.note?.trim() || null,
      riderId: null,
      createdAt: now,
      updatedAt: now,
    };
    db.orders.push(order);

    for (const r of resolved) {
      db.orderItems.push({
        id: randomId("oit"),
        orderId,
        variantId: r.variant.id,
        productId: r.product.id,
        name: r.product.name,
        optionsLabel: Object.values(r.variant.options).join(" · "),
        sku: r.variant.sku,
        unitPrice: r.variant.price,
        quantity: r.quantity,
      });
      // Hold the stock the moment the order exists, so two shoppers can't
      // buy the last pair of 38s in the same minute.
      r.variant.reserved += r.quantity;
    }

    pushEvent(db, orderId, order.status, instantPay
      ? `Order placed. Awaiting ${input.paymentMethod === "MPESA" ? "M-Pesa" : "card"} payment.`
      : "Order placed — paying on delivery.",
      { id: null, name: "System" });

    if (!instantPay) commitStock(db, order, "System");

    logAudit(db, {
      actorId: null,
      actorName: customer.name,
      action: "order.placed",
      entity: "order",
      entityId: code,
      meta: { total: order.total, items: resolved.length },
    });

    return { ok: true as const, code, status: order.status };
  });
}

/** Simulated payment confirmation — stands in for the M-Pesa STK callback. */
export async function confirmPayment(code: string, actor: { id: string | null; name: string }) {
  return write((db) => {
    const order = db.orders.find((o) => o.code === code);
    if (!order) return { ok: false as const, error: "Order not found." };
    if (order.paymentStatus === "PAID") return { ok: true as const };
    if (order.status === "CANCELLED") return { ok: false as const, error: "Order was cancelled." };

    order.paymentStatus = "PAID";
    order.paymentRef = mpesaRef();
    order.status = "CONFIRMED";
    order.updatedAt = new Date().toISOString();
    commitStock(db, order, actor.name);
    pushEvent(db, order.id, "CONFIRMED",
      `${order.paymentMethod === "MPESA" ? "M-Pesa" : "Card"} payment confirmed · ref ${order.paymentRef}`,
      actor);
    logAudit(db, {
      actorId: actor.id,
      actorName: actor.name,
      action: "payment.confirmed",
      entity: "order",
      entityId: order.code,
      meta: { ref: order.paymentRef, total: order.total },
    });
    return { ok: true as const };
  });
}

export async function transitionOrder(
  orderId: string,
  to: OrderStatus,
  note: string,
  actor: Pick<User, "id" | "name">,
) {
  return write((db) => {
    const order = db.orders.find((o) => o.id === orderId);
    if (!order) return { ok: false as const, error: "Order not found." };
    if (!computeNext(order).includes(to)) {
      return { ok: false as const, error: `Cannot move ${STATUS_LABELS[order.status]} → ${STATUS_LABELS[to]}.` };
    }

    if (to === "CANCELLED") {
      if (order.paymentStatus === "PAID") {
        order.paymentStatus = "REFUNDED";
        // Paid stock already left the shelf — put it back.
        for (const item of db.orderItems.filter((i) => i.orderId === order.id)) {
          const variant = db.variants.find((v) => v.id === item.variantId);
          if (!variant) continue;
          variant.stock += item.quantity;
          db.movements.unshift({
            id: randomId("stk"),
            variantId: variant.id,
            delta: item.quantity,
            reason: "RESTOCK",
            reference: `${order.code} cancelled`,
            actorName: actor.name,
            createdAt: new Date().toISOString(),
          });
        }
      } else {
        releaseStock(db, order, actor.name);
      }
    }

    if (to === "DELIVERED" && order.paymentMethod === "ON_DELIVERY") {
      order.paymentStatus = "PAID";
      order.paymentRef = `COD-${order.code.slice(4)}`;
    }

    order.status = to;
    order.updatedAt = new Date().toISOString();
    pushEvent(db, order.id, to, note || STATUS_LABELS[to], { id: actor.id, name: actor.name });
    logAudit(db, {
      actorId: actor.id,
      actorName: actor.name,
      action: `order.${to.toLowerCase()}`,
      entity: "order",
      entityId: order.code,
      meta: { note: note || null },
    });
    return { ok: true as const };
  });
}

export async function assignRider(orderId: string, riderId: string, actor: Pick<User, "id" | "name">) {
  return write((db) => {
    const order = db.orders.find((o) => o.id === orderId);
    if (!order) return { ok: false as const, error: "Order not found." };
    const rider = db.users.find((u) => u.id === riderId && u.role === "RIDER");
    if (!rider) return { ok: false as const, error: "Rider not found." };
    order.riderId = rider.id;
    order.updatedAt = new Date().toISOString();
    pushEvent(db, order.id, order.status, `Assigned to ${rider.name}.`, { id: actor.id, name: actor.name });
    logAudit(db, {
      actorId: actor.id,
      actorName: actor.name,
      action: "order.rider_assigned",
      entity: "order",
      entityId: order.code,
      meta: { rider: rider.name },
    });
    return { ok: true as const };
  });
}
