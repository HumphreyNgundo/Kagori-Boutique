import Link from "next/link";
import { ProductArt } from "@/components/ProductArt";
import { categoryPhoto } from "@/lib/seed/photos";
import type { Category } from "@/lib/types";

/**
 * A shelf tile: real photography where we have it, generated art otherwise,
 * so a new category never renders as a hole in the grid.
 */
export function CategoryTile({
  category,
  className = "",
  aspect = "aspect-square",
  priority = false,
}: {
  category: Category;
  className?: string;
  aspect?: string;
  priority?: boolean;
}) {
  const photo = categoryPhoto(category.slug);

  return (
    <Link href={`/c/${category.slug}`} className={`card group overflow-hidden ${className}`}>
      <div className={`relative overflow-hidden ${aspect}`}>
        {photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={photo}
            alt={category.name}
            loading={priority ? "eager" : "lazy"}
            decoding="async"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <ProductArt
            seed={category.slug}
            family={category.family}
            className="h-full w-full transition duration-500 group-hover:scale-105"
          />
        )}
      </div>
      <div className="p-3">
        <p className="text-sm font-semibold group-hover:text-brand">{category.name}</p>
        <p className="line-clamp-1 text-xs text-subtle">{category.tagline}</p>
      </div>
    </Link>
  );
}
