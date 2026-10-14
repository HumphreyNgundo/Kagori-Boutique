import Link from "next/link";
import { ArrowRight, ShoppingBag, Tag, Trash2 } from "lucide-react";
import { ProductImage } from "@/components/ProductImage";
import { readCart, summarise } from "@/lib/cart";
import { getSettings } from "@/lib/repo/catalog";
import { setLineQuantity, removeLine, applyCouponCode } from "@/lib/actions/cart";
import { ksh } from "@/lib/money";

export const dynamic = "force-dynamic";
export const metadata = { title: "Your basket" };

export default async function CartPage() {
  const [cart, settings] = await Promise.all([readCart(), getSettings()]);
  const summary = await summarise(cart);
  const freeDeliveryGap = settings.freeDeliveryOver - summary.subtotal;

  if (!summary.lines.length) {
    return (
      <div className="mx-auto grid max-w-md place-items-center gap-4 px-4 py-28 text-center">
        <span className="grid h-16 w-16 place-items-center rounded-full bg-[var(--brand-soft)] text-brand">
          <ShoppingBag size={26} />
        </span>
        <h1 className="text-2xl font-bold tracking-tight">Your basket is empty</h1>
        <p className="text-sm text-muted">
          Browse wigs, lashes, shoes and bags — add what you like and check out in two minutes.
        </p>
        <Link href="/shop" className="btn btn-primary">Start shopping <ArrowRight size={16} /></Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-extrabold tracking-tight">Your basket</h1>
      <p className="mt-1 text-sm text-muted">{summary.count} {summary.count === 1 ? "item" : "items"}</p>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1.6fr_1fr] lg:items-start">
        <ul className="space-y-4">
          {summary.lines.map((line) => (
            <li key={line.variantId} className="card flex gap-4 p-4">
              <Link href={`/p/${line.product.slug}`} className="shrink-0">
                <ProductImage
                  src={line.product.images[0] ?? null}
                  alt={line.product.name}
                  seed={line.product.slug}
                  family={line.category.family}
                  sizes="96px"
                  className="h-24 w-24 rounded-xl"
                />
              </Link>

              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="eyebrow">{line.category.name}</p>
                    <Link href={`/p/${line.product.slug}`} className="block truncate text-sm font-semibold hover:text-brand">
                      {line.product.name}
                    </Link>
                    <p className="mt-0.5 truncate text-xs text-subtle">{line.optionsLabel}</p>
                  </div>
                  <form action={removeLine}>
                    <input type="hidden" name="variantId" value={line.variantId} />
                    <button type="submit" className="btn btn-ghost btn-sm !px-2" aria-label={`Remove ${line.product.name}`}>
                      <Trash2 size={15} />
                    </button>
                  </form>
                </div>

                {line.available < line.quantity && (
                  <p className="mt-2 text-xs font-semibold text-[var(--danger)]">
                    Only {line.available} left — reduce the quantity to check out.
                  </p>
                )}

                <div className="mt-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-1 rounded-full border border-line-strong p-1">
                    {[-1, 1].map((step) => (
                      <form key={step} action={setLineQuantity}>
                        <input type="hidden" name="variantId" value={line.variantId} />
                        <input type="hidden" name="quantity" value={line.quantity + step} />
                        <button
                          type="submit"
                          className="grid h-7 w-7 place-items-center rounded-full text-muted transition hover:bg-surface-2 hover:text-ink disabled:opacity-40"
                          aria-label={step < 0 ? "Decrease quantity" : "Increase quantity"}
                          disabled={step > 0 && line.quantity >= line.available}
                        >
                          {step < 0 ? "−" : "+"}
                        </button>
                      </form>
                    ))}
                    <span className="w-7 text-center text-sm font-semibold tabular-nums">{line.quantity}</span>
                  </div>
                  <p className="text-sm font-bold">{ksh(line.lineTotal)}</p>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <aside className="card sticky top-24 space-y-5 p-6">
          <h2 className="text-base font-bold">Order summary</h2>

          <form action={applyCouponCode} className="flex gap-2">
            <div className="relative flex-1">
              <Tag size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-subtle" />
              <input
                name="coupon"
                defaultValue={cart.coupon ?? ""}
                placeholder="Discount code"
                aria-label="Discount code"
                className="input !py-2.5 pl-9 text-sm uppercase"
              />
            </div>
            <button type="submit" className="btn btn-outline btn-sm">Apply</button>
          </form>
          {summary.couponError && <p className="-mt-2 text-xs text-[var(--danger)]">{summary.couponError}</p>}
          {summary.discount > 0 && (
            <p className="-mt-2 text-xs font-semibold text-[var(--positive)]">
              {summary.coupon!.code} applied — you save {ksh(summary.discount)}.
            </p>
          )}

          <dl className="space-y-2.5 border-t border-line pt-5 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted">Subtotal</dt>
              <dd className="font-semibold">{ksh(summary.subtotal)}</dd>
            </div>
            {summary.discount > 0 && (
              <div className="flex justify-between text-[var(--positive)]">
                <dt>Discount</dt>
                <dd className="font-semibold">−{ksh(summary.discount)}</dd>
              </div>
            )}
            <div className="flex justify-between">
              <dt className="text-muted">Delivery</dt>
              <dd className="text-muted">Chosen at checkout</dd>
            </div>
          </dl>

          {freeDeliveryGap > 0 ? (
            <p className="rounded-xl bg-[var(--brand-soft)] p-3 text-xs leading-relaxed text-brand">
              Add {ksh(freeDeliveryGap)} more for free delivery.
            </p>
          ) : (
            <p className="rounded-xl bg-[var(--positive-soft)] p-3 text-xs font-semibold text-[var(--positive)]">
              You&apos;ve earned free delivery 🎉
            </p>
          )}

          <Link
            href="/checkout"
            className={`btn btn-primary w-full !py-3.5 ${summary.issues.length ? "pointer-events-none opacity-50" : ""}`}
            aria-disabled={summary.issues.length > 0}
          >
            Checkout · {ksh(summary.subtotal - summary.discount)} <ArrowRight size={16} />
          </Link>
          <Link href="/shop" className="btn btn-ghost btn-sm w-full">Keep shopping</Link>
        </aside>
      </div>
    </div>
  );
}
