-- 001_create_core_tables.sql
-- Create core tables: users, accounts, transactions, messages

create table users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  full_name text,
  role text default 'user', -- 'user' or 'admin'
  created_at timestamptz default now()
);

create table accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  currency text default 'USD',
  balance numeric default 0,
  created_at timestamptz default now()
);

create table transactions (
  id bigserial primary key,
  account_id uuid references accounts(id) on delete cascade,
  amount numeric not null,
  type text not null, -- credit|debit
  status text default 'pending',
  metadata jsonb,
  created_at timestamptz default now()
);

create table messages (
  id bigserial primary key,
  sender text not null,
  sender_type text not null,
  message text,
  file_url text,
  file_type text,
  read boolean default false,
  timestamp timestamptz default now(),
  user_id uuid
);

create index on messages (user_id);
create index on messages (timestamp);
