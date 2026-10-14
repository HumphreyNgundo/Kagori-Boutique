import Link from "next/link";
import { LogOut, Store } from "lucide-react";
import { AdminNav, type NavItem } from "@/components/admin/AdminNav";
import { LogoMark } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { requireUser } from "@/lib/auth/session";
import { can, ROLE_LABELS, type Permission } from "@/lib/auth/rbac";
import { logoutAction } from "@/lib/actions/auth";

export const dynamic = "force-dynamic";
export const metadata = { title: { default: "Console", template: "%s · Kagorim Console" } };

/** Each entry declares the permission that reveals it — the nav is the RBAC model. */
const NAV: (NavItem & { permission: Permission })[] = [
  { href: "/admin", label: "Dashboard", icon: "dashboard", permission: "dashboard:view" },
  { href: "/admin/orders", label: "Orders", icon: "orders", permission: "order:view" },
  { href: "/admin/deliveries", label: "My deliveries", icon: "deliveries", permission: "delivery:view_own" },
  { href: "/admin/products", label: "Products", icon: "products", permission: "product:view" },
  { href: "/admin/inventory", label: "Inventory", icon: "inventory", permission: "inventory:view" },
  { href: "/admin/customers", label: "Customers", icon: "customers", permission: "customer:view" },
  { href: "/admin/staff", label: "Staff & roles", icon: "staff", permission: "staff:manage" },
  { href: "/admin/audit", label: "Activity log", icon: "audit", permission: "audit:view" },
  { href: "/admin/settings", label: "Settings", icon: "settings", permission: "settings:manage" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const items = NAV.filter((item) => can(user.role, item.permission)).map(
    ({ href, label, icon }) => ({ href, label, icon }),
  );

  return (
    <div className="min-h-dvh bg-surface">
      <header className="sticky top-0 z-40 border-b border-line bg-bg/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1600px] items-center gap-3 px-4 sm:px-6">
          <Link href="/admin" className="flex items-center gap-2.5">
            <LogoMark size={26} className="text-ink" />
            <span className="flex flex-col leading-none">
              <span className="text-sm font-extrabold tracking-tight">KAGORIM</span>
              <span className="text-[0.5rem] font-semibold text-subtle" style={{ letterSpacing: "0.3em" }}>
                CONSOLE
              </span>
            </span>
          </Link>

          <div className="ml-auto flex items-center gap-2">
            <Link href="/" className="btn btn-ghost btn-sm hidden sm:inline-flex">
              <Store size={14} /> Storefront
            </Link>
            <ThemeToggle />
            <div className="hidden text-right sm:block">
              <p className="text-xs font-semibold leading-tight">{user.name}</p>
              <p className="text-[11px] leading-tight text-subtle">{ROLE_LABELS[user.role]}</p>
            </div>
            <form action={logoutAction}>
              <button type="submit" className="btn btn-outline btn-sm" aria-label="Sign out">
                <LogOut size={14} />
                <span className="hidden sm:inline">Sign out</span>
              </button>
            </form>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-[1600px] flex-col gap-6 px-4 py-6 sm:px-6 lg:flex-row">
        <aside className="lg:w-56 lg:shrink-0">
          <div className="lg:sticky lg:top-24">
            <AdminNav items={items} />
          </div>
        </aside>
        <main className="min-w-0 flex-1 pb-16">{children}</main>
      </div>
    </div>
  );
}
