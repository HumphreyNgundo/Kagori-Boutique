import { notFound } from "next/navigation";
import { Listing, type ListingParams } from "@/components/shop/Listing";
import { getCategory, listProducts, type CatalogQuery } from "@/lib/repo/catalog";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const category = await getCategory((await params).slug);
  return { title: category?.name ?? "Category" };
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<ListingParams>;
}) {
  const { slug } = await params;
  const search = await searchParams;
  const category = await getCategory(slug);
  if (!category) notFound();

  const query: CatalogQuery = {
    categorySlug: slug,
    sort: (search.sort as CatalogQuery["sort"]) ?? "featured",
    option: search.option,
    inStockOnly: search.stock === "in",
    q: search.q,
  };

  const [cards, unfiltered] = await Promise.all([
    listProducts(query),
    listProducts({ categorySlug: slug }),
  ]);

  return (
    <Listing
      base={`/c/${slug}`}
      params={search}
      cards={cards}
      unfiltered={unfiltered}
      title={category.name}
      subtitle={category.tagline}
    />
  );
}
