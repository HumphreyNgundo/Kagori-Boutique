import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, PackageSearch } from "lucide-react";
import { StatusBadge } from "@/components/OrderStatus";
import { getOrderByCode, getOrdersByCodes } from "@/lib/repo/orders";
import { myOrderCodes } from "@/lib/cart";
import { ksh } from "@/lib/money";

export const dynamic = "force-dynamic";
export const metadata = { title: "Track your order" };

async function lookup(formData: FormData) {
  "use server";
  const code = String(formData.get("code") ?? "").trim().toUpperCase();
  if (!code) return;
  const found = await getOrderByCode(code);
  redirect(found ? `/order/${found.order.code}` : `/track?missing=${encodeURIComponent(code)}`);
}

export default async function TrackPage({
  searchParams,
}: {
  searchParams: Promise<{ missing?: string }>;
}) {
  const { missing } = await searchParams;
  const mine = await getOrdersByCodes(await myOrderCodes());

  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <div className="text-center">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[var(--brand-soft)] text-brand">
          <PackageSearch size={24} />
        </span>
        <h1 className="mt-5 text-3xl font-extrabold tracking-tight sm:text-4xl">Track your order</h1>
        <p className="mx-auto mt-3 max-w-md text-sm text-muted">
          Enter the code from your confirmation — it looks like <strong className="text-ink">KGB-7F3Q2A</strong>.
          No login, no password.
        </p>
      </div>

      <form action={lookup} className="mx-auto mt-8 flex max-w-md gap-2">
        <input
          name="code"
          required
          placeholder="KGB-XXXXXX"
          aria-label="Tracking code"
          className="input text-center font-semibold uppercase tracking-widest"
        />
        <button type="submit" className="btn btn-primary">
          Track <ArrowRight size={15} />
        </button>
      </form>

      {missing && (
        <p className="mx-auto mt-4 max-w-md rounded-xl bg-[var(--danger-soft)] p-3 text-center text-sm text-[var(--danger)]">
          We couldn&apos;t find <strong>{missing}</strong>. Check the code and try again.
        </p>
      )}

      {mine.length > 0 && (
        <section className="mt-14">
          <h2 className="text-sm font-bold">Orders from this device</h2>
          <ul className="mt-4 space-y-3">
            {mine.map(({ order, items }) => (
              <li key={order.id}>
                <Link href={`/order/${order.code}`} className="card flex items-center gap-4 p-4 transition hover:border-brand">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold">{order.code}</p>
                    <p className="truncate text-xs text-subtle">
                      {items.length} {items.length === 1 ? "item" : "items"} ·{" "}
                      {new Date(order.createdAt).toLocaleDateString("en-KE", { day: "numeric", month: "short" })}
                    </p>
                  </div>
                  <span className="text-sm font-bold">{ksh(order.total)}</span>
                  <StatusBadge status={order.status} />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
