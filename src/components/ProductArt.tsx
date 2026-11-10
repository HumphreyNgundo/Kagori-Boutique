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
    case "EXTENSION":
      return (
        <g>
          <rect x="62" y="44" width="76" height="12" rx="6" fill={soft} />
          <path d="M70 56c0 44 -6 56 -4 84 1 12 10 14 12 2 3-20 0-46 2-62" stroke={fill} strokeWidth="9" strokeLinecap="round" fill="none" />
          <path d="M92 56c0 44 -5 58 -3 86 1 12 10 14 12 2 3-20 -1-48 1-64" stroke={fill} strokeWidth="9" strokeLinecap="round" fill="none" />
          <path d="M116 56c0 44 -5 56 -3 84 1 12 10 14 12 2 3-20 -1-46 1-62" stroke={fill} strokeWidth="9" strokeLinecap="round" fill="none" />
        </g>
      );
    case "HAIRCARE":
      return (
        <g>
          <rect x="88" y="34" width="24" height="22" rx="6" fill={soft} />
          <path d="M74 56h52c9 0 16 8 15 17l-9 74c-1 9-8 15-17 15H85c-9 0-16-6-17-15l-9-74c-1-9 6-17 15-17z" fill={fill} />
          <rect x="80" y="96" width="40" height="7" rx="3.5" fill={soft} />
        </g>
      );
    case "HAIR_ACCESSORY":
      return (
        <g>
          <rect x="52" y="60" width="96" height="26" rx="12" fill={fill} />
          <g stroke={fill} strokeWidth="7" strokeLinecap="round">
            <path d="M64 86v44" />
            <path d="M82 86v52" />
            <path d="M100 86v56" />
            <path d="M118 86v52" />
            <path d="M136 86v44" />
          </g>
          <rect x="62" y="66" width="76" height="7" rx="3.5" fill={soft} />
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
