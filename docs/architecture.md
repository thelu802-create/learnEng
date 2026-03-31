# Architecture Notes

This document gives a short overview of how the app is put together, so contributors can follow the main flow without having to reverse-engineer the whole codebase first.

## Frontend Shape

The app uses React pages as the main entry points:

- [`src/pages/HomePage.tsx`](../src/pages/HomePage.tsx)
- [`src/pages/LessonsPage.tsx`](../src/pages/LessonsPage.tsx)
- [`src/pages/PracticePage.tsx`](../src/pages/PracticePage.tsx)
- [`src/pages/PlannerPage.tsx`](../src/pages/PlannerPage.tsx)
- [`src/pages/HelpPage.tsx`](../src/pages/HelpPage.tsx)

Each page keeps its UI state close to the view, while shared persistence logic lives in service files under [`src/lib`](../src/lib).

## Authentication Flow

Teacher-only features use GitHub sign-in through Supabase Auth.

At a high level, the flow is:

1. the user clicks GitHub sign-in from the top bar or an inline locked section
2. Supabase Auth completes the OAuth flow
3. the app receives the authenticated user through the auth provider
4. pages that depend on teacher data begin loading their private records

Important provider:

- [`src/components/providers/SupabaseAuthProvider.tsx`](../src/components/providers/SupabaseAuthProvider.tsx)

## Supabase Service Layer

The main service file is:

- [`src/lib/supabase/teacherData.ts`](../src/lib/supabase/teacherData.ts)

This file acts as the main bridge between page-level UI and Supabase tables. It handles:

- teacher notes
- saved quizzes
- quiz attempts
- teacher-added vocabulary
- planner tasks

Pages call these helpers instead of scattering Supabase queries throughout the UI.

## Lessons Flow

Main page:

- [`src/pages/LessonsPage.tsx`](../src/pages/LessonsPage.tsx)

Supporting files:

- [`src/pages/lessons/VocabularyAddModal.tsx`](../src/pages/lessons/VocabularyAddModal.tsx)
- [`src/pages/lessons/VocabularyImportModal.tsx`](../src/pages/lessons/VocabularyImportModal.tsx)
- [`src/pages/lessons/utils.ts`](../src/pages/lessons/utils.ts)

In practice, the flow looks like this:

1. base lesson content comes from the local grade data
2. teacher-added vocabulary is loaded from Supabase after sign-in
3. local system words and teacher words are merged in memory for display
4. add and import actions normalize and deduplicate words before saving
5. only teacher-added words can be edited or deleted from the UI

## Planner Flow

Main page:

- [`src/pages/PlannerPage.tsx`](../src/pages/PlannerPage.tsx)

Helpers:

- [`src/lib/plannerStorage.ts`](../src/lib/plannerStorage.ts)
- [`src/lib/supabase/teacherData.ts`](../src/lib/supabase/teacherData.ts)

In practice, the flow looks like this:

1. tasks are loaded from Supabase for the signed-in teacher
2. tasks are mapped into UI-friendly objects
3. helper functions compute bucket groups such as today, upcoming, overdue, and later
4. after every create, edit, delete, or completion toggle, the client re-sorts tasks to keep the UI stable
5. the home page reads the same task source to show reminder summaries

## Vocabulary IPA Flow

Client helper:

- [`src/lib/vocabularyApi.ts`](../src/lib/vocabularyApi.ts)

Edge Function:

- [`supabase/functions/ipa-lookup/index.ts`](../supabase/functions/ipa-lookup/index.ts)

Cache table:

- [`supabase/ipa_cache.sql`](../supabase/ipa_cache.sql)

In practice, the flow looks like this:

1. when a new word or import row has no IPA, the app may request auto-fill
2. the Edge Function looks up IPA and can reuse cached results
3. the result is returned to the client and saved together with the vocabulary entry

## Database Overview

Core SQL files:

- [`supabase/schema.sql`](../supabase/schema.sql)
- [`supabase/vocabulary_entries.sql`](../supabase/vocabulary_entries.sql)
- [`supabase/planner_tasks.sql`](../supabase/planner_tasks.sql)
- [`supabase/ipa_cache.sql`](../supabase/ipa_cache.sql)

These are the main tables currently used by the UI:

- `teacher_notes`
- `saved_quizzes`
- `saved_quiz_questions`
- `quiz_attempts`
- `vocabulary_entries`
- `planner_tasks`
- `ipa_cache`

## Contribution Guideline

When adding a new teacher-facing feature, it is best to keep the split consistent:

- page component for UI and view state
- helper or utility for normalization and local transformation
- service function for Supabase access
- SQL file in [`supabase`](../supabase) if a new table or policy is needed
