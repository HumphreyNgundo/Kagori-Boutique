# Architecture

## Shape of the system

```
                    ┌─────────────────────────────────────────────┐
   shopper ────────▶│  Storefront  (app/(shop))                   │
   (no account)     │  home · categories · product · cart         │
                    │  checkout · order tracking                  │
                    └───────────────┬─────────────────────────────┘
                                    │ server actions
                    ┌───────────────▼─────────────────────────────┐
   staff ──────────▶│  Console  (app/admin)                       │
   (session cookie) │  dashboard · orders · products · inventory  │
                    │  customers · staff · audit · settings       │
                    └───────────────┬─────────────────────────────┘
                                    │
                    ┌───────────────▼─────────────────────────────┐
                    │  Domain layer  (lib/repo/*)                 │
                    │  catalog · orders · admin                   │
                    │  — all business rules live here             │
                    └───────────────┬─────────────────────────────┘
                                    │ read() / write()
                    ┌───────────────▼─────────────────────────────┐
                    │  Persistence seam  (lib/db)                 │
                    │  driver: vercel-blob │ in-memory            │
                    │  target: PostgreSQL  (db/schema.sql)        │
                    └─────────────────────────────────────────────┘
```

Three rules hold the design together:

1. **Pages never touch storage.** A page calls a repository; a repository calls
   `read()`/`write()`. Swapping the database touches one directory.
2. **Mutations are server actions, and every admin action re-checks permission**
   (`authorise("order:cancel")`). Hiding a button is presentation, not security.
3. **Money is integers.** Everything is stored in minor units (KES cents) and
   formatted once, at the edge, in `lib/money.ts`.

## Rendering

Next.js 15 App Router, React 19, server components by default. Client components
exist only where interaction demands them: variant picker, checkout form, theme
toggle, revenue chart, and the admin forms that report inline errors via
`useActionState`.

Every page that reads live data sets `dynamic = "force-dynamic"` — in a shop,
stale stock is worse than a cache miss.

## Persistence

`lib/db/index.ts` exposes exactly three functions:

```ts
read()                    // cached snapshot (3s) — for rendering
readFresh()               // bypasses the cache — before a mutation
write(db => { ... })      // read-modify-write, then persist
```

Two drivers implement the same interface:

| Driver | When it is used | Durability |
|---|---|---|
| `vercel-blob` | `BLOB_READ_WRITE_TOKEN` is present | Durable, shared across instances |
| `in-memory` | No token configured | Per-instance, resets on redeploy |

The in-memory store hangs off `globalThis`, not a module-level variable: Next.js
bundles server code per route, so a plain `let` gives each route its own empty
copy and freshly placed orders vanish on the next page.

### Moving to PostgreSQL

`db/schema.sql` is the production schema — tables, enums, constraints, indexes
and an availability view, mirroring `lib/types.ts` one-to-one. To switch:

1. Provision Postgres (Neon, Supabase, RDS) and run `db/schema.sql`.
2. Add a `postgresDriver` beside the existing drivers, or — better at volume —
   replace the repository bodies with SQL so queries push down to the database
   instead of loading a snapshot.
3. Point `POSTGRES_URL` at it and pick the driver in `selectDriver()`.

Callers do not change. The document-store approach is appropriate at boutique
volume (hundreds of orders a month); the trigger to move is concurrent writes
or reporting queries, not a date.

## Orders

```
PENDING_PAYMENT ──▶ CONFIRMED ──▶ PACKED ──┬──▶ DISPATCHED ───────▶ DELIVERED
       │                 │                 └──▶ READY_FOR_PICKUP ──▶ DELIVERED
       └──▶ CANCELLED ◀──┘
```

`TRANSITIONS` in `lib/order-status.ts` is the whole state machine, and
`transitionOrder()` refuses anything not in it. A packed order offers *dispatch*
or *ready for pickup* depending on its fulfilment method, never both.

### Stock semantics

| Event | `stock` | `reserved` | Ledger entry |
|---|---|---|---|
| Order placed (unpaid) | — | `+qty` | — |
| Payment confirmed | `−qty` | `−qty` | `SALE` |
| Order placed (pay on delivery) | `−qty` | — | `SALE` |
| Unpaid order cancelled | — | `−qty` | `RELEASE` |
| Paid order cancelled | `+qty` | — | `RESTOCK` |
| Manual adjustment | `±n` | — | `RESTOCK` / `ADJUSTMENT` |

Shoppers see `available = stock − reserved`, so two people cannot buy the same
last pair of size 38s while one of them is still entering their M-Pesa PIN.

## Payments

The demo ships a simulated M-Pesa flow: placing an order creates it as
`PENDING_PAYMENT`, and `simulatePayment` performs exactly the state change the
real callback performs — confirm payment, commit stock, append a timeline event.

To go live with Safaricom Daraja:

1. Add `POST /api/payments/mpesa/stk` which calls the STK push endpoint with the
   order total and the customer's phone, storing `CheckoutRequestID` on the order.
2. Add `POST /api/payments/mpesa/callback` — verify the payload, then call
   `confirmPayment(code, actor)`. That function is already the single place where
   payment turns into committed stock.

Card payments follow the same shape with a hosted checkout redirect.

## Media

`lib/media.ts` is the only file that knows where images live.

- **Staff uploads** (the normal path) go to Vercel Blob from the product page in
  the console, and the URL is appended to `product.images`. The first image is
  the hero used on cards and search.
- **Bulk/committed photos** can also be dropped into `public/products/<slug>/`
  and picked up by `npm run media:manifest`.
- **No image?** `ProductArt` renders deterministic studio art from the brand
  palette, so the storefront never shows a broken tile.

Repointing to Cloudinary, S3 or MinIO means rewriting `uploadProductImage` and
nothing else.

## Security notes

- Staff sessions are HMAC-signed cookies (`HttpOnly`, `SameSite=Lax`, `Secure` in
  production) with an 8-hour lifetime — a trading day.
- Passwords are salted SHA-256 **for the demo**. Swap `lib/auth/password.ts` for
  argon2id before real customer accounts; it has two call sites.
- Authorisation is re-checked inside every server action, so a crafted request
  from a signed-in rider cannot cancel an order.
- Order totals are recomputed server-side from the catalogue at checkout. Prices
  posted by the client are ignored.
