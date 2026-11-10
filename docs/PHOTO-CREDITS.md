# Product photography

The demo catalogue ships **no image files**. Each product record carries the URL
of its photo, exactly as it would carry a URL for a photo your staff uploaded.
Photography is replaced from the admin console (Products → a product → Choose
product photos), which stores the upload in Vercel Blob and overwrites the URL
on the record.

The demo URLs point at [Pexels](https://pexels.com) and
[Unsplash](https://unsplash.com), used under the
[Pexels License](https://www.pexels.com/license/) and the
[Unsplash License](https://unsplash.com/license), both of which permit
commercial use without attribution. The crop (square, 1100px) is applied by
their own image pipelines, so there is nothing to process at build time.

Every one of the 19 products carries a photograph, as do the four category
shelves and the three wig types. The full mapping lives in
`src/lib/seed/photos.ts` — each entry is a Pexels or Unsplash photo id, so the
file is the credit list.

Every photo was downloaded and inspected before being listed. Several
candidates that looked right as thumbnails turned out to be a different product
entirely and were dropped. Brand logos are visible on some of the haircare
bottles, which is fine for a demo but would need replacing before selling.

**These are stock photographs of similar items, not Bello Beauty's own stock**,
so some are approximations: a few units are modelled hair rather than the exact
cut on a mannequin head. Replace them with real product photography from the
console before selling — generated artwork still covers anything without a
photo, so a new product never renders as a hole.

The one exception is the brand's own imagery, which is committed to
`public/brand`: the logo (heart mark and circular badge) and the packaging
photograph used as the landing page lead. Those are Bello Beauty's own.

## How a photo reaches a product

1. **Seed** — a new store is created with these URLs already on the records.
2. **Migration** — a store created before the photos existed picks them up once,
   automatically, without re-seeding (`product-photos-v1` in `src/lib/db/index.ts`).
3. **Upload** — staff upload replaces whatever is there, storing the file in
   Vercel Blob and writing its URL to the record.
