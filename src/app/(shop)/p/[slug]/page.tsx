import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, RotateCcw, ShieldCheck, Truck } from "lucide-react";
import { ProductImage } from "@/components/ProductImage";
import { ProductGrid } from "@/components/shop/ProductCard";
import { VariantPicker, type PickerVariant } from "@/components/shop/VariantPicker";
import { availableOf, getProduct, relatedProducts } from "@/lib/repo/catalog";
import { ksh } from "@/lib/money";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const card = await getProduct((await params).slug);
  return card
    ? { title: card.product.name, description: card.product.summary }
    : { title: "Product" };
}

const PROMISES = [
  { icon: Truck, title: "Delivery countrywide", body: "Same-day in Nairobi CBD, 1–3 days upcountry." },
  { icon: ShieldCheck, title: "Checked before it ships", body: "Every item is inspected and photographed at packing." },
  { icon: RotateCcw, title: "7-day exchange", body: "Wrong size? Swap it, unworn, with the receipt." },
];

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const card = await getProduct(slug);
  if (!card) notFound();

  const { product, category, variants, optionAxes } = card;
  const related = await relatedProducts(card);
  const pickerVariants: PickerVariant[] = variants.map((v) => ({
    id: v.id,
    options: v.options,
    price: v.price,
    available: availableOf(v),
  }));
  const gallery = product.images.length ? product.images : [null, null];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <nav className="flex items-center gap-1.5 text-xs text-subtle" aria-label="Breadcrumb">
        <Link href="/shop" className="transition hover:text-brand">Shop</Link>
        <ChevronRight size={12} />
        <Link href={`/c/${category.slug}`} className="transition hover:text-brand">{category.name}</Link>
        <ChevronRight size={12} />
        <span className="truncate text-muted">{product.name}</span>
      </nav>

      <div className="mt-6 grid gap-10 lg:grid-cols-2">
        <div className="space-y-3">
          <div className="card overflow-hidden">
            <ProductImage
              src={gallery[0]}
              alt={product.name}
              seed={product.slug}
              family={category.family}
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="aspect-square w-full"
            />
          </div>
          {gallery.length > 1 && (
            <div className="grid grid-cols-4 gap-3">
              {gallery.slice(1, 5).map((src, i) => (
                <div key={i} className="card overflow-hidden">
                  <ProductImage
                    src={src}
                    alt={`${product.name} view ${i + 2}`}
                    seed={`${product.slug}-${i}`}
                    family={category.family}
                    sizes="12vw"
                    className="aspect-square w-full"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <p className="eyebrow">{category.name}</p>
          <h1 className="mt-2 text-balance text-3xl font-extrabold tracking-tight sm:text-4xl">{product.name}</h1>
          <p className="mt-3 text-base leading-relaxed text-muted">{product.summary}</p>

          {product.compareAtPrice && product.compareAtPrice > card.fromPrice && (
            <p className="mt-3 text-sm">
              <span className="text-subtle line-through">{ksh(product.compareAtPrice)}</span>{" "}
              <span className="badge bg-[var(--danger-soft)] text-[var(--danger)]">
                Save {ksh(product.compareAtPrice - card.fromPrice)}
              </span>
            </p>
          )}

          <div className="mt-8">
            <VariantPicker variants={pickerVariants} axes={optionAxes} />
          </div>

          <div className="mt-8 space-y-4 border-t border-line pt-8">
            <h2 className="text-sm font-semibold">About this piece</h2>
            <p className="text-sm leading-relaxed text-muted">{product.description}</p>
            {product.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {product.tags.map((tag) => (
                  <span key={tag} className="badge bg-surface-2 text-muted">{tag}</span>
                ))}
              </div>
            )}
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {PROMISES.map((p) => (
              <div key={p.title} className="card p-4">
                <p.icon size={16} className="text-brand" />
                <p className="mt-2.5 text-xs font-semibold">{p.title}</p>
                <p className="mt-1 text-xs leading-relaxed text-subtle">{p.body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-20">
          <h2 className="text-xl font-bold tracking-tight">More from {category.name}</h2>
          <div className="mt-6">
            <ProductGrid cards={related} />
          </div>
        </section>
      )}
    </div>
  );
}
