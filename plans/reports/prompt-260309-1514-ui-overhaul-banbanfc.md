# UI Overhaul: Ban Ban FC — Fund Management App

## Project Context

**Tech Stack:** Next.js 14 App Router, React 18, TypeScript, Tailwind CSS v3, Supabase, Recharts, React Hook Form + Zod, date-fns (Vietnamese locale), lucide-react icons.

**Current State:** Working app "Quỹ Đội Bóng" with sidebar layout, dashboard, members, contributions matrix, transaction ledger. Basic styling with white bg sidebar, gray text. No logo image — uses ⚽ emoji. No react-select or datepicker libraries installed.

**Logo:** `docs/banbanfc-logo.jpg` — Shield badge style, red/black/gold color palette. Devil mascot holding beer & football. Text: "BAN BAN FC - SINCE 2025". Vintage/retro aesthetic.

## Requirements

### 1. Branding Update
- Replace all "Quỹ Đội Bóng" references with "Ban Ban FC" across the entire codebase (titles, metadata, sidebar header, breadcrumb, login page, etc.)
- Update `<Metadata>` in `app/layout.tsx`: title → "Ban Ban FC - Quản Lý Quỹ", description updated accordingly
- Display the logo image (`/docs/banbanfc-logo.jpg`) in the sidebar header — copy to `public/` first, use Next.js `<Image>` component with proper sizing (e.g., 40×40px rounded)
- The logo should also appear on the login page prominently (larger size, centered)

### 2. Visual Design — Professional & Cohesive
- **Color palette derived from logo:** Primary red (#C41E3A or similar), accent gold (#D4A843), dark backgrounds (#1a1a2e or #0f0f23), white/light gray text
- **Dark-themed sidebar** to match the logo's dark aesthetic — dark bg, lighter text, active items highlighted with primary red
- **Main content area:** Clean white/light background, good contrast, professional typography
- **Cards & panels:** Subtle shadows, rounded corners (rounded-xl), consistent spacing
- **Dashboard summary cards:** Add subtle colored left borders or icons matching their data type (income=green, expense=red, balance=blue, members=purple)
- **Tables:** Alternating row colors, hover states, proper cell padding
- **Forms & modals:** Clean styling, consistent button styles (primary red, secondary gray/outline)
- **Login page:** Centered card with logo, dark or gradient background matching brand

### 3. Component Replacements
- **Install and use `react-select`** for ALL `<select>` dropdowns across the app (member selects, status filters, category filters, type filters). Style react-select to match the new theme using custom `styles` or `classNames` prop with Tailwind.
- **Install and use `react-datepicker`** for ALL date inputs (transaction date, date range filters in transaction page). Style to match theme. Import its CSS and override with Tailwind-compatible styles.
- Create reusable wrapper components: `components/ui/select-field.tsx` and `components/ui/date-picker-field.tsx` that integrate with React Hook Form via `Controller`.

### 4. Responsive Design (CRITICAL)
- **Mobile-first approach** — design for 320px+ screens, then enhance for tablet/desktop
- **Sidebar:** Already has mobile drawer — ensure smooth animation, proper z-index layering
- **Content must NEVER overflow/break outside its container:**
  - Use `overflow-x-auto` on all tables and wide content
  - Use `break-words` / `overflow-wrap: break-word` on text that could be long
  - Use `min-w-0` on flex children to prevent flex blowout
  - Use `max-w-full` on images and media
  - Test at: 320px, 375px, 768px, 1024px, 1440px breakpoints
- **Contribution matrix:** Ensure horizontal scroll works cleanly on mobile with sticky first column
- **Transaction table:** Stack or scroll horizontally on small screens, don't let columns compress to unreadable widths
- **Member table:** Responsive — consider card layout on mobile instead of table
- **Dashboard cards:** 1 column on mobile, 2 on tablet, 4 on desktop (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`)
- **Forms/modals:** Full-width on mobile, max-width centered on desktop
- **Typography:** Use `text-sm` on mobile, scale up on larger screens where appropriate
- **Padding:** Reduce horizontal padding on mobile (`px-3` on mobile, `px-6 md:px-8` on desktop)

### 5. Files to Modify (in order)

1. `package.json` — add `react-select`, `@types/react-select`, `react-datepicker`, `@types/react-datepicker`
2. `public/banbanfc-logo.jpg` — copy logo from docs/
3. `app/globals.css` — update CSS variables, add datepicker overrides, add utility classes
4. `tailwind.config.ts` — extend theme colors (primary, accent, dark), add custom shadows
5. `app/layout.tsx` — update metadata, font if needed
6. `components/ui/select-field.tsx` — NEW: react-select wrapper with RHF integration
7. `components/ui/date-picker-field.tsx` — NEW: react-datepicker wrapper with RHF integration
8. `components/layout/sidebar.tsx` — dark theme, logo image, rename text
9. `components/layout/breadcrumb.tsx` — update if references old name
10. `app/login/page.tsx` — redesign with logo, brand colors
11. `app/quan-ly-quy/layout.tsx` — responsive padding adjustments
12. `app/quan-ly-quy/page.tsx` — dashboard responsive grid
13. `components/dashboard/summary-cards.tsx` — styled cards, responsive
14. `components/dashboard/monthly-chart.tsx` — responsive chart container
15. `components/dashboard/recent-transactions.tsx` — responsive table
16. `components/members/member-table.tsx` — responsive, use react-select for filters
17. `components/members/member-form-modal.tsx` — use react-select for status
18. `components/contributions/contribution-matrix.tsx` — responsive scroll
19. `components/contributions/payment-modal.tsx` — styled modal
20. `components/transactions/transaction-page.tsx` — use react-select & datepicker for filters
21. `components/transactions/transaction-form-modal.tsx` — use react-select & datepicker
22. `components/transactions/transaction-table.tsx` — responsive table
23. `components/transactions/summary-panel.tsx` — responsive panel
24. `components/ui/modal.tsx` — responsive modal sizing
25. Other UI components as needed

### 6. Constraints
- Keep all existing functionality intact — this is a UI-only update
- No database changes, no API changes, no auth changes
- Maintain all Vietnamese text/labels
- Keep file structure — don't reorganize directories
- Each component file must stay under 200 lines
- Use Tailwind CSS only — no inline styles
- Preserve existing React Hook Form + Zod validation logic, just swap the rendered inputs
- All new components must be TypeScript with proper types

---

## Implementation Notes

**Techniques Used:**
- **Structured decomposition** — chia nhỏ task theo thứ tự ưu tiên rõ ràng
- **Explicit file ordering** — liệt kê chính xác file cần sửa theo dependency order
- **Constraint anchoring** — đặt constraints cuối cùng để model không "sáng tạo" quá mức
- **Concrete examples** — cho sẵn Tailwind classes, breakpoints, sizing cụ thể thay vì mô tả chung chung

**Model Optimization (Claude):**
- Prompt dùng markdown headings cho Claude parse tốt
- Mỗi section có context đủ để implement independent
- Logo description included vì model cần hiểu palette để derive colors

**Parameter Recommendations:**
- Temperature: 0 (deterministic — đây là task implementation, không cần creativity)
- Max tokens: không giới hạn (task dài, nhiều file)

## Testing & Evaluation

| Test Case | Validation |
|---|---|
| Logo hiển thị đúng trong sidebar + login | Visual check, `<Image>` renders without error |
| "Ban Ban FC" thay thế hoàn toàn "Quỹ Đội Bóng" | `grep -r "Quỹ Đội Bóng"` returns 0 results |
| react-select hoạt động trong tất cả forms | Submit form, check giá trị selected đúng |
| react-datepicker hoạt động trong transaction form + filters | Chọn date, submit, verify date format |
| Mobile 320px — no content overflow | DevTools responsive mode, scroll horizontal check |
| Tablet 768px — 2-column dashboard | Visual verify grid layout |
| Desktop 1440px — full layout | Sidebar + content fill properly |

**Edge Cases:**
- Long member names overflow trên mobile
- Contribution matrix với 12+ tháng horizontal scroll
- react-select dropdown position khi modal ở bottom of viewport (cần `menuPortalTarget`)
- Datepicker calendar popup bị cắt trên mobile

## Usage Guidelines

**Khi nào dùng prompt này:**
- Paste trực tiếp vào Claude Code session để implement
- Có thể chia nhỏ — implement từng section (Branding → Components → Responsive)

**Customization:**
- Thay color codes nếu muốn palette khác
- Thêm/bớt breakpoints tùy target devices
- Bỏ section 3 nếu không muốn react-select/datepicker

**Lưu ý quan trọng:**
- Chạy `pnpm install` sau khi thêm dependencies
- Test responsive bằng Chrome DevTools device toolbar
- Kiểm tra `react-select` menuPortal cho modal contexts
