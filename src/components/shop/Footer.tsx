import Link from "next/link";
import { Instagram, MessageCircle, Music2, Phone } from "lucide-react";
import { Wordmark } from "@/components/Logo";
import { Newsletter } from "@/components/shop/Newsletter";
import { SOCIALS } from "@/lib/brand";
import { listCategories, getSettings } from "@/lib/repo/catalog";
import { buildStamp } from "@/lib/build";

export async function Footer() {
  const [categories, settings] = await Promise.all([listCategories(), getSettings()]);

  return (
    <footer className="mt-24 border-t border-line bg-surface">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <Wordmark />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted">{settings.tagline}</p>
          <div className="mt-5 flex flex-wrap gap-2">
            <a
              href={`https://wa.me/${settings.whatsapp}`}
              className="btn btn-outline btn-sm"
              target="_blank"
              rel="noopener noreferrer"
            >
              <MessageCircle size={14} /> WhatsApp
            </a>
            <a href={`tel:${settings.supportPhone.replace(/\s/g, "")}`} className="btn btn-outline btn-sm">
              <Phone size={14} /> {settings.supportPhone}
            </a>
            <a
              href={SOCIALS.instagram.url}
              className="btn btn-outline btn-sm"
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Instagram ${SOCIALS.instagram.handle}`}
            >
              <Instagram size={14} /> Instagram
            </a>
            <a
              href={SOCIALS.tiktok.url}
              className="btn btn-outline btn-sm"
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`TikTok ${SOCIALS.tiktok.handle}`}
            >
              <Music2 size={14} /> TikTok
            </a>
          </div>
          <p className="mt-4 text-xs leading-relaxed text-subtle">{settings.address}</p>
        </div>

        <div>
          <p className="eyebrow mb-4">Shop</p>
          <ul className="space-y-2.5 text-sm text-muted">
            {categories.map((c) => (
              <li key={c.id}>
                <Link href={`/c/${c.slug}`} className="transition hover:text-brand">{c.name}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="eyebrow mb-4">Orders</p>
          <ul className="space-y-2.5 text-sm text-muted">
            <li><Link href="/track" className="transition hover:text-brand">Track an order</Link></li>
            <li><Link href="/account" className="transition hover:text-brand">My orders</Link></li>
            <li><Link href="/cart" className="transition hover:text-brand">Basket</Link></li>
          </ul>
        </div>

        <div>
          <Newsletter />
          <ul className="mt-6 space-y-2.5 text-sm text-muted">
            <li><Link href="/help" className="transition hover:text-brand">How it works</Link></li>
          </ul>
          <p className="mt-4 text-xs leading-relaxed text-subtle">
            Pay with M-Pesa, card or on delivery.
          </p>
        </div>
      </div>

      <div className="border-t border-line">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-5 text-xs text-subtle sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>
            © {new Date().getFullYear()} {settings.storeName}. All rights reserved.
            <span className="ml-2 opacity-60">build {buildStamp()}</span>
          </p>
          <p>Nairobi, Kenya · Prices in {settings.currency}</p>
        </div>
      </div>
    </footer>
  );
}
