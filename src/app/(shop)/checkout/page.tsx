import Link from "next/link";
import { redirect } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { CheckoutForm } from "@/components/shop/CheckoutForm";
import { readCart, summarise } from "@/lib/cart";
import { getSettings, listZones } from "@/lib/repo/catalog";

export const dynamic = "force-dynamic";
export const metadata = { title: "Checkout" };

export default async function CheckoutPage() {
  const cart = await readCart();
  const summary = await summarise(cart);
  if (!summary.lines.length) redirect("/cart");

  const [zones, settings] = await Promise.all([listZones(), getSettings()]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <Link href="/cart" className="btn btn-ghost btn-sm -ml-2">
        <ChevronLeft size={15} /> Back to basket
      </Link>
      <h1 className="mt-3 text-3xl font-extrabold tracking-tight">Checkout</h1>
      <p className="mt-1 text-sm text-muted">
        {summary.count} {summary.count === 1 ? "item" : "items"} · no account required
      </p>

      <div className="mt-8">
        <CheckoutForm
          zones={zones}
          settings={settings}
          subtotal={summary.subtotal}
          discount={summary.discount}
        />
      </div>
    </div>
  );
}
