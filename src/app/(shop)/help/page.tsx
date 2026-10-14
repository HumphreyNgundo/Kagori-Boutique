import Link from "next/link";
import { getSettings } from "@/lib/repo/catalog";

export const metadata = { title: "Delivery, returns & how it works" };

const FAQ: [string, string][] = [
  ["How do I order?", "Add what you want to the basket and press checkout. You give a name, a phone number and an address — that's it. No account, no password."],
  ["How do I pay?", "M-Pesa (we send a prompt to your phone), card, or cash/M-Pesa to the rider on delivery within Nairobi."],
  ["How long does delivery take?", "Nairobi CBD and Westlands: same day for orders placed before 3pm. Greater Nairobi: next day. Upcountry: 1–3 days by courier."],
  ["How much is delivery?", "From KES 200 within the CBD. Free on orders over KES 10,000. Pickup from our CBD shop is always free."],
  ["Can I track my order?", "Yes. Every order gets a code like KGB-7F3Q2A. Enter it on the Track page from any device and you'll see exactly where the parcel is."],
  ["What if the size is wrong?", "Exchange within 7 days, unworn and with the packaging. Wigs and lashes can't be exchanged once opened, for hygiene reasons."],
  ["Are the wigs human hair?", "Each product says so on its page. Where it says human hair, it is 100% human hair and can be dyed and heat-styled."],
];

export default async function HelpPage() {
  const settings = await getSettings();
  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <p className="eyebrow">Help</p>
      <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">How Kagorim works</h1>
      <p className="mt-3 text-sm leading-relaxed text-muted">
        Short answers to what people ask us most. Anything else, message us on WhatsApp — we reply fast.
      </p>

      <dl className="mt-10 space-y-4">
        {FAQ.map(([q, a]) => (
          <div key={q} className="card p-6">
            <dt className="text-base font-bold">{q}</dt>
            <dd className="mt-2 text-sm leading-relaxed text-muted">{a}</dd>
          </div>
        ))}
      </dl>

      <div className="card mt-8 flex flex-wrap items-center justify-between gap-4 p-6">
        <div>
          <p className="font-bold">Still stuck?</p>
          <p className="text-sm text-muted">We&apos;re on WhatsApp during shop hours, 9am–7pm.</p>
        </div>
        <div className="flex gap-2">
          <a href={`https://wa.me/${settings.whatsapp}`} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-sm">
            WhatsApp us
          </a>
          <Link href="/track" className="btn btn-outline btn-sm">Track an order</Link>
        </div>
      </div>
    </div>
  );
}
