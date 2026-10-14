# Product photography

Drop photos here, one folder per product slug:

```
public/products/aria-body-wave-hd-lace/1.webp   <- first image is the hero
public/products/aria-body-wave-hd-lace/2.webp
public/products/kasi-mesh-runner/1.webp
```

Then run `npm run media:manifest` and commit. Any product without a folder
renders generated studio art instead, so the catalogue never shows a broken image.

Guidelines: square (1:1) or 4:5, shortest edge >= 1200px, WebP, under 300KB each.
Staff-uploaded images added later from the admin console go to Vercel Blob instead —
see `src/lib/media.ts`.
