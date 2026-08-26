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
- `supabase/user_access.sql` (danh sach email duoc phep dang nhap + role admin/member)
- `supabase/class_rosters.sql` (chay sau `user_access.sql`)
- `supabase/planner_tasks.sql`
- `supabase/add_repeat_pattern.sql`
- `supabase/vocabulary_entries.sql`
- `supabase/makeup_schedules.sql`
- `supabase/ipa_cache.sql`
- `supabase/profiles_policy.sql`
- `supabase/planner_tasks_with_profiles.sql`
5. Voi database da ton tai, chay `supabase/enforce_active_user_access.sql` sau cac file tren de dong bo RLS theo trang thai allowlist.
6. Chay `supabase/transactional_writes.sql` de tao RPC transaction cho roster + students va quiz + questions.
7. (Tuy chon) Deploy Edge Function tra IPA:
- `supabase/functions/ipa-lookup/index.ts`
8. Lay tu Project Settings > API:
- Project URL
- anon public key
9. Tao file `.env.local` tu `.env.example`
10. Dien:

```bash
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

11. Cai dependency va build:

```bash
npm install
npm run build
```

## Gioi han dang ky bang danh sach email

App dung GitHub OAuth, khong can gui email moi. Admin cap quyen truoc cho email GitHub; email khong co trong danh sach se bi Auth Hook tu choi khi tao tai khoan.

1. Chay `supabase/user_access.sql` trong SQL Editor.
2. Tao admin dau tien trong SQL Editor (email phai trung voi email GitHub):

```sql
insert into public.app_user_allowlist (email, role, status)
values ('admin@example.com', 'admin', 'active');
```

3. Trong Supabase Dashboard, mo `Authentication > Hooks > Before User Created`, chon Postgres function `public.hook_allowlisted_signup`, sau do bat hook.
4. Admin dang nhap bang GitHub. Menu `Quan ly nguoi dung` se xuat hien de them, khoa, doi vai tro hoac xoa user.

Luu y:

- Nen nhap email chu thuong. He thong tu chuan hoa email duoc them tu giao dien.
- Hook ngan tai khoan moi khong nam trong danh sach. Neu project da co user la truoc do, can xoa/ban cac tai khoan khong hop le trong `Authentication > Users`.
- Database khong cho xoa, khoa hoac ha quyen admin dang hoat dong cuoi cung.
- Sau khi sua role cua tai khoan dang dang nhap bang SQL, dang xuat/dang nhap lai hoac tai lai trang de giao dien cap nhat.

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
- moi policy du lieu ung dung phai kiem tra `public.is_app_user_active()`; policy doc allowlist cua chinh user la ngoai le de AuthGate hien thi trang thai bi khoa
- cac thao tac ghi cha-con phai di qua RPC trong `supabase/transactional_writes.sql`; RPC lay user tu `auth.uid()` va chay voi `security invoker`
- Edge Function nen giu key/secret trong Supabase secrets, khong hardcode
