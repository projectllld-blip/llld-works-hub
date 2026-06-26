-- LLLD Works Hub / Works Market v0.15.5
-- Prevent duplicate company account rows by email.
-- Apply manually after checking existing company_accounts rows.
-- This migration does not delete or rewrite existing data.

do $$
begin
  if exists (
    select 1
    from (
      select lower(email) as normalized_email
      from public.company_accounts
      where email is not null
        and btrim(email) <> ''
      group by lower(email)
      having count(*) > 1
    ) duplicates
  ) then
    raise exception 'Duplicate company_accounts.email rows exist. Resolve duplicates before adding company_accounts_email_unique.';
  end if;
end;
$$;

create unique index if not exists company_accounts_email_unique
on public.company_accounts (lower(email))
where email is not null
  and btrim(email) <> '';
