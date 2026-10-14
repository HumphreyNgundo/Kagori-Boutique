import Link from "next/link";
import { ArrowRight, ShoppingBag } from "lucide-react";
import { StatusBadge } from "@/components/OrderStatus";
import { getOrdersByCodes } from "@/lib/repo/orders";
import { myOrderCodes } from "@/lib/cart";
import { ksh } from "@/lib/money";

export const dynamic = "force-dynamic";
export const metadata = { title: "My orders" };

export default async function AccountPage() {
  const orders = await getOrdersByCodes(await myOrderCodes());

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-extrabold tracking-tight">My orders</h1>
      <p className="mt-2 max-w-lg text-sm text-muted">
        Everything you&apos;ve ordered from this device. No account needed — we remember your
        tracking codes locally, and you can always look an order up with its code.
      </p>

      {orders.length === 0 ? (
        <div className="card mt-8 grid place-items-center gap-3 p-16 text-center">
          <span className="grid h-14 w-14 place-items-center rounded-full bg-[var(--brand-soft)] text-brand">
            <ShoppingBag size={22} />
          </span>
          <p className="text-lg font-semibold">No orders yet</p>
          <p className="max-w-sm text-sm text-muted">
            When you place an order it shows up here, with live status.
          </p>
          <div className="flex gap-2">
            <Link href="/shop" className="btn btn-primary btn-sm">Start shopping</Link>
            <Link href="/track" className="btn btn-outline btn-sm">I have a code</Link>
          </div>
        </div>
      ) : (
        <ul className="mt-8 space-y-4">
          {orders.map(({ order, items }) => (
            <li key={order.id}>
              <Link href={`/order/${order.code}`} className="card block p-5 transition hover:border-brand">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-bold">{order.code}</p>
                    <p className="text-xs text-subtle">
                      {new Date(order.createdAt).toLocaleString("en-KE", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <StatusBadge status={order.status} />
                </div>
                <div className="mt-4 flex items-end justify-between gap-4">
                  <p className="line-clamp-1 text-sm text-muted">
                    {items.map((i) => `${i.name} ×${i.quantity}`).join(", ")}
                  </p>
                  <p className="shrink-0 text-base font-extrabold">{ksh(order.total)}</p>
                </div>
                <p className="mt-3 flex items-center gap-1 text-xs font-semibold text-brand">
                  View tracking <ArrowRight size={12} />
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
