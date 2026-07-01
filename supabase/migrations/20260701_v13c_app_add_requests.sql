-- LLLD Works Hub / Works Market v1.3c
-- App add request table and RLS policy draft.
-- Apply manually in Supabase SQL Editor only after human review.
-- This migration does not add app_instances, app_data, company account changes, or payment state.

create table if not exists public.app_add_requests (
  id uuid primary key default gen_random_uuid(),
  company_account_id uuid not null references public.company_accounts(id) on delete cascade,
  app_id uuid not null references public.apps(id),
  app_key_snapshot text,
  app_name_snapshot text,
  request_message text,
  contact_requested boolean not null default false,
  status text not null default 'pending',
  admin_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by uuid,
  constraint app_add_requests_status_check
    check (status in ('pending','reviewing','approved','rejected','cancelled')),
  constraint app_add_requests_message_length_check
    check (char_length(coalesce(request_message, '')) <= 2000),
  constraint app_add_requests_admin_note_length_check
    check (char_length(coalesce(admin_note, '')) <= 2000)
);

drop trigger if exists set_app_add_requests_updated_at on public.app_add_requests;
create trigger set_app_add_requests_updated_at
before update on public.app_add_requests
for each row execute function public.set_updated_at();

create index if not exists idx_app_add_requests_company_account_id
  on public.app_add_requests(company_account_id);

create index if not exists idx_app_add_requests_app_id
  on public.app_add_requests(app_id);

create index if not exists idx_app_add_requests_status
  on public.app_add_requests(status);

create index if not exists idx_app_add_requests_created_at
  on public.app_add_requests(created_at);

alter table public.app_add_requests enable row level security;

drop policy if exists "app_add_requests_select_own_company" on public.app_add_requests;
create policy "app_add_requests_select_own_company"
on public.app_add_requests
for select
using (
  exists (
    select 1
    from public.company_accounts ca
    where ca.id = app_add_requests.company_account_id
      and ca.owner_user_id = auth.uid()
  )
);

drop policy if exists "app_add_requests_insert_own_company" on public.app_add_requests;
create policy "app_add_requests_insert_own_company"
on public.app_add_requests
for insert
with check (
  exists (
    select 1
    from public.company_accounts ca
    where ca.id = app_add_requests.company_account_id
      and ca.owner_user_id = auth.uid()
  )
  and status = 'pending'
  and admin_note is null
  and reviewed_at is null
  and reviewed_by is null
);

-- No user update/delete policy is created in v1.3c.
-- Users can create and read their own requests, but cannot freely change status,
-- admin_note, reviewed_at, reviewed_by, or delete request rows.
-- Operator-wide review policies need a separate admin/auth design in a later phase.
