-- LLLD Works Hub / Works Market v0.14.11
-- Portal persistence policy migration proposal.
-- Apply manually only after reviewing v0.14.11 docs.
-- This adds Works Portal as an app catalog item and prepares one portal_state row per company.
-- Do not put service role keys, secret keys, or real business data in frontend files.

insert into public.apps (app_key, name, description, status)
values (
  'works_portal',
  'LLLD Works Hub ポータル',
  'メモ、掲示板、ファイル保管庫、お気に入りなどを企業アカウント単位で扱う社内作業ポータル。',
  'active'
)
on conflict (app_key) do update
set
  name = excluded.name,
  description = excluded.description,
  status = excluded.status,
  updated_at = now();

insert into public.app_instances (
  company_account_id,
  app_key,
  display_name,
  status,
  settings_json
)
select
  ca.id,
  'works_portal',
  'LLLD Works Hub ポータル',
  'active',
  '{}'::jsonb
from public.company_accounts ca
on conflict (company_account_id, app_key) do nothing;

insert into public.app_data (
  company_account_id,
  app_instance_id,
  app_key,
  data_type,
  data_json
)
select
  ai.company_account_id,
  ai.id,
  'works_portal',
  'portal_state',
  jsonb_build_object(
    'portalVersion', 1,
    'memos', '[]'::jsonb,
    'todos', '[]'::jsonb,
    'boardPosts', '[]'::jsonb,
    'storageTree', '[]'::jsonb,
    'favorites', '[]'::jsonb,
    'recentItems', '[]'::jsonb,
    'portalSettings', '{}'::jsonb,
    'updatedAt', null
  )
from public.app_instances ai
where ai.app_key = 'works_portal'
on conflict (app_instance_id, data_type) do nothing;

-- RLS note:
-- app_instances and app_data are already separated by company_account_id in v0.10 policies.
-- v0.14.12 should verify that logged-in users can select/update only their own
-- works_portal portal_state row through existing app_data policies.
