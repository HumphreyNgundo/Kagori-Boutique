import Link from "next/link";
import { Plus } from "lucide-react";
import { PageHeader, Panel, TableWrap, Td, Th } from "@/components/admin/ui";
import { StockAdjuster } from "@/components/admin/PriceEditor";
import { requirePermission } from "@/lib/auth/session";
import { can } from "@/lib/auth/rbac";
import { listMovements, stockRows } from "@/lib/repo/admin";
import { ksh } from "@/lib/money";

export const dynamic = "force-dynamic";
export const metadata = { title: "Inventory" };

export default async function InventoryPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const user = await requirePermission("inventory:view");
  const { filter } = await searchParams;
  const onlyLow = filter === "low";
  const [rows, movements] = await Promise.all([stockRows(onlyLow), listMovements(25)]);
  const mayAdjust = can(user.role, "inventory:adjust");

  return (
    <>
      <PageHeader
        title="Inventory"
        subtitle="Available = on hand minus units held for unpaid orders. Open a product to add sizes or remove lines."
        action={
          <div className="flex items-center gap-2">
            <Link href="/admin/inventory" className="chip" data-active={!onlyLow}>Everything</Link>
            <Link href="/admin/inventory?filter=low" className="chip" data-active={onlyLow}>Low stock</Link>
            {mayAdjust && (
              <Link href="/admin/products/new" className="btn btn-primary btn-sm">
                <Plus size={14} /> Add a product
              </Link>
            )}
          </div>
        }
      />

      <div className="grid gap-4 xl:grid-cols-[1.7fr_1fr] xl:items-start">
        <TableWrap>
          <thead className="bg-surface-2">
            <tr>
              <Th>Product</Th>
              <Th>Option</Th>
              <Th>SKU</Th>
              <Th className="text-right">Price</Th>
              <Th className="text-right">On hand</Th>
              <Th className="text-right">Held</Th>
              <Th className="text-right">Available</Th>
              {mayAdjust && <Th>Adjust</Th>}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.variantId} className="border-t border-line transition hover:bg-surface-2">
                <Td>
                  <Link href={`/admin/products/${row.productId}`} className="font-medium hover:text-brand">
                    {row.productName}
                  </Link>
                  <span className="block text-xs text-subtle">{row.categoryName}</span>
                </Td>
                <Td className="text-muted">{row.optionsLabel}</Td>
                <Td className="text-xs text-subtle">{row.sku}</Td>
                <Td className="text-right tabular-nums">{ksh(row.price)}</Td>
                <Td className="text-right tabular-nums">{row.stock}</Td>
                <Td className="text-right tabular-nums text-subtle">{row.reserved}</Td>
                <Td className="text-right">
                  <span
                    className="font-bold tabular-nums"
                    style={{ color: row.available === 0 ? "var(--danger)" : row.low ? "var(--warning)" : undefined }}
                  >
                    {row.available}
                  </span>
                </Td>
                {mayAdjust && (
                  <Td>
                    <StockAdjuster variantId={row.variantId} />
                  </Td>
                )}
              </tr>
            ))}
          </tbody>
        </TableWrap>

        <Panel title="Stock ledger">
          <ul className="space-y-3">
            {movements.map((move) => (
              <li key={move.id} className="flex items-start gap-3 text-sm">
                <span
                  className="mt-0.5 shrink-0 rounded-full px-2 py-0.5 text-xs font-bold tabular-nums"
                  style={{
                    background: move.delta > 0 ? "var(--positive-soft)" : "var(--danger-soft)",
                    color: move.delta > 0 ? "var(--positive)" : "var(--danger)",
                  }}
                >
                  {move.delta > 0 ? "+" : ""}{move.delta}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{move.productName}</p>
                  <p className="truncate text-xs text-subtle">
                    {move.reason.toLowerCase()} · {move.sku}
                    {move.reference ? ` · ${move.reference}` : ""}
                  </p>
                  <p className="text-xs text-subtle">
                    {new Date(move.createdAt).toLocaleString("en-KE", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}{" "}
                    · {move.actorName}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </>
  );
}
