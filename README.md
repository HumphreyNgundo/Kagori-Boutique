<div align="center">

# KAGORIM BOUTIQUE

**Wigs · lashes · shoes · bags — a self-checkout storefront with order tracking and a role-based back office.**

Next.js 15 · TypeScript · Tailwind v4 · Server Actions · Vercel

</div>

---

## What this is

A working demo boutique for Kagorim Enterprise, built around one requirement:
**people should be able to order in under two minutes, and track the order
afterwards without phoning anyone.**

- **No account needed to buy.** The basket lives in a cookie; checkout asks for a
  name, a phone number and an address. Three steps, one screen.
- **Every order gets a tracking code** (`KGB-7F3Q2A`). Anyone with the code can
  follow the parcel from *awaiting payment* to *delivered*.
- **A back office with real roles.** Owner, manager, sales, fulfilment and rider
  each see exactly what their job needs — enforced server-side, not hidden in the UI.
- **The shop owner manages their own photos.** Upload product images from the
  console; until then, every product renders generated studio art, so the
  catalogue is never broken.

## Modules

| Module | What it covers | Where |
|---|---|---|
| Catalogue | 9 categories, 28 products, 80+ variants with per-family option axes (wig length/density, shoe size, lash style) | `src/lib/repo/catalog.ts` |
| Storefront | Home, category pages, search, facets, product detail, variant picker | `src/app/(shop)` |
| Cart & self-checkout | Cookie basket, coupons, delivery zones, M-Pesa / card / pay-on-delivery | `src/lib/cart.ts`, `src/lib/actions/checkout.ts` |
| Orders & tracking | Lifecycle state machine, event timeline, public tracking page | `src/lib/repo/orders.ts` |
| Inventory | Reserve-on-order, commit-on-payment, release-on-cancel, append-only stock ledger | `src/lib/repo/admin.ts` |
| Fulfilment | Packing queue, rider assignment, rider run sheet | `src/app/admin/orders`, `src/app/admin/deliveries` |
| Media | Staff image upload to Vercel Blob, hero selection, generated fallback art | `src/lib/media.ts` |
| Identity & RBAC | 6 roles, 18 permissions, signed session cookie, server-side guards | `src/lib/auth` |
| Analytics | 30-day revenue, AOV, top sellers, low stock, pipeline counts | `src/lib/repo/admin.ts` |
| Audit | Append-only log of every state change, with actor | `src/app/admin/audit` |

## Try it

```bash
npm install
npm run dev
```

### Demo accounts

Password for all of them: **`kagorim2026`**

| Email | Role | What they see |
|---|---|---|
| `owner@kagorim.co.ke` | Owner | Everything, including staff and settings |
| `manager@kagorim.co.ke` | Manager | Orders, catalogue, stock, discounts, reports |
| `sales@kagorim.co.ke` | Sales | Orders and customers, read-only catalogue |
| `store@kagorim.co.ke` | Fulfilment | Packing queue, stock adjustments, rider handover |
| `rider@kagorim.co.ke` | Rider | Only their own deliveries |

Shoppers never sign in. To see the customer side, just add something to the
basket and check out.

### A two-minute walkthrough

1. Add a pair of heels to the basket, apply coupon `KARIBU10`, check out with M-Pesa.
2. On the confirmation screen press **Simulate payment** — this stands in for the
   M-Pesa STK callback. The order flips to *Confirmed* and stock is committed.
3. Sign in as `store@kagorim.co.ke` → **Orders** → open the order → mark it **Packed**,
   assign a rider, mark it **Out for delivery**.
4. Go back to `/order/<code>` as the customer: the timeline has moved.
5. Sign in as `rider@kagorim.co.ke` — they see only that delivery, nothing else.

## Documentation

| Document | Contents |
|---|---|
| [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) | System design, request flow, persistence seam, payments, media, scaling path |
| [`docs/DATA-MODEL.md`](docs/DATA-MODEL.md) | Entity relationships, invariants, stock semantics |
| [`docs/RBAC.md`](docs/RBAC.md) | Roles, the permission matrix, how guards are enforced |
| [`db/schema.sql`](db/schema.sql) | Production PostgreSQL DDL — the target for the data-layer swap |

## Environment

Every variable is optional; the app boots without any of them. See `.env.example`.

| Variable | Effect when set |
|---|---|
| `AUTH_SECRET` | Signs staff session cookies (set this in production) |
| `BLOB_READ_WRITE_TOKEN` | Turns on durable storage + product image uploads (added automatically by Vercel when you connect a Blob store) |

## CI/CD

- **CI** — `.github/workflows/ci.yml` runs typecheck, production build and an HTTP
  smoke test of the main routes on every push and pull request.
- **CD** — the Vercel project is connected to this repository: every push to the
  development branch gets a preview URL, and `main` deploys to production.
