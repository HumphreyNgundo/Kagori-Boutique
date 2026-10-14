import type { Order, OrderStatus } from "@/lib/types";

/**
 * Lifecycle rules shared by the server repositories and the client components
 * that render them. Kept free of server-only imports on purpose.
 */

export const STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING_PAYMENT: "Awaiting payment",
  CONFIRMED: "Confirmed",
  PACKED: "Packed",
  DISPATCHED: "Out for delivery",
  READY_FOR_PICKUP: "Ready for pickup",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

/** The only transitions staff may perform. */
export const TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING_PAYMENT: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["PACKED", "CANCELLED"],
  PACKED: ["DISPATCHED", "READY_FOR_PICKUP", "CANCELLED"],
  DISPATCHED: ["DELIVERED"],
  READY_FOR_PICKUP: ["DELIVERED"],
  DELIVERED: [],
  CANCELLED: [],
};

export const OPEN_STATUSES: OrderStatus[] = [
  "PENDING_PAYMENT",
  "CONFIRMED",
  "PACKED",
  "DISPATCHED",
  "READY_FOR_PICKUP",
];

export function nextStatuses(order: Pick<Order, "status" | "fulfilment">): OrderStatus[] {
  const allowed = TRANSITIONS[order.status];
  if (order.status !== "PACKED") return allowed;
  // A packed order goes out with a rider, or waits on the counter — not both.
  return allowed.filter((s) =>
    order.fulfilment === "PICKUP" ? s !== "DISPATCHED" : s !== "READY_FOR_PICKUP",
  );
}
