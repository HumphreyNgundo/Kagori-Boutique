import type { ProductFamily } from "@/lib/types";

/**
 * Catalogue photography is optional. Until real photos land in
 * public/products/<slug>/ (see public/products/README.md), every product
 * renders deterministic studio art in brand colours — never a broken image.
 */

/** Brand-derived, deliberately mixed in weight so a grid of tiles has rhythm. */
const PALETTES: [string, string][] = [
  ["#8a0ff0", "#35b7f0"],
  ["#dfeefb", "#9fd4f2"],
  ["#efe4fd", "#b472ff"],
  ["#2b1b4d", "#8a0ff0"],
  ["#35b7f0", "#efe4fd"],
  ["#f3eefb", "#cdb6f0"],
  ["#1a9fdd", "#6b0fd0"],
  ["#e9e4f5", "#7d8fb3"],
];

function luminanceOf(hex: string): number {
  const n = parseInt(hex.slice(1), 16);
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}

function hashOf(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return h;
}

function Silhouette({ family, dark }: { family: ProductFamily; dark: boolean }) {
  // Light tiles get an ink silhouette, saturated tiles a white one.
  const fill = dark ? "rgba(255,255,255,0.92)" : "rgba(17,12,28,0.78)";
  const soft = dark ? "rgba(255,255,255,0.45)" : "rgba(17,12,28,0.32)";

  switch (family) {
    case "WIG":
      return (
        <g>
          <path d="M100 42c-30 0-48 22-48 52 0 34 6 54 10 74 3 14 12 18 12 2 0-26-6-44-4-62 6 10 18 16 30 16s24-6 30-16c2 18-4 36-4 62 0 16 9 12 12-2 4-20 10-40 10-74 0-30-18-52-48-52z" fill={fill} />
          <ellipse cx="100" cy="92" rx="26" ry="30" fill={soft} />
        </g>
      );
    case "WIG_ACCESSORY":
      return (
        <g>
          <rect x="84" y="40" width="32" height="26" rx="8" fill={soft} />
          <path d="M72 66h56c8 0 14 7 13 15l-8 70c-1 9-8 15-17 15h-32c-9 0-16-6-17-15l-8-70c-1-8 5-15 13-15z" fill={fill} />
        </g>
      );
    case "LASH":
      return (
        <g stroke={fill} strokeWidth="6" strokeLinecap="round" fill="none">
          <path d="M40 116c22-34 98-34 120 0" />
          <path d="M48 104c-4-12-6-20-4-30" />
          <path d="M70 92c-4-14-4-24 0-34" />
          <path d="M100 86c0-16 2-26 8-36" />
          <path d="M130 92c4-14 8-22 16-30" />
          <path d="M152 104c6-10 10-16 18-22" />
        </g>
      );
    case "LASH_ACCESSORY":
      return (
        <g>
          <path d="M92 36h16v30h-16z" fill={soft} />
          <path d="M82 66h36l10 74c1 10-6 18-16 18h-24c-10 0-17-8-16-18z" fill={fill} />
          <rect x="88" y="104" width="24" height="6" rx="3" fill={soft} />
        </g>
      );
    case "FOOTWEAR":
      return (
        <g>
          <path d="M34 134c0-10 4-16 14-18 18-4 30-12 42-26 10-12 18-18 30-18 10 0 16 6 18 16 3 16 14 26 28 30 10 3 14 8 14 16 0 8-6 14-16 14H48c-9 0-14-5-14-14z" fill={fill} />
          <path d="M34 140h146c0 12-8 20-20 20H54c-12 0-20-8-20-20z" fill={soft} />
        </g>
      );
    case "BAG":
      return (
        <g>
          <path d="M76 66c0-18 10-30 24-30s24 12 24 30" stroke={fill} strokeWidth="7" fill="none" strokeLinecap="round" />
          <path d="M52 70h96c6 0 11 5 12 11l8 66c1 10-6 19-17 19H49c-11 0-18-9-17-19l8-66c1-6 6-11 12-11z" fill={fill} />
          <rect x="84" y="96" width="32" height="8" rx="4" fill={soft} />
        </g>
      );
  }
}

export function ProductArt({
  seed,
  family,
  className = "",
  label,
}: {
  seed: string;
  family: ProductFamily;
  className?: string;
  label?: string;
}) {
  const hash = hashOf(seed);
  const [from, to] = PALETTES[hash % PALETTES.length];
  // Rough perceived luminance of the gradient decides the silhouette colour.
  const isDark = luminanceOf(from) + luminanceOf(to) < 1.05;
  const angle = 25 + (hash % 5) * 20;
  const id = `g${hash.toString(36)}`;

  return (
    <div className={`relative overflow-hidden ${className}`} aria-hidden={label ? undefined : true}>
      <svg viewBox="0 0 200 200" className="h-full w-full" role={label ? "img" : "presentation"}>
        {label ? <title>{label}</title> : null}
        <defs>
          <linearGradient id={id} gradientTransform={`rotate(${angle} 0.5 0.5)`}>
            <stop offset="0%" stopColor={from} />
            <stop offset="100%" stopColor={to} />
          </linearGradient>
          <radialGradient id={`${id}s`} cx="50%" cy="28%" r="70%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.45)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </radialGradient>
        </defs>
        <rect width="200" height="200" fill={`url(#${id})`} />
        <rect width="200" height="200" fill={`url(#${id}s)`} />
        <Silhouette family={family} dark={isDark} />
      </svg>
    </div>
  );
}
