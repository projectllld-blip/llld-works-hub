-- LLLD Works Hub / Works Market v0.13
-- Create app_instances from Supabase Auth signup metadata.
-- Apply manually after v0.10 foundation and v0.11 signup trigger migrations.
-- This does not create app_data or any real business data.

create unique index if not exists app_instances_company_app_unique
on public.app_instances(company_account_id, app_key);

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

  if target_company_account_id is not null
    and jsonb_typeof(meta->'selected_app_keys') = 'array'
  then
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

  return new;
end;
$$;
