create table if not exists public.makeup_schedules (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  class_name text not null,
  missed_date date not null,
  makeup_date date not null,
  makeup_time text not null default '',
  note text not null default '',
  status text not null default 'planned' check (status in ('planned', 'completed', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists makeup_schedules_user_makeup_idx
on public.makeup_schedules (user_id, makeup_date, makeup_time);

alter table public.makeup_schedules enable row level security;

drop policy if exists "makeup_schedules_select_own" on public.makeup_schedules;
create policy "makeup_schedules_select_own"
on public.makeup_schedules
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "makeup_schedules_insert_own" on public.makeup_schedules;
create policy "makeup_schedules_insert_own"
on public.makeup_schedules
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "makeup_schedules_update_own" on public.makeup_schedules;
create policy "makeup_schedules_update_own"
on public.makeup_schedules
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "makeup_schedules_delete_own" on public.makeup_schedules;
create policy "makeup_schedules_delete_own"
on public.makeup_schedules
for delete
to authenticated
using (auth.uid() = user_id);
