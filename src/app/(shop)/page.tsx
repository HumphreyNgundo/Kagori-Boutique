import Link from "next/link";
import {
  ArrowRight,
  Clock,
  MapPin,
  MessageCircle,
  PackageCheck,
  Phone,
  Search,
  ShieldCheck,
  Smartphone,
  Truck,
} from "lucide-react";
import { CategoryTile } from "@/components/shop/CategoryTile";
import { ProductGrid } from "@/components/shop/ProductCard";
import { LogoMark } from "@/components/Logo";
import { getSettings, listCategories, listProducts } from "@/lib/repo/catalog";
import { HERO_PHOTO } from "@/lib/seed/photos";

export const dynamic = "force-dynamic";

const STEPS = [
  {
    icon: PackageCheck,
    title: "Pick your pieces",
    body: "Browse the collection and choose your size, length or shade.",
  },
  {
    icon: Smartphone,
    title: "Pay how you like",
    body: "An M-Pesa prompt straight to your phone, card, or pay the rider on delivery.",
  },
  {
    icon: Truck,
    title: "Track it to your door",
    body: "A tracking code lands on screen instantly. Follow every step without calling anyone.",
  },
];

export default async function HomePage() {
  const [categories, featured, newest, settings] = await Promise.all([
    listCategories(),
    listProducts({ sort: "featured" }),
    listProducts({ sort: "newest" }),
    getSettings(),
  ]);
  const bestsellers = featured.filter((c) => c.product.featured).slice(0, 8);

  return (
    <>
      {/* ------------------------------------------------------------ hero */}
      <section className="relative isolate overflow-hidden border-b border-line">
        <div className="aurora" />
        <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:py-16 lg:grid-cols-[1.05fr_1fr] lg:items-center">
          <div className="animate-rise">
            <span className="badge bg-[var(--brand-soft)] text-brand">
              <ShieldCheck size={13} /> Nairobi · countrywide delivery
            </span>
            <h1 className="mt-5 text-balance text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
              The collection that arrives{" "}
              <span className="bg-gradient-to-r from-[var(--brand-violet)] to-[var(--brand-cyan)] bg-clip-text text-transparent">
                when we said it would.
              </span>
            </h1>
            <p className="mt-5 max-w-lg text-base leading-relaxed text-muted sm:text-lg">
              {settings.tagline} Pay with M-Pesa, get a tracking code on the spot, and watch your
              parcel move from packed to delivered.
            </p>

            {/* Search is the fastest route to a specific piece. */}
            <form action="/shop" className="mt-7 flex max-w-lg gap-2">
              <div className="relative flex-1">
                <Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-subtle" />
                <input
                  name="q"
                  aria-label="Search the collection"
                  placeholder="Search the collection…"
                  className="input !rounded-full !py-3.5 pl-11 text-base"
                />
              </div>
              <button type="submit" className="btn btn-primary !px-6 !py-3.5">
                Search
              </button>
            </form>

            <div className="mt-5 flex flex-wrap gap-3">
              <Link href="/shop" className="btn btn-outline">
                Shop everything <ArrowRight size={16} />
              </Link>
              <Link href="/track" className="btn btn-ghost">
                Track my order
              </Link>
            </div>

            <dl className="mt-9 grid max-w-md grid-cols-3 gap-6 border-t border-line pt-6">
              {[
                ["2 min", "average checkout"],
                ["Free", "delivery over KES 10,000"],
                ["Same day", "within Nairobi CBD"],
              ].map(([big, small]) => (
                <div key={small}>
                  <dt className="text-lg font-bold text-ink">{big}</dt>
                  <dd className="text-xs leading-snug text-muted">{small}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="relative">
            <div className="card overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={HERO_PHOTO}
                alt={settings.storeName}
                fetchPriority="high"
                decoding="async"
                className="aspect-[7/5] w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ----------------------------------------------------- bestsellers */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Loved this week</p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">Bestsellers</h2>
          </div>
          <Link href="/shop?sort=featured" className="btn btn-ghost btn-sm shrink-0">
            See more <ArrowRight size={14} />
          </Link>
        </div>
        <div className="mt-8">
          <ProductGrid cards={bestsellers} priorityCount={4} />
        </div>
      </section>

      {/* ---------------------------------------------------------- new in */}
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Just arrived</p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">New in</h2>
          </div>
          <Link href="/shop?sort=newest" className="btn btn-ghost btn-sm shrink-0">
            See more <ArrowRight size={14} />
          </Link>
        </div>
        <div className="mt-8">
          <ProductGrid cards={newest.slice(0, 8)} />
        </div>
      </section>

      {/* ------------------------------------------------------ categories */}
      <section className="border-y border-line bg-surface">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="eyebrow">Shop by category</p>
              <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">Browse the shelves</h2>
            </div>
            <Link href="/shop" className="btn btn-ghost btn-sm shrink-0">
              View all <ArrowRight size={14} />
            </Link>
          </div>
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {categories.map((c) => (
              <CategoryTile key={c.id} category={c} />
            ))}
          </div>
        </div>
      </section>

      {/* --------------------------------------------------- how it works */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <p className="eyebrow">Self-checkout</p>
        <h2 className="mt-2 max-w-2xl text-balance text-2xl font-bold tracking-tight sm:text-3xl">
          Ordering takes three steps. Nothing else.
        </h2>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {STEPS.map((step, i) => (
            <div key={step.title} className="card p-6">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-[var(--brand-soft)] text-brand">
                  <step.icon size={18} />
                </span>
                <span className="eyebrow">Step {i + 1}</span>
              </div>
              <h3 className="mt-4 text-base font-semibold">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{step.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------- about the brand */}
      <section className="border-t border-line bg-surface">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.3fr_1fr]">
          <div>
            <LogoMark size={40} className="text-ink" />
            <p className="eyebrow mt-5">About us</p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
              {settings.storeName}
            </h2>
            <div className="mt-4 max-w-xl space-y-4 text-sm leading-relaxed text-muted">
              <p>
                We are a Nairobi boutique built on one idea: the piece you ordered should be the
                piece that arrives, on the day we promised. Every unit is checked and photographed
                at packing, and every order carries a code you can follow from our counter to your
                door.
              </p>
              <p>
                Walk into the shop to try things on, or order online and have it delivered anywhere
                in Kenya. Whatever you buy, you deal with people who answer their phone.
              </p>
            </div>
          </div>

          <div className="card h-fit p-6">
            <p className="eyebrow">Visit the shop</p>
            <ul className="mt-4 space-y-4 text-sm">
              <li className="flex gap-3">
                <MapPin size={16} className="mt-0.5 shrink-0 text-brand" />
                <span>
                  <span className="block font-semibold">Where to find us</span>
                  <span className="block text-muted">{settings.address}</span>
                </span>
              </li>
              <li className="flex gap-3">
                <Clock size={16} className="mt-0.5 shrink-0 text-brand" />
                <span>
                  <span className="block font-semibold">Opening hours</span>
                  <span className="block text-muted">{settings.hours}</span>
                </span>
              </li>
              <li className="flex gap-3">
                <Phone size={16} className="mt-0.5 shrink-0 text-brand" />
                <span>
                  <span className="block font-semibold">Talk to us</span>
                  <a href={`tel:${settings.supportPhone.replace(/\s/g, "")}`} className="link-underline text-muted">
                    {settings.supportPhone}
                  </a>
                </span>
              </li>
            </ul>
            <a
              href={`https://wa.me/${settings.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary btn-sm mt-6 w-full"
            >
              <MessageCircle size={14} /> Message us on WhatsApp
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
