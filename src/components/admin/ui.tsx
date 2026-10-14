import type { CSSProperties, ReactNode } from "react";

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

/** Hero number. No plot, so no hover layer — the value is the whole message. */
export function StatTile({
  label,
  value,
  hint,
  tone = "default",
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: "default" | "positive" | "warning" | "danger";
}) {
  const colour =
    tone === "positive" ? "var(--positive)" : tone === "warning" ? "var(--warning)" : tone === "danger" ? "var(--danger)" : "var(--ink)";
  return (
    <div className="card p-5">
      <p className="eyebrow">{label}</p>
      <p className="mt-2 text-2xl font-extrabold tracking-tight tabular-nums" style={{ color: colour }}>
        {value}
      </p>
      {hint && <p className="mt-1 text-xs text-subtle">{hint}</p>}
    </div>
  );
}

export function Panel({
  title,
  action,
  children,
  className = "",
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`card p-5 ${className}`}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-sm font-bold">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

export function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="grid place-items-center gap-1.5 py-14 text-center">
      <p className="text-sm font-semibold">{title}</p>
      <p className="max-w-xs text-xs text-muted">{body}</p>
    </div>
  );
}

export function Th({ children, className = "" }: { children?: ReactNode; className?: string }) {
  return (
    <th className={`whitespace-nowrap px-3 py-2.5 text-left text-xs font-semibold text-subtle ${className}`}>
      {children}
    </th>
  );
}

export function Td({
  children,
  className = "",
  style,
  colSpan,
}: {
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
  colSpan?: number;
}) {
  return (
    <td className={`px-3 py-3 align-middle text-sm ${className}`} style={style} colSpan={colSpan}>
      {children}
    </td>
  );
}

export function TableWrap({ children }: { children: ReactNode }) {
  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">{children}</table>
      </div>
    </div>
  );
}
