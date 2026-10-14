import Link from "next/link";
import { ArrowRight, TriangleAlert } from "lucide-react";
import { RevenueChart } from "@/components/admin/RevenueChart";
import { EmptyState, PageHeader, Panel, StatTile, TableWrap, Td, Th } from "@/components/admin/ui";
import { StatusBadge } from "@/components/OrderStatus";
import { requirePermission } from "@/lib/auth/session";
import { dashboardKpis, stockRows } from "@/lib/repo/admin";
import { listOrders } from "@/lib/repo/orders";
import { STATUS_LABELS } from "@/lib/order-status";
import { ksh } from "@/lib/money";

export const dynamic = "force-dynamic";
export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const user = await requirePermission("dashboard:view");
  const [kpis, recent, low] = await Promise.all([
    dashboardKpis(30),
    listOrders({ status: "OPEN" }),
    stockRows(true),
  ]);

  const firstName = user.name.split(" ")[0];

  return (
    <>
      <PageHeader
        title={`Habari, ${firstName}`}
        subtitle="Last 30 days across the boutique."
        action={
          <Link href="/admin/orders" className="btn btn-primary btn-sm">
            Open orders <ArrowRight size={14} />
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile label="Revenue (30d)" value={ksh(kpis.revenue)} hint={`${kpis.orders} orders placed`} />
        <StatTile label="Average order" value={ksh(kpis.averageOrder)} hint={`${kpis.unitsSold} units sold`} />
        <StatTile
          label="Open orders"
          value={String(kpis.openOrders)}
          hint="Awaiting payment, packing or delivery"
          tone={kpis.openOrders > 0 ? "warning" : "default"}
        />
        <StatTile
          label="Low stock"
          value={String(kpis.lowStock)}
          hint="Variants at or below threshold"
          tone={kpis.lowStock > 0 ? "danger" : "positive"}
        />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1.6fr_1fr]">
        <Panel title="Daily revenue">
          <RevenueChart points={kpis.revenueSeries} />
        </Panel>

        <Panel title="Top sellers">
          {kpis.topProducts.length ? (
            <ul className="space-y-3">
              {kpis.topProducts.map((p, i) => (
                <li key={p.name} className="flex items-center gap-3">
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-surface-2 text-[11px] font-bold text-muted">
                    {i + 1}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">{p.name}</span>
                    <span className="block text-xs text-subtle">{p.units} sold</span>
                  </span>
                  <span className="shrink-0 text-sm font-bold tabular-nums">{ksh(p.revenue)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState title="No sales yet" body="Once orders come in, your best sellers rank here." />
          )}
        </Panel>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1.6fr_1fr]">
        <Panel
          title="Needs attention"
          action={
            <Link href="/admin/orders" className="btn btn-ghost btn-sm">
              All orders
            </Link>
          }
        >
          {recent.length ? (
            <TableWrap>
              <thead className="bg-surface-2">
                <tr>
                  <Th>Order</Th>
                  <Th>Customer</Th>
                  <Th>Status</Th>
                  <Th className="text-right">Total</Th>
                </tr>
              </thead>
              <tbody>
                {recent.slice(0, 6).map(({ order, customer }) => (
                  <tr key={order.id} className="border-t border-line">
                    <Td>
                      <Link href={`/admin/orders/${order.id}`} className="font-semibold hover:text-brand">
                        {order.code}
                      </Link>
                    </Td>
                    <Td className="text-muted">{customer?.name ?? "—"}</Td>
                    <Td><StatusBadge status={order.status} /></Td>
                    <Td className="text-right font-semibold tabular-nums">{ksh(order.total)}</Td>
                  </tr>
                ))}
              </tbody>
            </TableWrap>
          ) : (
            <EmptyState title="Nothing outstanding" body="Every order is delivered or closed. Good day." />
          )}
        </Panel>

        <Panel
          title="Running low"
          action={
            <Link href="/admin/inventory" className="btn btn-ghost btn-sm">
              Inventory
            </Link>
          }
        >
          {low.length ? (
            <ul className="space-y-3">
              {low.slice(0, 7).map((row) => (
                <li key={row.variantId} className="flex items-center gap-3">
                  <TriangleAlert size={14} className="shrink-0 text-[var(--warning)]" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">{row.productName}</span>
                    <span className="block truncate text-xs text-subtle">{row.optionsLabel}</span>
                  </span>
                  <span className="shrink-0 text-sm font-bold tabular-nums">{row.available}</span>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState title="Stock is healthy" body="No variant is below its threshold." />
          )}
        </Panel>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-5">
        {kpis.statusCounts.map((s) => (
          <div key={s.status} className="card p-4">
            <p className="text-xs font-semibold text-subtle">{STATUS_LABELS[s.status as keyof typeof STATUS_LABELS]}</p>
            <p className="mt-1 text-xl font-extrabold tabular-nums">{s.count}</p>
          </div>
        ))}
      </div>
    </>
  );
}
