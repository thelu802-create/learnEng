# Architecture Notes

This document gives a short overview of how the app is put together, so contributors can follow the main flow without having to reverse-engineer the whole codebase first.

## Frontend Shape

The app shell lives in [`src/App.tsx`](../src/App.tsx). It wires the providers, the layout (sidebar, topbar, grade bar), and a `HashRouter` whose routes are lazy-loaded feature pages. Feature pages are grouped by folder under [`src/pages`](../src/pages):

- [`src/pages/home/HomePage.tsx`](../src/pages/home/HomePage.tsx)
- [`src/pages/lessons/LessonsPage.tsx`](../src/pages/lessons/LessonsPage.tsx)
- [`src/pages/practice/PracticePage.tsx`](../src/pages/practice/PracticePage.tsx)
- [`src/pages/PlaygroundPage.tsx`](../src/pages/PlaygroundPage.tsx)
- [`src/pages/planner/PlannerPage.tsx`](../src/pages/planner/PlannerPage.tsx)
- [`src/pages/makeupSchedule/MakeupSchedulePage.tsx`](../src/pages/makeupSchedule/MakeupSchedulePage.tsx)
- [`src/pages/ProgressPage.tsx`](../src/pages/ProgressPage.tsx)
- [`src/pages/officeTips/OfficeTipsPage.tsx`](../src/pages/officeTips/OfficeTipsPage.tsx)
- [`src/pages/HelpPage.tsx`](../src/pages/HelpPage.tsx)

Each feature keeps its UI state close to the view (in `components/` and `hooks/`), while pure helpers live in `utils.ts` and shared persistence logic lives in service files under [`src/lib`](../src/lib). See [`src/pages/README.md`](../src/pages/README.md) for the per-feature file conventions.

The former MOS pages are preserved separately in [`mobile-source/mos`](../mobile-source/mos). Nothing under that directory is imported by the web app, included by `tsconfig.json`, or emitted by the current Vite build.

Routing note: navigation config (menu key, icon, path) is centralized in [`src/constants/navigation.ts`](../src/constants/navigation.ts). The grade bar is only shown for grade-scoped pages (home, lessons, practice, playground, progress).

## Authentication Flow

Teacher-only features use GitHub sign-in through Supabase Auth.

At a high level, the flow is:

1. the user clicks GitHub sign-in from the top bar or an inline locked section
2. Supabase Auth completes the OAuth flow (the provider preserves the in-app hash route across the redirect)
3. the app receives the authenticated user through the auth provider
4. a profile row is ensured on first sign-in via `ensureOwnProfile`
5. pages that depend on teacher data begin loading their private records

Important provider:

- [`src/components/providers/SupabaseAuthProvider.tsx`](../src/components/providers/SupabaseAuthProvider.tsx)

## Supabase Service Layer

The service layer is split by domain under [`src/lib/supabase`](../src/lib/supabase). [`teacherData.ts`](../src/lib/supabase/teacherData.ts) is a thin compatibility barrel that re-exports the domain modules for older page imports — new code should import the specific module directly:

- [`notesApi.ts`](../src/lib/supabase/notesApi.ts) — teacher notes
- [`vocabularyEntriesApi.ts`](../src/lib/supabase/vocabularyEntriesApi.ts) — teacher-added vocabulary
- [`plannerApi.ts`](../src/lib/supabase/plannerApi.ts) — planner tasks
- [`quizzesApi.ts`](../src/lib/supabase/quizzesApi.ts) — saved quizzes, quiz questions, quiz attempts
- [`makeupSchedulesApi.ts`](../src/lib/supabase/makeupSchedulesApi.ts) — make-up schedules
- [`profilesApi.ts`](../src/lib/supabase/profilesApi.ts) — user profiles

The Supabase client is created in [`client.ts`](../src/lib/supabase/client.ts); `isSupabaseConfigured()` lets the UI degrade gracefully when env vars are missing. Pages call these helpers instead of scattering Supabase queries throughout the UI.

## Lessons Flow

Main page: [`src/pages/lessons/LessonsPage.tsx`](../src/pages/lessons/LessonsPage.tsx)

Supporting files:

- [`src/pages/lessons/LessonsVocabularyTab.tsx`](../src/pages/lessons/LessonsVocabularyTab.tsx) and [`LessonsUnitsTab.tsx`](../src/pages/lessons/LessonsUnitsTab.tsx)
- [`src/pages/lessons/VocabularyAddModal.tsx`](../src/pages/lessons/VocabularyAddModal.tsx)
- [`src/pages/lessons/VocabularyImportModal.tsx`](../src/pages/lessons/VocabularyImportModal.tsx)
- [`src/pages/lessons/utils.ts`](../src/pages/lessons/utils.ts)

In practice, the flow looks like this:

1. base lesson content comes from the local grade data ([`src/data/grades`](../src/data/grades))
2. teacher notes and teacher-added vocabulary are loaded from Supabase after sign-in
3. local system words and teacher words are merged in memory for display
4. add and import actions normalize and deduplicate words before saving
5. only teacher-added words can be edited or deleted from the UI

## Planner Flow

Main page: [`src/pages/planner/PlannerPage.tsx`](../src/pages/planner/PlannerPage.tsx)

Helpers:

- [`src/pages/planner/utils.ts`](../src/pages/planner/utils.ts) (covered by [`utils.test.ts`](../src/pages/planner/utils.test.ts))
- [`src/pages/planner/pdf.ts`](../src/pages/planner/pdf.ts) — PDF export
- [`src/lib/supabase/plannerApi.ts`](../src/lib/supabase/plannerApi.ts)

In practice, the flow looks like this:

1. `PlannerNotificationsProvider` loads tasks from Supabase when Home or Planner needs them, and polls every five minutes only while browser reminders are enabled
2. tasks are mapped into UI-friendly objects and exposed through the shared planner notification context
3. helper functions compute bucket groups such as today, upcoming, overdue, and later
4. every create, edit, delete, or completion toggle updates and re-sorts the shared snapshot immediately; in-flight older refreshes cannot overwrite a newer local mutation
5. the home page derives its reminder summary from that snapshot through [`useHomePlannerSummary`](../src/pages/home/hooks/useHomePlannerSummary.ts)
6. [`usePlannerBrowserNotifications`](../src/pages/home/hooks/usePlannerBrowserNotifications.ts) checks the same snapshot and displays browser notifications after the teacher grants permission

The current reminder implementation is an in-app browser reminder, not server push: the website must be open, and [`notification-sw.js`](../public/notification-sw.js) is used to focus or open the Planner route when a notification is clicked.

## Practice Flow

Main page: [`src/pages/practice/PracticePage.tsx`](../src/pages/practice/PracticePage.tsx)

Word practice runs on local grade data and learning steps. The passage quiz generator builds questions from user-provided text; saved quizzes, their questions, and attempts are persisted via [`quizzesApi.ts`](../src/lib/supabase/quizzesApi.ts). Pure logic is covered by [`utils.test.ts`](../src/pages/practice/utils.test.ts).

## Archived MOS, Office Tips, and Make-up Schedule

- **MOS Lessons and MOS Exams** are disconnected from the web runtime. Their React/Ant Design source and MOS-only CSS are stored in [`mobile-source/mos`](../mobile-source/mos) as a reference snapshot for future mobile adaptation; this is not yet a standalone mobile app.
- **Office Tips** ([`src/pages/officeTips`](../src/pages/officeTips)) renders local content and keeps notes in browser `localStorage`.
- **Make-up Schedule** ([`src/pages/makeupSchedule`](../src/pages/makeupSchedule)) is Supabase-backed via [`makeupSchedulesApi.ts`](../src/lib/supabase/makeupSchedulesApi.ts).

## Vocabulary IPA Flow

- Client helper: [`src/lib/vocabularyApi.ts`](../src/lib/vocabularyApi.ts)
- Edge Function: [`supabase/functions/ipa-lookup/index.ts`](../supabase/functions/ipa-lookup/index.ts)
- Cache table: [`supabase/ipa_cache.sql`](../supabase/ipa_cache.sql)

In practice, the flow looks like this:

1. when a new word or import row has no IPA, the app may request auto-fill
2. the Edge Function looks up IPA and can reuse cached results
3. the result is returned to the client and saved together with the vocabulary entry

## Database Overview

Core SQL files under [`supabase`](../supabase):

- [`schema.sql`](../supabase/schema.sql), [`vocabulary_entries.sql`](../supabase/vocabulary_entries.sql), [`planner_tasks.sql`](../supabase/planner_tasks.sql), [`add_repeat_pattern.sql`](../supabase/add_repeat_pattern.sql), [`makeup_schedules.sql`](../supabase/makeup_schedules.sql), [`ipa_cache.sql`](../supabase/ipa_cache.sql), [`profiles_policy.sql`](../supabase/profiles_policy.sql), [`planner_tasks_with_profiles.sql`](../supabase/planner_tasks_with_profiles.sql)

Tables currently used by the UI:

- `profiles`
- `teacher_notes`
- `saved_quizzes`
- `saved_quiz_questions`
- `quiz_attempts`
- `vocabulary_entries`
- `planner_tasks`
- `makeup_schedules`
- `ipa_cache`

All user-owned tables should have Row Level Security enabled so each teacher only sees their own rows.

## Contribution Guideline

When adding a new teacher-facing feature, keep the split consistent:

- feature folder under `src/pages` with a `FeaturePage.tsx` for UI and view state
- `components/` for JSX pieces, `hooks/` for state/actions, `utils.ts` for UI-free logic
- a domain service module under [`src/lib/supabase`](../src/lib/supabase) for Supabase access (add it to the `teacherData.ts` barrel if older code needs it)
- a SQL file in [`supabase`](../supabase) if a new table or policy is needed, with RLS from the start
