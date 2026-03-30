create table if not exists public.vocabulary_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete cascade,
  grade_key text not null,
  topic_key text not null,
  topic_title text not null,
  word text not null,
  ipa text not null default '',
  meaning text not null,
  example text not null default '',
  source text not null default 'teacher' check (source in ('system', 'teacher')),
  normalized_word text generated always as (lower(word)) stored,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists vocabulary_entries_teacher_unique_idx
on public.vocabulary_entries (user_id, grade_key, topic_key, normalized_word)
where source = 'teacher' and user_id is not null;

create unique index if not exists vocabulary_entries_system_unique_idx
on public.vocabulary_entries (grade_key, topic_key, normalized_word)
where source = 'system';

alter table public.vocabulary_entries enable row level security;

drop policy if exists "vocabulary_entries_select_visible" on public.vocabulary_entries;
create policy "vocabulary_entries_select_visible"
on public.vocabulary_entries
for select
to authenticated
using (source = 'system' or auth.uid() = user_id);

drop policy if exists "vocabulary_entries_insert_own" on public.vocabulary_entries;
create policy "vocabulary_entries_insert_own"
on public.vocabulary_entries
for insert
to authenticated
with check (source = 'teacher' and auth.uid() = user_id);

drop policy if exists "vocabulary_entries_update_own" on public.vocabulary_entries;
create policy "vocabulary_entries_update_own"
on public.vocabulary_entries
for update
to authenticated
using (source = 'teacher' and auth.uid() = user_id)
with check (source = 'teacher' and auth.uid() = user_id);

drop policy if exists "vocabulary_entries_delete_own" on public.vocabulary_entries;
create policy "vocabulary_entries_delete_own"
on public.vocabulary_entries
for delete
to authenticated
using (source = 'teacher' and auth.uid() = user_id);
