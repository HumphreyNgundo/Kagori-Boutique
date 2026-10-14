"use client";

import { useMemo, useState } from "react";
import { useFormStatus } from "react-dom";
import { Check, Loader2, Minus, Plus, ShoppingBag } from "lucide-react";
import { addToCart } from "@/lib/actions/cart";
import { ksh } from "@/lib/money";

export interface PickerVariant {
  id: string;
  options: Record<string, string>;
  price: number;
  available: number;
}

function SubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn btn-primary w-full !py-3.5 text-base" disabled={disabled || pending}>
      {pending ? <Loader2 size={18} className="animate-spin" /> : <ShoppingBag size={18} />}
      {disabled ? "Out of stock" : pending ? "Adding…" : "Add to basket"}
    </button>
  );
}

export function VariantPicker({
  variants,
  axes,
}: {
  variants: PickerVariant[];
  axes: Record<string, string[]>;
}) {
  const axisNames = Object.keys(axes);
  const [selection, setSelection] = useState<Record<string, string>>(() => {
    // Default to the first combination that is actually in stock.
    const firstAvailable = variants.find((v) => v.available > 0) ?? variants[0];
    return firstAvailable ? { ...firstAvailable.options } : {};
  });
  const [quantity, setQuantity] = useState(1);

  const current = useMemo(
    () => variants.find((v) => axisNames.every((axis) => v.options[axis] === selection[axis])) ?? null,
    [variants, selection, axisNames],
  );

  /** A value is offered only if some in-stock variant carries it alongside the rest of the selection. */
  function reachable(axis: string, value: string): boolean {
    return variants.some(
      (v) =>
        v.options[axis] === value &&
        v.available > 0 &&
        axisNames.filter((a) => a !== axis).every((a) => v.options[a] === selection[a]),
    );
  }

  const available = current?.available ?? 0;
  const max = Math.min(available, 10);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-3xl font-extrabold tracking-tight">
          {ksh(current?.price ?? Math.min(...variants.map((v) => v.price)))}
        </p>
        <p className="mt-1 text-sm text-muted">
          {available > 3 && "In stock — ships today"}
          {available > 0 && available <= 3 && (
            <span className="font-semibold text-[var(--warning)]">Only {available} left</span>
          )}
          {available === 0 && <span className="font-semibold text-[var(--danger)]">Out of stock in this option</span>}
        </p>
      </div>

      {axisNames.map((axis) => (
        <div key={axis}>
          <div className="mb-2.5 flex items-baseline justify-between">
            <span className="label !mb-0">{axis}</span>
            <span className="text-xs text-subtle">{selection[axis]}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {axes[axis].map((value) => {
              const selected = selection[axis] === value;
              const possible = reachable(axis, value);
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => {
                    setSelection((prev) => ({ ...prev, [axis]: value }));
                    setQuantity(1);
                  }}
                  className="chip"
                  data-active={selected}
                  style={possible ? undefined : { opacity: 0.4, textDecoration: "line-through" }}
                  aria-pressed={selected}
                >
                  {selected && <Check size={13} />}
                  {value}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      <form action={addToCart} className="space-y-4">
        <input type="hidden" name="variantId" value={current?.id ?? ""} />
        <input type="hidden" name="quantity" value={quantity} />
        <input type="hidden" name="redirectTo" value="/cart" />

        <div className="flex items-center gap-4">
          <span className="label !mb-0">Quantity</span>
          <div className="flex items-center gap-1 rounded-full border border-line-strong p-1">
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="grid h-8 w-8 place-items-center rounded-full text-muted transition hover:bg-surface-2 hover:text-ink"
              aria-label="Decrease quantity"
              disabled={quantity <= 1}
            >
              <Minus size={14} />
            </button>
            <span className="w-8 text-center text-sm font-semibold tabular-nums">{quantity}</span>
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.min(max || 1, q + 1))}
              className="grid h-8 w-8 place-items-center rounded-full text-muted transition hover:bg-surface-2 hover:text-ink"
              aria-label="Increase quantity"
              disabled={quantity >= max}
            >
              <Plus size={14} />
            </button>
          </div>
        </div>

        <SubmitButton disabled={!current || available === 0} />
      </form>
    </div>
  );
}
