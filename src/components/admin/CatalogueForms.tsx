"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { AlertCircle, Check, Loader2, Plus, RotateCcw, Save, Trash2, X } from "lucide-react";
import {
  addVariantAction,
  createProductAction,
  removeProductAction,
  removeVariantAction,
  restoreVariantAction,
  updateProductAction,
} from "@/lib/actions/admin";
import { IDLE, type ActionState } from "@/lib/actions/state";

export interface CategoryOption {
  id: string;
  name: string;
  family: string;
}

function Feedback({ state }: { state: ActionState }) {
  if (!state.error && !state.ok) return null;
  return (
    <p
      role="status"
      className="flex items-center gap-2 rounded-xl p-2.5 text-xs font-medium"
      style={{
        background: state.error ? "var(--danger-soft)" : "var(--positive-soft)",
        color: state.error ? "var(--danger)" : "var(--positive)",
      }}
    >
      {state.error ? <AlertCircle size={13} /> : <Check size={13} />}
      {state.error ?? state.ok}
    </p>
  );
}

function Submit({ label, icon, busy }: { label: string; icon?: React.ReactNode; busy: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn btn-primary btn-sm" disabled={pending}>
      {pending ? <Loader2 size={14} className="animate-spin" /> : icon}
      {pending ? busy : label}
    </button>
  );
}

/**
 * Option axes differ per product family — wigs have Length/Density/Colour,
 * shoes have Size/Colour — so the rows are editable rather than fixed fields.
 */
function OptionRows({
  axes,
  locked = false,
}: {
  axes: string[];
  /** On an existing product the axis names are fixed; only values are typed. */
  locked?: boolean;
}) {
  const [rows, setRows] = useState<string[]>(axes.length ? axes : [""]);

  return (
    <div className="space-y-2">
      <span className="label !mb-0">Options</span>
      <p className="text-xs text-subtle">
        {locked
          ? "Fill in the values for this new option — for example Size 39, Colour Black."
          : "How this product varies. Leave as is if it has none (a single bottle, one clutch)."}
      </p>
      {rows.map((axis, i) => (
        <div key={i} className="flex gap-2">
          <input
            name={`optionName${i}`}
            defaultValue={axis}
            readOnly={locked && Boolean(axis)}
            placeholder="Size"
            aria-label={`Option name ${i + 1}`}
            className="input !w-32 !py-2 text-sm"
          />
          <input
            name={`optionValue${i}`}
            placeholder="39"
            aria-label={`Option value ${i + 1}`}
            className="input !py-2 text-sm"
          />
          {!locked && rows.length > 1 && (
            <button
              type="button"
              onClick={() => setRows(rows.filter((_, r) => r !== i))}
              className="btn btn-ghost btn-sm !px-2"
              aria-label="Remove this option"
            >
              <X size={14} />
            </button>
          )}
        </div>
      ))}
      {!locked && rows.length < 4 && (
        <button type="button" onClick={() => setRows([...rows, ""])} className="btn btn-ghost btn-sm">
          <Plus size={13} /> Another option
        </button>
      )}
    </div>
  );
}

function PriceAndStock({ price, stock }: { price?: number; stock?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div>
        <label className="label" htmlFor="price">Selling price (KES)</label>
        <input
          id="price"
          name="price"
          type="number"
          min="1"
          step="1"
          required
          defaultValue={price}
          placeholder="4200"
          className="input tabular-nums"
        />
      </div>
      <div>
        <label className="label" htmlFor="stock">How many in stock</label>
        <input
          id="stock"
          name="stock"
          type="number"
          min="0"
          step="1"
          required
          defaultValue={stock}
          placeholder="6"
          className="input tabular-nums"
        />
      </div>
    </div>
  );
}

function Details({
  categories,
  product,
}: {
  categories: CategoryOption[];
  product?: {
    name: string;
    categoryId: string;
    summary: string;
    description: string;
    tags: string[];
    featured: boolean;
  };
}) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="name">Product name</label>
          <input
            id="name"
            name="name"
            required
            defaultValue={product?.name}
            placeholder="Amani Block Heel Sandal"
            className="input"
          />
        </div>
        <div>
          <label className="label" htmlFor="categoryId">Category</label>
          <select
            id="categoryId"
            name="categoryId"
            defaultValue={product?.categoryId ?? categories[0]?.id}
            className="input"
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="label" htmlFor="summary">
          One-line description <span className="font-normal text-subtle">— shown under the name</span>
        </label>
        <input
          id="summary"
          name="summary"
          defaultValue={product?.summary}
          placeholder="75mm block heel you can actually walk in."
          className="input"
        />
      </div>

      <div>
        <label className="label" htmlFor="description">Full description</label>
        <textarea
          id="description"
          name="description"
          rows={4}
          defaultValue={product?.description}
          placeholder="Material, fit, care — whatever a customer would ask on WhatsApp."
          className="input resize-y"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="tags">
            Tags <span className="font-normal text-subtle">— comma separated</span>
          </label>
          <input
            id="tags"
            name="tags"
            defaultValue={product?.tags.join(", ")}
            placeholder="leather, everyday"
            className="input"
          />
        </div>
        <label className="flex cursor-pointer items-end gap-2.5 pb-2.5 text-sm">
          <input
            type="checkbox"
            name="featured"
            defaultChecked={product?.featured}
            className="h-4 w-4 accent-[var(--brand)]"
          />
          Show as a bestseller on the home page
        </label>
      </div>
    </div>
  );
}

export function NewProductForm({ categories, axesByFamily }: { categories: CategoryOption[]; axesByFamily: Record<string, string[]> }) {
  const [state, action] = useActionState<ActionState, FormData>(createProductAction, IDLE);
  const [family, setFamily] = useState(categories[0]?.family ?? "FOOTWEAR");

  return (
    <form action={action} className="space-y-6">
      <Feedback state={state} />

      {/* The category drives which option axes are suggested below. */}
      <div
        onChange={(event) => {
          const target = event.target as HTMLInputElement | HTMLSelectElement;
          if (target.name !== "categoryId") return;
          setFamily(categories.find((c) => c.id === target.value)?.family ?? family);
        }}
      >
        <Details categories={categories} />
      </div>

      <div className="border-t border-line pt-5">
        <h3 className="mb-3 text-sm font-bold">First option in stock</h3>
        <p className="mb-4 text-xs text-subtle">
          Add one size or colour now; you can add the rest on the next screen.
        </p>
        <OptionRows key={family} axes={axesByFamily[family] ?? ["Size"]} />
        <div className="mt-4">
          <PriceAndStock />
        </div>
      </div>

      <Submit label="Create product" icon={<Plus size={14} />} busy="Creating…" />
    </form>
  );
}

export function EditProductForm({
  productId,
  categories,
  product,
}: {
  productId: string;
  categories: CategoryOption[];
  product: {
    name: string;
    categoryId: string;
    summary: string;
    description: string;
    tags: string[];
    featured: boolean;
  };
}) {
  const [state, action] = useActionState<ActionState, FormData>(updateProductAction, IDLE);
  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="productId" value={productId} />
      <Feedback state={state} />
      <Details categories={categories} product={product} />
      <Submit label="Save changes" icon={<Save size={14} />} busy="Saving…" />
    </form>
  );
}

export function AddVariantForm({ productId, axes }: { productId: string; axes: string[] }) {
  const [state, action] = useActionState<ActionState, FormData>(addVariantAction, IDLE);
  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="productId" value={productId} />
      <Feedback state={state} />
      <OptionRows axes={axes} locked />
      <PriceAndStock />
      <Submit label="Add option" icon={<Plus size={14} />} busy="Adding…" />
    </form>
  );
}

function DangerSubmit({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      className="btn btn-outline btn-sm"
      style={{ color: "var(--danger)", borderColor: "var(--danger)" }}
      disabled={pending}
    >
      {pending ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
      {label}
    </button>
  );
}

export function RemoveVariantButton({ variantId, label }: { variantId: string; label: string }) {
  const [state, action] = useActionState<ActionState, FormData>(removeVariantAction, IDLE);
  const [confirming, setConfirming] = useState(false);

  // Feedback renders in both states: a refusal ("this is the last option")
  // arrives while the confirm row is still open, and must not be swallowed.
  return (
    <div className="space-y-1.5">
      {confirming ? (
        <form action={action} className="flex items-center gap-1.5">
          <input type="hidden" name="variantId" value={variantId} />
          <span className="text-xs text-muted">Remove {label}?</span>
          <DangerSubmit label="Yes" />
          <button type="button" onClick={() => setConfirming(false)} className="btn btn-ghost btn-sm !px-2">
            No
          </button>
        </form>
      ) : (
        <button
          type="button"
          onClick={() => setConfirming(true)}
          className="btn btn-ghost btn-sm !px-2"
          aria-label={`Remove ${label}`}
          title="Remove this option"
        >
          <Trash2 size={13} />
        </button>
      )}
      <Feedback state={state} />
    </div>
  );
}

export function RestoreVariantButton({ variantId }: { variantId: string }) {
  return (
    <form action={restoreVariantAction}>
      <input type="hidden" name="variantId" value={variantId} />
      <button type="submit" className="btn btn-ghost btn-sm">
        <RotateCcw size={13} /> Restore
      </button>
    </form>
  );
}

export function RemoveProductButton({ productId, name }: { productId: string; name: string }) {
  const [state, action] = useActionState<ActionState, FormData>(removeProductAction, IDLE);
  const [confirming, setConfirming] = useState(false);

  return (
    <div className="space-y-2">
      <Feedback state={state} />
      {confirming ? (
        <form action={action} className="flex flex-wrap items-center gap-2">
          <input type="hidden" name="productId" value={productId} />
          <span className="text-xs text-muted">
            Remove <strong className="text-ink">{name}</strong> from the shop?
          </span>
          <DangerSubmit label="Yes, remove it" />
          <button type="button" onClick={() => setConfirming(false)} className="btn btn-ghost btn-sm">
            Cancel
          </button>
        </form>
      ) : (
        <button
          type="button"
          onClick={() => setConfirming(true)}
          className="btn btn-outline btn-sm"
          style={{ color: "var(--danger)", borderColor: "var(--line-strong)" }}
        >
          <Trash2 size={13} /> Remove product
        </button>
      )}
      <p className="text-xs leading-relaxed text-subtle">
        Products that have never been ordered are deleted outright. Anything with sales history is hidden from
        the shop instead, so past orders and reports stay intact.
      </p>
    </div>
  );
}
