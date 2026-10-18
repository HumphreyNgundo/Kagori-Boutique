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

| Product | Unsplash photo id |
|---|---|
| Aria Body Wave HD Lace Wig | photo-1522337360788-8b13dee7a37e |
| Amani Block Heel Sandal | photo-1535043934128-cf0b28d52f95, photo-1543163521-1bf539c55dd2 |
| Nova Pointed Stiletto | photo-1596703263926-eb0762ee17e4, photo-1573100925118-870b8efc799d |
| Mara Kitten Heel Mule | photo-1518049362265-d5b2a6467637, photo-1515347619252-60a4bf4fff4f |
| Sauti Structured Tote | photo-1584917865442-de89df76afd3 |
| Dala Shoulder Bag | photo-1590874103328-eac38a683ce7 |
| Noir Evening Clutch | photo-1566150905458-1bf1fc113f0d |
| Safari Mini Crossbody | photo-1594223274512-ad4803739b7c |
| Kasi Mesh Runner | photo-1560769629-975ec94e6a86 |
| Imani Leather Loafer | photo-1533867617858-e7b97e060509 |

Every photo was downloaded and inspected before being listed here. Candidates
showing another brand's logo were rejected, as were several that turned out not
to be the product at all.

**These are stock photographs of similar items, not Kagorim's own stock.** The
remaining products — lashes, lash accessories, wig accessories, doll shoes and
three of the four wigs — keep generated artwork, because nothing licence-clean
and on-subject was found for them. Replace all of it with real product
photography before selling.

## How a photo reaches a product

1. **Seed** — a new store is created with these URLs already on the records.
2. **Migration** — a store created before the photos existed picks them up once,
   automatically, without re-seeding (`product-photos-v1` in `src/lib/db/index.ts`).
3. **Upload** — staff upload replaces whatever is there, storing the file in
   Vercel Blob and writing its URL to the record.
