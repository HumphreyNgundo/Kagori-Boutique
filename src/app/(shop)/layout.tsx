import { Header } from "@/components/shop/Header";
import { Footer } from "@/components/shop/Footer";
import { WhatsAppButton } from "@/components/shop/WhatsAppButton";
import { getSettings } from "@/lib/repo/catalog";

export default async function ShopLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSettings();

  return (
    <div className="flex min-h-dvh flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <WhatsAppButton phone={settings.whatsapp} storeName={settings.storeName} />
    </div>
  );
}
