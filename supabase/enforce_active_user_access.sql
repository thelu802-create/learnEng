-- Rollout migration for an existing database.
-- Run after user_access.sql and after all application tables have been created.
-- Disabled or removed allowlist users keep enough access to read their own
-- allowlist status, but cannot read or mutate application data.

begin;

alter table public.profiles enable row level security;
alter table public.teacher_notes enable row level security;
alter table public.saved_quizzes enable row level security;
alter table public.saved_quiz_questions enable row level security;
alter table public.quiz_attempts enable row level security;
alter table public.planner_tasks enable row level security;
alter table public.vocabulary_entries enable row level security;
alter table public.makeup_schedules enable row level security;
alter table public.class_rosters enable row level security;
alter table public.class_students enable row level security;
alter table public.ipa_cache enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
on public.profiles for select to authenticated
using (public.is_app_user_active() and auth.uid() = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
on public.profiles for insert to authenticated
with check (public.is_app_user_active() and auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
on public.profiles for update to authenticated
using (public.is_app_user_active() and auth.uid() = id)
with check (public.is_app_user_active() and auth.uid() = id);

drop policy if exists "teacher_notes_manage_own" on public.teacher_notes;
create policy "teacher_notes_manage_own"
on public.teacher_notes for all to authenticated
using (public.is_app_user_active() and auth.uid() = user_id)
with check (public.is_app_user_active() and auth.uid() = user_id);

drop policy if exists "saved_quizzes_manage_own" on public.saved_quizzes;
create policy "saved_quizzes_manage_own"
on public.saved_quizzes for all to authenticated
using (public.is_app_user_active() and auth.uid() = user_id)
with check (public.is_app_user_active() and auth.uid() = user_id);

drop policy if exists "saved_quiz_questions_select_owner" on public.saved_quiz_questions;
create policy "saved_quiz_questions_select_owner"
on public.saved_quiz_questions for select to authenticated
using (
  public.is_app_user_active() and exists (
    select 1 from public.saved_quizzes
    where public.saved_quizzes.id = saved_quiz_questions.quiz_id
      and public.saved_quizzes.user_id = auth.uid()
  )
);

drop policy if exists "saved_quiz_questions_insert_owner" on public.saved_quiz_questions;
create policy "saved_quiz_questions_insert_owner"
on public.saved_quiz_questions for insert to authenticated
with check (
  public.is_app_user_active() and exists (
    select 1 from public.saved_quizzes
    where public.saved_quizzes.id = saved_quiz_questions.quiz_id
      and public.saved_quizzes.user_id = auth.uid()
  )
);

drop policy if exists "saved_quiz_questions_delete_owner" on public.saved_quiz_questions;
create policy "saved_quiz_questions_delete_owner"
on public.saved_quiz_questions for delete to authenticated
using (
  public.is_app_user_active() and exists (
    select 1 from public.saved_quizzes
    where public.saved_quizzes.id = saved_quiz_questions.quiz_id
      and public.saved_quizzes.user_id = auth.uid()
  )
);

drop policy if exists "quiz_attempts_manage_owner" on public.quiz_attempts;
create policy "quiz_attempts_manage_owner"
on public.quiz_attempts for all to authenticated
using (
  public.is_app_user_active() and exists (
    select 1 from public.saved_quizzes
    where public.saved_quizzes.id = quiz_attempts.quiz_id
      and public.saved_quizzes.user_id = auth.uid()
  )
)
with check (
  public.is_app_user_active() and exists (
    select 1 from public.saved_quizzes
    where public.saved_quizzes.id = quiz_attempts.quiz_id
      and public.saved_quizzes.user_id = auth.uid()
  )
);

drop policy if exists "planner_tasks_select_own" on public.planner_tasks;
create policy "planner_tasks_select_own"
on public.planner_tasks for select to authenticated
using (public.is_app_user_active() and auth.uid() = user_id);

drop policy if exists "planner_tasks_insert_own" on public.planner_tasks;
create policy "planner_tasks_insert_own"
on public.planner_tasks for insert to authenticated
with check (public.is_app_user_active() and auth.uid() = user_id);

drop policy if exists "planner_tasks_update_own" on public.planner_tasks;
create policy "planner_tasks_update_own"
on public.planner_tasks for update to authenticated
using (public.is_app_user_active() and auth.uid() = user_id)
with check (public.is_app_user_active() and auth.uid() = user_id);

drop policy if exists "planner_tasks_delete_own" on public.planner_tasks;
create policy "planner_tasks_delete_own"
on public.planner_tasks for delete to authenticated
using (public.is_app_user_active() and auth.uid() = user_id);

drop policy if exists "vocabulary_entries_select_visible" on public.vocabulary_entries;
create policy "vocabulary_entries_select_visible"
on public.vocabulary_entries for select to authenticated
using (public.is_app_user_active() and (source = 'system' or auth.uid() = user_id));

drop policy if exists "vocabulary_entries_insert_own" on public.vocabulary_entries;
create policy "vocabulary_entries_insert_own"
on public.vocabulary_entries for insert to authenticated
with check (public.is_app_user_active() and source = 'teacher' and auth.uid() = user_id);

drop policy if exists "vocabulary_entries_update_own" on public.vocabulary_entries;
create policy "vocabulary_entries_update_own"
on public.vocabulary_entries for update to authenticated
using (public.is_app_user_active() and source = 'teacher' and auth.uid() = user_id)
with check (public.is_app_user_active() and source = 'teacher' and auth.uid() = user_id);

drop policy if exists "vocabulary_entries_delete_own" on public.vocabulary_entries;
create policy "vocabulary_entries_delete_own"
on public.vocabulary_entries for delete to authenticated
using (public.is_app_user_active() and source = 'teacher' and auth.uid() = user_id);

drop policy if exists "makeup_schedules_select_own" on public.makeup_schedules;
create policy "makeup_schedules_select_own"
on public.makeup_schedules for select to authenticated
using (public.is_app_user_active() and auth.uid() = user_id);

drop policy if exists "makeup_schedules_insert_own" on public.makeup_schedules;
create policy "makeup_schedules_insert_own"
on public.makeup_schedules for insert to authenticated
with check (public.is_app_user_active() and auth.uid() = user_id);

drop policy if exists "makeup_schedules_update_own" on public.makeup_schedules;
create policy "makeup_schedules_update_own"
on public.makeup_schedules for update to authenticated
using (public.is_app_user_active() and auth.uid() = user_id)
with check (public.is_app_user_active() and auth.uid() = user_id);

drop policy if exists "makeup_schedules_delete_own" on public.makeup_schedules;
create policy "makeup_schedules_delete_own"
on public.makeup_schedules for delete to authenticated
using (public.is_app_user_active() and auth.uid() = user_id);

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

drop policy if exists "ipa_cache_read_authenticated" on public.ipa_cache;
create policy "ipa_cache_read_authenticated"
on public.ipa_cache for select to authenticated
using (public.is_app_user_active());

commit;
