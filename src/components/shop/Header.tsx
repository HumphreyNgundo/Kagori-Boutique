import Link from "next/link";
import { Package, Search, ShoppingBag, UserRound } from "lucide-react";
import { Wordmark } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { listCategories } from "@/lib/repo/catalog";
import { readCart } from "@/lib/cart";
import { getSession } from "@/lib/auth/session";
import { homeFor } from "@/lib/auth/rbac";

export async function Header() {
  const [categories, cart, session] = await Promise.all([listCategories(), readCart(), getSession()]);
  const count = cart.lines.reduce((sum, l) => sum + l.quantity, 0);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6">
        <Link href="/" className="shrink-0" aria-label="Kagorim Boutique home">
          <Wordmark />
        </Link>

        <nav className="ml-4 hidden items-center gap-1 lg:flex">
          <Link href="/shop" className="rounded-full px-3 py-2 text-sm font-medium text-muted transition hover:bg-surface-2 hover:text-ink">
            All products
          </Link>
          {categories.slice(0, 5).map((c) => (
            <Link
              key={c.id}
              href={`/c/${c.slug}`}
              className="rounded-full px-3 py-2 text-sm font-medium text-muted transition hover:bg-surface-2 hover:text-ink"
            >
              {c.name}
            </Link>
          ))}
        </nav>

        <form action="/shop" className="ml-auto hidden max-w-xs flex-1 items-center md:flex">
          <div className="relative w-full">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-subtle" />
            <input
              name="q"
              placeholder="Search wigs, heels, lashes…"
              aria-label="Search products"
              className="input !rounded-full !py-2 pl-9 text-sm"
            />
          </div>
        </form>

        <div className="ml-auto flex items-center gap-1.5 md:ml-2">
          <Link
            href="/track"
            className="hidden items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium text-muted transition hover:bg-surface-2 hover:text-ink sm:flex"
          >
            <Package size={15} /> Track order
          </Link>

          <ThemeToggle />

          <Link
            href={session ? homeFor(session.role) : "/login"}
            className="grid h-9 w-9 place-items-center rounded-full border border-line-strong text-muted transition hover:border-brand hover:text-brand"
            aria-label={session ? "Your account" : "Sign in"}
            title={session ? `${session.name} — ${session.role.toLowerCase()}` : "Staff sign in"}
          >
            <UserRound size={16} />
          </Link>

          <Link href="/cart" className="btn btn-ink relative !px-4" aria-label={`Basket, ${count} items`}>
            <ShoppingBag size={16} />
            <span className="hidden sm:inline">Basket</span>
            {count > 0 && (
              <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-brand px-1 text-[11px] font-bold text-[var(--brand-contrast)] ring-2 ring-bg">
                {count}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* Category rail — the whole catalogue stays one tap away on mobile. */}
      <div className="no-scrollbar flex gap-2 overflow-x-auto border-t border-line px-4 py-2 lg:hidden">
        <Link href="/shop" className="chip shrink-0">All</Link>
        {categories.map((c) => (
          <Link key={c.id} href={`/c/${c.slug}`} className="chip shrink-0">
            {c.name}
          </Link>
        ))}
      </div>
    </header>
  );
}
