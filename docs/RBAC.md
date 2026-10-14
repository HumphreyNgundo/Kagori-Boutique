# Roles & permissions

Permissions are code-defined in [`src/lib/auth/rbac.ts`](../src/lib/auth/rbac.ts)
and derived from a single role per user. The console renders the live matrix at
**/admin/staff**, from the same constants the guards use — so the documentation
cannot drift from the enforcement.

## Roles

| Role | Exists to | Typical person |
|---|---|---|
| **Owner** | Run the business | Grace |
| **Manager** | Run the shop day to day | Shop manager |
| **Sales** | Take and chase orders | Counter / WhatsApp staff |
| **Fulfilment** | Pick, pack, hand over | Stores |
| **Rider** | Deliver parcels | Boda rider |
| **Customer** | Shop and track | Everyone else (no login needed) |

## Matrix

| Permission | Owner | Manager | Sales | Fulfilment | Rider |
|---|:--:|:--:|:--:|:--:|:--:|
| `dashboard:view` | ● | ● | ● | ● | |
| `order:view` | ● | ● | ● | ● | ● |
| `order:advance` | ● | ● | ● | ● | |
| `order:cancel` | ● | ● | | | |
| `order:refund` | ● | ● | | | |
| `order:assign_rider` | ● | ● | | ● | |
| `delivery:view_own` | ● | | | | ● |
| `delivery:complete` | ● | | | | ● |
| `product:view` | ● | ● | ● | ● | |
| `product:edit` | ● | ● | | | |
| `inventory:view` | ● | ● | ● | ● | |
| `inventory:adjust` | ● | ● | | ● | |
| `customer:view` | ● | ● | ● | | |
| `coupon:manage` | ● | ● | | | |
| `settings:manage` | ● | | | | |
| `staff:manage` | ● | | | | |
| `audit:view` | ● | ● | | | |
| `report:view` | ● | ● | ● | | |

## How it is enforced

Three layers, and only the last two are security:

1. **Navigation** — `app/admin/layout.tsx` filters the sidebar by permission, so
   nobody is shown a door they cannot open.
2. **Page guards** — every admin page begins with
   `await requirePermission("order:view")`, which redirects to `/admin/denied`.
3. **Action guards** — every mutation begins with `await authorise("order:cancel")`
   and returns an error rather than a redirect, so a crafted POST from a rider
   cannot cancel an order even though no button exists for it.

A rider signing in lands on `/admin/deliveries`, sees only parcels assigned to
them, and `/admin/settings` returns the denied page.

## Changing access

Add the permission to the `PERMISSIONS` array, list it under the roles that
should hold it, and use it in `requirePermission` / `authorise`. The matrix page,
the sidebar and this table all follow from that one edit.

## Customer identity

Shoppers deliberately have no account. A browser remembers its own tracking codes
in an `HttpOnly` cookie (`/account`), and anyone can look an order up by code at
`/track`. There is no password to forget, and no personal data behind a login
that a phone call cannot already reach.
