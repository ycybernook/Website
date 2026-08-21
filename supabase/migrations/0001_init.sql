-- Cybernook storefront schema: products, variant options, orders

create extension if not exists "pgcrypto";

create table products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null default '',
  image_url text,
  base_price numeric(10,2) not null default 0,
  active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table option_groups (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  name text not null,
  kind text not null check (kind in ('select', 'quantity_stepper')),
  required boolean not null default true,
  sort_order int not null default 0
);

create table option_choices (
  id uuid primary key default gen_random_uuid(),
  option_group_id uuid not null references option_groups(id) on delete cascade,
  label text not null,
  price_delta numeric(10,2) not null default 0,
  sort_order int not null default 0
);

create table orders (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  phone text not null,
  email text,
  fulfillment text not null check (fulfillment in ('pickup', 'delivery')),
  address text,
  status text not null default 'pending_payment'
    check (status in ('pending_payment', 'paid', 'cancelled')),
  subtotal numeric(10,2) not null,
  total numeric(10,2) not null,
  paymongo_checkout_session_id text,
  created_at timestamptz not null default now()
);

create table order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  product_id uuid references products(id) on delete set null,
  product_name_snapshot text not null,
  quantity int not null check (quantity > 0),
  selected_options jsonb not null default '[]',
  unit_price numeric(10,2) not null,
  line_total numeric(10,2) not null
);

create index on option_groups(product_id);
create index on option_choices(option_group_id);
create index on order_items(order_id);
create index on orders(paymongo_checkout_session_id);

-- RLS: catalog is public read-only; orders/order_items are server-only
-- (writes go through the service-role key in API routes, never the browser).

alter table products enable row level security;
alter table option_groups enable row level security;
alter table option_choices enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;

create policy "public read active products" on products
  for select using (active = true);

create policy "public read option groups" on option_groups
  for select using (true);

create policy "public read option choices" on option_choices
  for select using (true);

-- No policies on orders/order_items: only the service role (which bypasses
-- RLS) can read or write them. The anon key gets zero access.
