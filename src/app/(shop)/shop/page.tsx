import { Listing, type ListingParams } from "@/components/shop/Listing";
import { listProducts, type CatalogQuery } from "@/lib/repo/catalog";

export const dynamic = "force-dynamic";
export const metadata = { title: "All products" };

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<ListingParams>;
}) {
  const params = await searchParams;
  const query: CatalogQuery = {
    q: params.q,
    sort: (params.sort as CatalogQuery["sort"]) ?? "featured",
    option: params.option,
    inStockOnly: params.stock === "in",
  };

  const [cards, unfiltered] = await Promise.all([
    listProducts(query),
    listProducts({ q: params.q }),
  ]);

  return (
    <Listing
      base="/shop"
      params={params}
      cards={cards}
      unfiltered={unfiltered}
      showFacets={false}
      title={params.q ? `Results for “${params.q}”` : "All products"}
      subtitle={
        params.q
          ? undefined
          : "Wigs, lashes, heels, flats, doll shoes, sneakers and bags — everything we stock, in one place."
      }
    />
  );
}
