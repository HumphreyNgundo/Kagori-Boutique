import Link from "next/link";
import { MapPin, Phone } from "lucide-react";
import { AdvanceOrder } from "@/components/admin/OrderActions";
import { EmptyState, PageHeader, Panel } from "@/components/admin/ui";
import { StatusBadge } from "@/components/OrderStatus";
import { requirePermission } from "@/lib/auth/session";
import { listOrders } from "@/lib/repo/orders";
import { nextStatuses } from "@/lib/order-status";
import { ksh } from "@/lib/money";

export const dynamic = "force-dynamic";
export const metadata = { title: "My deliveries" };

/** A rider's run sheet: only their own assigned parcels, nothing else. */
export default async function DeliveriesPage() {
  const user = await requirePermission("delivery:view_own");
  const assigned = await listOrders({ riderId: user.id });
  const active = assigned.filter((d) => d.order.status === "DISPATCHED");
  const done = assigned.filter((d) => d.order.status === "DELIVERED").slice(0, 10);

  return (
    <>
      <PageHeader
        title="My deliveries"
        subtitle={`${active.length} parcel${active.length === 1 ? "" : "s"} to drop off today.`}
      />

      {active.length ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {active.map(({ order, customer, items }) => (
            <Panel key={order.id} title={order.code} action={<StatusBadge status={order.status} />}>
              <div className="space-y-3 text-sm">
                <p className="font-semibold">{customer.name}</p>
                <p className="flex items-start gap-2 text-muted">
                  <MapPin size={14} className="mt-0.5 shrink-0" /> {order.address}
                </p>
                <p className="flex items-center gap-2">
                  <Phone size={14} className="shrink-0 text-subtle" />
                  <a href={`tel:${customer.phone}`} className="link-underline">{customer.phone}</a>
                </p>
                <p className="text-xs text-subtle">
                  {items.reduce((n, i) => n + i.quantity, 0)} items ·{" "}
                  {order.paymentMethod === "ON_DELIVERY" ? (
                    <strong className="text-[var(--warning)]">COLLECT {ksh(order.total)}</strong>
                  ) : (
                    "Already paid"
                  )}
                </p>
                {order.customerNote && (
                  <p className="rounded-xl bg-surface-2 p-2.5 text-xs italic text-muted">“{order.customerNote}”</p>
                )}
              </div>
              <div className="mt-4 border-t border-line pt-4">
                <AdvanceOrder orderId={order.id} options={nextStatuses(order)} canCancel={false} />
              </div>
            </Panel>
          ))}
        </div>
      ) : (
        <div className="card">
          <EmptyState title="Nothing to deliver right now" body="When fulfilment assigns you a parcel it appears here." />
        </div>
      )}

      {done.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-3 text-sm font-bold">Recently delivered</h2>
          <ul className="space-y-2">
            {done.map(({ order, customer }) => (
              <li key={order.id} className="card flex items-center justify-between gap-3 p-3.5 text-sm">
                <Link href={`/admin/orders/${order.id}`} className="font-semibold hover:text-brand">
                  {order.code}
                </Link>
                <span className="truncate text-muted">{customer.name}</span>
                <StatusBadge status={order.status} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}
