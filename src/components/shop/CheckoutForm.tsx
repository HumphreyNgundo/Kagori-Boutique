"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { AlertCircle, CreditCard, Loader2, Lock, Smartphone, Store, Truck, Wallet } from "lucide-react";
import { submitCheckout, type CheckoutState } from "@/lib/actions/checkout";
import { ksh } from "@/lib/money";
import type { DeliveryZone, PaymentMethod, StoreSettings } from "@/lib/types";

const PAYMENTS: { id: PaymentMethod; label: string; hint: string; icon: typeof Smartphone }[] = [
  { id: "MPESA", label: "M-Pesa", hint: "STK push to your phone", icon: Smartphone },
  { id: "CARD", label: "Card", hint: "Visa / Mastercard", icon: CreditCard },
  { id: "ON_DELIVERY", label: "Pay on delivery", hint: "Cash or M-Pesa to the rider", icon: Wallet },
];

function Submit({ total }: { total: number }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn btn-primary w-full !py-4 text-base" disabled={pending}>
      {pending ? <Loader2 size={18} className="animate-spin" /> : <Lock size={16} />}
      {pending ? "Placing order…" : `Place order · ${ksh(total)}`}
    </button>
  );
}

export function CheckoutForm({
  zones,
  settings,
  subtotal,
  discount,
}: {
  zones: DeliveryZone[];
  settings: StoreSettings;
  subtotal: number;
  discount: number;
}) {
  const [state, action] = useActionState<CheckoutState, FormData>(submitCheckout, { error: null });
  const [zoneId, setZoneId] = useState(zones.find((z) => z.method === "DELIVERY")?.id ?? zones[0]?.id ?? "");
  const [payment, setPayment] = useState<PaymentMethod>("MPESA");

  const zone = zones.find((z) => z.id === zoneId);
  const freeDelivery = subtotal >= settings.freeDeliveryOver;
  const deliveryFee = !zone || zone.method === "PICKUP" || freeDelivery ? 0 : zone.fee;
  const total = subtotal - discount + deliveryFee;
  const methods = PAYMENTS.filter((p) =>
    p.id === "MPESA" ? settings.mpesaEnabled : p.id === "CARD" ? settings.cardEnabled : settings.codEnabled,
  );

  return (
    <form action={action} className="grid gap-8 lg:grid-cols-[1.5fr_1fr] lg:items-start">
      <div className="space-y-6">
        {state.error && (
          <p className="flex items-start gap-2 rounded-xl bg-[var(--danger-soft)] p-3.5 text-sm font-medium text-[var(--danger)]" role="alert">
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            {state.error}
          </p>
        )}

        {/* ------------------------------------------------- 1. contact */}
        <section className="card p-6">
          <div className="flex items-center gap-3">
            <span className="grid h-7 w-7 place-items-center rounded-full bg-ink text-xs font-bold text-bg">1</span>
            <h2 className="text-base font-bold">Who is this for?</h2>
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="name">Full name</label>
              <input id="name" name="name" required autoComplete="name" placeholder="Aisha Noor" className="input" />
            </div>
            <div>
              <label className="label" htmlFor="phone">Phone (M-Pesa)</label>
              <input
                id="phone"
                name="phone"
                required
                inputMode="tel"
                autoComplete="tel"
                placeholder="0712 345 678"
                className="input"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="label" htmlFor="email">
                Email <span className="font-normal text-subtle">— optional, for the receipt</span>
              </label>
              <input id="email" name="email" type="email" autoComplete="email" placeholder="you@example.com" className="input" />
            </div>
          </div>
        </section>

        {/* ------------------------------------------------ 2. delivery */}
        <section className="card p-6">
          <div className="flex items-center gap-3">
            <span className="grid h-7 w-7 place-items-center rounded-full bg-ink text-xs font-bold text-bg">2</span>
            <h2 className="text-base font-bold">How should we get it to you?</h2>
          </div>

          <div className="mt-5 space-y-2.5">
            {zones.map((z) => {
              const selected = zoneId === z.id;
              const fee = z.method === "PICKUP" || freeDelivery ? 0 : z.fee;
              return (
                <label
                  key={z.id}
                  className="flex cursor-pointer items-center gap-3 rounded-xl border p-3.5 transition"
                  style={{
                    borderColor: selected ? "var(--brand)" : "var(--line)",
                    background: selected ? "var(--brand-soft)" : "transparent",
                  }}
                >
                  <input
                    type="radio"
                    name="zoneId"
                    value={z.id}
                    checked={selected}
                    onChange={() => setZoneId(z.id)}
                    className="sr-only"
                  />
                  <span
                    className="grid h-9 w-9 shrink-0 place-items-center rounded-full"
                    style={{ background: selected ? "var(--brand)" : "var(--surface-2)", color: selected ? "var(--brand-contrast)" : "var(--ink-muted)" }}
                  >
                    {z.method === "PICKUP" ? <Store size={16} /> : <Truck size={16} />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold">{z.name}</span>
                    <span className="block text-xs text-muted">
                      {z.etaHours <= 24 ? `Within ${z.etaHours} hours` : `${Math.round(z.etaHours / 24)} days`}
                    </span>
                  </span>
                  <span className="text-sm font-bold">{fee === 0 ? "Free" : ksh(fee)}</span>
                </label>
              );
            })}
          </div>

          {zone?.method === "DELIVERY" && (
            <div className="mt-5">
              <label className="label" htmlFor="address">Delivery address</label>
              <textarea
                id="address"
                name="address"
                required
                rows={2}
                placeholder="Estate / building, road, house or apartment number"
                className="input resize-none"
              />
            </div>
          )}

          <div className="mt-4">
            <label className="label" htmlFor="note">
              Note for us <span className="font-normal text-subtle">— optional</span>
            </label>
            <input id="note" name="note" placeholder="Call when you reach the gate" className="input" />
          </div>
        </section>

        {/* ------------------------------------------------- 3. payment */}
        <section className="card p-6">
          <div className="flex items-center gap-3">
            <span className="grid h-7 w-7 place-items-center rounded-full bg-ink text-xs font-bold text-bg">3</span>
            <h2 className="text-base font-bold">How would you like to pay?</h2>
          </div>

          <div className="mt-5 grid gap-2.5 sm:grid-cols-3">
            {methods.map((m) => {
              const selected = payment === m.id;
              return (
                <label
                  key={m.id}
                  className="flex cursor-pointer flex-col gap-1.5 rounded-xl border p-3.5 transition"
                  style={{
                    borderColor: selected ? "var(--brand)" : "var(--line)",
                    background: selected ? "var(--brand-soft)" : "transparent",
                  }}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={m.id}
                    checked={selected}
                    onChange={() => setPayment(m.id)}
                    className="sr-only"
                  />
                  <m.icon size={18} style={{ color: selected ? "var(--brand)" : "var(--ink-muted)" }} />
                  <span className="text-sm font-semibold">{m.label}</span>
                  <span className="text-xs leading-snug text-muted">{m.hint}</span>
                </label>
              );
            })}
          </div>

          <p className="mt-4 text-xs leading-relaxed text-subtle">
            {payment === "MPESA" && "We'll send an M-Pesa prompt to the number above. Enter your PIN and the order confirms itself."}
            {payment === "CARD" && "You'll be redirected to our secure card page. We never store card details."}
            {payment === "ON_DELIVERY" && "Pay the rider on arrival. Available within Nairobi only."}
          </p>
        </section>
      </div>

      {/* --------------------------------------------------- summary rail */}
      <aside className="card sticky top-24 space-y-4 p-6">
        <h2 className="text-base font-bold">Total</h2>
        <dl className="space-y-2.5 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted">Subtotal</dt>
            <dd className="font-semibold">{ksh(subtotal)}</dd>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-[var(--positive)]">
              <dt>Discount</dt>
              <dd className="font-semibold">−{ksh(discount)}</dd>
            </div>
          )}
          <div className="flex justify-between">
            <dt className="text-muted">{zone?.method === "PICKUP" ? "Pickup" : "Delivery"}</dt>
            <dd className="font-semibold">{deliveryFee === 0 ? "Free" : ksh(deliveryFee)}</dd>
          </div>
          <div className="flex justify-between border-t border-line pt-3 text-base">
            <dt className="font-bold">To pay</dt>
            <dd className="font-extrabold">{ksh(total)}</dd>
          </div>
        </dl>

        <Submit total={total} />

        <p className="flex items-start gap-1.5 text-xs leading-relaxed text-subtle">
          <Lock size={12} className="mt-0.5 shrink-0" />
          No account needed. Your tracking code appears the moment you place the order.
        </p>
      </aside>
    </form>
  );
}
