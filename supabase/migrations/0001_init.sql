-- Cybernook storefront schema: products, variant options, orders.
-- Lives in its own "cybernook" schema so it never collides with the
-- unrelated hardware-store POS schema already in this Supabase project's
-- "public" schema.

create extension if not exists "pgcrypto";

create schema if not exists cybernook;

create table cybernook.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null default '',
  image_url text,
  base_price numeric(10,2) not null default 0,
  active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table cybernook.option_groups (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references cybernook.products(id) on delete cascade,
  name text not null,
  kind text not null check (kind in ('select', 'quantity_stepper')),
  required boolean not null default true,
  sort_order int not null default 0
);

create table cybernook.option_choices (
  id uuid primary key default gen_random_uuid(),
  option_group_id uuid not null references cybernook.option_groups(id) on delete cascade,
  label text not null,
  price_delta numeric(10,2) not null default 0,
  sort_order int not null default 0
);

create table cybernook.orders (
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

create table cybernook.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references cybernook.orders(id) on delete cascade,
  product_id uuid references cybernook.products(id) on delete set null,
  product_name_snapshot text not null,
  quantity int not null check (quantity > 0),
  selected_options jsonb not null default '[]',
  unit_price numeric(10,2) not null,
  line_total numeric(10,2) not null
);

create index on cybernook.option_groups(product_id);
create index on cybernook.option_choices(option_group_id);
create index on cybernook.order_items(order_id);
create index on cybernook.orders(paymongo_checkout_session_id);

-- RLS: catalog is public read-only; orders/order_items are server-only
-- (writes go through the service-role key in API routes, never the browser).

alter table cybernook.products enable row level security;
alter table cybernook.option_groups enable row level security;
alter table cybernook.option_choices enable row level security;
alter table cybernook.orders enable row level security;
alter table cybernook.order_items enable row level security;

create policy "public read active products" on cybernook.products
  for select using (active = true);

create policy "public read option groups" on cybernook.option_groups
  for select using (true);

create policy "public read option choices" on cybernook.option_choices
  for select using (true);

-- No policies on orders/order_items: only the service role (which bypasses
-- RLS) can read or write them. The anon key gets zero access.

-- Grants: PostgREST/supabase-js requires explicit schema + table grants in
-- addition to RLS — RLS alone does not grant access. service_role gets
-- everything (used only server-side); anon/authenticated get read-only
-- access to the catalog tables, further narrowed by the RLS policies above.

grant usage on schema cybernook to anon, authenticated, service_role;

grant select on cybernook.products, cybernook.option_groups, cybernook.option_choices
  to anon, authenticated;

grant all on all tables in schema cybernook to service_role;
alter default privileges in schema cybernook grant all on tables to service_role;
