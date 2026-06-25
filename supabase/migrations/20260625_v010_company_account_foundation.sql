-- LLLD Works Hub / Works Market v0.10
-- Supabase test database foundation.
-- This migration creates the verification DB schema only.
-- Do not put service role keys, secret keys, or real business data in frontend files.

create extension if not exists "pgcrypto";

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.company_accounts (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null unique references auth.users(id) on delete cascade,
  email text not null,
  company_name text not null,
  contact_name text,
  business_type text not null default 'demo',
  phone text,
  plan_status text not null default 'demo',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint company_accounts_business_type_check
    check (business_type in ('school','store','restaurant','small_business','consulting','personal','demo')),
  constraint company_accounts_plan_status_check
    check (plan_status in ('demo','free','trial','paid','paused','cancelled'))
);

create table if not exists public.apps (
  id uuid primary key default gen_random_uuid(),
  app_key text not null unique,
  name text not null,
  description text,
  status text not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint apps_status_check
    check (status in ('draft','active','beta','paused','internal'))
);

create table if not exists public.app_instances (
  id uuid primary key default gen_random_uuid(),
  company_account_id uuid not null references public.company_accounts(id) on delete cascade,
  app_key text not null references public.apps(app_key),
  display_name text not null,
  status text not null default 'active',
  settings_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint app_instances_status_check
    check (status in ('active','trial','paused','disabled'))
);

create table if not exists public.app_data (
  id uuid primary key default gen_random_uuid(),
  company_account_id uuid not null references public.company_accounts(id) on delete cascade,
  app_instance_id uuid references public.app_instances(id) on delete cascade,
  app_key text not null,
  data_type text not null,
  data_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  company_account_id uuid not null references public.company_accounts(id) on delete cascade,
  app_key text,
  action text not null,
  target_type text,
  target_id text,
  before_json jsonb,
  after_json jsonb,
  created_at timestamptz not null default now()
);

drop trigger if exists set_company_accounts_updated_at on public.company_accounts;
create trigger set_company_accounts_updated_at
before update on public.company_accounts
for each row execute function public.set_updated_at();

drop trigger if exists set_apps_updated_at on public.apps;
create trigger set_apps_updated_at
before update on public.apps
for each row execute function public.set_updated_at();

drop trigger if exists set_app_instances_updated_at on public.app_instances;
create trigger set_app_instances_updated_at
before update on public.app_instances
for each row execute function public.set_updated_at();

drop trigger if exists set_app_data_updated_at on public.app_data;
create trigger set_app_data_updated_at
before update on public.app_data
for each row execute function public.set_updated_at();

create index if not exists idx_company_accounts_owner_user_id
  on public.company_accounts(owner_user_id);

create index if not exists idx_app_instances_company_account_id
  on public.app_instances(company_account_id);

create index if not exists idx_app_instances_app_key
  on public.app_instances(app_key);

create index if not exists idx_app_data_company_account_id
  on public.app_data(company_account_id);

create index if not exists idx_app_data_app_instance_id
  on public.app_data(app_instance_id);

create index if not exists idx_app_data_app_key
  on public.app_data(app_key);

create index if not exists idx_app_data_data_type
  on public.app_data(data_type);

create index if not exists idx_audit_logs_company_account_id
  on public.audit_logs(company_account_id);

create index if not exists idx_audit_logs_app_key
  on public.audit_logs(app_key);

alter table public.company_accounts enable row level security;
alter table public.apps enable row level security;
alter table public.app_instances enable row level security;
alter table public.app_data enable row level security;
alter table public.audit_logs enable row level security;

drop policy if exists "company_accounts_select_own" on public.company_accounts;
create policy "company_accounts_select_own"
on public.company_accounts
for select
using (owner_user_id = auth.uid());

drop policy if exists "company_accounts_insert_own" on public.company_accounts;
create policy "company_accounts_insert_own"
on public.company_accounts
for insert
with check (owner_user_id = auth.uid());

drop policy if exists "company_accounts_update_own" on public.company_accounts;
create policy "company_accounts_update_own"
on public.company_accounts
for update
using (owner_user_id = auth.uid())
with check (owner_user_id = auth.uid());

drop policy if exists "apps_select_catalog" on public.apps;
create policy "apps_select_catalog"
on public.apps
for select
using (true);

drop policy if exists "app_instances_select_own_company" on public.app_instances;
create policy "app_instances_select_own_company"
on public.app_instances
for select
using (
  exists (
    select 1
    from public.company_accounts ca
    where ca.id = app_instances.company_account_id
      and ca.owner_user_id = auth.uid()
  )
);

drop policy if exists "app_instances_insert_own_company" on public.app_instances;
create policy "app_instances_insert_own_company"
on public.app_instances
for insert
with check (
  exists (
    select 1
    from public.company_accounts ca
    where ca.id = app_instances.company_account_id
      and ca.owner_user_id = auth.uid()
  )
);

drop policy if exists "app_instances_update_own_company" on public.app_instances;
create policy "app_instances_update_own_company"
on public.app_instances
for update
using (
  exists (
    select 1
    from public.company_accounts ca
    where ca.id = app_instances.company_account_id
      and ca.owner_user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.company_accounts ca
    where ca.id = app_instances.company_account_id
      and ca.owner_user_id = auth.uid()
  )
);

drop policy if exists "app_data_select_own_company" on public.app_data;
create policy "app_data_select_own_company"
on public.app_data
for select
using (
  exists (
    select 1
    from public.company_accounts ca
    where ca.id = app_data.company_account_id
      and ca.owner_user_id = auth.uid()
  )
);

drop policy if exists "app_data_insert_own_company" on public.app_data;
create policy "app_data_insert_own_company"
on public.app_data
for insert
with check (
  exists (
    select 1
    from public.company_accounts ca
    where ca.id = app_data.company_account_id
      and ca.owner_user_id = auth.uid()
  )
);

drop policy if exists "app_data_update_own_company" on public.app_data;
create policy "app_data_update_own_company"
on public.app_data
for update
using (
  exists (
    select 1
    from public.company_accounts ca
    where ca.id = app_data.company_account_id
      and ca.owner_user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.company_accounts ca
    where ca.id = app_data.company_account_id
      and ca.owner_user_id = auth.uid()
  )
);

drop policy if exists "audit_logs_select_own_company" on public.audit_logs;
create policy "audit_logs_select_own_company"
on public.audit_logs
for select
using (
  exists (
    select 1
    from public.company_accounts ca
    where ca.id = audit_logs.company_account_id
      and ca.owner_user_id = auth.uid()
  )
);

drop policy if exists "audit_logs_insert_own_company" on public.audit_logs;
create policy "audit_logs_insert_own_company"
on public.audit_logs
for insert
with check (
  exists (
    select 1
    from public.company_accounts ca
    where ca.id = audit_logs.company_account_id
      and ca.owner_user_id = auth.uid()
  )
);
