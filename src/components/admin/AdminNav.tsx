"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export interface NavItem {
  href: string;
  label: string;
  icon: string;
}

/** Icon names are resolved here so the server can keep the nav data serialisable. */
import {
  Boxes,
  ClipboardList,
  LayoutDashboard,
  ScrollText,
  Settings,
  ShoppingCart,
  Truck,
  Users,
  UsersRound,
} from "lucide-react";

const ICONS: Record<string, typeof Boxes> = {
  dashboard: LayoutDashboard,
  orders: ShoppingCart,
  deliveries: Truck,
  products: ClipboardList,
  inventory: Boxes,
  customers: Users,
  staff: UsersRound,
  audit: ScrollText,
  settings: Settings,
};

export function AdminNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();

  return (
    <nav className="no-scrollbar flex gap-1 overflow-x-auto lg:flex-col lg:gap-0.5 lg:overflow-visible">
      {items.map((item) => {
        const Icon = ICONS[item.icon] ?? LayoutDashboard;
        const active = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className="flex shrink-0 items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition"
            style={{
              background: active ? "var(--brand-soft)" : "transparent",
              color: active ? "var(--brand)" : "var(--ink-muted)",
            }}
          >
            <Icon size={16} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
