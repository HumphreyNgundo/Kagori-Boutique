import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { NewProductForm, type CategoryOption } from "@/components/admin/CatalogueForms";
import { PageHeader, Panel } from "@/components/admin/ui";
import { requirePermission } from "@/lib/auth/session";
import { listCategories } from "@/lib/repo/catalog";
import { FAMILY_AXES } from "@/lib/repo/admin";

export const dynamic = "force-dynamic";
export const metadata = { title: "New product" };

export default async function NewProductPage() {
  await requirePermission("product:edit");
  const categories = await listCategories();
  const options: CategoryOption[] = categories.map((c) => ({ id: c.id, name: c.name, family: c.family }));

  return (
    <>
      <Link href="/admin/products" className="btn btn-ghost btn-sm -ml-2 mb-2">
        <ChevronLeft size={15} /> All products
      </Link>
      <PageHeader
        title="Add a product"
        subtitle="Takes a minute. You can upload photos and add more sizes straight after."
      />
      <div className="max-w-3xl">
        <Panel title="Details">
          <NewProductForm categories={options} axesByFamily={FAMILY_AXES} />
        </Panel>
      </div>
    </>
  );
}
