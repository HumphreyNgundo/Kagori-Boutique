import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Kagorim Enterprise — wigs, extensions & wig care in Nairobi",
    template: "%s · Kagorim Enterprise",
  },
  description:
    "Kagorim Enterprise — shop the collection, pay with M-Pesa, and track your order to your door anywhere in Kenya.",
  openGraph: {
    title: "Kagorim Enterprise",
    description: "Shop the collection and track every order to your door.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#08080c" },
  ],
};

/** Applied before first paint so the theme never flashes. */
const THEME_SCRIPT = `(function(){try{var t=localStorage.getItem('kagorim-theme');if(!t){t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}document.documentElement.setAttribute('data-theme',t);}catch(e){document.documentElement.setAttribute('data-theme','light');}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body className={`${jakarta.variable} min-h-dvh bg-bg text-ink antialiased`}>{children}</body>
    </html>
  );
}
