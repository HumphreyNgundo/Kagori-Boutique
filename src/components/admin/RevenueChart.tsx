"use client";

import { useMemo, useRef, useState } from "react";
import { ksh } from "@/lib/money";

export interface Point {
  day: string;
  value: number;
}

const W = 720;
const H = 200;
const PAD = { top: 16, right: 8, bottom: 24, left: 8 };

/**
 * Single-series revenue over time: one hue (brand), recessive grid, 2px
 * non-scaling stroke, direct label on the peak only, and a crosshair +
 * tooltip on hover. One measure, one axis — never a second y-scale.
 */
export function RevenueChart({ points }: { points: Point[] }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hover, setHover] = useState<number | null>(null);

  const { path, area, coords, max, peakIndex } = useMemo(() => {
    const values = points.map((p) => p.value);
    const max = Math.max(...values, 1);
    const innerW = W - PAD.left - PAD.right;
    const innerH = H - PAD.top - PAD.bottom;
    const step = points.length > 1 ? innerW / (points.length - 1) : 0;

    const coords = points.map((p, i) => ({
      x: PAD.left + i * step,
      y: PAD.top + innerH - (p.value / max) * innerH,
      ...p,
    }));

    const path = coords.map((c, i) => `${i === 0 ? "M" : "L"}${c.x.toFixed(1)} ${c.y.toFixed(1)}`).join(" ");
    const area = `${path} L${(PAD.left + innerW).toFixed(1)} ${PAD.top + innerH} L${PAD.left} ${PAD.top + innerH} Z`;
    const peakIndex = values.indexOf(Math.max(...values));

    return { path, area, coords, max, peakIndex };
  }, [points]);

  function onMove(event: React.MouseEvent<SVGSVGElement>) {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect || !coords.length) return;
    const ratio = (event.clientX - rect.left) / rect.width;
    const index = Math.round(ratio * (coords.length - 1));
    setHover(Math.max(0, Math.min(coords.length - 1, index)));
  }

  const active = hover !== null ? coords[hover] : null;
  const peak = coords[peakIndex];

  return (
    <div className="relative">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        style={{ height: 200 }}
        onMouseMove={onMove}
        onMouseLeave={() => setHover(null)}
        role="img"
        aria-label={`Daily revenue over the last ${points.length} days. Peak ${ksh(peak?.value ?? 0)}.`}
      >
        <defs>
          <linearGradient id="revFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--brand)" stopOpacity="0.28" />
            <stop offset="100%" stopColor="var(--brand)" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* recessive gridlines */}
        {[0, 0.5, 1].map((t) => {
          const y = PAD.top + (H - PAD.top - PAD.bottom) * t;
          return (
            <line
              key={t}
              x1={PAD.left}
              x2={W - PAD.right}
              y1={y}
              y2={y}
              stroke="var(--line)"
              strokeWidth="1"
              strokeDasharray={t === 1 ? undefined : "3 5"}
            />
          );
        })}

        <path d={area} fill="url(#revFill)" />
        <path
          d={path}
          fill="none"
          stroke="var(--brand)"
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />

        {/* peak marker — the only point labelled by default */}
        {peak && (
          <circle cx={peak.x} cy={peak.y} r="4" fill="var(--brand)" stroke="var(--card)" strokeWidth="2" />
        )}

        {active && (
          <g>
            <line
              x1={active.x}
              x2={active.x}
              y1={PAD.top}
              y2={H - PAD.bottom}
              stroke="var(--brand)"
              strokeWidth="1"
              strokeDasharray="3 4"
            />
            <circle cx={active.x} cy={active.y} r="5" fill="var(--brand)" stroke="var(--card)" strokeWidth="2" />
          </g>
        )}
      </svg>

      {active && (
        <div
          className="pointer-events-none absolute -translate-x-1/2 rounded-xl border border-line bg-card px-3 py-2 text-xs shadow-[var(--shadow-md)]"
          style={{ left: `${(active.x / W) * 100}%`, top: 0 }}
        >
          <p className="font-bold tabular-nums">{ksh(active.value)}</p>
          <p className="text-subtle">
            {new Date(active.day).toLocaleDateString("en-KE", { day: "numeric", month: "short" })}
          </p>
        </div>
      )}

      <div className="mt-1 flex justify-between text-[11px] text-subtle">
        <span>
          {points[0] &&
            new Date(points[0].day).toLocaleDateString("en-KE", { day: "numeric", month: "short" })}
        </span>
        <span className="tabular-nums">peak {ksh(max)}</span>
        <span>
          {points.at(-1) &&
            new Date(points.at(-1)!.day).toLocaleDateString("en-KE", { day: "numeric", month: "short" })}
        </span>
      </div>
    </div>
  );
}
