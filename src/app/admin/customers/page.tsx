import Link from "next/link";
import { PageHeader, TableWrap, Td, Th } from "@/components/admin/ui";
import { requirePermission } from "@/lib/auth/session";
import { listCustomers } from "@/lib/repo/admin";
import { ksh } from "@/lib/money";

export const dynamic = "force-dynamic";
export const metadata = { title: "Customers" };

export default async function CustomersPage() {
  await requirePermission("customer:view");
  const customers = await listCustomers();

  return (
    <>
      <PageHeader
        title="Customers"
        subtitle="Built from phone numbers at checkout — repeat shoppers merge automatically."
      />

      <TableWrap>
        <thead className="bg-surface-2">
          <tr>
            <Th>Name</Th>
            <Th>Phone</Th>
            <Th>Email</Th>
            <Th className="text-right">Orders</Th>
            <Th className="text-right">Lifetime spend</Th>
            <Th>Last order</Th>
          </tr>
        </thead>
        <tbody>
          {customers.map((customer) => (
            <tr key={customer.id} className="border-t border-line transition hover:bg-surface-2">
              <Td className="font-medium">{customer.name}</Td>
              <Td>
                <a href={`tel:${customer.phone}`} className="link-underline">{customer.phone}</a>
              </Td>
              <Td className="text-muted">{customer.email ?? "—"}</Td>
              <Td className="text-right tabular-nums">{customer.orderCount}</Td>
              <Td className="text-right font-semibold tabular-nums">{ksh(customer.spend)}</Td>
              <Td className="text-muted">
                {customer.lastOrderAt
                  ? new Date(customer.lastOrderAt).toLocaleDateString("en-KE", { day: "numeric", month: "short" })
                  : "—"}
              </Td>
            </tr>
          ))}
        </tbody>
      </TableWrap>

      <p className="mt-4 text-xs text-subtle">
        Looking for a specific order? Search by name or phone on the{" "}
        <Link href="/admin/orders" className="link-underline">orders page</Link>.
      </p>
    </>
  );
}
