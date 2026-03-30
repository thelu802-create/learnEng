# Backend Setup

## Kien truc de xuat

- Frontend: Vite + React hien tai
- Hosting: Vercel Hobby
- Database + Auth + API: Supabase Free
- Logic server-side nang hon: Supabase Edge Functions khi can

## Tai sao hop voi app nay

- Free tier du dung cho MVP, demo, lop hoc nho
- Khong can tu dung server rieng
- Co san Postgres, Auth, Storage va REST API
- De mo rong sau nay khi muon luu teacher notes, saved quizzes va attempts

## Goi y pham vi du lieu

Giu trong code:
- noi dung chu diem
- bai hoc tinh theo khoi
- vocabulary goc neu ban muon van deploy nhu web tinh

Luu vao Supabase:
- teacher notes
- saved quizzes
- quiz questions
- quiz attempts
- profiles

## Buoc setup nhanh

1. Tao project Supabase
2. Vao SQL Editor va chay file `supabase/schema.sql`
3. Lay:
- Project URL
- anon public key
4. Tao file `.env.local` tu `.env.example`
5. Dien:

```bash
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

6. Cai dependency:

```bash
npm install
```

7. Build lai:

```bash
npm run build
```

## Free-tier roadmap hop ly

Giai doan 1:
- Vercel Hobby
- Supabase Free
- teacher notes
- saved quizzes

Giai doan 2:
- them auth
- them attempts cho hoc sinh
- them Edge Functions cho quiz/export

Giai doan 3:
- neu co nhieu user hon thi nang Supabase truoc

## Files da scaffold trong repo

- `src/lib/supabase/client.ts`
- `src/lib/supabase/teacherData.ts`
- `src/lib/supabase/types.ts`
- `.env.example`
- `supabase/schema.sql`

## Luu y bao mat

- `anon key` co the dung o frontend neu bat RLS dung cach
- khong dua service role key vao Vite frontend
- moi bang co du lieu rieng tu user nen bat RLS ngay tu dau
