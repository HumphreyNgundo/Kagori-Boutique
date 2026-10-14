import Link from "next/link";
import { ArrowRight, PackageCheck, ShieldCheck, Smartphone, Truck } from "lucide-react";
import { ProductArt } from "@/components/ProductArt";
import { ProductGrid } from "@/components/shop/ProductCard";
import { listCategories, listProducts } from "@/lib/repo/catalog";

export const dynamic = "force-dynamic";

const STEPS = [
  { icon: PackageCheck, title: "Pick your pieces", body: "Browse by category, choose your size, length or shade. No account, no sign-up form." },
  { icon: Smartphone, title: "Pay how you like", body: "M-Pesa prompt straight to your phone, card, or pay the rider on delivery." },
  { icon: Truck, title: "Track it to your door", body: "A tracking code lands on screen instantly. Follow every step without calling anyone." },
];

export default async function HomePage() {
  const [categories, featured, newest] = await Promise.all([
    listCategories(),
    listProducts({ sort: "featured" }),
    listProducts({ sort: "newest" }),
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
              Wigs, lashes &amp; shoes that arrive{" "}
              <span className="bg-gradient-to-r from-[var(--brand-violet)] to-[var(--brand-cyan)] bg-clip-text text-transparent">
                when we said they would.
              </span>
            </h1>
            <p className="mt-5 max-w-lg text-base leading-relaxed text-muted sm:text-lg">
              Self-checkout in under two minutes. Pay with M-Pesa, get a tracking code on
              the spot, and watch your parcel move from packed to delivered.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/shop" className="btn btn-primary !px-6 !py-3">
                Shop the boutique <ArrowRight size={16} />
              </Link>
              <Link href="/track" className="btn btn-outline !px-6 !py-3">
                Track my order
              </Link>
            </div>
            <dl className="mt-10 grid max-w-md grid-cols-3 gap-6 border-t border-line pt-6">
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

          {/* Collage of category art — doubles as navigation. */}
          <div className="relative grid grid-cols-2 gap-3 sm:gap-4">
            {categories.slice(0, 4).map((c, i) => (
              <Link
                key={c.id}
                href={`/c/${c.slug}`}
                className={`card group overflow-hidden ${i % 2 === 1 ? "mt-5" : ""}`}
              >
                <ProductArt
                  seed={c.slug}
                  family={c.family}
                  className="aspect-square w-full transition duration-500 group-hover:scale-105"
                />
                <div className="p-3">
                  <p className="text-sm font-semibold group-hover:text-brand">{c.name}</p>
                  <p className="line-clamp-1 text-xs text-subtle">{c.tagline}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------ categories */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Shop by category</p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">Everything in the boutique</h2>
          </div>
          <Link href="/shop" className="btn btn-ghost btn-sm shrink-0">
            View all <ArrowRight size={14} />
          </Link>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {categories.map((c) => (
            <Link key={c.id} href={`/c/${c.slug}`} className="card group overflow-hidden text-center">
              <ProductArt seed={`${c.slug}-tile`} family={c.family} className="aspect-square w-full transition duration-500 group-hover:scale-105" />
              <div className="p-3">
                <p className="text-sm font-semibold group-hover:text-brand">{c.name}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------ bestsellers */}
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6">
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

      {/* --------------------------------------------------- how it works */}
      <section className="border-y border-line bg-surface">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
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
        </div>
      </section>

      {/* ------------------------------------------------------------ new in */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Just arrived</p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">New in</h2>
          </div>
        </div>
        <div className="mt-8">
          <ProductGrid cards={newest.slice(0, 8)} />
        </div>
      </section>
    </>
  );
}
