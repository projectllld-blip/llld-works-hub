-- LLLD Works Hub / Works Market v0.16
-- Ensure Works Portal is a required foundation app for every company account.
-- Apply manually after reviewing v0.16 RLS verification docs.
-- Do not put service role keys, secret keys, or real business data in frontend files.

create unique index if not exists app_instances_company_app_unique
on public.app_instances(company_account_id, app_key);

create unique index if not exists app_data_instance_type_unique
on public.app_data(app_instance_id, data_type);

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
where not exists (
  select 1
  from public.app_instances ai
  where ai.company_account_id = ca.id
    and ai.app_key = 'works_portal'
);

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
  and not exists (
    select 1
    from public.app_data ad
    where ad.app_instance_id = ai.id
      and ad.data_type = 'portal_state'
  );

create or replace function public.handle_new_company_account()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  meta jsonb;
  raw_business_type text;
  safe_business_type text;
  target_company_account_id uuid;
begin
  meta := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  raw_business_type := coalesce(nullif(meta->>'business_type', ''), 'demo');

  safe_business_type := case
    when raw_business_type in ('school','store','restaurant','small_business','consulting','personal','demo')
      then raw_business_type
    else 'demo'
  end;

  insert into public.company_accounts (
    owner_user_id,
    email,
    company_name,
    contact_name,
    business_type,
    plan_status
  )
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(nullif(meta->>'company_name', ''), '未設定'),
    nullif(meta->>'contact_name', ''),
    safe_business_type,
    'demo'
  )
  on conflict (owner_user_id) do nothing;

  select id
    into target_company_account_id
    from public.company_accounts
    where owner_user_id = new.id
    limit 1;

  if target_company_account_id is not null then
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
    values (
      target_company_account_id,
      'works_portal',
      'LLLD Works Hub ポータル',
      'active',
      '{}'::jsonb
    )
    on conflict (company_account_id, app_key) do nothing;

    if jsonb_typeof(meta->'selected_app_keys') = 'array' then
      insert into public.app_instances (
        company_account_id,
        app_key,
        display_name,
        status,
        settings_json
      )
      select
        target_company_account_id,
        apps.app_key,
        apps.name,
        'active',
        '{}'::jsonb
      from jsonb_array_elements_text(meta->'selected_app_keys') as selected(app_key)
      join public.apps on apps.app_key = selected.app_key
      on conflict (company_account_id, app_key) do nothing;
    end if;
  end if;

  return new;
end;
$$;
