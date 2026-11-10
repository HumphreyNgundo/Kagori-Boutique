import Link from "next/link";
import { SlidersHorizontal } from "lucide-react";
import { ProductGrid } from "@/components/shop/ProductCard";
import { facetsOf, type ProductCard } from "@/lib/repo/catalog";

export interface ListingParams {
  q?: string;
  sort?: string;
  option?: string;
  stock?: string;
  tag?: string;
}

/** A way of cutting one shelf — wigs by headband / closure / frontal. */
export interface ListingGroup {
  tag: string;
  name: string;
  blurb: string;
  photo: string;
}

const SORTS: [string, string][] = [
  ["featured", "Featured"],
  ["newest", "Newest"],
  ["price-asc", "Price: low to high"],
  ["price-desc", "Price: high to low"],
];

function href(base: string, params: ListingParams, patch: Partial<ListingParams>): string {
  const next = { ...params, ...patch };
  const query = Object.entries(next)
    .filter(([, v]) => v)
    .map(([k, v]) => `${k}=${encodeURIComponent(v as string)}`)
    .join("&");
  return query ? `${base}?${query}` : base;
}

export function Listing({
  base,
  params,
  cards,
  unfiltered,
  title,
  subtitle,
  showFacets = true,
  groups,
}: {
  base: string;
  params: ListingParams;
  cards: ProductCard[];
  /** Full result set for the facet rail, so options don't vanish as you filter. */
  unfiltered: ProductCard[];
  title: string;
  subtitle?: string;
  /** Option facets only make sense within one category — sizes differ per family. */
  showFacets?: boolean;
  /** Sub-shelves shown above the grid, each a tag on the product. */
  groups?: ListingGroup[];
}) {
  const facets = facetsOf(unfiltered);
  const active = params.option ?? "";
  const hasFilters = Boolean(params.option || params.stock || params.q || params.tag);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">Bello Beauty</p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">{title}</h1>
          {subtitle && <p className="mt-2 max-w-xl text-sm text-muted">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-2">
          <span className="hidden text-sm text-subtle sm:inline">
            {cards.length} {cards.length === 1 ? "item" : "items"}
          </span>
          <form action={base} className="flex items-center gap-2">
            {params.q && <input type="hidden" name="q" value={params.q} />}
            {params.tag && <input type="hidden" name="tag" value={params.tag} />}
            {params.option && <input type="hidden" name="option" value={params.option} />}
            {params.stock && <input type="hidden" name="stock" value={params.stock} />}
            <label className="sr-only" htmlFor="sort">Sort</label>
            <select
              id="sort"
              name="sort"
              defaultValue={params.sort ?? "featured"}
              className="input !w-auto !rounded-full !py-2 text-sm"
            >
              {SORTS.map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
            <button type="submit" className="btn btn-outline btn-sm">
              <SlidersHorizontal size={14} /> Apply
            </button>
          </form>
        </div>
      </header>

      {/* Sub-shelves: the three ways we cut a wig, with a photo each. */}
      {groups?.length ? (
        <div className="mt-7 grid grid-cols-3 gap-3 sm:gap-4">
          {groups.map((group) => {
            const on = params.tag === group.tag;
            return (
              <Link
                key={group.tag}
                href={href(base, params, { tag: on ? undefined : group.tag })}
                aria-pressed={on}
                className={`card group overflow-hidden transition ${on ? "ring-2 ring-brand" : "hover:border-brand"}`}
              >
                <div className="relative aspect-[5/4] overflow-hidden sm:aspect-[4/3]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={group.photo}
                    alt={group.name}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="p-3">
                  <p className={`text-sm font-semibold ${on ? "text-brand" : "group-hover:text-brand"}`}>
                    {group.name}
                  </p>
                  <p className="mt-0.5 hidden text-xs leading-snug text-subtle sm:block">{group.blurb}</p>
                </div>
              </Link>
            );
          })}
        </div>
      ) : null}

      {/* Facet rail: one axis (size / length / colour) plus availability. */}
      <div className="no-scrollbar mt-6 flex items-center gap-2 overflow-x-auto pb-1">
        {showFacets && (
          <Link href={href(base, params, { option: undefined })} className="chip shrink-0" data-active={!active}>
            All options
          </Link>
        )}
        {showFacets && Object.entries(facets).flatMap(([axis, values]) =>
          values.slice(0, 10).map((value) => {
            const key = `${axis}:${value}`;
            return (
              <Link
                key={key}
                href={href(base, params, { option: active === key ? undefined : key })}
                className="chip shrink-0"
                data-active={active === key}
              >
                {axis} {value}
              </Link>
            );
          }),
        )}
        {hasFilters && (
          <Link href={base} className="chip shrink-0 border-dashed">
            Clear
          </Link>
        )}
      </div>

      <div className="mt-8">
        {cards.length ? (
          <ProductGrid cards={cards} priorityCount={4} />
        ) : (
          <div className="card grid place-items-center gap-3 p-16 text-center">
            <p className="text-lg font-semibold">Nothing matches that yet</p>
            <p className="max-w-sm text-sm text-muted">
              Try clearing a filter, or search for something else — we restock weekly.
            </p>
            <Link href={base} className="btn btn-outline btn-sm">Clear filters</Link>
          </div>
        )}
      </div>
    </div>
  );
}
