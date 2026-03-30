create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role text not null default 'teacher' check (role in ('teacher', 'student', 'admin')),
  display_name text,
  created_at timestamptz not null default now()
);

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
alter table public.teacher_notes enable row level security;
alter table public.saved_quizzes enable row level security;
alter table public.saved_quiz_questions enable row level security;
alter table public.quiz_attempts enable row level security;

create policy "profiles_select_own"
on public.profiles for select
to authenticated
using (auth.uid() = id);

create policy "profiles_update_own"
on public.profiles for update
to authenticated
using (auth.uid() = id);

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
