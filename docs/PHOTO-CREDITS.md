# Product photography

The demo catalogue ships **no image files**. Each product record carries the URL
of its photo, exactly as it would carry a URL for a photo your staff uploaded.
Photography is replaced from the admin console (Products → a product → Choose
product photos), which stores the upload in Vercel Blob and overwrites the URL
on the record.

The demo URLs point at [Unsplash](https://unsplash.com), used under the
[Unsplash License](https://unsplash.com/license), which permits commercial use
without attribution. The crop (square, WebP, 1100px) is applied by Unsplash's
own image pipeline, so there is nothing to process at build time.

Every one of the 28 products carries a photograph, as do the nine category
shelves and the landing page. The full mapping lives in
`src/lib/seed/photos.ts` — each entry is an Unsplash photo id, so the file is
the credit list.

Every photo was downloaded and inspected before being listed. Several
candidates that looked right as thumbnails turned out to be a different product
entirely and were dropped. Brand logos are visible on some of the footwear and
cosmetics, which is fine for a demo but would need replacing before selling.

**These are stock photographs of similar items, not Kagorim's own stock**, so
some are approximations: the wigs are modelled hair rather than units on a
mannequin head, and a few shoes match the category better than the exact
silhouette. Replace them with real product photography from the console before
selling — generated artwork still covers anything without a photo, so a new
product never renders as a hole.

## How a photo reaches a product

1. **Seed** — a new store is created with these URLs already on the records.
2. **Migration** — a store created before the photos existed picks them up once,
   automatically, without re-seeding (`product-photos-v1` in `src/lib/db/index.ts`).
3. **Upload** — staff upload replaces whatever is there, storing the file in
   Vercel Blob and writing its URL to the record.
