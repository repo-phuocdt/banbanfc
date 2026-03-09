# Prompt: Implement Trang Quản Lý Thu Chi Đội Bóng

## Prompt (copy toàn bộ block dưới đây vào Claude Code)

```
Implement a football team fund management page ("Quản lý quỹ đội bóng") as part of a Next.js 14 app with TypeScript and Tailwind CSS. This is an internal tool for a Vietnamese amateur football team to track monthly member contributions and team expenses.

<context>
The team currently has ~32 members (20 active, 12 former). Each month, active members contribute a fixed amount (currently 200,000 VNĐ). The team captain records income (member contributions) and expenses (field rental, water, equipment, parties) in a ledger. All amounts are in Vietnamese Dong (VNĐ).

This is a CRUD application with 4 main data domains:
1. Members (master list with status)
2. Monthly contribution tracking (matrix: member × month)
3. Transaction ledger (income/expense log)
4. Dashboard summary
</context>

<tech_stack>
- Next.js 14 App Router with TypeScript
- Tailwind CSS for styling
- Use a simple JSON file or SQLite (via Prisma) as data store — no external DB required
- React Hook Form for forms
- date-fns for date formatting (Vietnamese locale)
- Currency format: VNĐ with dot separator (e.g., 200.000)
- UI language: Vietnamese
</tech_stack>

<data_models>
Define these TypeScript interfaces and database schema:

1. Member:
   - id: string (UUID)
   - name: string
   - status: "active" | "inactive" | "paused" (Đang hoạt động / Đã nghỉ / Tạm nghỉ)
   - joinedAt: Date
   - note: string (optional)

2. Contribution (tracks monthly payments per member):
   - id: string
   - memberId: string (FK → Member)
   - month: string (format: "YYYY-MM", e.g., "2025-08")
   - amount: number (in VNĐ, e.g., 200000)
   - paidAt: Date
   - note: string (optional)

3. Transaction (income/expense ledger):
   - id: string
   - date: Date
   - type: "income" | "expense"
   - amount: number
   - category: string (see categories below)
   - description: string
   - memberId: string | null (FK → Member, nullable — some transactions are not member-specific)
   - note: string (optional)

4. Categories (seed data):
   Income categories: ["Quỹ hàng tháng", "Góp thêm", "Tiền dư hoàn lại", "Khác"]
   Expense categories: ["Tiền sân", "Tiền nước", "Tiền sân + nước", "Tiền áo/đồ", "Tiền nhậu", "Khác"]
</data_models>

<pages_and_features>
Create these pages under /app/quan-ly-quy/:

## Page 1: Dashboard (/quan-ly-quy)
Summary cards at top:
- Tổng thu (total income) — green
- Tổng chi (total expenses) — red
- Còn lại (balance = income - expenses) — blue
- Thành viên đang hoạt động (active member count)

Below cards:
- Bar chart: Thu vs Chi by month (use recharts)
- Recent 10 transactions list with date, description, amount, type badge

## Page 2: Thành viên (/quan-ly-quy/thanh-vien)
Table with columns: STT, Họ tên, Trạng thái, Ngày tham gia, Tổng đã đóng, Ghi chú, Actions
- Status shown as colored badge: green = Đang hoạt động, red = Đã nghỉ, yellow = Tạm nghỉ
- Former members (Đã nghỉ) shown with muted text and strikethrough name
- Actions: Edit (modal), Change status (dropdown)
- Button "Thêm thành viên" opens a modal with form: name (required), status (dropdown), note
- Search/filter by name and status

## Page 3: Đóng tiền hàng tháng (/quan-ly-quy/dong-tien)
This is the CORE feature — a matrix view (spreadsheet-like):
- Rows = members (sorted: active first, then inactive with muted style)
- Columns = months (dynamically generated from data range)
- Each cell shows the amount paid, or empty if not yet paid
- Paid cells: green background with amount displayed
- Unpaid cells: clickable — opens a popover/modal to record payment (amount pre-filled with default 200,000)
- Right-side summary columns: "Tổng đã đóng" (sum), "Số tháng" (count of months paid)
- Top controls: filter by status, button to add new month column
- Sticky first 2 columns (STT, Họ tên) when scrolling horizontally

## Page 4: Thu chi (/quan-ly-quy/thu-chi)
Full transaction ledger:
- Table columns: STT, Ngày, Thu (VNĐ), Chi (VNĐ), Nội dung, Người, Số dư lũy kế
- Income cells: green text, green-tinted row
- Expense cells: red text, pink-tinted row
- Running balance column (Số dư lũy kế): auto-calculated
- Filters: date range picker, member dropdown, income/expense toggle, category
- Button "Thêm giao dịch" opens modal with:
  - Date picker (default: today)
  - Type: radio "Thu" / "Chi"
  - Amount: number input with VNĐ format
  - Category: dropdown (filtered by type — income shows income categories, expense shows expense categories)
  - Description: text input
  - Member: dropdown from member list (optional)
- Summary panel on right side (sticky): Tổng thu, Tổng chi, Còn lại, Số giao dịch
- Sort by date descending (newest first), but show running balance correctly
</pages_and_features>

<ui_requirements>
- Responsive: works on desktop and mobile
- Vietnamese UI text throughout — no English labels
- Number format: use dot as thousand separator (1.200.000), no decimal
- Date format: DD/MM/YYYY
- Use a consistent color scheme:
  - Primary: blue (#4472C4)
  - Income/positive: green (#006100 text, #E2EFDA bg)
  - Expense/negative: red (#9C0006 text, #FCE4EC bg)
  - Inactive/muted: gray (#999999)
- Empty states: show friendly message with icon when no data
- Loading states: skeleton loaders for tables
- Confirmation dialog before delete actions
- Toast notifications for CRUD success/error
- Tables should have alternating row colors for readability
</ui_requirements>

<layout>
Use a sidebar layout:
- Sidebar (collapsible on mobile):
  - Logo/title: "Quỹ Đội Bóng ⚽"
  - Nav items with icons: Tổng quan, Thành viên, Đóng tiền, Thu chi
  - Active nav item highlighted
- Main content area with breadcrumb
</layout>

<implementation_order>
Follow this sequence:
1. Set up data models and seed data with sample members and transactions
2. Create layout with sidebar navigation
3. Implement Members page (simplest CRUD)
4. Implement Transaction ledger page
5. Implement Monthly contribution matrix
6. Implement Dashboard with charts
7. Add filters, search, and polish

At each step, verify the page works before moving to the next.
</implementation_order>

<code_quality>
- Extract reusable components: DataTable, Modal, Badge, CurrencyDisplay, EmptyState
- Create utility functions: formatCurrency(amount) → "200.000", formatDate(date) → "09/03/2026"
- Use server actions or API routes for data mutations
- Handle loading, error, and empty states for every data-fetching component
- No inline styles — Tailwind only
</code_quality>
```

---

## Implementation Notes

### Techniques Used
- **Structured XML tags**: `<context>`, `<tech_stack>`, `<data_models>`, etc. — Claude processes XML sections with high fidelity, treating each as an independent instruction block
- **Graduated complexity in implementation order**: Step-by-step build sequence prevents Claude Code from trying to scaffold everything at once, reducing errors
- **Concrete data models with examples**: TypeScript interfaces with exact field names and sample values eliminate ambiguity
- **Visual specification via color codes**: Hex colors + semantic descriptions (green = income, red = expense) give Claude precise design targets
- **Domain-specific terminology in Vietnamese**: Labels defined upfront so Claude doesn't guess translations

### Model-Specific Optimizations (Claude via Claude Code)
- Direct, imperative instructions without hedging
- XML structure for clear section boundaries
- Important constraints placed at both start (tech stack) and end (code quality) — leveraging primacy/recency effect
- Implementation order acts as a built-in prompt chain — Claude Code will naturally checkpoint between steps

### Parameter Recommendations
- Claude Code default settings work well for this prompt
- If using API directly: temperature 0.2–0.3 for consistent code output
- Expect 4-6 iterations of Claude Code runs to complete all pages

---

## Testing & Evaluation

### Test Cases
1. **Thêm thành viên mới**: Tạo thành viên → verify hiển thị trong danh sách + dropdown ở các page khác
2. **Ghi nhận đóng tiền**: Click ô trống trong ma trận → nhập số tiền → verify ô chuyển xanh + tổng cập nhật
3. **Thêm giao dịch chi**: Thêm "Tiền sân + nước 450.000" → verify số dư lũy kế giảm đúng
4. **Filter thành viên đã nghỉ**: Bật filter "Đã nghỉ" → verify chỉ hiện thành viên inactive, text mờ + gạch ngang
5. **Dashboard accuracy**: Verify tổng thu/chi/còn lại khớp giữa Dashboard và page Thu chi

### Edge Cases
- Thành viên đóng nhiều hơn mức chuẩn (300.000 thay vì 200.000) trong 1 tháng
- Giao dịch không gắn với thành viên cụ thể (e.g., "AE bạn a Châu góp")
- Thành viên đóng gộp nhiều tháng trong 1 lần (e.g., "Quỹ tháng 12 + tháng 1")
- Ngày không nhớ chính xác → cho phép để trống hoặc chọn "Không nhớ"
- Số dư lũy kế khi sort theo ngày khác nhau

### Failure Modes
- Ma trận đóng tiền bị vỡ layout khi có nhiều tháng → cần horizontal scroll + sticky columns
- Format số VNĐ bị sai (dấu phẩy thay vì dấu chấm) → verify formatCurrency utility
- Thành viên trùng tên → cần unique constraint hoặc warning

---

## Usage Guidelines

### Khi nào dùng prompt này
- Khi bắt đầu implement tính năng quản lý quỹ đội bóng từ đầu
- Có thể chạy toàn bộ prompt 1 lần hoặc tách từng `<page>` section ra chạy riêng

### Cách customize
- **Thay đổi mức đóng**: Sửa số `200,000` trong prompt
- **Thêm tính năng**: Thêm page/feature mới vào section `<pages_and_features>`
- **Đổi data store**: Thay "SQLite via Prisma" bằng PostgreSQL, Supabase, etc.
- **Thêm auth**: Bổ sung section `<authentication>` nếu cần phân quyền (admin vs viewer)

### Integration
- Prompt được thiết kế cho Next.js 14 App Router — nếu dùng Pages Router cần điều chỉnh routing
- Có thể tích hợp thêm: export Excel (dùng SheetJS), import CSV, gửi nhắc nhở qua Zalo/Telegram
- Nếu muốn deploy: thêm section về database migration và environment variables
