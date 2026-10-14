"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { readCart, writeCart } from "@/lib/cart";
import { read } from "@/lib/db";

const MAX_PER_LINE = 20;

export async function addToCart(formData: FormData) {
  const variantId = String(formData.get("variantId") ?? "");
  const quantity = Math.max(1, Math.min(MAX_PER_LINE, Number(formData.get("quantity") ?? 1)));
  const redirectTo = String(formData.get("redirectTo") ?? "");
  if (!variantId) return;

  const db = await read();
  const variant = db.variants.find((v) => v.id === variantId && v.active);
  if (!variant) return;

  const cart = await readCart();
  const existing = cart.lines.find((l) => l.variantId === variantId);
  const available = Math.max(0, variant.stock - variant.reserved);
  const nextQty = Math.min(available, (existing?.quantity ?? 0) + quantity);

  if (nextQty <= 0) return;
  if (existing) existing.quantity = nextQty;
  else cart.lines.push({ variantId, quantity: nextQty });

  await writeCart(cart);
  revalidatePath("/", "layout");
  if (redirectTo) redirect(redirectTo);
}

export async function setLineQuantity(formData: FormData) {
  const variantId = String(formData.get("variantId") ?? "");
  const quantity = Number(formData.get("quantity") ?? 0);
  const cart = await readCart();

  if (quantity <= 0) {
    cart.lines = cart.lines.filter((l) => l.variantId !== variantId);
  } else {
    const line = cart.lines.find((l) => l.variantId === variantId);
    if (line) line.quantity = Math.min(MAX_PER_LINE, quantity);
  }

  await writeCart(cart);
  revalidatePath("/cart");
  revalidatePath("/checkout");
}

export async function removeLine(formData: FormData) {
  const variantId = String(formData.get("variantId") ?? "");
  const cart = await readCart();
  cart.lines = cart.lines.filter((l) => l.variantId !== variantId);
  await writeCart(cart);
  revalidatePath("/cart");
  revalidatePath("/checkout");
}

export async function applyCouponCode(formData: FormData) {
  const code = String(formData.get("coupon") ?? "").trim().toUpperCase();
  const cart = await readCart();
  cart.coupon = code || null;
  await writeCart(cart);
  revalidatePath("/cart");
  revalidatePath("/checkout");
}

export async function clearCart() {
  await writeCart({ lines: [], coupon: null });
  revalidatePath("/", "layout");
}
