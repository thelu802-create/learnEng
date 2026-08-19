create extension if not exists "pgcrypto";

create table if not exists public.app_user_allowlist (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  role text not null default 'member' check (role in ('admin', 'member')),
  status text not null default 'active' check (status in ('active', 'disabled')),
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists app_user_allowlist_email_idx
on public.app_user_allowlist (lower(email));

create or replace function public.protect_last_active_app_admin()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  removes_active_admin boolean := false;
begin
  if old.role = 'admin' and old.status = 'active' then
    if tg_op = 'DELETE' then
      removes_active_admin := true;
    elsif tg_op = 'UPDATE' and (new.role <> 'admin' or new.status <> 'active') then
      removes_active_admin := true;
    end if;
  end if;

  if removes_active_admin and not exists (
    select 1
    from public.app_user_allowlist
    where id <> old.id
      and role = 'admin'
      and status = 'active'
  ) then
    raise exception 'Cannot remove or disable the last active administrator';
  end if;

  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$$;

drop trigger if exists protect_last_active_app_admin on public.app_user_allowlist;
create trigger protect_last_active_app_admin
before update or delete on public.app_user_allowlist
for each row execute function public.protect_last_active_app_admin();

revoke all on function public.protect_last_active_app_admin() from public;

create or replace function public.is_app_user_active()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.app_user_allowlist
    where lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
      and status = 'active'
  );
$$;

create or replace function public.is_app_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.app_user_allowlist
    where lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
      and role = 'admin'
      and status = 'active'
  );
$$;

revoke all on function public.is_app_user_active() from public;
revoke all on function public.is_app_admin() from public;
grant execute on function public.is_app_user_active() to authenticated;
grant execute on function public.is_app_admin() to authenticated;

alter table public.app_user_allowlist enable row level security;

drop policy if exists "app_user_allowlist_select" on public.app_user_allowlist;
create policy "app_user_allowlist_select"
on public.app_user_allowlist for select to authenticated
using (
  public.is_app_admin()
  or lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
);

drop policy if exists "app_user_allowlist_insert_admin" on public.app_user_allowlist;
create policy "app_user_allowlist_insert_admin"
on public.app_user_allowlist for insert to authenticated
with check (public.is_app_admin() and created_by = auth.uid());

drop policy if exists "app_user_allowlist_update_admin" on public.app_user_allowlist;
create policy "app_user_allowlist_update_admin"
on public.app_user_allowlist for update to authenticated
using (public.is_app_admin())
with check (public.is_app_admin());

drop policy if exists "app_user_allowlist_delete_admin" on public.app_user_allowlist;
create policy "app_user_allowlist_delete_admin"
on public.app_user_allowlist for delete to authenticated
using (public.is_app_admin());

create or replace function public.hook_allowlisted_signup(event jsonb)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  signup_email text;
begin
  signup_email := lower(coalesce(event -> 'user' ->> 'email', ''));

  if signup_email = '' or not exists (
    select 1
    from public.app_user_allowlist
    where lower(email) = signup_email
      and status = 'active'
  ) then
    return jsonb_build_object(
      'error', jsonb_build_object(
        'http_code', 403,
        'message', 'Tai khoan chua duoc quan tri vien cap quyen.'
      )
    );
  end if;

  return '{}'::jsonb;
end;
$$;

grant execute on function public.hook_allowlisted_signup(jsonb) to supabase_auth_admin;
revoke execute on function public.hook_allowlisted_signup(jsonb) from authenticated, anon, public;

-- Bootstrap once in Supabase SQL Editor before enabling the Auth Hook:
-- insert into public.app_user_allowlist (email, role, status)
-- values ('YOUR_GITHUB_EMAIL@example.com', 'admin', 'active');

-- Then open Authentication > Hooks > Before User Created and select:
-- public.hook_allowlisted_signup
