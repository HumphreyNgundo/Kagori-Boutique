import Link from "next/link";
import { MessageCircle, Phone } from "lucide-react";
import { Wordmark } from "@/components/Logo";
import { Newsletter } from "@/components/shop/Newsletter";
import { listCategories, getSettings } from "@/lib/repo/catalog";
import { buildStamp } from "@/lib/build";

const PROMISES = [
  {
    title: "Handpicked hair",
    body: "Every unit, bundle and bottle is chosen for Nairobi heads and Nairobi weather — nothing we wouldn't wear ourselves.",
  },
  {
    title: "Quality first",
    body: "We check and photograph every piece at packing, so what arrives is exactly what you ordered.",
  },
  {
    title: "Customer care",
    body: "Real people who answer the phone. Keeping you happy is our first job, before and after you buy.",
  },
];

export async function Footer() {
  const [categories, settings] = await Promise.all([listCategories(), getSettings()]);

  return (
    <footer className="mt-24">
      <Newsletter />

      {/* ------------------------------------------------------ promises */}
      <section className="border-b border-line bg-surface">
        <div className="mx-auto grid max-w-5xl gap-10 px-4 py-14 text-center sm:px-6 md:grid-cols-3 md:py-16">
          {PROMISES.map((p) => (
            <div key={p.title}>
              <h3 className="text-2xl font-bold tracking-tight">{p.title}</h3>
              <p className="mx-auto mt-3 max-w-xs text-sm leading-relaxed text-muted">{p.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* -------------------------------------------------------- footer */}
      <div className="bg-bg">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <Wordmark />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted">
              Get exclusive deals and early access to new arrivals.
            </p>
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
            </div>
          </div>

          <nav aria-label="Shop">
            <p className="eyebrow mb-4">Shop</p>
            <ul className="space-y-2.5 text-sm text-muted">
              <li><Link href="/" className="transition hover:text-brand">Home</Link></li>
              <li><Link href="/shop" className="transition hover:text-brand">Catalogue</Link></li>
              {categories.map((c) => (
                <li key={c.id}>
                  <Link href={`/c/${c.slug}`} className="transition hover:text-brand">{c.name}</Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Help">
            <p className="eyebrow mb-4">Help</p>
            <ul className="space-y-2.5 text-sm text-muted">
              <li><Link href="/track" className="transition hover:text-brand">Track an order</Link></li>
              <li><Link href="/cart" className="transition hover:text-brand">Basket</Link></li>
              <li><Link href="/help" className="transition hover:text-brand">Delivery & returns</Link></li>
              <li>
                <a
                  href={`https://wa.me/${settings.whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition hover:text-brand"
                >
                  Contact
                </a>
              </li>
            </ul>
            <p className="mt-5 text-xs leading-relaxed text-subtle">Pay with M-Pesa, card or on delivery.</p>
          </nav>
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
      </div>
    </footer>
  );
}
