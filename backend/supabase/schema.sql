-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- Shops table
create table shops (
  id uuid primary key default uuid_generate_v4(),
  owner_id uuid not null,
  shop_name text not null,
  slug text unique not null,
  template text not null default 'grid' check (template in ('grid', 'list', 'dark')),
  location text,
  is_published boolean default false,
  created_at timestamp with time zone default now()
);

-- Products table
create table products (
  id uuid primary key default uuid_generate_v4(),
  shop_id uuid references shops(id) on delete cascade,
  name text not null,
  brand text,
  quantity text,
  category text,
  price text,
  specs text,
  image_url text,
  is_verified boolean default false,
  created_at timestamp with time zone default now()
);

-- Index for fast slug lookup
create index on shops(slug);

-- Index for fast shop product lookup
create index on products(shop_id);

-- Full text search index on products
create index on products using gin(to_tsvector('english', name || ' ' || coalesce(brand, '')));
