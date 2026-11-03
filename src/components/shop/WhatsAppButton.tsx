import { MessageCircle } from "lucide-react";

/**
 * Always-available WhatsApp handle. Most Kenyan shoppers would rather ask a
 * question than fill in a form, so it follows them down every page.
 */
export function WhatsAppButton({ phone, storeName }: { phone: string; storeName: string }) {
  const text = encodeURIComponent(`Hi ${storeName}, I have a question about an item on your website.`);

  return (
    <a
      href={`https://wa.me/${phone}?text=${text}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-full px-4 py-3 text-sm font-semibold text-white shadow-[var(--shadow-lg)] transition hover:scale-105"
      style={{ background: "#25D366" }}
    >
      <MessageCircle size={18} />
      <span className="hidden sm:inline">Chat with us</span>
    </a>
  );
}
