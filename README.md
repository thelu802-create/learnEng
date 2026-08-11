# English Path (learnEng)

English Path is a web app that supports lower secondary English teaching and review, plus teacher-productivity tools such as Planner, Office tips, and make-up scheduling. The project is built with React, Vite, Ant Design, React Router, and Supabase.

## What The App Covers

The app is organized as a sidebar of feature areas ([`src/constants/navigation.ts`](src/constants/navigation.ts)):

- **Trang chủ / Home** — dashboard with a weekly planner summary
- **Bài học / Lessons** — lesson overview and vocabulary lookup for grades 6-9, teacher notes by topic, and teacher-added vocabulary
- **Luyện tập / Practice** — word practice and passage quiz generation, saved quizzes, and quiz attempts
- **Vừa học vừa chơi / Playground** — lightweight learning games built from grade data
- **Nhắc việc / Planner** — weekly teaching tasks and reminders with PDF export
- **Lịch dạy bù / Make-up Schedule** — make-up class scheduling
- **Tiến độ / Progress** — progress overview by grade
- **Mẹo Office / Office Tips** — Office productivity tips with local notes
- **Hướng dẫn / Help** — in-app usage guide

Teacher-specific data (notes, vocabulary, planner tasks, quizzes, attempts, make-up schedules) is stored in Supabase and unlocked by GitHub sign-in. Office Tips keeps its notes in the browser via `localStorage`.

The former MOS Lessons and MOS Exams modules are no longer registered in the web menu or router. Their source snapshot is preserved under [`mobile-source/mos`](mobile-source/mos) for future mobile-specific development and is excluded from the current Vite/TypeScript build.

## Main Data Flow

- page components under [`src/pages`](src/pages) render the teaching UI and collect user actions
- shared helpers (`utils.ts`, `hooks/`) normalize input, sort data, and prepare payloads
- domain-specific Supabase service functions under [`src/lib/supabase`](src/lib/supabase) handle reads and writes
- Supabase stores teacher notes, vocabulary additions, planner tasks, saved quizzes, quiz attempts, make-up schedules, and profiles

Some features include one small extra step:

- vocabulary import can auto-fill IPA (via an Edge Function) before saving
- Planner, Home, and browser reminders share one client-side task snapshot; mutations update it immediately and periodic polling only runs while reminders are enabled
- signed-in teachers can enable Planner browser reminders; the current implementation checks while the website is open
- topic notes and teacher vocabulary are loaded only after GitHub sign-in succeeds
- a profile row is ensured automatically the first time a user signs in

## Project Structure

- [`src/pages`](src/pages): feature areas, each grouped in its own folder (see [`src/pages/README.md`](src/pages/README.md)) with `FeaturePage.tsx`, `components/`, `hooks/`, `utils.ts`, `types.ts`, and optional `data.ts` / `storage.ts` / `pdf.ts`
- [`src/components`](src/components): shared layout (`AppSidebar`, `AppTopbar`, `AppGradeBar`) and providers (`SupabaseAuthProvider`, `I18nProvider`)
- [`src/constants`](src/constants): navigation config
- [`src/data`](src/data): local grade content (grades 6-9) and learning steps
- [`src/lib/supabase`](src/lib/supabase): Supabase client plus per-domain service modules
- [`mobile-source/mos`](mobile-source/mos): disconnected MOS source snapshot reserved for future mobile work
- [`supabase`](supabase): SQL schema files and Edge Function source
- [`docs`](docs): setup, architecture, and requirements notes

### Supabase service modules

The service layer is split by domain. [`teacherData.ts`](src/lib/supabase/teacherData.ts) is a compatibility barrel that re-exports the modules below for older imports:

- [`notesApi.ts`](src/lib/supabase/notesApi.ts) — teacher notes
- [`vocabularyEntriesApi.ts`](src/lib/supabase/vocabularyEntriesApi.ts) — teacher-added vocabulary
- [`plannerApi.ts`](src/lib/supabase/plannerApi.ts) — planner tasks
- [`quizzesApi.ts`](src/lib/supabase/quizzesApi.ts) — saved quizzes, quiz questions, quiz attempts
- [`makeupSchedulesApi.ts`](src/lib/supabase/makeupSchedulesApi.ts) — make-up schedules
- [`profilesApi.ts`](src/lib/supabase/profilesApi.ts) — user profiles

## Supabase Setup

The app expects these environment variables (see [`.env.example`](.env.example)):

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Run these SQL files in the Supabase SQL Editor:

- [`supabase/schema.sql`](supabase/schema.sql) — core tables (profiles, teacher_notes, saved_quizzes, saved_quiz_questions, quiz_attempts, vocabulary_entries)
- [`supabase/planner_tasks.sql`](supabase/planner_tasks.sql)
- [`supabase/add_repeat_pattern.sql`](supabase/add_repeat_pattern.sql) — adds the planner repeat column
- [`supabase/vocabulary_entries.sql`](supabase/vocabulary_entries.sql)
- [`supabase/makeup_schedules.sql`](supabase/makeup_schedules.sql)
- [`supabase/ipa_cache.sql`](supabase/ipa_cache.sql)
- [`supabase/profiles_policy.sql`](supabase/profiles_policy.sql) and [`supabase/planner_tasks_with_profiles.sql`](supabase/planner_tasks_with_profiles.sql) — supporting policies/views

For auto IPA lookup on the deployed app, also deploy the Edge Function:

- [`supabase/functions/ipa-lookup/index.ts`](supabase/functions/ipa-lookup/index.ts)

For the full checklist and a broader overview, see:

- [`docs/backend-setup.md`](docs/backend-setup.md)
- [`docs/architecture.md`](docs/architecture.md)
- [`docs/requirements.md`](docs/requirements.md)

## Deploy Notes

For GitHub Pages, the build workflow reads these repository secrets:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

The app uses `HashRouter` so client-side routes survive a page refresh on GitHub Pages. The Pages site is expected at:

- `https://thelu802-create.github.io/learnEng/`
