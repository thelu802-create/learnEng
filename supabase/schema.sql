create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role text not null default 'teacher' check (role in ('teacher', 'student', 'admin')),
  display_name text,
  created_at timestamptz not null default now()
);

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
returns trigger language plpgsql security definer set search_path = ''
as $$
declare removes_active_admin boolean := false;
begin
  if old.role = 'admin' and old.status = 'active' then
    if tg_op = 'DELETE' then
      removes_active_admin := true;
    elsif tg_op = 'UPDATE' and (new.role <> 'admin' or new.status <> 'active') then
      removes_active_admin := true;
    end if;
  end if;

  if removes_active_admin and not exists (
    select 1 from public.app_user_allowlist
    where id <> old.id and role = 'admin' and status = 'active'
  ) then
    raise exception 'Cannot remove or disable the last active administrator';
  end if;

  if tg_op = 'DELETE' then return old; end if;
  return new;
end;
$$;

drop trigger if exists protect_last_active_app_admin on public.app_user_allowlist;
create trigger protect_last_active_app_admin
before update or delete on public.app_user_allowlist
for each row execute function public.protect_last_active_app_admin();

revoke all on function public.protect_last_active_app_admin() from public;

create or replace function public.is_app_user_active()
returns boolean language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.app_user_allowlist
    where lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
      and status = 'active'
  );
$$;

create or replace function public.is_app_admin()
returns boolean language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.app_user_allowlist
    where lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
      and role = 'admin' and status = 'active'
  );
$$;

revoke all on function public.is_app_user_active() from public;
revoke all on function public.is_app_admin() from public;
grant execute on function public.is_app_user_active() to authenticated;
grant execute on function public.is_app_admin() to authenticated;

create or replace function public.hook_allowlisted_signup(event jsonb)
returns jsonb language plpgsql security definer set search_path = ''
as $$
declare signup_email text;
begin
  signup_email := lower(coalesce(event -> 'user' ->> 'email', ''));
  if signup_email = '' or not exists (
    select 1 from public.app_user_allowlist
    where lower(email) = signup_email and status = 'active'
  ) then
    return jsonb_build_object('error', jsonb_build_object(
      'http_code', 403,
      'message', 'Tai khoan chua duoc quan tri vien cap quyen.'
    ));
  end if;
  return '{}'::jsonb;
end;
$$;

grant execute on function public.hook_allowlisted_signup(jsonb) to supabase_auth_admin;
revoke execute on function public.hook_allowlisted_signup(jsonb) from authenticated, anon, public;

create table if not exists public.teacher_notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  grade_key text not null,
  topic_key text not null,
  content text not null default '',
  updated_at timestamptz not null default now(),
  unique (user_id, grade_key, topic_key)
);

create table if not exists public.saved_quizzes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  source_passage text not null,
  grade_key text,
  topic_key text,
  created_at timestamptz not null default now()
);

create table if not exists public.saved_quiz_questions (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references public.saved_quizzes (id) on delete cascade,
  prompt text not null,
  answer text not null,
  options jsonb not null,
  original_sentence text,
  question_order integer not null default 0
);

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

create table if not exists public.quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references public.saved_quizzes (id) on delete cascade,
  student_name text,
  score integer not null default 0,
  total_questions integer not null default 0,
  answers jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.app_user_allowlist enable row level security;
alter table public.teacher_notes enable row level security;
alter table public.saved_quizzes enable row level security;
alter table public.saved_quiz_questions enable row level security;
alter table public.quiz_attempts enable row level security;
alter table public.class_rosters enable row level security;
alter table public.class_students enable row level security;

create policy "profiles_select_own"
on public.profiles for select
to authenticated
using (auth.uid() = id);

create policy "profiles_insert_own"
on public.profiles for insert
to authenticated
with check (auth.uid() = id);

create policy "profiles_update_own"
on public.profiles for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

create policy "app_user_allowlist_select"
on public.app_user_allowlist for select to authenticated
using (public.is_app_admin() or lower(email) = lower(coalesce(auth.jwt() ->> 'email', '')));

create policy "app_user_allowlist_insert_admin"
on public.app_user_allowlist for insert to authenticated
with check (public.is_app_admin() and created_by = auth.uid());

create policy "app_user_allowlist_update_admin"
on public.app_user_allowlist for update to authenticated
using (public.is_app_admin()) with check (public.is_app_admin());

create policy "app_user_allowlist_delete_admin"
on public.app_user_allowlist for delete to authenticated
using (public.is_app_admin());

create policy "teacher_notes_manage_own"
on public.teacher_notes
for all
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "saved_quizzes_manage_own"
on public.saved_quizzes
for all
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "saved_quiz_questions_select_owner"
on public.saved_quiz_questions
for select
to authenticated
using (
  exists (
    select 1
    from public.saved_quizzes
    where public.saved_quizzes.id = saved_quiz_questions.quiz_id
      and public.saved_quizzes.user_id = auth.uid()
  )
);

create policy "saved_quiz_questions_insert_owner"
on public.saved_quiz_questions
for insert
to authenticated
with check (
  exists (
    select 1
    from public.saved_quizzes
    where public.saved_quizzes.id = saved_quiz_questions.quiz_id
      and public.saved_quizzes.user_id = auth.uid()
  )
);

create policy "saved_quiz_questions_delete_owner"
on public.saved_quiz_questions
for delete
to authenticated
using (
  exists (
    select 1
    from public.saved_quizzes
    where public.saved_quizzes.id = saved_quiz_questions.quiz_id
      and public.saved_quizzes.user_id = auth.uid()
  )
);

create policy "quiz_attempts_manage_owner"
on public.quiz_attempts
for all
to authenticated
using (
  exists (
    select 1
    from public.saved_quizzes
    where public.saved_quizzes.id = quiz_attempts.quiz_id
      and public.saved_quizzes.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.saved_quizzes
    where public.saved_quizzes.id = quiz_attempts.quiz_id
      and public.saved_quizzes.user_id = auth.uid()
  )
);

create policy "class_rosters_manage_own"
on public.class_rosters for all to authenticated
using (public.is_app_user_active() and auth.uid() = user_id)
with check (public.is_app_user_active() and auth.uid() = user_id);

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
