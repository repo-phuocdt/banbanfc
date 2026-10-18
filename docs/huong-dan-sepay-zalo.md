# Hướng dẫn: tự ghi nhận chuyển khoản qua SePay + báo Zalo

Tài liệu dành cho admin/thủ quỹ khi đưa tính năng lên production. Code nằm ở `app/api/webhooks/sepay/`, `lib/bank/`, `lib/notify/`; schema trong `supabase/migrations/005_bank_auto_contributions.sql`.

## 1. Database
1. **Backup trước** (Supabase → Database → Backups, hoặc `pg_dump`).
2. Mở SQL editor, chạy toàn bộ `005_bank_auto_contributions.sql`. File chạy lại nhiều lần không lỗi.
   Tùy chọn: chạy tiếp `006_backfill_leave_months.sql` để đánh dấu mọi tháng chưa đóng đến hết T09/2026 là "Nghỉ" (dữ liệu cũ không còn bị tính nợ). Chạy lại không tạo trùng.
   Sau đó chạy `007_monthly_fees.sql`: tạo bảng mức quỹ theo tháng, tự điền 200.000đ từ tháng đóng đầu tiên. Đổi mức quỹ ở mục "Mức quỹ" trên trang Đóng tiền (admin).
3. Kiểm tra: đăng xuất rồi mở app, mục "Giao dịch ngân hàng" không được hiện; dữ liệu `member_bank_identities`/`bank_transactions` chỉ admin đọc được.

## 2. Biến môi trường (Vercel → Settings → Environment Variables)
Xem `.env.local.example`. Bắt buộc: `SUPABASE_SERVICE_ROLE_KEY`, `SEPAY_WEBHOOK_API_KEY`, `FUND_BANK_ACCOUNT`, `FUND_ACCOUNT_HOLDER_NAME`, `CRON_SECRET`. Tùy chọn: `ZALO_BOT_TOKEN`, `ZALO_CHAT_ID`, `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`.
- Preview và Production dùng **API key SePay khác nhau**.
- Không có Upstash thì mỗi lần SePay gửi lại một giao dịch lỗi sẽ có một cảnh báo (tối đa 7 lần/5 giờ).

## 3. SePay
1. my.sepay.vn → gói FREE → liên kết MB (số TK, CCCD, SĐT đăng ký MB, OTP).
2. Tạo webhook: URL `https://<domain>/api/webhooks/sepay`, sự kiện **Cả hai** (tiền vào + tiền ra), xác thực **API Key** = `SEPAY_WEBHOOK_API_KEY`.
3. Thử trước bằng Test mode (mô phỏng giao dịch) trỏ vào bản Preview.

## 4. Zalo Bot
1. Tạo bot bằng Zalo Bot Creator, lưu token vào `ZALO_BOT_TOKEN` (`.env.local` khi chạy local).
2. Mời bot vào nhóm đội (hoặc nhắn 1-1 với bot), @nhắc bot một lần, rồi chạy `npx tsx scripts/zalo-get-chat-id.ts` để lấy `chat_id` → `ZALO_CHAT_ID`.
3. Gửi thử: `npx tsx scripts/zalo-get-chat-id.ts --send "Test"` và **mở nhóm xem tận mắt** (API trả ok chưa chắc tin tới nhóm). Tính năng nhóm của Zalo Bot đang Beta; nếu không tới được thì dùng chat_id 1-1 của thủ quỹ.

## 5. Dữ liệu thành viên
Trang Thành viên → Sửa → nhập **Tên chuyển tiền** (vd `DINH TAN PHUOC`) và **Số tài khoản**, mỗi dòng một giá trị. Chưa nhập cũng được: giao dịch sẽ vào "Chờ xử lý", admin gán một lần là app nhớ tên cho lần sau.

## 6. Vận hành hằng ngày
- **Chờ xử lý** (trang Đóng tiền, chỉ admin thấy): gán thành viên (chia được cho nhiều người), ghi thu/chi khác, hoặc bỏ qua.
- **Đã ghi gần đây → Hủy ghi nhận**: gỡ mọi khoản đóng/thu chi do giao dịch tạo ra và đưa về hàng chờ. Khoản đóng từ ngân hàng không sửa/xóa trực tiếp trong bảng đóng tiền.
- **Tháng nghỉ**: bấm ô tháng chưa đóng → "Đánh dấu nghỉ". Tháng nghỉ không bị tính và được bỏ qua khi chia tiền.
- Quy tắc tự ghi: chỉ khoản **bằng đúng mức quỹ** của tháng đầu tiên cần đóng (tính từ tháng trước tháng chuyển, bỏ qua tháng nghỉ và các tháng trước ngày vào đội) mới được ghi tự động. Số tiền khác (vd tiền trận), khớp nhiều người hoặc có chữ "hoàn tiền/tra soát" luôn vào hàng chờ để admin chia hoặc ghi thu khác.

## 7. Tắt khẩn cấp
Tắt webhook trên SePay là dừng ghi tự động ngay; mọi thứ quay về nhập tay như cũ. Dữ liệu cũ không bị ảnh hưởng.

## Kiểm thử local
`npm test` (unit), sau đó chạy app và dùng `npx tsx scripts/simulate-sepay-webhook.ts --content "DINH TAN PHUOC chuyen tien" --amount 200000` (cần `SEPAY_WEBHOOK_API_KEY`, `FUND_BANK_ACCOUNT` trong `.env.local`). **Đừng** trỏ script vào database thật khi thử.
