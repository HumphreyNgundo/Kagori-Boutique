import Link from "next/link";
import { Copy, MapPin, MessageCircle, Package, PackageSearch, Phone, Smartphone } from "lucide-react";
import { EventLog, StatusBadge, TrackingRail } from "@/components/OrderStatus";
import { getOrderByCode } from "@/lib/repo/orders";
import { getSettings } from "@/lib/repo/catalog";
import { simulatePayment } from "@/lib/actions/checkout";
import { ksh } from "@/lib/money";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ code: string }> }) {
  return { title: `Order ${(await params).code}` };
}

export default async function OrderPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const detail = await getOrderByCode(code);
  const settings = await getSettings();

  // A bare 404 leaves a customer holding a code and nowhere to go.
  if (!detail) {
    return (
      <div className="mx-auto grid max-w-md place-items-center gap-4 px-4 py-24 text-center">
        <span className="grid h-16 w-16 place-items-center rounded-full bg-[var(--warning-soft)] text-[var(--warning)]">
          <PackageSearch size={26} />
        </span>
        <h1 className="text-2xl font-bold tracking-tight">We can&apos;t find order {code}</h1>
        <p className="text-sm leading-relaxed text-muted">
          Check the code against your confirmation — letters only, no spaces. If it still doesn&apos;t come up,
          message us with the code and we&apos;ll look it up by hand.
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          <Link href="/track" className="btn btn-primary btn-sm">Try another code</Link>
          <a
            href={`https://wa.me/${settings.whatsapp}?text=${encodeURIComponent(`Hi Kagorim, I can't find my order ${code}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-outline btn-sm"
          >
            <MessageCircle size={14} /> Ask us on WhatsApp
          </a>
        </div>
      </div>
    );
  }

  const { order, items, events, customer, zoneName, riderName } = detail;
  const awaitingPayment = order.paymentStatus === "PENDING" && order.paymentMethod !== "ON_DELIVERY";

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <div className="card relative overflow-hidden p-6 sm:p-8">
        <div className="aurora" />
        <div className="relative flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="eyebrow">Order confirmed</p>
            <h1 className="mt-2 flex items-center gap-3 text-3xl font-extrabold tracking-tight">
              {order.code}
              <Copy size={16} className="text-subtle" aria-hidden />
            </h1>
            <p className="mt-2 max-w-md text-sm text-muted">
              Keep this code — it&apos;s all you need to track the order from any device.
            </p>
          </div>
          <StatusBadge status={order.status} />
        </div>
      </div>

      {awaitingPayment && (
        <div className="card mt-5 flex flex-col gap-4 border-2 p-6 sm:flex-row sm:items-center sm:justify-between" style={{ borderColor: "var(--warning)" }}>
          <div className="flex items-start gap-3">
            <Smartphone size={20} className="mt-0.5 shrink-0 text-[var(--warning)]" />
            <div>
              <p className="text-sm font-bold">
                {order.paymentMethod === "MPESA" ? "Check your phone for the M-Pesa prompt" : "Complete your card payment"}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-muted">
                Sent to {customer.phone} for {ksh(order.total)}. The order confirms itself the moment payment lands.
              </p>
            </div>
          </div>
          {/* Demo shortcut standing in for the Daraja callback. */}
          <form action={simulatePayment}>
            <input type="hidden" name="code" value={order.code} />
            <button type="submit" className="btn btn-primary btn-sm whitespace-nowrap">
              Simulate payment
            </button>
          </form>
        </div>
      )}

      <div className="mt-5 grid gap-5 lg:grid-cols-[1.3fr_1fr] lg:items-start">
        <div className="space-y-5">
          <section className="card p-6">
            <h2 className="text-base font-bold">Where your order is</h2>
            <div className="mt-5">
              <TrackingRail status={order.status} fulfilment={order.fulfilment} />
            </div>
            {riderName && order.status === "DISPATCHED" && (
              <p className="mt-4 rounded-xl bg-[var(--brand-soft)] p-3 text-xs text-brand">
                {riderName} is delivering your parcel today.
              </p>
            )}
          </section>

          <section className="card p-6">
            <h2 className="text-base font-bold">Updates</h2>
            <div className="mt-4">
              <EventLog events={events} />
            </div>
          </section>
        </div>

        <div className="space-y-5">
          <section className="card p-6">
            <h2 className="text-base font-bold">What you ordered</h2>
            <ul className="mt-4 space-y-3">
              {items.map((item) => (
                <li key={item.id} className="flex justify-between gap-3 text-sm">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{item.name}</p>
                    <p className="truncate text-xs text-subtle">
                      {item.optionsLabel} · ×{item.quantity}
                    </p>
                  </div>
                  <p className="shrink-0 font-semibold">{ksh(item.unitPrice * item.quantity)}</p>
                </li>
              ))}
            </ul>
            <dl className="mt-5 space-y-2 border-t border-line pt-4 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted">Subtotal</dt>
                <dd>{ksh(order.subtotal)}</dd>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-[var(--positive)]">
                  <dt>Discount {order.couponCode && `(${order.couponCode})`}</dt>
                  <dd>−{ksh(order.discount)}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-muted">{order.fulfilment === "PICKUP" ? "Pickup" : "Delivery"}</dt>
                <dd>{order.deliveryFee === 0 ? "Free" : ksh(order.deliveryFee)}</dd>
              </div>
              <div className="flex justify-between border-t border-line pt-2 text-base font-extrabold">
                <dt>Total</dt>
                <dd>{ksh(order.total)}</dd>
              </div>
            </dl>
            <p className="mt-3 text-xs text-subtle">
              {order.paymentMethod === "ON_DELIVERY"
                ? "Paying on delivery"
                : `${order.paymentMethod === "MPESA" ? "M-Pesa" : "Card"} · ${order.paymentStatus === "PAID" ? `paid · ref ${order.paymentRef}` : "awaiting payment"}`}
            </p>
          </section>

          <section className="card p-6">
            <h2 className="text-base font-bold">Delivery details</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex gap-3">
                <Package size={15} className="mt-0.5 shrink-0 text-subtle" />
                <div>
                  <dt className="text-xs text-subtle">Method</dt>
                  <dd className="font-medium">{zoneName}</dd>
                </div>
              </div>
              {order.address && (
                <div className="flex gap-3">
                  <MapPin size={15} className="mt-0.5 shrink-0 text-subtle" />
                  <div>
                    <dt className="text-xs text-subtle">Address</dt>
                    <dd className="font-medium">{order.address}</dd>
                  </div>
                </div>
              )}
              <div className="flex gap-3">
                <Phone size={15} className="mt-0.5 shrink-0 text-subtle" />
                <div>
                  <dt className="text-xs text-subtle">Contact</dt>
                  <dd className="font-medium">{customer.name} · {customer.phone}</dd>
                </div>
              </div>
            </dl>
            {order.customerNote && (
              <p className="mt-4 rounded-xl bg-surface-2 p-3 text-xs italic text-muted">“{order.customerNote}”</p>
            )}
          </section>

          <div className="flex gap-2">
            <a
              href={`https://wa.me/${settings.whatsapp}?text=${encodeURIComponent(`Hi Kagorim, about order ${order.code}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline btn-sm flex-1"
            >
              <MessageCircle size={14} /> Ask about this order
            </a>
            <Link href="/shop" className="btn btn-ghost btn-sm flex-1">Keep shopping</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
