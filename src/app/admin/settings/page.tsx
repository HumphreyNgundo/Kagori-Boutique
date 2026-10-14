import { Database, HardDrive, Image as ImageIcon } from "lucide-react";
import { ResetDemo, SettingsForm } from "@/components/admin/SettingsForm";
import { PageHeader, Panel } from "@/components/admin/ui";
import { requirePermission } from "@/lib/auth/session";
import { getSettings } from "@/lib/repo/catalog";
import { mediaConfigured } from "@/lib/media";
import { driver } from "@/lib/db";

export const dynamic = "force-dynamic";
export const metadata = { title: "Settings" };

export default async function SettingsPage() {
  await requirePermission("settings:manage");
  const settings = await getSettings();
  const mediaReady = mediaConfigured();

  return (
    <>
      <PageHeader title="Settings" subtitle="Store details, payment methods and the data layer." />

      <div className="grid gap-4 xl:grid-cols-[1.4fr_1fr] xl:items-start">
        <Panel title="Storefront">
          <SettingsForm settings={settings} />
        </Panel>

        <div className="space-y-4">
          <Panel title="Infrastructure">
            <ul className="space-y-4 text-sm">
              <li className="flex gap-3">
                <HardDrive size={16} className="mt-0.5 shrink-0 text-subtle" />
                <div>
                  <p className="font-semibold">Persistence · {driver.name}</p>
                  <p className="text-xs leading-relaxed text-muted">
                    {driver.durable
                      ? "Orders, stock and settings survive restarts and are shared across every server instance."
                      : "No storage connected — data resets when the server restarts. Add a Vercel Blob store to make it durable."}
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <ImageIcon size={16} className="mt-0.5 shrink-0 text-subtle" />
                <div>
                  <p className="font-semibold">Product images · {mediaReady ? "Vercel Blob" : "not connected"}</p>
                  <p className="text-xs leading-relaxed text-muted">
                    {mediaReady
                      ? "Upload photos from any product page; they replace the generated artwork instantly."
                      : "Connect a Blob store to upload your own product photos from the console."}
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <Database size={16} className="mt-0.5 shrink-0 text-subtle" />
                <div>
                  <p className="font-semibold">Relational schema ready</p>
                  <p className="text-xs leading-relaxed text-muted">
                    The full Postgres DDL ships in <code className="font-mono">db/schema.sql</code>. When order volume
                    outgrows the document store, point <code className="font-mono">POSTGRES_URL</code> at it and swap
                    the driver — the repositories keep the same interface.
                  </p>
                </div>
              </li>
            </ul>
          </Panel>

          <Panel title="Demo data">
            <p className="mb-3 text-xs leading-relaxed text-muted">
              Puts the catalogue, stock levels and order history back to how they shipped. Useful before a client
              walkthrough. Orders placed since the last reset are discarded.
            </p>
            <ResetDemo />
          </Panel>
        </div>
      </div>
    </>
  );
}
