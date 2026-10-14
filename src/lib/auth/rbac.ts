import type { Role } from "@/lib/types";

/**
 * Permissions are code-defined and role-derived. Every mutation in the admin
 * surface routes through `requirePermission`, so adding a role is a one-line
 * change here rather than an audit of every page.
 */
export const PERMISSIONS = [
  "dashboard:view",
  "order:view",
  "order:advance", // move an order along the fulfilment pipeline
  "order:cancel",
  "order:refund",
  "order:assign_rider",
  "delivery:view_own", // rider's own run sheet
  "delivery:complete",
  "product:view",
  "product:edit",
  "inventory:view",
  "inventory:adjust",
  "customer:view",
  "coupon:manage",
  "settings:manage",
  "staff:manage",
  "audit:view",
  "report:view",
] as const;

export type Permission = (typeof PERMISSIONS)[number];

const MANAGER: Permission[] = [
  "dashboard:view",
  "order:view",
  "order:advance",
  "order:cancel",
  "order:refund",
  "order:assign_rider",
  "product:view",
  "product:edit",
  "inventory:view",
  "inventory:adjust",
  "customer:view",
  "coupon:manage",
  "audit:view",
  "report:view",
];

const SALES: Permission[] = [
  "dashboard:view",
  "order:view",
  "order:advance",
  "product:view",
  "inventory:view",
  "customer:view",
  "report:view",
];

const FULFILMENT: Permission[] = [
  "dashboard:view",
  "order:view",
  "order:advance",
  "order:assign_rider",
  "product:view",
  "inventory:view",
  "inventory:adjust",
];

const RIDER: Permission[] = ["delivery:view_own", "delivery:complete", "order:view"];

export const ROLE_PERMISSIONS: Record<Role, readonly Permission[]> = {
  OWNER: PERMISSIONS, // everything, including staff + settings
  MANAGER,
  SALES,
  FULFILMENT,
  RIDER,
  CUSTOMER: [],
};

export const ROLE_LABELS: Record<Role, string> = {
  OWNER: "Owner",
  MANAGER: "Manager",
  SALES: "Sales associate",
  FULFILMENT: "Fulfilment",
  RIDER: "Rider",
  CUSTOMER: "Customer",
};

export const ROLE_DESCRIPTIONS: Record<Role, string> = {
  OWNER: "Full control: staff, settings, refunds, reports.",
  MANAGER: "Runs the shop day to day — orders, catalogue, stock, discounts.",
  SALES: "Takes and advances orders, reads catalogue and customers.",
  FULFILMENT: "Packs orders, adjusts stock, hands over to riders.",
  RIDER: "Sees only the deliveries assigned to them; marks them delivered.",
  CUSTOMER: "Shops, tracks their own orders. No back-office access.",
};

export function can(role: Role, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role].includes(permission);
}

/** Landing page per role after sign-in. */
export function homeFor(role: Role): string {
  if (role === "RIDER") return "/admin/deliveries";
  if (role === "CUSTOMER") return "/account";
  return "/admin";
}
