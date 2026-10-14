import Link from "next/link";
import { ProductImage } from "@/components/ProductImage";
import { ksh } from "@/lib/money";
import type { ProductCard as Card } from "@/lib/repo/catalog";

export function ProductCardTile({ card, priority = false }: { card: Card; priority?: boolean }) {
  const { product, category, fromPrice, available } = card;
  const multiPrice = card.variants.some((v) => v.price !== fromPrice);
  const onSale = product.compareAtPrice && product.compareAtPrice > fromPrice;

  return (
    <Link
      href={`/p/${product.slug}`}
      className="group card overflow-hidden transition duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-lg)]"
    >
      <div className="relative aspect-square overflow-hidden bg-surface-2">
        <ProductImage
          src={product.images[0] ?? null}
          alt={product.name}
          seed={product.slug}
          family={category.family}
          priority={priority}
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="h-full w-full transition duration-500 group-hover:scale-105"
        />
        <div className="absolute left-3 top-3 flex flex-col items-start gap-1.5">
          {onSale && (
            <span className="badge bg-[var(--danger-soft)] text-[var(--danger)]">
              Save {ksh(product.compareAtPrice! - fromPrice)}
            </span>
          )}
          {product.featured && !onSale && (
            <span className="badge bg-[var(--brand-soft)] text-brand">Bestseller</span>
          )}
        </div>
        {available === 0 && (
          <div className="absolute inset-0 grid place-items-center bg-bg/70 backdrop-blur-[2px]">
            <span className="badge bg-card text-muted">Sold out</span>
          </div>
        )}
        {available > 0 && available <= 3 && (
          <span className="badge absolute bottom-3 left-3 bg-[var(--warning-soft)] text-[var(--warning)]">
            Only {available} left
          </span>
        )}
      </div>

      <div className="space-y-1.5 p-4">
        <p className="eyebrow">{category.name}</p>
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug transition group-hover:text-brand">
          {product.name}
        </h3>
        <div className="flex items-baseline gap-2 pt-0.5">
          <span className="text-base font-bold">
            {multiPrice && <span className="text-xs font-medium text-subtle">from </span>}
            {ksh(fromPrice)}
          </span>
          {onSale && (
            <span className="text-xs text-subtle line-through">{ksh(product.compareAtPrice!)}</span>
          )}
        </div>
      </div>
    </Link>
  );
}

export function ProductGrid({ cards, priorityCount = 0 }: { cards: Card[]; priorityCount?: number }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
      {cards.map((card, i) => (
        <ProductCardTile key={card.product.id} card={card} priority={i < priorityCount} />
      ))}
    </div>
  );
}
