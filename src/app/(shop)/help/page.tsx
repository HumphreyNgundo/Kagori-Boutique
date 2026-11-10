import Link from "next/link";
import { Instagram, MessageCircle, Music2 } from "lucide-react";
import { SOCIALS } from "@/lib/brand";
import { getSettings } from "@/lib/repo/catalog";

export const dynamic = "force-dynamic";
export const metadata = { title: "Delivery, returns & how it works" };

const FAQ: [string, string][] = [
  ["What types of wigs do you sell?", "We offer a beautiful selection of frontal wigs, closure wigs, headband wigs and extensions in different textures, lengths and styles — giving you plenty of options to find your perfect look."],
  ["When will I receive my order?", "Once your order has been confirmed and processed, delivery timelines depend on your location. Nairobi: delivery is typically within hours. Outside Nairobi: delivery typically takes 1–2 business days."],
  ["How do I order?", "Add what you want to the basket and press checkout. You give a name, a phone number, an email for the receipt and an address — that's it. No account needed."],
  ["How do I pay?", "M-Pesa (we send a prompt to your phone), card, or cash/M-Pesa to the rider on delivery within Nairobi."],
  ["How much is delivery?", "From KES 200 within the CBD. Free on orders over KES 10,000. Pickup from the shop on Moi Avenue is always free."],
  ["Can I track my order?", "Yes. Every order gets a code like BB-7F3Q2A. Enter it on the Track page from any device and you'll see exactly where the parcel is."],
  ["What if it isn't right?", "Exchange within 7 days, unused and with the packaging. For hygiene reasons a unit that has been worn or installed can't be exchanged."],
  ["Are the wigs human hair?", "Each product says so on its page. Where it says human hair, it is 100% human hair and can be dyed and heat-styled."],
];

export default async function HelpPage() {
  const settings = await getSettings();
  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <p className="eyebrow">Help</p>
      <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">
        How {settings.storeName} works
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-muted">
        Short answers to what our Bello Babes ask us most. Anything else, message us — we reply fast.
      </p>

      <dl className="mt-10 space-y-4">
        {FAQ.map(([q, a]) => (
          <div key={q} className="card p-6">
            <dt className="text-base font-bold">{q}</dt>
            <dd className="mt-2 text-sm leading-relaxed text-muted">{a}</dd>
          </div>
        ))}
      </dl>

      <div className="card mt-8 p-6">
        <p className="font-bold">How can I contact {settings.storeName}?</p>
        <p className="mt-1 text-sm text-muted">
          We&apos;re here during shop hours — {settings.hours}.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <a
            href={`https://wa.me/${settings.whatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary btn-sm"
          >
            <MessageCircle size={14} /> WhatsApp {settings.supportPhone}
          </a>
          <a
            href={SOCIALS.instagram.url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-outline btn-sm"
          >
            <Instagram size={14} /> {SOCIALS.instagram.handle}
          </a>
          <a
            href={SOCIALS.tiktok.url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-outline btn-sm"
          >
            <Music2 size={14} /> {SOCIALS.tiktok.handle}
          </a>
          <Link href="/track" className="btn btn-ghost btn-sm">Track an order</Link>
        </div>
      </div>
    </div>
  );
}
