import Link from "next/link";
import { Search } from "lucide-react";
import { PageHeader, EmptyState, TableWrap, Td, Th } from "@/components/admin/ui";
import { StatusBadge } from "@/components/OrderStatus";
import { requirePermission } from "@/lib/auth/session";
import { listOrders } from "@/lib/repo/orders";
import { OPEN_STATUSES, STATUS_LABELS } from "@/lib/order-status";
import { ksh } from "@/lib/money";
import type { OrderStatus } from "@/lib/types";

export const dynamic = "force-dynamic";
export const metadata = { title: "Orders" };

const TABS: { value: string; label: string }[] = [
  { value: "OPEN", label: "Open" },
  ...OPEN_STATUSES.map((s) => ({ value: s, label: STATUS_LABELS[s] })),
  { value: "DELIVERED", label: "Delivered" },
  { value: "CANCELLED", label: "Cancelled" },
  { value: "ALL", label: "All" },
];

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  await requirePermission("order:view");
  const { status = "OPEN", q } = await searchParams;
  const orders = await listOrders({ status: status as OrderStatus | "OPEN" | "ALL", q });

  return (
    <>
      <PageHeader title="Orders" subtitle="Every order, from M-Pesa prompt to doorstep." />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="no-scrollbar flex gap-2 overflow-x-auto">
          {TABS.map((tab) => (
            <Link
              key={tab.value}
              href={`/admin/orders?status=${tab.value}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
              className="chip shrink-0"
              data-active={status === tab.value}
            >
              {tab.label}
            </Link>
          ))}
        </div>
        <form action="/admin/orders" className="ml-auto flex gap-2">
          <input type="hidden" name="status" value={status} />
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-subtle" />
            <input
              name="q"
              defaultValue={q ?? ""}
              placeholder="Code, name or phone"
              className="input !w-56 !py-2 pl-9 text-sm"
            />
          </div>
          <button type="submit" className="btn btn-outline btn-sm">Search</button>
        </form>
      </div>

      {orders.length ? (
        <TableWrap>
          <thead className="bg-surface-2">
            <tr>
              <Th>Order</Th>
              <Th>Customer</Th>
              <Th>Items</Th>
              <Th>Fulfilment</Th>
              <Th>Payment</Th>
              <Th>Status</Th>
              <Th className="text-right">Total</Th>
            </tr>
          </thead>
          <tbody>
            {orders.map(({ order, items, customer, riderName }) => (
              <tr key={order.id} className="border-t border-line transition hover:bg-surface-2">
                <Td>
                  <Link href={`/admin/orders/${order.id}`} className="font-semibold hover:text-brand">
                    {order.code}
                  </Link>
                  <span className="block text-xs text-subtle">
                    {new Date(order.createdAt).toLocaleDateString("en-KE", { day: "numeric", month: "short" })}
                  </span>
                </Td>
                <Td>
                  <span className="block">{customer?.name ?? "—"}</span>
                  <span className="block text-xs text-subtle">{customer?.phone}</span>
                </Td>
                <Td className="text-muted">{items.reduce((n, i) => n + i.quantity, 0)}</Td>
                <Td>
                  <span className="block text-xs">{order.fulfilment === "PICKUP" ? "Pickup" : "Delivery"}</span>
                  {riderName && <span className="block text-xs text-subtle">{riderName}</span>}
                </Td>
                <Td>
                  <span className="text-xs">
                    {order.paymentMethod === "ON_DELIVERY" ? "On delivery" : order.paymentMethod === "MPESA" ? "M-Pesa" : "Card"}
                  </span>
                  <span
                    className="block text-xs font-semibold"
                    style={{
                      color:
                        order.paymentStatus === "PAID"
                          ? "var(--positive)"
                          : order.paymentStatus === "PENDING"
                            ? "var(--warning)"
                            : "var(--danger)",
                    }}
                  >
                    {order.paymentStatus.toLowerCase()}
                  </span>
                </Td>
                <Td><StatusBadge status={order.status} /></Td>
                <Td className="text-right font-semibold tabular-nums">{ksh(order.total)}</Td>
              </tr>
            ))}
          </tbody>
        </TableWrap>
      ) : (
        <div className="card">
          <EmptyState title="No orders here" body="Try a different tab, or clear the search." />
        </div>
      )}
    </>
  );
}
