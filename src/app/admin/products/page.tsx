import Link from "next/link";
import { Check, Eye, EyeOff, ImageOff, Images, Plus } from "lucide-react";
import { PageHeader, TableWrap, Td, Th } from "@/components/admin/ui";
import { requirePermission } from "@/lib/auth/session";
import { can } from "@/lib/auth/rbac";
import { listProductsForAdmin } from "@/lib/repo/admin";
import { toggleProductAction } from "@/lib/actions/admin";
import { ksh } from "@/lib/money";

export const dynamic = "force-dynamic";
export const metadata = { title: "Products" };

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ archived?: string; deleted?: string }>;
}) {
  const user = await requirePermission("product:view");
  const { archived, deleted } = await searchParams;
  const rows = await listProductsForAdmin();
  const mayEdit = can(user.role, "product:edit");
  const withoutPhotos = rows.filter((r) => r.imageCount === 0).length;

  return (
    <>
      <PageHeader
        title="Products"
        subtitle={`${rows.length} products · ${withoutPhotos} still using placeholder artwork`}
        action={
          mayEdit ? (
            <Link href="/admin/products/new" className="btn btn-primary btn-sm">
              <Plus size={14} /> Add a product
            </Link>
          ) : undefined
        }
      />

      {(archived || deleted) && (
        <p className="mb-4 flex items-center gap-2 rounded-xl bg-[var(--positive-soft)] p-3 text-sm font-medium text-[var(--positive)]">
          <Check size={15} />
          {deleted
            ? "Product deleted."
            : "Product hidden from the shop — it had sales history, so past orders keep their records."}
        </p>
      )}

      {withoutPhotos > 0 && mayEdit && (
        <p className="mb-4 flex items-center gap-2 rounded-xl bg-[var(--brand-soft)] p-3 text-xs text-brand">
          <Images size={14} />
          Open any product to upload its real photos — they replace the placeholder on the storefront instantly.
        </p>
      )}

      <TableWrap>
        <thead className="bg-surface-2">
          <tr>
            <Th>Product</Th>
            <Th>Category</Th>
            <Th>Photos</Th>
            <Th>Variants</Th>
            <Th>In stock</Th>
            <Th className="text-right">From</Th>
            <Th />
          </tr>
        </thead>
        <tbody>
          {rows.map(({ product, categoryName, variantCount, stock, imageCount }) => (
            <tr key={product.id} className="border-t border-line transition hover:bg-surface-2">
              <Td>
                <Link href={`/admin/products/${product.id}`} className="font-semibold hover:text-brand">
                  {product.name}
                </Link>
                <span className="block text-xs text-subtle">{product.slug}</span>
              </Td>
              <Td className="text-muted">{categoryName}</Td>
              <Td>
                {imageCount > 0 ? (
                  <span className="badge bg-[var(--positive-soft)] text-[var(--positive)]">{imageCount}</span>
                ) : (
                  <span className="badge bg-surface-2 text-subtle">
                    <ImageOff size={11} /> none
                  </span>
                )}
              </Td>
              <Td className="text-muted tabular-nums">{variantCount}</Td>
              <Td className="tabular-nums" style={{ color: stock === 0 ? "var(--danger)" : undefined }}>
                {stock}
              </Td>
              <Td className="text-right font-semibold tabular-nums">{ksh(product.basePrice)}</Td>
              <Td className="text-right">
                {mayEdit ? (
                  <form action={toggleProductAction}>
                    <input type="hidden" name="productId" value={product.id} />
                    <button type="submit" className="btn btn-ghost btn-sm" title={product.active ? "Hide from storefront" : "Publish"}>
                      {product.active ? <Eye size={14} /> : <EyeOff size={14} />}
                      {product.active ? "Live" : "Hidden"}
                    </button>
                  </form>
                ) : (
                  <span className="text-xs text-subtle">{product.active ? "Live" : "Hidden"}</span>
                )}
              </Td>
            </tr>
          ))}
        </tbody>
      </TableWrap>
    </>
  );
}
