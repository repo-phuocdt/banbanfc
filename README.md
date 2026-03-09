# Quản Lý Quỹ Đội Bóng ⚽

Ứng dụng quản lý tài chính cho đội bóng đá phong trào. Theo dõi đóng quỹ, thu chi, và tổng quan tài chính — tất cả trong một giao diện đơn giản, dễ sử dụng.

> **Ban Ban FC** — Được xây dựng bởi đội bóng, cho đội bóng.

## Screenshots

### Đăng nhập
Bảo mật bằng tài khoản admin — chỉ người được phân quyền mới có thể thao tác dữ liệu.

![Đăng nhập](/public/screenshots/01-login.png)

### Tổng quan (Dashboard)
Xem nhanh tình hình tài chính: tổng thu, tổng chi, số dư còn lại, biểu đồ thu chi theo tháng và các giao dịch gần đây.

![Dashboard](/public/screenshots/02-dashboard.png)

---

### Phân quyền: Admin vs Thành viên

Ứng dụng phân biệt rõ 2 chế độ xem:

| | Thành viên (chưa đăng nhập) | Admin (đã đăng nhập) |
|---|---|---|
| **Xem dữ liệu** | Xem được tất cả | Xem được tất cả |
| **Thêm/Sửa/Xóa** | Không có nút thao tác | Đầy đủ nút Thêm, Sửa, Xóa |
| **Đổi trạng thái** | Chỉ xem badge | Dropdown thay đổi trực tiếp |
| **Ghi nhận đóng tiền** | Chỉ xem bảng | Click ô trống để ghi nhận |
| **Sidebar** | Hiện "Đăng nhập" | Hiện "Đăng xuất" |

#### Thành viên — Xem danh sách (chỉ đọc)
Không có nút "Thêm", không có icon sửa/xóa, trạng thái hiển thị dạng badge.

![Thành viên - Public](/public/screenshots/03-thanh-vien.png)

#### Admin — Quản lý thành viên
Có nút "+ Thêm thành viên", dropdown đổi trạng thái trực tiếp, icon sửa/xóa mỗi dòng.

![Thành viên - Admin](/public/screenshots/07-admin-thanh-vien.png)

#### Admin — Thêm thành viên mới
Form modal nhập họ tên, chọn trạng thái và ghi chú.

![Thêm thành viên](/public/screenshots/08-admin-them-thanh-vien-modal.png)

---

#### Thành viên — Xem bảng đóng tiền (chỉ đọc)
Xem ai đã đóng tháng nào, nhưng không thao tác được.

![Đóng tiền - Public](/public/screenshots/04-dong-tien.png)

#### Admin — Bảng đóng tiền + Ghi nhận thanh toán
Admin có nút "+" thêm tháng mới. Click vào ô trống mở modal ghi nhận đóng tiền.

![Đóng tiền - Admin](/public/screenshots/09-admin-dong-tien.png)

#### Admin — Ghi nhận đóng tiền
Chọn tháng, số tiền (mặc định 200.000), ghi chú. Hệ thống tự tạo giao dịch thu tương ứng.

![Ghi nhận đóng tiền](/public/screenshots/10-admin-ghi-nhan-dong-tien-modal.png)

---

#### Thành viên — Xem sổ thu chi (chỉ đọc)
Xem toàn bộ giao dịch và số dư, nhưng không thêm/sửa/xóa được.

![Thu chi - Public](/public/screenshots/05-thu-chi.png)

#### Admin — Sổ thu chi + Thao tác
Admin có nút "+ Thêm giao dịch", icon sửa/xóa mỗi dòng.

![Thu chi - Admin](/public/screenshots/11-admin-thu-chi.png)

#### Admin — Thêm giao dịch
Form đầy đủ: ngày, loại (Thu/Chi), số tiền, danh mục, nội dung, thành viên liên quan.

![Thêm giao dịch](/public/screenshots/12-admin-them-giao-dich-modal.png)

---

### Giao diện Mobile
Responsive hoàn toàn — hoạt động mượt mà trên điện thoại.

![Mobile](/public/screenshots/06-mobile-dashboard.png)

## Tính năng chính

| Tính năng | Mô tả |
|-----------|-------|
| **Dashboard** | Tổng thu, tổng chi, số dư, biểu đồ theo tháng, giao dịch gần đây |
| **Thành viên** | CRUD, tìm kiếm, lọc trạng thái, xem tổng đã đóng |
| **Đóng tiền** | Ma trận thành viên × tháng, ghi nhận nhanh, tự tạo giao dịch |
| **Thu chi** | Sổ cái đầy đủ, số dư lũy kế, bộ lọc đa chiều, 16 danh mục |
| **Bảo mật** | Đăng nhập admin, RLS trên database, xác thực mọi thao tác ghi |
| **Responsive** | Hoạt động tốt trên desktop, tablet và mobile |

## Tech Stack

- **Framework**: Next.js 14 (App Router) + React 18 + TypeScript
- **Styling**: Tailwind CSS v3
- **Database**: Supabase (PostgreSQL + Row Level Security)
- **Auth**: Supabase Authentication
- **Forms**: React Hook Form + Zod validation
- **Charts**: Recharts
- **Date**: date-fns (Vietnamese locale)

## Cài đặt

### Yêu cầu
- Node.js 18+
- Supabase project (free tier đủ dùng)

### Bước 1: Clone & cài dependencies
```bash
git clone <repo-url>
cd banbanfc
npm install
```

### Bước 2: Cấu hình môi trường
```bash
cp .env.local.example .env.local
```
Điền thông tin Supabase:
- `NEXT_PUBLIC_SUPABASE_URL` — URL project Supabase
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Anon key
- `SUPABASE_SERVICE_ROLE_KEY` — Service role key

### Bước 3: Tạo database
Chạy SQL schema trong Supabase SQL Editor:
```sql
-- File: /lib/supabase/schema.sql
```

### Bước 4: Chạy
```bash
npm run dev
```
Mở http://localhost:3000 và đăng nhập.

### Deploy
```bash
npm run build && npm start
```

## Kiến trúc

```
Người dùng → Next.js (Server Components + Server Actions)
                ↓
           Supabase Auth (xác thực)
                ↓
           PostgreSQL + RLS (dữ liệu)
```

- **Server Components** lấy dữ liệu, **Client Components** xử lý tương tác
- **Server Actions** với `requireAdmin()` bảo vệ mọi thao tác ghi
- **Zod** validate dữ liệu cả client và server
- Khi ghi nhận đóng quỹ → tự động tạo giao dịch tương ứng

## Database

| Bảng | Mô tả |
|------|-------|
| `members` | Thành viên (tên, trạng thái, ngày tham gia) |
| `contributions` | Đóng quỹ hàng tháng (thành viên, tháng, số tiền) |
| `transactions` | Thu chi (ngày, loại, số tiền, danh mục, mô tả) |

## Roadmap

- [ ] Export Excel/CSV
- [ ] Bulk import thành viên
- [ ] Thông báo qua Zalo/SMS
- [ ] Báo cáo đối soát hàng tháng
- [ ] Ảnh chụp hóa đơn
- [ ] Quy trình duyệt chi

## License

Internal use only — Ban Ban FC.

---

**Cập nhật**: Tháng 3, 2026 | **Tài liệu chi tiết**: xem thư mục `/docs`
