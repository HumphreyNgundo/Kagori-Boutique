import { ProductArt } from "@/components/ProductArt";
import type { ProductFamily } from "@/lib/types";

/**
 * Renders a real photo when one exists, generated studio art otherwise.
 * Plain <img> on purpose: images come from /public or Vercel Blob, both
 * already CDN-cached, and this keeps the demo free of remote-pattern config.
 */
export function ProductImage({
  src,
  alt,
  seed,
  family,
  className = "",
  sizes,
  priority = false,
}: {
  src: string | null;
  alt: string;
  seed: string;
  family: ProductFamily;
  className?: string;
  sizes?: string;
  priority?: boolean;
}) {
  if (!src) return <ProductArt seed={seed} family={family} className={className} label={alt} />;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      sizes={sizes}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      className={`object-cover ${className}`}
    />
  );
}
