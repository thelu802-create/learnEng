create table if not exists public.planner_tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  note text not null default '',
  due_date date not null,
  due_time text not null default '',
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high')),
  repeat_weekly boolean not null default false,
  completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists planner_tasks_user_due_idx
on public.planner_tasks (user_id, due_date, due_time);

alter table public.planner_tasks enable row level security;

drop policy if exists "planner_tasks_select_own" on public.planner_tasks;
create policy "planner_tasks_select_own"
on public.planner_tasks
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "planner_tasks_insert_own" on public.planner_tasks;
create policy "planner_tasks_insert_own"
on public.planner_tasks
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "planner_tasks_update_own" on public.planner_tasks;
create policy "planner_tasks_update_own"
on public.planner_tasks
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "planner_tasks_delete_own" on public.planner_tasks;
create policy "planner_tasks_delete_own"
on public.planner_tasks
for delete
to authenticated
using (auth.uid() = user_id);
