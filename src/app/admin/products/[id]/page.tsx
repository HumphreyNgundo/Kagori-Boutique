import Link from "next/link";
import { notFound } from "next/navigation";
import { Check, ChevronLeft, ExternalLink } from "lucide-react";
import {
  AddVariantForm,
  EditProductForm,
  RemoveProductButton,
  RemoveVariantButton,
  RestoreVariantButton,
  type CategoryOption,
} from "@/components/admin/CatalogueForms";
import { MediaManager } from "@/components/admin/MediaManager";
import { PriceField, StockAdjuster } from "@/components/admin/PriceEditor";
import { PageHeader, Panel, TableWrap, Td, Th } from "@/components/admin/ui";
import { ProductImage } from "@/components/ProductImage";
import { requirePermission } from "@/lib/auth/session";
import { can } from "@/lib/auth/rbac";
import { getProductForAdmin } from "@/lib/repo/admin";
import { listCategories } from "@/lib/repo/catalog";
import { mediaConfigured } from "@/lib/media";
import { ksh } from "@/lib/money";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const found = await getProductForAdmin((await params).id);
  return { title: found?.product.name ?? "Product" };
}

export default async function AdminProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ created?: string }>;
}) {
  const user = await requirePermission("product:view");
  const [{ id }, { created }] = await Promise.all([params, searchParams]);
  const found = await getProductForAdmin(id);
  if (!found) notFound();

  const { product, category, variants } = found;
  const mayEdit = can(user.role, "product:edit");
  const mayAdjust = can(user.role, "inventory:adjust");
  const categories = await listCategories();
  const categoryOptions: CategoryOption[] = categories.map((c) => ({ id: c.id, name: c.name, family: c.family }));

  const live = variants.filter((v) => v.active);
  const retired = variants.filter((v) => !v.active);
  // New options reuse the axis names already in use, so the catalogue stays consistent.
  const axes = [...new Set(live.flatMap((v) => Object.keys(v.options)))];

  return (
    <>
      <Link href="/admin/products" className="btn btn-ghost btn-sm -ml-2 mb-2">
        <ChevronLeft size={15} /> All products
      </Link>

      {created && (
        <p className="mb-4 flex items-center gap-2 rounded-xl bg-[var(--positive-soft)] p-3 text-sm font-medium text-[var(--positive)]">
          <Check size={15} /> Product created and live on the shop. Add its photos and any other sizes below.
        </p>
      )}

      <PageHeader
        title={product.name}
        subtitle={`${category.name} · ${live.length} option${live.length === 1 ? "" : "s"}${product.active ? "" : " · hidden from the shop"}`}
        action={
          <Link href={`/p/${product.slug}`} className="btn btn-outline btn-sm" target="_blank">
            View on storefront <ExternalLink size={13} />
          </Link>
        }
      />

      <div className="grid gap-4 xl:grid-cols-[1fr_1.2fr] xl:items-start">
        <div className="space-y-4">
          <Panel title="Photos">
            {mayEdit ? (
              <MediaManager
                productId={product.id}
                slug={product.slug}
                images={product.images}
                storageReady={mediaConfigured()}
              />
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {(product.images.length ? product.images : [null]).map((src, i) => (
                  <ProductImage
                    key={i}
                    src={src}
                    alt={product.name}
                    seed={product.slug}
                    family={category.family}
                    className="aspect-square w-full rounded-xl"
                  />
                ))}
              </div>
            )}
          </Panel>

        </div>

        <div className="space-y-4">
          <Panel title="Options, prices & stock">
            <TableWrap>
              <thead className="bg-surface-2">
                <tr>
                  <Th>Option</Th>
                  <Th>SKU</Th>
                  <Th>Price (KES)</Th>
                  <Th>Stock</Th>
                  {mayAdjust && <Th>Add / remove</Th>}
                  {mayEdit && <Th />}
                </tr>
              </thead>
              <tbody>
                {live.map((variant) => {
                  const available = Math.max(0, variant.stock - variant.reserved);
                  const label = Object.values(variant.options).join(" · ") || "Standard";
                  return (
                    <tr key={variant.id} className="border-t border-line">
                      <Td className="font-medium">{label}</Td>
                      <Td className="text-xs text-subtle">{variant.sku}</Td>
                      <Td>
                        {mayEdit ? (
                          <PriceField variantId={variant.id} price={variant.price} />
                        ) : (
                          <span className="tabular-nums">{ksh(variant.price)}</span>
                        )}
                      </Td>
                      <Td>
                        <span
                          className="font-semibold tabular-nums"
                          style={{ color: available <= variant.lowStockThreshold ? "var(--warning)" : undefined }}
                        >
                          {available}
                        </span>
                        {variant.reserved > 0 && (
                          <span className="block text-xs text-subtle">{variant.reserved} held</span>
                        )}
                      </Td>
                      {mayAdjust && (
                        <Td>
                          <StockAdjuster variantId={variant.id} />
                        </Td>
                      )}
                      {mayEdit && (
                        <Td>
                          <RemoveVariantButton variantId={variant.id} label={label} />
                        </Td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </TableWrap>
            <p className="mt-3 text-xs text-subtle">
              Type <strong className="text-ink">+5</strong> to receive new stock or{" "}
              <strong className="text-ink">-2</strong> to write off damaged units — every change is logged.
            </p>
          </Panel>

          {mayEdit && (
            <Panel title="Add a size, colour or style">
              <AddVariantForm productId={product.id} axes={axes.length ? axes : ["Size"]} />
            </Panel>
          )}

          {retired.length > 0 && (
            <Panel title="Retired options">
              <p className="mb-3 text-xs text-muted">
                Removed from the shop but kept because they appear in past orders.
              </p>
              <ul className="space-y-2">
                {retired.map((variant) => (
                  <li key={variant.id} className="flex items-center justify-between gap-3 text-sm">
                    <span>
                      <span className="font-medium">{Object.values(variant.options).join(" · ") || "Standard"}</span>
                      <span className="ml-2 text-xs text-subtle">{variant.sku}</span>
                    </span>
                    {mayEdit && <RestoreVariantButton variantId={variant.id} />}
                  </li>
                ))}
              </ul>
            </Panel>
          )}

          {mayEdit && (
            <Panel title="Product details">
              <EditProductForm
                productId={product.id}
                categories={categoryOptions}
                product={{
                  name: product.name,
                  categoryId: product.categoryId,
                  summary: product.summary,
                  description: product.description,
                  tags: product.tags,
                  featured: product.featured,
                }}
              />
            </Panel>
          )}

          {mayEdit && (
            <Panel title="Danger zone">
              <RemoveProductButton productId={product.id} name={product.name} />
            </Panel>
          )}
        </div>
      </div>
    </>
  );
}
