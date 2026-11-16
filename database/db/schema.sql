CREATE TABLE IF NOT EXISTS products (
  id          SERIAL PRIMARY KEY,
  slug        TEXT NOT NULL UNIQUE,
  name        TEXT NOT NULL,
  category    TEXT NOT NULL,
  brand       TEXT NOT NULL,
  price       INTEGER NOT NULL CHECK (price >= 0),
  is_new      BOOLEAN NOT NULL DEFAULT FALSE,
  rating      NUMERIC(3, 2) NOT NULL CHECK (rating >= 0 AND rating <= 5),
  stock       INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  description TEXT NOT NULL,
  features    JSONB NOT NULL DEFAULT '[]'::jsonb,
  specs       JSONB NOT NULL DEFAULT '[]'::jsonb,
  in_the_box  JSONB NOT NULL DEFAULT '[]'::jsonb,
  images      JSONB NOT NULL DEFAULT '[]'::jsonb
);

CREATE TABLE IF NOT EXISTS orders (
  id            SERIAL PRIMARY KEY,
  order_number  TEXT NOT NULL UNIQUE,
  customer_name TEXT NOT NULL,
  email         TEXT NOT NULL,
  phone         TEXT NOT NULL,
  address       TEXT NOT NULL,
  city          TEXT NOT NULL,
  state         TEXT NOT NULL,
  notes         TEXT,
  status        TEXT NOT NULL DEFAULT 'pending'
                CHECK (status IN ('pending','paid','shipped','delivered','cancelled')),
  subtotal      INTEGER NOT NULL CHECK (subtotal >= 0),
  delivery_fee  INTEGER NOT NULL CHECK (delivery_fee >= 0),
  total         INTEGER NOT NULL CHECK (total >= 0),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS order_items (
  id           SERIAL PRIMARY KEY,
  order_id     INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id   INTEGER NOT NULL REFERENCES products(id),
  product_name TEXT NOT NULL,
  unit_price   INTEGER NOT NULL CHECK (unit_price >= 0),
  quantity     INTEGER NOT NULL CHECK (quantity > 0)
);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);