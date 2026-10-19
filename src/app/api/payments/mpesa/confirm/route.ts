import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { confirmPayment } from "@/lib/repo/orders";

export const dynamic = "force-dynamic";

/**
 * Stands in for Safaricom's Daraja callback: the state change a real STK
 * confirmation performs.
 *
 * Deliberately a route handler rather than a server action. Server action ids
 * are rebuilt on every deployment, so a page rendered by an older deployment
 * posts an id the live one has never heard of and Next answers 404 — which is
 * what a customer saw whenever a deploy landed while their order page sat
 * open. A route path does not change between builds.
 */
export async function POST(request: Request) {
  const form = await request.formData();
  const code = String(form.get("code") ?? "").trim();
  const back = (path: string) => NextResponse.redirect(new URL(path, request.url), 303);

  if (!code) return back("/track");

  const result = await confirmPayment(code, { id: null, name: "M-Pesa (simulated)" });

  revalidatePath(`/order/${code}`);
  revalidatePath("/account");
  revalidatePath("/admin", "layout");

  // The order page reports the outcome; failures are not silent.
  return back(`/order/${code}${result.ok ? "" : "?payment=failed"}`);
}
