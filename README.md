# LearnEng

Web học tiếng Anh cho khối 6-9, xây bằng React + Vite + Ant Design.

## Chạy local

```bash
npm install
npm run dev
```

Ứng dụng local sẽ mở qua Vite. Nếu cần phần API ghi file cũ thì server local chạy cùng trong `npm run dev`.

## Build production

```bash
npm run build
```

## Supabase scaffold

Repo đã được scaffold sẵn cho hướng `Vercel + Supabase`.

1. Tạo file `.env.local` từ `.env.example`
2. Điền `VITE_SUPABASE_URL` và `VITE_SUPABASE_ANON_KEY`
3. Chạy SQL trong `supabase/schema.sql`

Chi tiết xem tại:

`docs/backend-setup.md`

## Deploy GitHub Pages

Repo này đã được cấu hình để deploy tự động lên GitHub Pages qua GitHub Actions.

Sau khi push lên nhánh `main`, workflow sẽ build và deploy. Link dự kiến:

`https://thelu802-create.github.io/learnEng/`
