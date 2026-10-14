-- =====================================================================
-- Kagorim Boutique — canonical relational schema (PostgreSQL 15+)
--
-- The running demo persists this same shape through a document driver
-- (Vercel Blob / in-memory). This file is the production target: run it
-- against Neon/Supabase/RDS and point POSTGRES_URL at it, then swap the
-- persistence driver in src/lib/db/index.ts. Types in src/lib/types.ts
-- mirror these tables one-to-one.
-- =====================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ---------------------------------------------------------------- RBAC
CREATE TYPE user_role AS ENUM ('OWNER','MANAGER','SALES','FULFILMENT','RIDER','CUSTOMER');

CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         CITEXT UNIQUE NOT NULL,
  name          TEXT NOT NULL,
  phone         TEXT,
  role          user_role NOT NULL DEFAULT 'CUSTOMER',
  password_hash TEXT NOT NULL,
  active        BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_login_at TIMESTAMPTZ
);

-- Permissions are code-defined (src/lib/auth/rbac.ts) and role-derived.
-- This table only exists for per-user grants that deviate from the role.
CREATE TABLE user_permission_overrides (
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  permission TEXT NOT NULL,
  allowed    BOOLEAN NOT NULL,
  PRIMARY KEY (user_id, permission)
);

-- ------------------------------------------------------------- CATALOG
CREATE TYPE product_family AS ENUM
  ('WIG','WIG_ACCESSORY','LASH','LASH_ACCESSORY','FOOTWEAR','BAG');

CREATE TABLE categories (
  id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug     TEXT UNIQUE NOT NULL,
  name     TEXT NOT NULL,
  tagline  TEXT NOT NULL DEFAULT '',
  family   product_family NOT NULL,
  position INT NOT NULL DEFAULT 0,
  active   BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE products (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id       UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  slug              TEXT UNIQUE NOT NULL,
  name              TEXT NOT NULL,
  summary           TEXT NOT NULL DEFAULT '',
  description       TEXT NOT NULL DEFAULT '',
  base_price        INT  NOT NULL CHECK (base_price >= 0),   -- minor units (KES cents)
  compare_at_price  INT  CHECK (compare_at_price >= 0),
  tags              TEXT[] NOT NULL DEFAULT '{}',
  images            TEXT[] NOT NULL DEFAULT '{}',            -- object-store URLs
  featured          BOOLEAN NOT NULL DEFAULT FALSE,
  active            BOOLEAN NOT NULL DEFAULT TRUE,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX products_category_idx ON products(category_id) WHERE active;

-- Variant option axes vary by family (wig: length/density/colour,
-- footwear: size/colour, bag: colour) so they live in JSONB rather than
-- as rigid columns.
CREATE TABLE variants (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id           UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  sku                  TEXT UNIQUE NOT NULL,
  options              JSONB NOT NULL DEFAULT '{}'::jsonb,
  price                INT NOT NULL CHECK (price >= 0),
  stock                INT NOT NULL DEFAULT 0 CHECK (stock >= 0),
  reserved             INT NOT NULL DEFAULT 0 CHECK (reserved >= 0),
  low_stock_threshold  INT NOT NULL DEFAULT 3,
  active               BOOLEAN NOT NULL DEFAULT TRUE,
  CONSTRAINT reserved_within_stock CHECK (reserved <= stock)
);
CREATE INDEX variants_product_idx ON variants(product_id);

-- ------------------------------------------------------------ COMMERCE
CREATE TABLE customers (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  phone      TEXT NOT NULL,
  email      TEXT,
  user_id    UUID REFERENCES users(id) ON DELETE SET NULL,
  notes      TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (phone)
);

CREATE TYPE fulfilment_method AS ENUM ('DELIVERY','PICKUP');

CREATE TABLE delivery_zones (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name      TEXT NOT NULL,
  fee       INT NOT NULL CHECK (fee >= 0),
  eta_hours INT NOT NULL CHECK (eta_hours > 0),
  method    fulfilment_method NOT NULL DEFAULT 'DELIVERY',
  active    BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TYPE order_status AS ENUM
  ('PENDING_PAYMENT','CONFIRMED','PACKED','DISPATCHED','READY_FOR_PICKUP','DELIVERED','CANCELLED');
CREATE TYPE payment_method AS ENUM ('MPESA','CARD','ON_DELIVERY');
CREATE TYPE payment_status AS ENUM ('PENDING','PAID','FAILED','REFUNDED');

CREATE TABLE coupons (
  code         TEXT PRIMARY KEY,
  kind         TEXT NOT NULL CHECK (kind IN ('PERCENT','FIXED')),
  value        INT NOT NULL CHECK (value > 0),
  min_subtotal INT NOT NULL DEFAULT 0,
  active       BOOLEAN NOT NULL DEFAULT TRUE,
  expires_at   TIMESTAMPTZ
);

CREATE TABLE orders (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code           TEXT UNIQUE NOT NULL,                     -- KGB-7F3Q2A
  customer_id    UUID NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
  status         order_status NOT NULL DEFAULT 'PENDING_PAYMENT',
  fulfilment     fulfilment_method NOT NULL,
  zone_id        UUID NOT NULL REFERENCES delivery_zones(id),
  address        TEXT,
  delivery_fee   INT NOT NULL DEFAULT 0,
  subtotal       INT NOT NULL,
  discount       INT NOT NULL DEFAULT 0,
  total          INT NOT NULL,
  payment_method payment_method NOT NULL,
  payment_status payment_status NOT NULL DEFAULT 'PENDING',
  payment_ref    TEXT,
  coupon_code    TEXT REFERENCES coupons(code),
  customer_note  TEXT,
  rider_id       UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT delivery_needs_address
    CHECK (fulfilment = 'PICKUP' OR address IS NOT NULL)
);
CREATE INDEX orders_status_idx   ON orders(status);
CREATE INDEX orders_customer_idx ON orders(customer_id);
CREATE INDEX orders_created_idx  ON orders(created_at DESC);

-- Line items snapshot name/price: catalogue edits must not rewrite history.
CREATE TABLE order_items (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id      UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  variant_id    UUID NOT NULL REFERENCES variants(id) ON DELETE RESTRICT,
  product_id    UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  name          TEXT NOT NULL,
  options_label TEXT NOT NULL DEFAULT '',
  sku           TEXT NOT NULL,
  unit_price    INT NOT NULL CHECK (unit_price >= 0),
  quantity      INT NOT NULL CHECK (quantity > 0)
);
CREATE INDEX order_items_order_idx ON order_items(order_id);

-- The customer-facing tracking timeline.
CREATE TABLE order_events (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id   UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  status     order_status NOT NULL,
  note       TEXT NOT NULL DEFAULT '',
  actor_id   UUID REFERENCES users(id) ON DELETE SET NULL,  -- NULL = system
  actor_name TEXT NOT NULL DEFAULT 'System',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX order_events_order_idx ON order_events(order_id, created_at);

-- ----------------------------------------------------------- INVENTORY
CREATE TABLE stock_movements (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  variant_id UUID NOT NULL REFERENCES variants(id) ON DELETE CASCADE,
  delta      INT NOT NULL,
  reason     TEXT NOT NULL CHECK (reason IN ('RESTOCK','SALE','RELEASE','ADJUSTMENT')),
  reference  TEXT,                                          -- order code, GRN no.
  actor_name TEXT NOT NULL DEFAULT 'System',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX stock_movements_variant_idx ON stock_movements(variant_id, created_at DESC);

-- --------------------------------------------------------------- AUDIT
CREATE TABLE audit_logs (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id   UUID REFERENCES users(id) ON DELETE SET NULL,
  actor_name TEXT NOT NULL,
  action     TEXT NOT NULL,
  entity     TEXT NOT NULL,
  entity_id  TEXT NOT NULL,
  meta       JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX audit_logs_created_idx ON audit_logs(created_at DESC);

-- ------------------------------------------------------------ SETTINGS
CREATE TABLE store_settings (
  id                SMALLINT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  store_name        TEXT NOT NULL,
  currency          TEXT NOT NULL DEFAULT 'KES',
  whatsapp          TEXT NOT NULL,
  support_phone     TEXT NOT NULL,
  free_delivery_over INT NOT NULL DEFAULT 0,
  mpesa_enabled     BOOLEAN NOT NULL DEFAULT TRUE,
  card_enabled      BOOLEAN NOT NULL DEFAULT TRUE,
  cod_enabled       BOOLEAN NOT NULL DEFAULT TRUE
);

-- Available-to-sell view used by the storefront.
CREATE VIEW variant_availability AS
  SELECT v.id, v.product_id, v.sku, v.price,
         v.stock - v.reserved AS available,
         (v.stock - v.reserved) <= v.low_stock_threshold AS low_stock
  FROM variants v WHERE v.active;
