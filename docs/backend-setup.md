# Backend Setup

## Kien truc de xuat

- Frontend: Vite + React hien tai
- Hosting: GitHub Pages (production) hoac Vercel Hobby
- Database + Auth + API: Supabase Free
- Logic server-side nang hon: Supabase Edge Functions khi can (vi du: tra IPA)

## Tai sao hop voi app nay

- Free tier du dung cho MVP, demo, lop hoc nho
- Khong can tu dung server rieng
- Co san Postgres, Auth (GitHub OAuth), Storage va REST API
- De mo rong sau nay cho teacher notes, saved quizzes, attempts, planner, makeup schedules

## Pham vi du lieu

Giu trong code (tinh, khong can DB):
- noi dung chu diem va bai hoc theo khoi (`src/data/grades`)
- vocabulary goc cua he thong
- noi dung office tips

Luu trong trinh duyet (localStorage):
- ghi chu office tips

Luu rieng ngoai web runtime:
- source MOS lessons va MOS exams nam trong `mobile-source/mos`
- web hien tai khong import, build hoac phat hanh cac module MOS
- source nay la snapshot de chuyen doi cho mobile sau nay, chua phai ung dung mobile doc lap

Luu vao Supabase (theo tung user, bat RLS):
- profiles
- teacher notes
- teacher vocabulary entries
- planner tasks
- saved quizzes + saved quiz questions
- quiz attempts
- makeup schedules
- ipa cache (dung chung cho Edge Function)

## Buoc setup nhanh

1. Tao project Supabase
2. Bat GitHub provider trong Authentication > Providers
3. Vao SQL Editor va chay `supabase/schema.sql` (profiles, teacher_notes, saved_quizzes, saved_quiz_questions, quiz_attempts, vocabulary_entries)
4. Chay them cac file tinh nang:
- `supabase/planner_tasks.sql`
- `supabase/add_repeat_pattern.sql`
- `supabase/vocabulary_entries.sql`
- `supabase/makeup_schedules.sql`
- `supabase/ipa_cache.sql`
- `supabase/profiles_policy.sql`
- `supabase/planner_tasks_with_profiles.sql`
5. (Tuy chon) Deploy Edge Function tra IPA:
- `supabase/functions/ipa-lookup/index.ts`
6. Lay tu Project Settings > API:
- Project URL
- anon public key
7. Tao file `.env.local` tu `.env.example`
8. Dien:

```bash
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

9. Cai dependency va build:

```bash
npm install
npm run build
```

## Free-tier roadmap hop ly

Giai doan 1 (da lam):
- Supabase Free + GitHub OAuth
- teacher notes, vocabulary, planner, saved quizzes, attempts, makeup schedules

Giai doan 2:
- them Edge Functions cho export / cham diem nang hon
- them dong bo ghi chu Office Tips len Supabase neu can da thiet bi
- chi thiet ke backend MOS khi kien truc ung dung mobile da duoc xac dinh

Giai doan 3:
- neu co nhieu user hon thi nang Supabase truoc, tach role giao vien / hoc sinh

## Files da scaffold trong repo

Service layer (tach theo domain, `teacherData.ts` la barrel tuong thich):
- `src/lib/supabase/client.ts`
- `src/lib/supabase/notesApi.ts`
- `src/lib/supabase/vocabularyEntriesApi.ts`
- `src/lib/supabase/plannerApi.ts`
- `src/lib/supabase/quizzesApi.ts`
- `src/lib/supabase/makeupSchedulesApi.ts`
- `src/lib/supabase/profilesApi.ts`
- `src/lib/supabase/teacherData.ts`
- `src/lib/supabase/types.ts`

Config va SQL:
- `.env.example`
- `supabase/schema.sql` va cac file `.sql` tinh nang o tren

## Luu y bao mat

- `anon key` co the dung o frontend neu bat RLS dung cach
- khong dua service role key vao Vite frontend
- moi bang co du lieu rieng tu user nen bat RLS ngay tu dau
- Edge Function nen giu key/secret trong Supabase secrets, khong hardcode
