-- LLLD Works Hub / Works Market v0.11
-- Create a company account when Supabase Auth creates a user.
-- Apply manually in Supabase SQL Editor after the v0.10 foundation migration.
-- Do not use service role keys in frontend code.

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

  return new;
end;
$$;

drop trigger if exists on_auth_user_created_company_account on auth.users;

create trigger on_auth_user_created_company_account
after insert on auth.users
for each row execute function public.handle_new_company_account();
