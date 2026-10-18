import "server-only";
import { cookies } from "next/headers";
import { read } from "@/lib/db";
import { availableOf } from "@/lib/repo/catalog";
import type { Cart, Coupon, HydratedLine } from "@/lib/types";

export const CART_COOKIE = "kagorim_cart";
export const ORDERS_COOKIE = "kagorim_orders"; // tracking codes this browser placed

const EMPTY: Cart = { lines: [], coupon: null };

/**
 * The cart lives in a cookie, not the database. A shopper can fill a basket
 * and check out without ever creating an account — "self-checkout bila mambo
 * mingi" — and there are no abandoned-cart rows to clean up.
 */
export async function readCart(): Promise<Cart> {
  const raw = (await cookies()).get(CART_COOKIE)?.value;
  if (!raw) return EMPTY;
  try {
    const parsed = JSON.parse(raw) as Cart;
    if (!Array.isArray(parsed.lines)) return EMPTY;
    return {
      lines: parsed.lines
        .filter((l) => typeof l.variantId === "string" && Number.isFinite(l.quantity))
        .map((l) => ({ variantId: l.variantId, quantity: Math.max(1, Math.min(20, Math.trunc(l.quantity))) })),
      coupon: typeof parsed.coupon === "string" ? parsed.coupon : null,
    };
  } catch {
    return EMPTY;
  }
}

export async function writeCart(cart: Cart): Promise<void> {
  const jar = await cookies();
  if (!cart.lines.length) {
    jar.delete(CART_COOKIE);
    return;
  }
  jar.set(CART_COOKIE, JSON.stringify(cart), {
    httpOnly: false, // the header badge reads it client-side
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function rememberOrderCode(code: string): Promise<void> {
  const jar = await cookies();
  const existing = jar.get(ORDERS_COOKIE)?.value?.split(",").filter(Boolean) ?? [];
  const next = [code, ...existing.filter((c) => c !== code)].slice(0, 20);
  jar.set(ORDERS_COOKIE, next.join(","), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 180,
  });
}

export async function myOrderCodes(): Promise<string[]> {
  const jar = await cookies();
  return jar.get(ORDERS_COOKIE)?.value?.split(",").filter(Boolean) ?? [];
}

export interface CartSummary {
  lines: HydratedLine[];
  count: number;
  subtotal: number;
  discount: number;
  coupon: Coupon | null;
  couponError: string | null;
  /** Lines whose requested quantity exceeds live availability. */
  issues: { variantId: string; name: string; available: number }[];
}

export function applyCoupon(subtotal: number, coupon: Coupon | null): number {
  if (!coupon || !coupon.active) return 0;
  if (subtotal < coupon.minSubtotal) return 0;
  if (coupon.expiresAt && Date.parse(coupon.expiresAt) < Date.now()) return 0;
  return coupon.kind === "PERCENT"
    ? Math.round((subtotal * coupon.value) / 100)
    : Math.min(coupon.value, subtotal);
}

export async function summarise(cart: Cart): Promise<CartSummary> {
  const db = await read();
  const lines: HydratedLine[] = [];
  const issues: CartSummary["issues"] = [];

  for (const line of cart.lines) {
    const variant = db.variants.find((v) => v.id === line.variantId && v.active);
    if (!variant) continue;
    const product = db.products.find((p) => p.id === variant.productId && p.active);
    if (!product) continue;
    const category = db.categories.find((c) => c.id === product.categoryId)!;
    const available = availableOf(variant);
    if (available < line.quantity) {
      issues.push({ variantId: variant.id, name: product.name, available });
    }
    lines.push({
      variantId: variant.id,
      quantity: line.quantity,
      product,
      variant,
      category,
      optionsLabel: Object.values(variant.options).join(" · "),
      lineTotal: variant.price * line.quantity,
      available,
    });
  }

  const subtotal = lines.reduce((sum, l) => sum + l.lineTotal, 0);
  const coupon = cart.coupon ? db.coupons.find((c) => c.code === cart.coupon) ?? null : null;
  const discount = applyCoupon(subtotal, coupon);

  let couponError: string | null = null;
  if (cart.coupon && !coupon) couponError = `Coupon ${cart.coupon} not recognised.`;
  else if (coupon && discount === 0) {
    couponError =
      subtotal < coupon.minSubtotal
        ? `Spend ${(coupon.minSubtotal / 100).toLocaleString()} to use ${coupon.code}.`
        : `Coupon ${coupon.code} is no longer active.`;
  }

  return {
    lines,
    count: lines.reduce((sum, l) => sum + l.quantity, 0),
    subtotal,
    discount,
    coupon,
    couponError,
    issues,
  };
}
