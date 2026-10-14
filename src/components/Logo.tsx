/**
 * The Kagorim mark, rebuilt as vector: four teardrop petals meeting at a
 * centre point — violet (top), cyan (left), lavender (right), ink (bottom).
 */
const PETAL = "M0 0 Q 7 -12 21 -13 A 19 19 0 1 1 21 13 Q 7 12 0 0 Z";

export function LogoMark({ size = 32, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="-58 -58 116 116"
      fill="none"
      className={className}
      aria-hidden="true"
      role="presentation"
    >
      <g transform="rotate(-90)">
        <path d={PETAL} fill="var(--brand-violet)" />
      </g>
      <g transform="rotate(180)">
        <path d={PETAL} fill="var(--brand-cyan)" />
      </g>
      <g>
        <path d={PETAL} fill="var(--brand-lavender)" />
      </g>
      <g transform="rotate(90) scale(1.12)">
        <path d={PETAL} fill="currentColor" />
      </g>
    </svg>
  );
}

export function Wordmark({ compact = false }: { compact?: boolean }) {
  return (
    <span className="flex items-center gap-2.5 text-ink">
      <LogoMark size={compact ? 26 : 32} className="text-ink shrink-0" />
      <span className="flex flex-col leading-none">
        <span
          className={`font-extrabold tracking-tight ${compact ? "text-base" : "text-lg"}`}
        >
          KAGORIM
        </span>
        <span
          className="text-subtle font-semibold"
          style={{ fontSize: compact ? "0.5rem" : "0.5625rem", letterSpacing: "0.34em" }}
        >
          BOUTIQUE
        </span>
      </span>
    </span>
  );
}
