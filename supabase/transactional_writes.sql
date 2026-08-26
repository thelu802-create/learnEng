-- Atomic write RPCs for data that spans parent and child tables.
-- Run after schema.sql, user_access.sql, and class_rosters.sql.

begin;

create or replace function public.create_class_roster_with_students(
  p_name text,
  p_school_year text default '',
  p_source_file_name text default '',
  p_students jsonb default '[]'::jsonb
)
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  roster public.class_rosters%rowtype;
  student_total integer;
begin
  if current_user_id is null or not public.is_app_user_active() then
    raise exception 'Active application user required' using errcode = '42501';
  end if;

  if nullif(btrim(coalesce(p_name, '')), '') is null then
    raise exception 'Roster name is required' using errcode = '22023';
  end if;

  if coalesce(jsonb_typeof(p_students), 'null') <> 'array' then
    raise exception 'Students must be a JSON array' using errcode = '22023';
  end if;

  student_total := jsonb_array_length(p_students);
  if student_total = 0 then
    raise exception 'At least one student is required' using errcode = '22023';
  end if;
  if student_total > 5000 then
    raise exception 'A roster cannot contain more than 5000 students' using errcode = '22023';
  end if;

  if exists (
    select 1
    from jsonb_array_elements(p_students) as item(student)
    where jsonb_typeof(student) <> 'object'
      or nullif(btrim(coalesce(student ->> 'className', '')), '') is null
      or nullif(btrim(coalesce(student ->> 'fullName', '')), '') is null
  ) then
    raise exception 'Every student requires className and fullName' using errcode = '22023';
  end if;

  insert into public.class_rosters (
    user_id,
    name,
    school_year,
    source_file_name,
    student_count
  )
  values (
    current_user_id,
    btrim(p_name),
    btrim(coalesce(p_school_year, '')),
    btrim(coalesce(p_source_file_name, '')),
    student_total
  )
  returning * into roster;

  insert into public.class_students (
    roster_id,
    user_id,
    class_name,
    student_number,
    full_name,
    gender,
    date_of_birth,
    phone_number,
    is_ic3,
    is_tabn,
    has_air_conditioner,
    is_inclusive,
    has_zalo,
    note,
    extra_data,
    source_sheet,
    source_row
  )
  select
    roster.id,
    current_user_id,
    btrim(student ->> 'className'),
    btrim(coalesce(student ->> 'studentNumber', '')),
    btrim(student ->> 'fullName'),
    btrim(coalesce(student ->> 'gender', '')),
    btrim(coalesce(student ->> 'dateOfBirth', '')),
    btrim(coalesce(student ->> 'phoneNumber', '')),
    coalesce((student ->> 'isIc3')::boolean, false),
    coalesce((student ->> 'isTabn')::boolean, false),
    coalesce((student ->> 'hasAirConditioner')::boolean, false),
    coalesce((student ->> 'isInclusive')::boolean, false),
    false,
    btrim(coalesce(student ->> 'note', '')),
    case
      when jsonb_typeof(student -> 'extraData') = 'object' then student -> 'extraData'
      else '{}'::jsonb
    end,
    btrim(coalesce(student ->> 'sourceSheet', '')),
    coalesce((student ->> 'sourceRow')::integer, ordinal::integer)
  from jsonb_array_elements(p_students) with ordinality as item(student, ordinal);

  return to_jsonb(roster);
end;
$$;

revoke all on function public.create_class_roster_with_students(text, text, text, jsonb) from public;
revoke execute on function public.create_class_roster_with_students(text, text, text, jsonb) from anon;
grant execute on function public.create_class_roster_with_students(text, text, text, jsonb) to authenticated;

create or replace function public.create_saved_quiz_with_questions(
  p_title text,
  p_source_passage text,
  p_grade_key text default null,
  p_topic_key text default null,
  p_questions jsonb default '[]'::jsonb
)
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  quiz public.saved_quizzes%rowtype;
  question_total integer;
begin
  if current_user_id is null or not public.is_app_user_active() then
    raise exception 'Active application user required' using errcode = '42501';
  end if;

  if nullif(btrim(coalesce(p_title, '')), '') is null then
    raise exception 'Quiz title is required' using errcode = '22023';
  end if;
  if nullif(btrim(coalesce(p_source_passage, '')), '') is null then
    raise exception 'Quiz source passage is required' using errcode = '22023';
  end if;

  if coalesce(jsonb_typeof(p_questions), 'null') <> 'array' then
    raise exception 'Questions must be a JSON array' using errcode = '22023';
  end if;

  question_total := jsonb_array_length(p_questions);
  if question_total = 0 then
    raise exception 'At least one question is required' using errcode = '22023';
  end if;
  if question_total > 200 then
    raise exception 'A quiz cannot contain more than 200 questions' using errcode = '22023';
  end if;

  if exists (
    select 1
    from jsonb_array_elements(p_questions) as item(question)
    where jsonb_typeof(question) <> 'object'
      or nullif(btrim(coalesce(question ->> 'prompt', '')), '') is null
      or nullif(btrim(coalesce(question ->> 'answer', '')), '') is null
      or jsonb_typeof(question -> 'options') <> 'array'
  ) then
    raise exception 'Every question requires prompt, answer, and an options array' using errcode = '22023';
  end if;

  insert into public.saved_quizzes (
    user_id,
    title,
    source_passage,
    grade_key,
    topic_key
  )
  values (
    current_user_id,
    btrim(p_title),
    btrim(p_source_passage),
    nullif(btrim(coalesce(p_grade_key, '')), ''),
    nullif(btrim(coalesce(p_topic_key, '')), '')
  )
  returning * into quiz;

  insert into public.saved_quiz_questions (
    quiz_id,
    prompt,
    answer,
    options,
    original_sentence,
    question_order
  )
  select
    quiz.id,
    btrim(question ->> 'prompt'),
    btrim(question ->> 'answer'),
    question -> 'options',
    nullif(btrim(coalesce(question ->> 'originalSentence', '')), ''),
    ordinal::integer - 1
  from jsonb_array_elements(p_questions) with ordinality as item(question, ordinal);

  return to_jsonb(quiz);
end;
$$;

revoke all on function public.create_saved_quiz_with_questions(text, text, text, text, jsonb) from public;
revoke execute on function public.create_saved_quiz_with_questions(text, text, text, text, jsonb) from anon;
grant execute on function public.create_saved_quiz_with_questions(text, text, text, text, jsonb) to authenticated;

notify pgrst, 'reload schema';

commit;
