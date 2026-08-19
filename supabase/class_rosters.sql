-- Run supabase/user_access.sql first. These policies depend on is_app_user_active().

create table if not exists public.class_rosters (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  school_year text not null default '',
  source_file_name text not null default '',
  student_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.class_students (
  id uuid primary key default gen_random_uuid(),
  roster_id uuid not null references public.class_rosters (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  class_name text not null,
  student_number text not null default '',
  full_name text not null,
  gender text not null default '',
  date_of_birth text not null default '',
  phone_number text not null default '',
  is_ic3 boolean not null default false,
  is_tabn boolean not null default false,
  has_air_conditioner boolean not null default false,
  is_inclusive boolean not null default false,
  has_zalo boolean not null default false,
  note text not null default '',
  extra_data jsonb not null default '{}'::jsonb,
  source_sheet text not null default '',
  source_row integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.class_students
add column if not exists has_zalo boolean not null default false;

create index if not exists class_rosters_user_created_idx
on public.class_rosters (user_id, created_at desc);

create index if not exists class_students_roster_class_idx
on public.class_students (roster_id, class_name, source_row);

alter table public.class_rosters enable row level security;
alter table public.class_students enable row level security;

drop policy if exists "class_rosters_manage_own" on public.class_rosters;
create policy "class_rosters_manage_own"
on public.class_rosters for all to authenticated
using (public.is_app_user_active() and auth.uid() = user_id)
with check (public.is_app_user_active() and auth.uid() = user_id);

drop policy if exists "class_students_manage_own" on public.class_students;
create policy "class_students_manage_own"
on public.class_students for all to authenticated
using (
  public.is_app_user_active() and auth.uid() = user_id and exists (
    select 1 from public.class_rosters
    where class_rosters.id = class_students.roster_id
      and class_rosters.user_id = auth.uid()
  )
)
with check (
  public.is_app_user_active() and auth.uid() = user_id and exists (
    select 1 from public.class_rosters
    where class_rosters.id = class_students.roster_id
      and class_rosters.user_id = auth.uid()
  )
);
