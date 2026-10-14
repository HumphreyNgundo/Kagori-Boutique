# Data model

Canonical DDL: [`db/schema.sql`](../db/schema.sql). TypeScript mirror:
[`src/lib/types.ts`](../src/lib/types.ts).

```
users ──────┬──< orders.rider_id
            └──< audit_logs.actor_id
                      ▲
categories ──< products ──< variants ──< order_items >── orders >── customers
                                │                           │
                                └──< stock_movements        ├──< order_events
                                                            ├── delivery_zones
                                                            └── coupons
```

## Entities

| Table | Rows mean | Notes |
|---|---|---|
| `users` | Anyone who can sign in | `role` drives every permission check |
| `categories` | The nine shelves of the boutique | `family` decides which option axes products expose |
| `products` | A sellable thing | `base_price` is denormalised from the cheapest variant for list views |
| `variants` | The thing you actually buy | Options are JSONB — wigs have length/density/colour, shoes have size/colour |
| `customers` | A phone number that has ordered | Unique on `phone`; repeat shoppers merge automatically |
| `orders` | One checkout | `code` is the human tracking reference |
| `order_items` | Line items | Name, SKU and price are **snapshots** — editing the catalogue must not rewrite history |
| `order_events` | The tracking timeline | `actor_id IS NULL` means a system transition |
| `stock_movements` | Append-only inventory ledger | Every `±1` is attributable |
| `delivery_zones` | Pickup and delivery options with fee and ETA | |
| `coupons` | `PERCENT` or `FIXED`, with a minimum spend | |
| `audit_logs` | Who changed what, when | Append-only, capped in the demo store |
| `store_settings` | Single row, enforced by `CHECK (id = 1)` | |

## Invariants

- `reserved <= stock` — enforced by a table constraint and by the write path.
- `available = stock − reserved` — exposed as the `variant_availability` view.
- A delivery order must carry an address: `CHECK (fulfilment = 'PICKUP' OR address IS NOT NULL)`.
- `total = subtotal − discount + delivery_fee`, all recomputed server-side.
- Deleting a product never orphans history — `order_items` references it with
  `ON DELETE RESTRICT`; products are hidden (`active = false`), not deleted.

## Why options are JSONB

A wig has length, density and colour. A sneaker has size and colour. A clutch has
only colour. Modelling that as columns means either a sparse table or a join per
attribute family; modelling it as rows means reconstructing a variant on every
read. JSONB keeps one row per sellable SKU, and the storefront derives its filter
facets from the keys that actually appear.
