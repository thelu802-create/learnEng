# English Path

English Path is a web app designed to support lower secondary English teaching and review. The project is built with React, Vite, Ant Design, and Supabase.

## What The App Covers

At the moment, the app focuses on these main areas:

- lesson overview and vocabulary lookup for grades 6-9
- teacher notes by topic
- word practice and passage quiz generation
- planner for weekly teaching tasks and reminders
- GitHub sign-in for teacher-specific data

## Main Data Flow

The app follows a fairly straightforward flow:

- page components render the teaching UI and collect user actions
- shared helpers normalize input, sort data, and prepare payloads
- Supabase service functions in [`src/lib/supabase/teacherData.ts`](src/lib/supabase/teacherData.ts) handle reads and writes
- Supabase stores teacher notes, vocabulary additions, planner tasks, saved quizzes, and quiz attempts

Some features include one small extra step:

- vocabulary import can auto-fill IPA before saving
- planner tasks are sorted again in the client after add, edit, delete, or complete actions
- topic notes and teacher vocabulary are loaded only after GitHub sign-in succeeds

## Project Structure

The main folders are organized like this:

- [`src/pages`](src/pages): top-level screens such as Home, Lessons, Practice, Planner, and Help
- [`src/components`](src/components): reusable layout and provider components
- [`src/lib/supabase`](src/lib/supabase): Supabase client setup, types, and service functions
- [`src/pages/lessons`](src/pages/lessons): modal components and import helpers for vocabulary tools
- [`supabase`](supabase): SQL schema files and Edge Function source
- [`docs`](docs): setup and architecture notes

## Supabase Setup

The app expects these environment variables:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

These SQL files are part of the current setup:

- [`supabase/schema.sql`](supabase/schema.sql)
- [`supabase/vocabulary_entries.sql`](supabase/vocabulary_entries.sql)
- [`supabase/planner_tasks.sql`](supabase/planner_tasks.sql)
- [`supabase/ipa_cache.sql`](supabase/ipa_cache.sql)

If you want auto IPA lookup on the deployed app, you should also deploy:

- [`supabase/functions/ipa-lookup/index.ts`](supabase/functions/ipa-lookup/index.ts)

For the full setup checklist and a broader overview, see:

- [`docs/backend-setup.md`](docs/backend-setup.md)
- [`docs/architecture.md`](docs/architecture.md)

## Deploy Notes

For GitHub Pages, the build workflow reads these repository secrets:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

The Pages site is expected at:

- `https://thelu802-create.github.io/learnEng/`
