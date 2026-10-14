"use client";

import { useActionState, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { AlertCircle, Check, ImagePlus, Loader2, Star, Trash2, UploadCloud } from "lucide-react";
import {
  removeImageAction,
  setHeroImageAction,
  uploadImageAction,
} from "@/lib/actions/admin";
import { IDLE, type ActionState } from "@/lib/actions/state";

function UploadButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn btn-primary btn-sm" disabled={disabled || pending}>
      {pending ? <Loader2 size={14} className="animate-spin" /> : <UploadCloud size={14} />}
      {pending ? "Uploading…" : "Upload"}
    </button>
  );
}

/**
 * The shop owner's own image pipeline: pick photos, they go to object storage,
 * the first one becomes the hero shown on cards and search.
 */
export function MediaManager({
  productId,
  slug,
  images,
  storageReady,
}: {
  productId: string;
  slug: string;
  images: string[];
  storageReady: boolean;
}) {
  const [state, action] = useActionState<ActionState, FormData>(uploadImageAction, IDLE);
  const [chosen, setChosen] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-4">
      {!storageReady && (
        <p className="flex items-start gap-2 rounded-xl bg-[var(--warning-soft)] p-3 text-xs text-[var(--warning)]">
          <AlertCircle size={14} className="mt-0.5 shrink-0" />
          Image storage isn&apos;t connected yet. Add a Vercel Blob store to this project and uploads start working
          immediately — no code change.
        </p>
      )}

      {(state.error || state.ok) && (
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
      )}

      <form action={action} className="space-y-3">
        <input type="hidden" name="productId" value={productId} />
        <input type="hidden" name="slug" value={slug} />

        <label
          className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-line-strong p-6 text-center transition hover:border-brand"
          htmlFor={`upload-${productId}`}
        >
          <ImagePlus size={22} className="text-brand" />
          <span className="text-sm font-semibold">Choose product photos</span>
          <span className="text-xs text-subtle">JPG, PNG, WebP or AVIF · up to 5MB each · square works best</span>
          {chosen.length > 0 && (
            <span className="badge bg-[var(--brand-soft)] text-brand">{chosen.length} selected</span>
          )}
          <input
            id={`upload-${productId}`}
            ref={inputRef}
            type="file"
            name="images"
            accept="image/jpeg,image/png,image/webp,image/avif"
            multiple
            className="sr-only"
            onChange={(e) => setChosen(Array.from(e.target.files ?? []).map((f) => f.name))}
          />
        </label>

        {chosen.length > 0 && (
          <ul className="space-y-1 text-xs text-subtle">
            {chosen.map((name) => (
              <li key={name} className="truncate">· {name}</li>
            ))}
          </ul>
        )}

        <div className="flex gap-2">
          <UploadButton disabled={!storageReady || chosen.length === 0} />
          {chosen.length > 0 && (
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => {
                setChosen([]);
                if (inputRef.current) inputRef.current.value = "";
              }}
            >
              Clear
            </button>
          )}
        </div>
      </form>

      {images.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {images.map((url, i) => (
            <div key={url} className="card overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt={`Product image ${i + 1}`} className="aspect-square w-full object-cover" />
              <div className="flex items-center justify-between gap-1 p-2">
                {i === 0 ? (
                  <span className="badge bg-[var(--brand-soft)] text-brand">
                    <Star size={11} /> Hero
                  </span>
                ) : (
                  <form action={setHeroImageAction}>
                    <input type="hidden" name="productId" value={productId} />
                    <input type="hidden" name="url" value={url} />
                    <button type="submit" className="btn btn-ghost btn-sm !px-2 text-xs">
                      <Star size={12} /> Make hero
                    </button>
                  </form>
                )}
                <form action={removeImageAction}>
                  <input type="hidden" name="productId" value={productId} />
                  <input type="hidden" name="url" value={url} />
                  <button type="submit" className="btn btn-ghost btn-sm !px-2" aria-label="Remove image">
                    <Trash2 size={13} />
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="rounded-xl bg-surface-2 p-3 text-xs text-muted">
          No photos yet — the storefront is showing generated artwork for this product. Upload one and it replaces
          the placeholder everywhere.
        </p>
      )}
    </div>
  );
}
