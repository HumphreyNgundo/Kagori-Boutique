import { notFound } from "next/navigation";
import { Listing, type ListingGroup, type ListingParams } from "@/components/shop/Listing";
import { getCategory, listProducts, type CatalogQuery } from "@/lib/repo/catalog";
import { WIG_TYPES } from "@/lib/seed/catalog";
import { WIG_TYPE_PHOTOS } from "@/lib/seed/photos";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const category = await getCategory((await params).slug);
  return { title: category?.name ?? "Category" };
}

/** Wigs are the one shelf cut into types; every other shelf reads flat. */
function groupsFor(slug: string): ListingGroup[] | undefined {
  if (slug !== "wigs") return undefined;
  return WIG_TYPES.map((type) => ({ ...type, photo: WIG_TYPE_PHOTOS[type.tag] }));
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

  const groups = groupsFor(slug);
  const tag = groups?.some((g) => g.tag === search.tag) ? search.tag : undefined;

  const query: CatalogQuery = {
    categorySlug: slug,
    tag,
    sort: (search.sort as CatalogQuery["sort"]) ?? "featured",
    option: search.option,
    inStockOnly: search.stock === "in",
    q: search.q,
  };

  const [cards, unfiltered] = await Promise.all([
    listProducts(query),
    listProducts({ categorySlug: slug }),
  ]);

  const heading = groups?.find((g) => g.tag === tag);

  return (
    <Listing
      base={`/c/${slug}`}
      params={{ ...search, tag }}
      cards={cards}
      unfiltered={unfiltered}
      groups={groups}
      title={heading?.name ?? category.name}
      subtitle={heading?.blurb ?? category.tagline}
    />
  );
}
