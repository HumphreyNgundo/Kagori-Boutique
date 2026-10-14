import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, ExternalLink } from "lucide-react";
import { MediaManager } from "@/components/admin/MediaManager";
import { PriceField, StockAdjuster } from "@/components/admin/PriceEditor";
import { PageHeader, Panel, TableWrap, Td, Th } from "@/components/admin/ui";
import { ProductImage } from "@/components/ProductImage";
import { requirePermission } from "@/lib/auth/session";
import { can } from "@/lib/auth/rbac";
import { getProductForAdmin } from "@/lib/repo/admin";
import { mediaConfigured } from "@/lib/media";
import { ksh } from "@/lib/money";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const found = await getProductForAdmin((await params).id);
  return { title: found?.product.name ?? "Product" };
}

export default async function AdminProductPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requirePermission("product:view");
  const found = await getProductForAdmin((await params).id);
  if (!found) notFound();

  const { product, category, variants } = found;
  const mayEdit = can(user.role, "product:edit");
  const mayAdjust = can(user.role, "inventory:adjust");

  return (
    <>
      <Link href="/admin/products" className="btn btn-ghost btn-sm -ml-2 mb-2">
        <ChevronLeft size={15} /> All products
      </Link>

      <PageHeader
        title={product.name}
        subtitle={`${category.name} · ${variants.length} variants`}
        action={
          <Link href={`/p/${product.slug}`} className="btn btn-outline btn-sm" target="_blank">
            View on storefront <ExternalLink size={13} />
          </Link>
        }
      />

      <div className="grid gap-4 xl:grid-cols-[1fr_1.2fr] xl:items-start">
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

        <div className="space-y-4">
          <Panel title="Variants, prices & stock">
            <TableWrap>
              <thead className="bg-surface-2">
                <tr>
                  <Th>Option</Th>
                  <Th>SKU</Th>
                  <Th>Price (KES)</Th>
                  <Th>Stock</Th>
                  {mayAdjust && <Th>Adjust</Th>}
                </tr>
              </thead>
              <tbody>
                {variants.map((variant) => {
                  const available = Math.max(0, variant.stock - variant.reserved);
                  return (
                    <tr key={variant.id} className="border-t border-line">
                      <Td className="font-medium">{Object.values(variant.options).join(" · ")}</Td>
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
                    </tr>
                  );
                })}
              </tbody>
            </TableWrap>
          </Panel>

          <Panel title="Description">
            <p className="text-sm leading-relaxed text-muted">{product.description}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {product.tags.map((tag) => (
                <span key={tag} className="badge bg-surface-2 text-muted">{tag}</span>
              ))}
            </div>
          </Panel>
        </div>
      </div>
    </>
  );
}
