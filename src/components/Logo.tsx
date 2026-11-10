/**
 * The Bello Beauty identity, served from /public/brand:
 *   logo-heart.png  — the ribbon heart on its own, for inline marks
 *   logo-badge.png  — the full circular logo with the script wordmark
 *
 * Plain <img> rather than next/image: these are fixed-size brand furniture on
 * every page, so a build-time optimiser adds a request without adding value.
 */

export function LogoMark({ size = 32, className = "" }: { size?: number; className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/brand/logo-heart.png"
      alt=""
      width={size}
      height={size}
      aria-hidden="true"
      decoding="async"
      className={`object-contain ${className}`}
      style={{ width: size, height: size }}
    />
  );
}

/** The circular logo exactly as it appears on the shop's packaging. */
export function LogoBadge({ size = 96, className = "" }: { size?: number; className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/brand/logo-badge.png"
      alt="Bello Beauty"
      width={size}
      height={size}
      decoding="async"
      className={`rounded-full bg-white object-contain ${className}`}
      style={{ width: size, height: size }}
    />
  );
}

export function Wordmark({ compact = false }: { compact?: boolean }) {
  return (
    <span className="flex items-center gap-2.5 text-ink">
      <LogoMark size={compact ? 28 : 34} className="shrink-0" />
      <span className="flex flex-col leading-none">
        <span className={`font-extrabold tracking-tight ${compact ? "text-base" : "text-lg"}`}>
          BELLO
        </span>
        <span
          className="font-semibold text-brand"
          style={{ fontSize: compact ? "0.5rem" : "0.56rem", letterSpacing: "0.34em" }}
        >
          BEAUTY
        </span>
      </span>
    </span>
  );
}
