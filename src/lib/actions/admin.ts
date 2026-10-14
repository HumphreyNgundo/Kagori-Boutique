"use server";

import { revalidatePath } from "next/cache";
import { authorise } from "@/lib/auth/session";
import {
  adjustStock,
  attachProductImage,
  removeProductImage,
  saveSettings,
  setHeroImage,
  setProductPrice,
  setStaffActive,
  toggleProduct,
} from "@/lib/repo/admin";
import { assignRider, confirmPayment, transitionOrder } from "@/lib/repo/orders";
import { uploadProductImage } from "@/lib/media";
import { resetStore } from "@/lib/db";
import type { OrderStatus } from "@/lib/types";
import type { ActionState } from "@/lib/actions/state";



/* ----------------------------------------------------------- orders */

export async function advanceOrderAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const auth = await authorise("order:advance");
  if (!auth.ok) return { error: auth.error, ok: null };

  const orderId = String(formData.get("orderId") ?? "");
  const to = String(formData.get("status") ?? "") as OrderStatus;
  const note = String(formData.get("note") ?? "");

  if (to === "CANCELLED") {
    const cancel = await authorise("order:cancel");
    if (!cancel.ok) return { error: "Only a manager can cancel an order.", ok: null };
  }

  const result = await transitionOrder(orderId, to, note, auth.user);
  if (!result.ok) return { error: result.error, ok: null };

  revalidatePath("/admin", "layout");
  revalidatePath("/order", "layout");
  return { error: null, ok: "Order updated." };
}

export async function confirmPaymentAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const auth = await authorise("order:advance");
  if (!auth.ok) return { error: auth.error, ok: null };

  const code = String(formData.get("code") ?? "");
  const result = await confirmPayment(code, auth.user);
  if (!result.ok) return { error: result.error, ok: null };

  revalidatePath("/admin", "layout");
  revalidatePath(`/order/${code}`);
  return { error: null, ok: "Payment marked as received." };
}

export async function assignRiderAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const auth = await authorise("order:assign_rider");
  if (!auth.ok) return { error: auth.error, ok: null };

  const result = await assignRider(
    String(formData.get("orderId") ?? ""),
    String(formData.get("riderId") ?? ""),
    auth.user,
  );
  if (!result.ok) return { error: result.error, ok: null };

  revalidatePath("/admin", "layout");
  return { error: null, ok: "Rider assigned." };
}

/* -------------------------------------------------------- inventory */

export async function adjustStockAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const auth = await authorise("inventory:adjust");
  if (!auth.ok) return { error: auth.error, ok: null };

  const delta = Number(formData.get("delta") ?? 0);
  if (!Number.isFinite(delta) || delta === 0) return { error: "Enter how many units to add or remove.", ok: null };

  const result = await adjustStock(
    String(formData.get("variantId") ?? ""),
    Math.trunc(delta),
    delta > 0 ? "RESTOCK" : "ADJUSTMENT",
    auth.user,
  );
  if (!result.ok) return { error: result.error, ok: null };

  revalidatePath("/admin", "layout");
  return { error: null, ok: `Stock ${delta > 0 ? "increased" : "reduced"} by ${Math.abs(delta)}.` };
}

/* ---------------------------------------------------------- catalogue */

export async function toggleProductAction(formData: FormData) {
  const auth = await authorise("product:edit");
  if (!auth.ok) return;
  await toggleProduct(String(formData.get("productId") ?? ""), auth.user);
  revalidatePath("/admin", "layout");
  revalidatePath("/", "layout");
}

export async function setPriceAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const auth = await authorise("product:edit");
  if (!auth.ok) return { error: auth.error, ok: null };

  // Prices are typed in shillings, stored in cents.
  const shillings = Number(formData.get("price") ?? 0);
  const result = await setProductPrice(String(formData.get("variantId") ?? ""), Math.round(shillings * 100), auth.user);
  if (!result.ok) return { error: result.error, ok: null };

  revalidatePath("/admin", "layout");
  revalidatePath("/", "layout");
  return { error: null, ok: "Price updated." };
}

/* -------------------------------------------------------------- media */

export async function uploadImageAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const auth = await authorise("product:edit");
  if (!auth.ok) return { error: auth.error, ok: null };

  const productId = String(formData.get("productId") ?? "");
  const slug = String(formData.get("slug") ?? "product");
  const files = formData.getAll("images").filter((f): f is File => f instanceof File && f.size > 0);
  if (!files.length) return { error: "Choose at least one image.", ok: null };

  let uploaded = 0;
  for (const file of files) {
    const result = await uploadProductImage(slug, file);
    if (!result.ok) return { error: result.error, ok: uploaded ? `${uploaded} uploaded before this failed.` : null };
    await attachProductImage(productId, result.url, auth.user);
    uploaded++;
  }

  revalidatePath("/admin", "layout");
  revalidatePath("/", "layout");
  return { error: null, ok: `${uploaded} image${uploaded === 1 ? "" : "s"} uploaded.` };
}

export async function removeImageAction(formData: FormData) {
  const auth = await authorise("product:edit");
  if (!auth.ok) return;
  await removeProductImage(String(formData.get("productId") ?? ""), String(formData.get("url") ?? ""), auth.user);
  revalidatePath("/admin", "layout");
  revalidatePath("/", "layout");
}

export async function setHeroImageAction(formData: FormData) {
  const auth = await authorise("product:edit");
  if (!auth.ok) return;
  await setHeroImage(String(formData.get("productId") ?? ""), String(formData.get("url") ?? ""), auth.user);
  revalidatePath("/admin", "layout");
  revalidatePath("/", "layout");
}

/* ----------------------------------------------------- staff & store */

export async function setStaffActiveAction(formData: FormData) {
  const auth = await authorise("staff:manage");
  if (!auth.ok) return;
  await setStaffActive(
    String(formData.get("userId") ?? ""),
    formData.get("active") === "true",
    auth.user,
  );
  revalidatePath("/admin/staff");
}

export async function saveSettingsAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const auth = await authorise("settings:manage");
  if (!auth.ok) return { error: auth.error, ok: null };

  const freeOver = Number(formData.get("freeDeliveryOver") ?? 0);
  await saveSettings(
    {
      storeName: String(formData.get("storeName") ?? "").trim() || "Kagorim Boutique",
      whatsapp: String(formData.get("whatsapp") ?? "").replace(/\D/g, ""),
      supportPhone: String(formData.get("supportPhone") ?? "").trim(),
      freeDeliveryOver: Math.max(0, Math.round(freeOver * 100)),
      mpesaEnabled: formData.get("mpesaEnabled") === "on",
      cardEnabled: formData.get("cardEnabled") === "on",
      codEnabled: formData.get("codEnabled") === "on",
    },
    auth.user,
  );

  revalidatePath("/", "layout");
  return { error: null, ok: "Settings saved." };
}

/** Puts the demo back to its seeded state — owner only. */
export async function resetDemoAction(_prev: ActionState): Promise<ActionState> {
  const auth = await authorise("settings:manage");
  if (!auth.ok) return { error: auth.error, ok: null };
  await resetStore();
  revalidatePath("/", "layout");
  return { error: null, ok: "Demo data restored." };
}
