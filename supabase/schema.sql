-- Enable extensions
create extension if not exists "uuid-ossp";

-- Profiles
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  name text,
  first_name text,
  last_name text,
  phone text,
  role text default 'user',
  status text default 'UNREGISTERED',
  nationality text,
  gender text,
  date_of_birth date,
  house_address text,
  occupation text,
  salary_range text,
  primary_account_type text,
  currency text default 'USD',
  avatar_url text,
  preferences jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Accounts
create table if not exists accounts (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  account_number text not null unique,
  routing_number text not null,
  account_type text not null,
  currency text not null,
  status text default 'ACTIVE',
  created_at timestamptz default now()
);

-- Virtual cards
create table if not exists virtual_cards (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  account_id uuid not null references accounts(id) on delete cascade,
  card_number text not null,
  expiry_date text not null,
  cvv text not null,
  status text default 'ACTIVE',
  daily_limit numeric default 5000,
  monthly_limit numeric default 50000,
  created_at timestamptz default now()
);

-- Transactions
create table if not exists transactions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  account_id uuid not null references accounts(id) on delete cascade,
  type text not null,
  amount numeric not null,
  description text not null,
  currency text not null,
  status text default 'completed',
  created_at timestamptz default now()
);

-- Activities
create table if not exists activities (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null,
  description text not null,
  amount numeric,
  created_at timestamptz default now()
);

-- Notifications
create table if not exists notifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text,
  message text not null,
  type text,
  path text,
  read boolean default false,
  created_at timestamptz default now()
);

-- Drafts (add money / send money)
create table if not exists drafts (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null, -- 'add_money' | 'send_money'
  payload jsonb not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (user_id, type)
);

-- Chat threads (1:1 user-support)
create table if not exists chat_threads (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  status text default 'open',
  created_at timestamptz default now()
);

-- Chat messages
create table if not exists chat_messages (
  id uuid primary key default uuid_generate_v4(),
  thread_id uuid not null references chat_threads(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  sender_type text not null, -- 'user' | 'admin'
  message text not null,
  attachment_url text,
  read boolean default false,
  created_at timestamptz default now()
);

-- Trigger to update updated_at on profiles
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_profiles_updated_at on profiles;
create trigger set_profiles_updated_at
before update on profiles
for each row execute procedure public.set_updated_at();

drop trigger if exists set_drafts_updated_at on drafts;
create trigger set_drafts_updated_at
before update on drafts
for each row execute procedure public.set_updated_at();

-- Auto-create profile on auth signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, email, name, status, role)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'name', 'User'), 'UNREGISTERED', 'user')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

-- Account creation RPC (atomic)
create or replace function public.create_account(
  first_name text,
  last_name text,
  middle_name text,
  gender text,
  date_of_birth text,
  nationality text,
  house_address text,
  occupation text,
  salary_range text,
  account_type text,
  currency text,
  avatar_url text default null
) returns json language plpgsql security definer as $$
declare
  _user_id uuid := auth.uid();
  _account accounts;
  _card virtual_cards;
  _routing text;
  _account_number text;
  _expiry text;
  _cvv text;
begin
  if _user_id is null then
    raise exception 'Not authenticated';
  end if;

  -- Generate account numbers
  _routing := lpad((floor(random() * 1000000000))::text, 9, '0');
  _account_number := lpad((floor(random() * 100000000000))::text, 11, '0');

  -- Create account
  insert into accounts (user_id, account_number, routing_number, account_type, currency)
  values (_user_id, _account_number, _routing, account_type, currency)
  returning * into _account;

  -- Create virtual card
  _expiry := to_char(now() + interval '5 years', 'MM/YY');
  _cvv := lpad((floor(random() * 1000))::text, 3, '0');

  insert into virtual_cards (user_id, account_id, card_number, expiry_date, cvv)
  values (_user_id, _account.id, lpad((floor(random() * 10000000000000000))::text, 16, '0'), _expiry, _cvv)
  returning * into _card;

  -- Update profile
  update profiles
  set first_name = create_account.first_name,
      last_name = create_account.last_name,
      name = trim(concat(create_account.first_name, ' ', create_account.middle_name, ' ', create_account.last_name)),
      gender = create_account.gender,
      date_of_birth = create_account.date_of_birth::date,
      nationality = create_account.nationality,
      house_address = create_account.house_address,
      occupation = create_account.occupation,
      salary_range = create_account.salary_range,
      primary_account_type = create_account.account_type,
      currency = create_account.currency,
      avatar_url = create_account.avatar_url,
      status = 'ACTIVE'
  where id = _user_id;

  -- Welcome bonus transaction
  insert into transactions (user_id, account_id, type, amount, description, currency, status)
  values (_user_id, _account.id, 'credit', 10, 'Onboarding Welcome Bonus', currency, 'completed');

  -- Activity log
  insert into activities (user_id, type, description, amount)
  values (_user_id, 'credit', 'Onboarding Welcome Bonus', 10);

  -- Notification
  insert into notifications (user_id, title, message, type, read, path)
  values (_user_id, 'Welcome to Chime!', 'Your account has been created and $10 bonus credited.', 'success', false, '/activity');

  return json_build_object('account', _account, 'card', _card);
end;
$$;

-- RLS
alter table profiles enable row level security;
alter table accounts enable row level security;
alter table virtual_cards enable row level security;
alter table transactions enable row level security;
alter table activities enable row level security;
alter table notifications enable row level security;
alter table drafts enable row level security;
alter table chat_threads enable row level security;
alter table chat_messages enable row level security;

-- Helper policy for admin (role stored in profiles)
create or replace function public.is_admin()
returns boolean language sql stable as $$
  select exists (
    select 1 from profiles p
    where p.id = auth.uid() and p.role = 'admin'
  );
$$;

-- Profiles policies
create policy "Profiles: read own"
on profiles for select
using (auth.uid() = id or public.is_admin());

create policy "Profiles: update own"
on profiles for update
using (auth.uid() = id or public.is_admin());

-- Accounts policies
create policy "Accounts: read own"
on accounts for select
using (auth.uid() = user_id or public.is_admin());

create policy "Accounts: insert own"
on accounts for insert
with check (auth.uid() = user_id or public.is_admin());

-- Virtual cards policies
create policy "Cards: read own"
on virtual_cards for select
using (auth.uid() = user_id or public.is_admin());

create policy "Cards: update own"
on virtual_cards for update
using (auth.uid() = user_id or public.is_admin());

-- Transactions policies
create policy "Transactions: read own"
on transactions for select
using (auth.uid() = user_id or public.is_admin());

create policy "Transactions: insert own"
on transactions for insert
with check (auth.uid() = user_id or public.is_admin());

-- Activities policies
create policy "Activities: read own"
on activities for select
using (auth.uid() = user_id or public.is_admin());

create policy "Activities: insert own"
on activities for insert
with check (auth.uid() = user_id or public.is_admin());

-- Notifications policies
create policy "Notifications: read own"
on notifications for select
using (auth.uid() = user_id or public.is_admin());

create policy "Notifications: update own"
on notifications for update
using (auth.uid() = user_id or public.is_admin());

create policy "Notifications: insert own"
on notifications for insert
with check (auth.uid() = user_id or public.is_admin());

-- Drafts policies
create policy "Drafts: read own"
on drafts for select
using (auth.uid() = user_id or public.is_admin());

create policy "Drafts: upsert own"
on drafts for insert
with check (auth.uid() = user_id or public.is_admin());

create policy "Drafts: update own"
on drafts for update
using (auth.uid() = user_id or public.is_admin());

create policy "Drafts: delete own"
on drafts for delete
using (auth.uid() = user_id or public.is_admin());

-- Chat policies
create policy "Threads: read own"
on chat_threads for select
using (auth.uid() = user_id or public.is_admin());

create policy "Threads: insert own"
on chat_threads for insert
with check (auth.uid() = user_id or public.is_admin());

create policy "Messages: read own"
on chat_messages for select
using (
  auth.uid() = user_id
  or public.is_admin()
);

create policy "Messages: insert own"
on chat_messages for insert
with check (auth.uid() = user_id or public.is_admin());

create policy "Messages: update own"
on chat_messages for update
using (auth.uid() = user_id or public.is_admin());
-- Add metadata to transactions
alter table transactions add column if not exists metadata jsonb default '{}'::jsonb;

-- Storage bucket for payment evidence
insert into storage.buckets (id, name, public)
values ('payment-evidence', 'payment-evidence', true)
on conflict (id) do nothing;

-- Storage policies for payment evidence
create policy "Evidence: read own"
on storage.objects for select
using (
  bucket_id = 'payment-evidence'
  and (auth.uid() = owner or public.is_admin())
);

create policy "Evidence: insert own"
on storage.objects for insert
with check (
  bucket_id = 'payment-evidence'
  and auth.uid() = owner
);

create policy "Evidence: update own"
on storage.objects for update
using (
  bucket_id = 'payment-evidence'
  and (auth.uid() = owner or public.is_admin())
);

create policy "Evidence: delete own"
on storage.objects for delete
using (
  bucket_id = 'payment-evidence'
  and (auth.uid() = owner or public.is_admin())
);
