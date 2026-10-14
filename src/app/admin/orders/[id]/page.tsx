import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, MapPin, Phone, StickyNote, User } from "lucide-react";
import { AdvanceOrder, AssignRider, ConfirmPayment } from "@/components/admin/OrderActions";
import { PageHeader, Panel } from "@/components/admin/ui";
import { EventLog, StatusBadge, TrackingRail } from "@/components/OrderStatus";
import { requirePermission } from "@/lib/auth/session";
import { can } from "@/lib/auth/rbac";
import { getOrderById } from "@/lib/repo/orders";
import { nextStatuses } from "@/lib/order-status";
import { listRiders } from "@/lib/repo/admin";
import { ksh } from "@/lib/money";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const detail = await getOrderById((await params).id);
  return { title: detail ? `Order ${detail.order.code}` : "Order" };
}

export default async function AdminOrderPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requirePermission("order:view");
  const detail = await getOrderById((await params).id);
  if (!detail) notFound();

  const { order, items, events, customer, zoneName, riderName } = detail;
  const riders = can(user.role, "order:assign_rider") ? await listRiders() : [];
  const mayAdvance = can(user.role, "order:advance");

  return (
    <>
      <Link href="/admin/orders" className="btn btn-ghost btn-sm -ml-2 mb-2">
        <ChevronLeft size={15} /> All orders
      </Link>

      <PageHeader
        title={order.code}
        subtitle={`Placed ${new Date(order.createdAt).toLocaleString("en-KE", {
          day: "numeric",
          month: "long",
          hour: "2-digit",
          minute: "2-digit",
        })}`}
        action={<StatusBadge status={order.status} />}
      />

      <div className="grid gap-4 xl:grid-cols-[1.5fr_1fr] xl:items-start">
        <div className="space-y-4">
          <Panel title="Items">
            <ul className="divide-y divide-[var(--line)]">
              {items.map((item) => (
                <li key={item.id} className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{item.name}</p>
                    <p className="truncate text-xs text-subtle">
                      {item.optionsLabel} · {item.sku}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-sm font-semibold tabular-nums">{ksh(item.unitPrice * item.quantity)}</p>
                    <p className="text-xs text-subtle">
                      {item.quantity} × {ksh(item.unitPrice)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
            <dl className="mt-4 space-y-1.5 border-t border-line pt-4 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted">Subtotal</dt>
                <dd className="tabular-nums">{ksh(order.subtotal)}</dd>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between" style={{ color: "var(--positive)" }}>
                  <dt>Discount {order.couponCode}</dt>
                  <dd className="tabular-nums">−{ksh(order.discount)}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-muted">Delivery</dt>
                <dd className="tabular-nums">{order.deliveryFee === 0 ? "Free" : ksh(order.deliveryFee)}</dd>
              </div>
              <div className="flex justify-between border-t border-line pt-2 text-base font-extrabold">
                <dt>Total</dt>
                <dd className="tabular-nums">{ksh(order.total)}</dd>
              </div>
            </dl>
          </Panel>

          <Panel title="Timeline">
            <EventLog events={events} />
          </Panel>
        </div>

        <div className="space-y-4">
          <Panel title="Progress">
            <TrackingRail status={order.status} fulfilment={order.fulfilment} />
          </Panel>

          {mayAdvance && (
            <Panel title="Move this order on">
              {order.paymentStatus === "PENDING" && order.paymentMethod !== "ON_DELIVERY" ? (
                <div className="space-y-3">
                  <p className="rounded-xl bg-[var(--warning-soft)] p-3 text-xs text-[var(--warning)]">
                    Waiting on {order.paymentMethod === "MPESA" ? "M-Pesa" : "card"} payment. Confirm it here if the
                    customer paid another way.
                  </p>
                  <ConfirmPayment code={order.code} />
                </div>
              ) : (
                <AdvanceOrder
                  orderId={order.id}
                  options={nextStatuses(order)}
                  canCancel={can(user.role, "order:cancel")}
                />
              )}
            </Panel>
          )}

          {riders.length > 0 && order.fulfilment === "DELIVERY" && (
            <Panel title="Rider">
              <AssignRider
                orderId={order.id}
                riders={riders.map((r) => ({ id: r.id, name: r.name }))}
                currentRiderId={order.riderId}
              />
              {riderName && <p className="mt-2 text-xs text-subtle">Currently with {riderName}.</p>}
            </Panel>
          )}

          <Panel title="Customer">
            <dl className="space-y-3 text-sm">
              <div className="flex gap-3">
                <User size={14} className="mt-0.5 shrink-0 text-subtle" />
                <div>
                  <dt className="text-xs text-subtle">Name</dt>
                  <dd className="font-medium">{customer.name}</dd>
                </div>
              </div>
              <div className="flex gap-3">
                <Phone size={14} className="mt-0.5 shrink-0 text-subtle" />
                <div>
                  <dt className="text-xs text-subtle">Phone</dt>
                  <dd className="font-medium">
                    <a href={`tel:${customer.phone}`} className="link-underline">{customer.phone}</a>
                  </dd>
                </div>
              </div>
              <div className="flex gap-3">
                <MapPin size={14} className="mt-0.5 shrink-0 text-subtle" />
                <div>
                  <dt className="text-xs text-subtle">{order.fulfilment === "PICKUP" ? "Collection" : "Delivery"}</dt>
                  <dd className="font-medium">{zoneName}</dd>
                  {order.address && <dd className="text-xs text-muted">{order.address}</dd>}
                </div>
              </div>
              {order.customerNote && (
                <div className="flex gap-3">
                  <StickyNote size={14} className="mt-0.5 shrink-0 text-subtle" />
                  <div>
                    <dt className="text-xs text-subtle">Note</dt>
                    <dd className="italic text-muted">“{order.customerNote}”</dd>
                  </div>
                </div>
              )}
            </dl>
          </Panel>
        </div>
      </div>
    </>
  );
}
