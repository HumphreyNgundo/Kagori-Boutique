import Link from "next/link";
import {
  ArrowRight,
  Clock,
  CreditCard,
  Heart,
  Instagram,
  MapPin,
  MessageCircle,
  Music2,
  PackageCheck,
  Phone,
  Search,
  Sparkles,
  Truck,
} from "lucide-react";
import { CategoryTile } from "@/components/shop/CategoryTile";
import { ProductGrid } from "@/components/shop/ProductCard";
import { LogoBadge } from "@/components/Logo";
import { SOCIALS } from "@/lib/brand";
import { getSettings, listCategories, listProducts } from "@/lib/repo/catalog";
import { WIG_TYPES } from "@/lib/seed/catalog";
import { HERO_PHOTO, WIG_TYPE_PHOTOS } from "@/lib/seed/photos";

export const dynamic = "force-dynamic";

const STEPS = [
  {
    icon: PackageCheck,
    title: "Pick your pieces",
    body: "Browse our collection and select your favourite wigs. Add your desired pieces to your shopping cart.",
  },
  {
    icon: CreditCard,
    title: "Checkout and pay",
    body: "Proceed to checkout, fill in your delivery details and complete your payment using the available payment options.",
  },
  {
    icon: Truck,
    title: "Track it to your door",
    body: "Once your order is confirmed, a tracking code lands on your screen instantly. Sit back, relax and track your Bello Beauty goodies right to your doorstep.",
  },
];

const PROMISES = [
  {
    icon: Heart,
    title: "Handpicked hair",
    body: "At Bello Beauty, every unit is thoughtfully handpicked with quality, beauty and style in mind. We don't just sell wigs; we curate beautiful hair pieces that help you look good, feel confident and express your unique style.",
  },
  {
    icon: Sparkles,
    title: "Quality first",
    body: "We are committed to providing beautiful, carefully selected wigs that meet our quality standards. We want every Bello Babe to look good, feel confident and love their purchase. Because you deserve nothing but the best!",
  },
  {
    icon: MessageCircle,
    title: "Customer care",
    body: "We're always happy to hear from our Bello Babes! Our customer care team is available to assist you with enquiries, orders, product recommendations and any concerns.",
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

  const FAQ: { q: string; a: React.ReactNode }[] = [
    {
      q: "What types of wigs do you sell?",
      a: (
        <>
          We offer a beautiful selection of frontal wigs, closure wigs, headband wigs and extensions
          in different textures, lengths and styles — giving you plenty of options to find your
          perfect look.
        </>
      ),
    },
    {
      q: "When will I receive my order?",
      a: (
        <>
          Once your order has been confirmed and processed, delivery timelines depend on your
          location.
          <span className="mt-2 block">
            <strong className="text-ink">Nairobi:</strong> delivery is typically within hours.
          </span>
          <span className="block">
            <strong className="text-ink">Outside Nairobi:</strong> delivery typically takes 1–2
            business days.
          </span>
        </>
      ),
    },
    {
      q: "How can I contact Bello Beauty?",
      a: (
        <>
          You can reach us through:
          <span className="mt-2 flex flex-wrap gap-x-5 gap-y-1">
            <a
              href={`https://wa.me/${settings.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="link-underline inline-flex items-center gap-1.5"
            >
              <MessageCircle size={14} /> WhatsApp: {settings.supportPhone}
            </a>
            <a
              href={SOCIALS.instagram.url}
              target="_blank"
              rel="noopener noreferrer"
              className="link-underline inline-flex items-center gap-1.5"
            >
              <Instagram size={14} /> Instagram: {SOCIALS.instagram.handle}
            </a>
            <a
              href={SOCIALS.tiktok.url}
              target="_blank"
              rel="noopener noreferrer"
              className="link-underline inline-flex items-center gap-1.5"
            >
              <Music2 size={14} /> TikTok: {SOCIALS.tiktok.handle}
            </a>
          </span>
        </>
      ),
    },
  ];

  return (
    <>
      {/* ------------------------------------------------------------ hero */}
      <section className="relative isolate overflow-hidden border-b border-line">
        <div className="aurora" />
        <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:py-16 lg:grid-cols-[1.05fr_1fr] lg:items-center">
          <div className="animate-rise">
            <span className="badge bg-[var(--brand-soft)] text-brand">
              <Sparkles size={13} /> Nairobi · same day delivery
            </span>
            <h1 className="mt-5 text-balance text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
              Handpicked hair for{" "}
              <span className="bg-gradient-to-r from-[var(--brand-pink)] to-[var(--brand-rose)] bg-clip-text text-transparent">
                every Bello Babe.
              </span>
            </h1>
            {/* Search is the fastest route to a specific piece. */}
            <form action="/shop" className="mt-8 flex max-w-lg gap-2">
              <div className="relative flex-1">
                <Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-subtle" />
                <input
                  name="q"
                  aria-label="Search the collection"
                  placeholder="Search wigs, bundles, haircare…"
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
                ["Same day", "anywhere in Nairobi"],
                ["1–2 days", "outside Nairobi"],
                ["Free", "delivery over KES 10,000"],
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
                alt={`${settings.storeName} packaging`}
                fetchPriority="high"
                decoding="async"
                className="aspect-[5/4] w-full object-cover"
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

      {/* -------------------------------------------------------- wig types */}
      <section className="border-y border-line bg-surface">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="eyebrow">Find your cut</p>
              <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">Shop wigs by type</h2>
            </div>
            <Link href="/c/wigs" className="btn btn-ghost btn-sm shrink-0">
              All wigs <ArrowRight size={14} />
            </Link>
          </div>
          <div className="mt-8 grid grid-cols-3 gap-4">
            {WIG_TYPES.map((type) => (
              <Link
                key={type.tag}
                href={`/c/wigs?tag=${type.tag}`}
                className="card group overflow-hidden transition hover:border-brand"
              >
                <div className="relative aspect-[5/4] overflow-hidden sm:aspect-[4/3]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={WIG_TYPE_PHOTOS[type.tag]}
                    alt={type.name}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="p-3 sm:p-4">
                  <p className="text-sm font-semibold group-hover:text-brand sm:text-base">
                    {type.name}
                  </p>
                  <p className="mt-1 hidden text-xs leading-snug text-subtle sm:block">{type.blurb}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------- new in */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
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
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
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
          Ordering takes three easy steps
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
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
            <LogoBadge size={72} className="shrink-0 shadow-[var(--shadow-md)]" />
            <div>
              <p className="eyebrow">Why {settings.storeName}</p>
              <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
                Beautiful hair, chosen with care
              </h2>
            </div>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {PROMISES.map((promise) => (
              <div key={promise.title} className="card p-6">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-[var(--brand-soft)] text-brand">
                  <promise.icon size={18} />
                </span>
                <h3 className="mt-4 text-base font-semibold">{promise.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{promise.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------- faq */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.25fr]">
          <div>
            <p className="eyebrow">Good to know</p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
              Frequently asked questions
            </h2>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted">
              Anything we haven&apos;t covered here, message us on WhatsApp — a Bello Beauty human
              answers during shop hours.
            </p>
            <Link href="/help" className="btn btn-outline btn-sm mt-5">
              More answers <ArrowRight size={14} />
            </Link>
          </div>

          <dl className="space-y-4">
            {FAQ.map((item) => (
              <div key={item.q} className="card p-6">
                <dt className="text-base font-bold">{item.q}</dt>
                <dd className="mt-2 text-sm leading-relaxed text-muted">{item.a}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ------------------------------------------------------ visit us */}
      <section className="border-t border-line bg-surface">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <p className="eyebrow">Come say hello</p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">Visit the shop</h2>

          <div className="mt-8 grid gap-5 md:grid-cols-3">
            <div className="card p-6">
              <MapPin size={18} className="text-brand" />
              <p className="mt-4 font-semibold">Where to find us</p>
              <p className="mt-1 text-sm leading-relaxed text-muted">{settings.address}</p>
            </div>
            <div className="card p-6">
              <Clock size={18} className="text-brand" />
              <p className="mt-4 font-semibold">Opening hours</p>
              <p className="mt-1 text-sm leading-relaxed text-muted">{settings.hours}</p>
            </div>
            <div className="card p-6">
              <Phone size={18} className="text-brand" />
              <p className="mt-4 font-semibold">Talk to us</p>
              <a
                href={`tel:${settings.supportPhone.replace(/\s/g, "")}`}
                className="link-underline mt-1 block text-sm text-muted"
              >
                {settings.supportPhone}
              </a>
              <div className="mt-4 flex flex-wrap gap-2">
                <a
                  href={`https://wa.me/${settings.whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary btn-sm"
                >
                  <MessageCircle size={14} /> WhatsApp
                </a>
                <a
                  href={SOCIALS.instagram.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline btn-sm"
                >
                  <Instagram size={14} /> Instagram
                </a>
                <a
                  href={SOCIALS.tiktok.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline btn-sm"
                >
                  <Music2 size={14} /> TikTok
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
