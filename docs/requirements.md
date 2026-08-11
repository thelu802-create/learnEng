# Requirements & Roadmap — English Path (learnEng)

> Tài liệu này mô tả mục tiêu sản phẩm, phạm vi tính năng hiện tại, và lộ trình phát triển. Dùng làm kim chỉ nam khi quyết định thêm/bớt tính năng.
>
> Cập nhật gần nhất: 2026-08-11

## 1. Tầm nhìn sản phẩm

English Path là công cụ cho **giáo viên tiếng Anh THCS** (khối 6-9), giúp:

- soạn và tra cứu bài học, từ vựng theo khối nhanh chóng
- quản lý công việc giảng dạy (nhắc việc, lịch dạy bù)
- tạo hoạt động luyện tập / quiz cho học sinh
- cung cấp tiện ích Office cho giáo viên và bảo lưu source MOS để phát triển mobile sau này

Nguyên tắc: **nhẹ, chạy được trên free tier, ưu tiên giáo viên dùng cá nhân**, dữ liệu riêng tư theo từng tài khoản.

## 2. Người dùng & phạm vi

| Vai trò | Trạng thái | Mô tả |
|--------|-----------|-------|
| Khách (chưa đăng nhập) | Đã hỗ trợ | Xem nội dung tĩnh: bài học, từ vựng gốc, Office tips, playground |
| Giáo viên (đăng nhập GitHub) | Đã hỗ trợ | Mở khóa dữ liệu riêng: ghi chú, từ vựng tự thêm, planner, quiz, lịch dạy bù |
| Học sinh | Chưa có (roadmap) | Dự kiến: làm quiz, xem tiến độ được giao |

## 3. Yêu cầu chức năng theo module

Trạng thái: ✅ đã có · 🟡 có một phần · ⬜ dự kiến

### 3.1 Trang chủ (Home)
- ✅ Tổng quan planner tuần (số việc, việc đã xong)
- ✅ Lối tắt sang Lessons / Practice / Planner
- ⬜ Widget tổng hợp tiến độ học sinh

### 3.2 Bài học (Lessons)
- ✅ Xem nội dung bài học theo khối 6-9 (dữ liệu tĩnh)
- ✅ Tra từ vựng gốc của hệ thống
- ✅ Ghi chú giáo viên theo chủ điểm (Supabase, sau đăng nhập)
- ✅ Thêm / import / sửa / xóa từ vựng riêng của giáo viên
- ✅ Tự động điền IPA khi thêm/import (Edge Function + cache)
- ⬜ Xuất bộ từ vựng ra PDF/CSV

### 3.3 Luyện tập (Practice)
- ✅ Word practice từ dữ liệu khối
- ✅ Passage Quiz Generator từ đoạn văn tự nhập
- ✅ Lưu quiz, câu hỏi và lịch sử làm bài (attempts) lên Supabase
- 🟡 Chấm điểm / thống kê kết quả cơ bản
- ⬜ Giao quiz cho học sinh và thu kết quả

### 3.4 MOS Lessons — đã tách khỏi web
- ✅ Source bài giảng và dữ liệu được bảo lưu tại `mobile-source/mos/pages/mosLessons`
- ✅ Đã gỡ khỏi menu, router và build của web hiện tại
- ⬜ Chuyển đổi snapshot React/Ant Design thành module mobile khi kiến trúc mobile được xác định

### 3.5 MOS Exams — đã tách khỏi web
- ✅ Source đề thi thử và PDF được bảo lưu tại `mobile-source/mos/pages/mosExams`
- ✅ Đã gỡ khỏi menu, router và build của web hiện tại
- ⬜ Thiết kế trải nghiệm làm đề, chấm điểm và lưu lịch sử cho ứng dụng mobile tương lai

### 3.6 Vừa học vừa chơi (Playground)
- ✅ Trò chơi/hoạt động nhẹ dựng từ dữ liệu khối
- ⬜ Thêm dạng game mới, bảng xếp hạng lớp

### 3.7 Nhắc việc (Planner)
- ✅ CRUD công việc theo tuần, đánh dấu hoàn thành
- ✅ Nhóm today / upcoming / overdue / later, tự sắp xếp lại sau thao tác
- ✅ Mẫu lặp lại (repeat pattern)
- ✅ Xuất PDF
- ✅ Nhắc nhở qua browser notification khi giáo viên đăng nhập, cấp quyền và website đang mở
- ✅ Dùng chung một snapshot task cho Planner, Home và browser notification
- ⬜ Hỗ trợ push notification khi website đóng

### 3.8 Lịch dạy bù (Make-up Schedule)
- ✅ Tạo / cập nhật trạng thái / xóa lịch dạy bù (Supabase)
- ⬜ Đồng bộ với Planner và lịch tuần

### 3.9 Tiến độ (Progress)
- 🟡 Tổng quan tiến độ theo khối
- ⬜ Tiến độ theo lớp / theo học sinh

### 3.10 Mẹo Office (Office Tips)
- ✅ Danh sách mẹo Office (tĩnh) + ghi chú `localStorage`
- ⬜ Phân loại theo phần mềm (Word/Excel/PowerPoint), tìm kiếm

### 3.11 Hướng dẫn (Help)
- ✅ Hướng dẫn sử dụng trong app

## 4. Yêu cầu phi chức năng

- **Nền tảng:** React + Vite + TypeScript, Ant Design, React Router (`HashRouter` cho GitHub Pages).
- **Backend:** Supabase (Postgres + Auth GitHub + Edge Functions), free tier.
- **Bảo mật:** RLS bật cho mọi bảng dữ liệu người dùng; chỉ dùng `anon key` ở frontend; không đưa `service role key` vào client.
- **Ngôn ngữ:** i18n qua `src/i18n.ts` (mặc định tiếng Việt); giữ chuỗi trong file i18n, không hardcode.
- **Đa thiết bị / responsive:** hỗ trợ mobile (topbar/sidebar thu gọn).
- **Giao diện:** hỗ trợ light/dark và 3 cỡ chữ (sm/md/lg), lưu ở `localStorage`.
- **Hiệu năng:** trang được lazy-load; dữ liệu tĩnh tách khỏi dữ liệu người dùng.
- **Kiểm thử:** logic thuần có unit test (ví dụ `planner/utils.test.ts`, `practice/utils.test.ts`); mở rộng độ phủ khi thêm logic mới.
- **Khả năng suy biến:** khi thiếu env Supabase, app vẫn chạy phần nội dung tĩnh (`isSupabaseConfigured`).

## 5. Quy ước kiến trúc (bắt buộc khi phát triển tiếp)

1. Mỗi tính năng nằm trong 1 thư mục dưới `src/pages` theo mẫu ở [`src/pages/README.md`](../src/pages/README.md): `FeaturePage.tsx`, `components/`, `hooks/`, `utils.ts`, `types.ts`, và tùy chọn `data.ts` / `storage.ts` / `pdf.ts`.
2. Truy cập Supabase đi qua module dịch vụ theo domain trong `src/lib/supabase` (không rải query trong UI). `teacherData.ts` chỉ là barrel tương thích ngược.
3. Cần bảng/policy mới → thêm file `.sql` trong `supabase/`, bật RLS ngay từ đầu.
4. Chuỗi hiển thị đưa vào i18n; logic thuần tách khỏi JSX để test được.

## 6. Lộ trình phát triển

### Giai đoạn 1 — Nền tảng giáo viên (đã hoàn thành phần lớn)
- ✅ Đăng nhập GitHub + profiles
- ✅ Lessons + từ vựng giáo viên + IPA tự động
- ✅ Practice + lưu quiz/attempts
- ✅ Planner (repeat, PDF) + Make-up Schedule
- ✅ Office Tips / Playground
- ✅ Tách source MOS khỏi web và bảo lưu tại `mobile-source/mos`

### Giai đoạn 2 — Hoàn thiện & đồng bộ (kế tiếp)
- ⬜ Đồng bộ ghi chú Office từ `localStorage` lên Supabase
- ✅ Dùng một nguồn task chung cho Planner, Home và browser notification
- ⬜ Thống kê kết quả Practice (biểu đồ, tỷ lệ đúng theo chủ điểm)
- ⬜ Xuất dữ liệu (từ vựng, quiz) ra PDF/CSV
- ⬜ Hoàn thiện trang Progress theo khối/lớp
- ⬜ Tăng độ phủ unit test cho các module dịch vụ

### Giai đoạn 3 — Mở rộng cho học sinh
- ⬜ Vai trò học sinh, giao quiz và thu bài
- ⬜ Nâng browser reminder hiện tại thành push notification khi website đóng
- ⬜ Bảng xếp hạng / gamification cho Playground
- ⬜ Tách quyền giáo viên / học sinh, nâng cấp hạ tầng Supabase khi tải cao

## 7. Rủi ro & điểm cần theo dõi

- Ghi chú Office chỉ ở `localStorage` → mất khi đổi thiết bị/xóa cache (cần đồng bộ nếu hỗ trợ đa thiết bị).
- Source MOS đã tách khỏi web nhưng vẫn dùng React/Ant Design → cần chuyển đổi khi kiến trúc mobile được xác định.
- Browser notification hiện chỉ kiểm tra khi web đang mở; chưa có server push khi website đóng.
- Nội dung bài học là dữ liệu tĩnh trong code → cập nhật nội dung cần deploy lại.
- Phụ thuộc GitHub OAuth: học sinh THCS có thể không có tài khoản GitHub → cân nhắc thêm provider khác khi mở cho học sinh.
- Free tier Supabase có giới hạn → theo dõi dung lượng/row khi số user tăng.
