"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { readCart, writeCart, rememberOrderCode, summarise } from "@/lib/cart";
import { placeOrder, confirmPayment } from "@/lib/repo/orders";
import type { PaymentMethod } from "@/lib/types";

export interface CheckoutState {
  error: string | null;
}

const PHONE = /^(?:\+?254|0)?7\d{8}$|^(?:\+?254|0)?1\d{8}$/;

function normalisePhone(raw: string): string | null {
  const digits = raw.replace(/[\s-]/g, "");
  if (!PHONE.test(digits)) return null;
  const tail = digits.replace(/^\+?254/, "").replace(/^0/, "");
  return `0${tail}`;
}

export async function submitCheckout(
  _prev: CheckoutState,
  formData: FormData,
): Promise<CheckoutState> {
  const name = String(formData.get("name") ?? "").trim();
  const rawPhone = String(formData.get("phone") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const zoneId = String(formData.get("zoneId") ?? "");
  const address = String(formData.get("address") ?? "").trim();
  const note = String(formData.get("note") ?? "").trim();
  const paymentMethod = String(formData.get("paymentMethod") ?? "MPESA") as PaymentMethod;

  if (name.length < 2) return { error: "Tell us who the order is for." };
  const phone = normalisePhone(rawPhone);
  if (!phone) return { error: "Enter a valid Kenyan phone number, e.g. 0712 345 678." };
  if (!zoneId) return { error: "Choose delivery or pickup." };

  const cart = await readCart();
  const summary = await summarise(cart);
  if (!summary.lines.length) return { error: "Your basket is empty." };
  if (summary.issues.length) {
    const issue = summary.issues[0];
    return { error: `${issue.name} — only ${issue.available} left. Update your basket.` };
  }

  const result = await placeOrder({
    lines: summary.lines.map((l) => ({ variantId: l.variantId, quantity: l.quantity })),
    couponCode: summary.discount > 0 ? summary.coupon!.code : null,
    name,
    phone,
    email: email || null,
    zoneId,
    address: address || null,
    paymentMethod,
    note: note || null,
  });

  if (!result.ok) return { error: result.error };

  await writeCart({ lines: [], coupon: null });
  await rememberOrderCode(result.code);
  revalidatePath("/", "layout");
  redirect(`/order/${result.code}`);
}

/**
 * Stands in for the M-Pesa STK callback. In production this is a webhook from
 * Daraja hitting /api/payments/mpesa — the state change it performs is exactly
 * what `confirmPayment` does here.
 */
export async function simulatePayment(formData: FormData) {
  const code = String(formData.get("code") ?? "");
  if (!code) return;
  await confirmPayment(code, { id: null, name: "M-Pesa (simulated)" });
  revalidatePath(`/order/${code}`);
  revalidatePath("/account");
}
