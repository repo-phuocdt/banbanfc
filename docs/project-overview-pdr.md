# Project Overview & Product Development Requirements

**Project**: Quản Lý Quỹ Đội Bóng (Football Team Fund Management)
**Version**: 1.1.0
**Status**: Production-Ready
**Last Updated**: April 18, 2026

## Executive Summary

Quản Lý Quỹ Đội Bóng is a web-based internal tool for Vietnamese amateur football teams to track finances. It enables team captains to manage member contributions, record transactions (income/expenses), and visualize financial health through dashboards and reports.

**Key Stats**:
- 32 team members (~20 active)
- 200,000 VNĐ monthly contribution standard
- 4 main data domains: Members, Contributions, Transactions, Dashboard
- Admin-only access (Supabase auth)

---

## Problem Statement

**Context**: Amateur football teams operate on member contributions and sponsorships. Financial tracking is manual, error-prone, and lacks visibility.

**Pain Points**:
1. No centralized member contribution records
2. Expense ledger spread across multiple people/notebooks
3. Cannot quickly answer: "Who hasn't paid?" or "What's our current balance?"
4. No audit trail or historical data retention
5. Monthly reconciliation takes manual calculation

**Solution**: Unified digital platform with member management, transaction ledger, and real-time financial visibility.

---

## Functional Requirements

### F1: Authentication & Authorization
- **Description**: Admin-only access via Supabase email/password, public page viewing
- **Scope**: Login page, session management, middleware, admin mutations
- **AC1**: Pages are publicly viewable without authentication
- **AC2**: Middleware refreshes session, does NOT redirect to /login
- **AC3**: Server actions require `requireAdmin()` (checks authenticated AND is_admin claim)
- **AC4**: User can logout (session cleared, redirect to login)
- **AC5**: Admin verification uses custom `is_admin()` PL/pgSQL function on JWT metadata
- **AC6**: All mutations protected by admin-only RLS policies

### F2: Member Management
- **Description**: CRUD operations for team members
- **Scope**: Members page, form modal, status management
- **AC1**: Display all members (active, paused, inactive) in sortable table
- **AC2**: Create member: name (required), status (dropdown), optional note
- **AC3**: Edit member: update name, status, note
- **AC4**: Change member status: active → paused → inactive → (soft delete)
- **AC5**: Search/filter by name or status
- **AC6**: View total contributions per member
- **AC7**: Soft delete: inactive members exclude from dropdowns but visible in history
- **AC8**: Display status badges with color coding
- **AC9**: Empty state when no members exist
- **AC10**: Confirmation before status change to inactive

### F3: Contribution Tracking
- **Description**: Record monthly member payments in matrix view
- **Scope**: Contribution matrix page, payment modal
- **AC1**: Display members × months spreadsheet
- **AC2**: Rows = members (active first, then inactive with muted style)
- **AC3**: Columns = months (dynamically from data, YYYY-MM format)
- **AC4**: Sticky first 2 columns when scrolling horizontally
- **AC5**: Click unpaid cell opens modal to record payment
- **AC6**: Amount pre-filled with default 200,000 VNĐ
- **AC7**: Allow custom amount (e.g., 300,000 for extra contribution)
- **AC8**: Paid cells: green background, show amount
- **AC9**: Unpaid cells: light/empty, clickable
- **AC10**: Right panel: total contributed sum, month count
- **AC11**: Filter by member status
- **AC12**: Add new month column (current month or custom)
- **AC13**: Auto-create transaction when contribution logged
- **AC14**: Responsive on mobile with horizontal scroll

### F4: Transaction Ledger
- **Description**: Complete income/expense log with balance tracking
- **Scope**: Ledger page, form modal, filters, summary panel
- **AC1**: Display all transactions in table: STT, Date, Income, Expense, Description, Member, Running Balance
- **AC2**: Color code: green rows for income, red rows for expenses
- **AC3**: Sort by date descending (newest first)
- **AC4**: Calculate running balance correctly (cumulative sum respecting date order)
- **AC5**: Income cells show green text, expense cells show red text
- **AC6**: Create transaction modal with:
  - Date picker (default: today)
  - Type: radio income/expense
  - Amount: number input (VNĐ format)
  - Category: dropdown (filtered by type)
  - Description: text input
  - Member: optional dropdown
- **AC7**: 8 income categories: Quỹ hàng tháng, Tài trợ, Bán đồ cũ, Phạt, Khác
- **AC8**: 8 expense categories: Thuê sân, Nước uống, Trang phục, Bóng, Y tế, Giải đấu, Liên hoan, Khác
- **AC9**: Filters: date range, member, type (income/expense), category
- **AC10**: Summary panel (sticky): total income, total expense, balance, transaction count
- **AC11**: Empty state when no transactions
- **AC12**: Delete transaction with confirmation

### F5: Dashboard & Analytics
- **Description**: Summary cards and financial overview
- **Scope**: Dashboard page, summary cards, monthly chart, recent transactions
- **AC1**: Summary cards at top:
  - Tổng thu (total income) — green
  - Tổng chi (total expenses) — red
  - Còn lại (balance = income - expenses) — blue
  - Thành viên đang hoạt động (active count) — gray
- **AC2**: Monthly bar chart: income vs expense by month (recharts)
- **AC3**: Recent 10 transactions: date, description, amount, type badge
- **AC4**: All metrics calculated from transaction data
- **AC5**: Loading skeleton during data fetch
- **AC6**: Empty state if no data

### F6: Data Validation
- **Description**: Client and server-side form validation
- **Scope**: All forms (members, contributions, transactions)
- **AC1**: Member schema: name required (min 1 char), status enum, note optional
- **AC2**: Contribution schema: member_id UUID, month YYYY-MM format, amount positive integer, optional note
- **AC3**: Transaction schema: type enum, amount positive integer, category required, description optional, member_id optional UUID
- **AC4**: Error messages in Vietnamese
- **AC5**: Display validation errors on form submit
- **AC6**: Prevent submit if validation fails

### F7: User Interface
- **Description**: Responsive, Vietnamese-language UI
- **Scope**: All pages and components
- **AC1**: Responsive design: works on desktop, tablet, mobile
- **AC2**: All labels/buttons in Vietnamese
- **AC3**: Currency format: VNĐ with dot separator (e.g., 200.000)
- **AC4**: Date format: DD/MM/YYYY (Vietnamese locale)
- **AC5**: Custom Tailwind theme with semantic colors:
  - Primary: blue, Income: green, Expense: red, Dark: navy
  - Custom shadows: shadow-card, shadow-card-hover
- **AC6**: Sidebar with icon nav: Tổng quan, Thành viên, Đóng tiền, Thu chi, QR chuyển tiền
- **AC7**: Active nav item highlighted
- **AC8**: Breadcrumb navigation
- **AC9**: Skeleton loaders during data fetch
- **AC10**: Toast notifications for CRUD success/error

### F8: QR Code Management
- **Description**: Upload and manage bank transfer QR codes
- **Scope**: QR code page, upload modal, QR code gallery
- **AC1**: Display list of bank QR codes with details (bank name, account number, image)
- **AC2**: Upload QR image with bank details (name, account name, account number)
- **AC3**: Copy account number to clipboard
- **AC4**: Download QR image
- **AC5**: Toggle QR code active/inactive status
- **AC6**: Edit QR code details (bank info, description)
- **AC7**: Delete QR code with confirmation
- **AC8**: Reorder QR codes by display_order
- **AC9**: Store QR image as base64 in database with MIME type
- **AC10**: Display active QR codes prominently, inactive with muted style

---

## Non-Functional Requirements

### NFR1: Security
- **Requirement**: Supabase RLS policies enforce access control
- **AC1**: Public read on tables (if needed for UI)
- **AC2**: Authenticated users can write
- **AC3**: Service role used only for admin operations
- **AC4**: No sensitive data in browser logs
- **AC5**: Passwords never sent in plaintext (Supabase handles)

### NFR2: Performance
- **Requirement**: Responsive UI, fast data loading
- **AC1**: Dashboard loads in under 2 seconds
- **AC2**: Member table renders 50+ rows smoothly
- **AC3**: Contribution matrix scrolls smoothly with sticky columns
- **AC4**: Chart lazy-loaded (dynamic import)
- **AC5**: Parallel data fetches where possible

### NFR3: Availability
- **Requirement**: Continuous uptime for team
- **AC1**: Supabase uptime SLA 99.9%
- **AC2**: Graceful fallback if database unavailable
- **AC3**: Error messages guide user on retry

### NFR4: Scalability
- **Requirement**: Support 50+ members, 2+ years of data
- **AC1**: Database optimized with indexes on foreign keys
- **AC2**: No N+1 queries in list views
- **AC3**: Pagination optional (future enhancement)

### NFR5: Data Integrity
- **Requirement**: Accurate financial records
- **AC1**: Transactions editable with audit trail (created_at, updated_at)
- **AC2**: Running balance calculation deterministic
- **AC3**: Comprehensive audit trail on all tables
- **AC4**: Soft deletes preserve historical data

### NFR6: Maintainability
- **Requirement**: Clean, documented codebase
- **AC1**: TypeScript for type safety
- **AC2**: Zod validation schemas for consistency
- **AC3**: Reusable components (modal, badge, table)
- **AC4**: Server actions for business logic
- **AC5**: Clear file structure (lib/, components/, app/)

---

## Technical Specifications

### Stack
| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14 (App Router), React 18, TypeScript |
| Styling | Tailwind CSS v3 |
| Forms | React Hook Form + Zod |
| Database | Supabase (PostgreSQL) with RLS |
| Auth | Supabase Authentication |
| Charts | Recharts |
| Utilities | date-fns (Vietnamese locale) |
| Deployment | Vercel (recommended) |

### Database Schema
```
members
├── id (uuid, pk)
├── name (text, unique)
├── status (enum: active, inactive, paused, deleted)
├── joined_at (timestamp)
├── note (text, nullable)
├── created_at, updated_at (timestamp)

contributions
├── id (uuid, pk)
├── member_id (uuid, fk)
├── month (text, 'YYYY-MM')
├── amount (integer, VNĐ)
├── paid_at (timestamp, nullable)
├── created_at (timestamp)

transactions
├── id (uuid, pk)
├── date (timestamp, nullable)
├── type (enum: income, expense)
├── amount (integer, VNĐ)
├── category (text)
├── description (text)
├── member_id (uuid, nullable, fk)
├── contribution_id (uuid, nullable, fk)
├── note (text, nullable)
├── created_at, updated_at (timestamp)

qr_codes
├── id (uuid, pk)
├── title (text)
├── bank_name (text)
├── account_name (text)
├── account_number (text)
├── description (text, nullable)
├── image_data (bytea, base64)
├── image_mime (text)
├── display_order (integer)
├── is_active (boolean)
├── created_at, updated_at (timestamp)
```

### API Patterns
- **Server Components**: Page-level data fetching
- **Client Components**: Interactive widgets
- **Server Actions**: Data mutations with validation
- **Error Handling**: ActionResult<T> type for consistency
- **Auth Guard**: `requireAdmin()` on all mutations

### Configuration
```env
NEXT_PUBLIC_SUPABASE_URL=https://project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

---

## Acceptance Criteria Summary

### Phase 1: Core Functionality (Completed)
- [x] Members CRUD
- [x] Contribution matrix
- [x] Transaction ledger
- [x] Dashboard with charts
- [x] Authentication & authorization

### Phase 2: Polish (Completed)
- [x] Form validation
- [x] Error handling & toasts
- [x] Responsive design
- [x] Vietnamese localization
- [x] Soft deletes
- [x] Auto-create transactions

### Phase 3: QR Code Management (Completed)
- [x] Upload QR code images
- [x] Bank details management
- [x] Copy account number
- [x] Download QR images
- [x] Active/inactive toggle
- [x] Admin-only RLS policies
- [x] Custom Tailwind theme

### Phase 4: Future Enhancements
- [ ] CSV export/import
- [ ] Monthly reconciliation reports
- [ ] SMS/Zalo notifications
- [ ] Transaction editing UI
- [ ] Photo receipt uploads

---

## Architecture Overview

### Folder Structure
```
banbanfc/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Redirect
│   ├── login/             # Auth page
│   └── quan-ly-quy/       # Main app
│       ├── page.tsx       # Dashboard
│       ├── layout.tsx     # Sidebar layout
│       ├── thanh-vien/    # Members
│       ├── dong-tien/     # Contributions
│       ├── thu-chi/       # Transactions
│       └── qr-chuyen-tien/# QR codes (NEW)
├── components/
│   ├── ui/                # Primitives (badge, modal)
│   ├── layout/            # Sidebar, breadcrumb
│   ├── dashboard/         # Dashboard widgets
│   ├── members/           # Member components
│   ├── contributions/     # Contribution matrix
│   ├── transactions/      # Ledger components
│   └── qr-codes/          # QR code components (NEW)
├── lib/
│   ├── types/             # TypeScript interfaces
│   ├── auth/              # Auth utilities
│   ├── supabase/          # Supabase clients
│   ├── utils/             # Format, constants
│   └── validations/       # Zod schemas
├── docs/                  # Documentation
└── middleware.ts          # Auth middleware
```

### Data Flow
1. **User logs in** → Supabase auth session created
2. **Navigate to page** → Middleware checks auth, passes through
3. **Server component fetches data** → Supabase query executed
4. **Render page** → Client components hydrate
5. **User interacts** → Client action triggers server action
6. **Server action validates** → Zod schema check
7. **Mutation executed** → Database updated via Supabase
8. **Cache revalidated** → Related pages updated
9. **Toast shown** → Success/error feedback
10. **UI re-renders** → New data displayed

### Security Model
- **Auth**: Email/password via Supabase
- **Authorization**: requireAdmin() on mutations
- **RLS**: Row-Level Security on all tables
- **Data**: Encrypted at rest (Supabase default)

---

## Success Metrics

| Metric | Target | Status |
|--------|--------|--------|
| All members visible in list | 100% | Pass |
| Contribution recording | Accurate + instant | Pass |
| Balance accuracy | ±0 VNĐ | Pass |
| Dashboard load time | <2s | Pass |
| Mobile responsiveness | Works on all sizes | Pass |
| Form validation | All errors caught | Pass |
| Auth protection | No public access | Pass |
| Data persistence | All transactions logged | Pass |

---

## Known Limitations

1. **No pagination**: Small data set (32 members, ~100 transactions/month)
2. **No bulk operations**: Members/transactions added one at a time
3. **No export**: Manual CSV export from Supabase dashboard required
4. **No offline mode**: Requires internet connection
5. **No notifications**: No email/SMS reminders for unpaid contributions
6. **Single team**: No multi-team support yet

---

## Future Enhancements

### Short-term (1-3 months)
- CSV import for bulk member/transaction upload
- Monthly reconciliation reports
- Filters persistence (URL-based)
- UI for transaction editing

### Medium-term (3-6 months)
- SMS/Zalo notifications for contributions
- Photo receipt upload for expenses
- Recurring transaction templates
- Contribution approval workflow

### Long-term (6+ months)
- Mobile app (React Native)
- Multi-team support
- Advanced analytics (per-game costs, ROI)
- Integration with banking API for auto-import

---

## Deployment Strategy

### Prerequisites
- Supabase project created
- Database schema migrated
- Environment variables set
- Node 18+ installed

### Steps
1. Clone repository
2. Install dependencies: `npm install`
3. Configure `.env.local` with Supabase credentials
4. Run migrations (if needed)
5. Deploy to Vercel: `vercel`

### Monitoring
- Supabase dashboard: DB performance, auth logs
- Vercel dashboard: Deployment status, error logs
- Application logging: Toast notifications for user feedback

---

## Support & Maintenance

### Regular Tasks
- Weekly: Check error logs, respond to bugs
- Monthly: Backup database via Supabase
- Quarterly: Review performance metrics, plan enhancements

### Bug Triage
- P0 (Critical): Auth broken, data loss → immediate fix
- P1 (High): Feature not working, wrong calculations → within 24h
- P2 (Medium): UI issues, slow performance → within 1 week
- P3 (Low): Polish, documentation → backlog

### Code Review
- All changes reviewed before merge
- TypeScript strict mode enforced
- No console errors/warnings in production

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-03-09 | Initial release: members, contributions, ledger, dashboard |
| 1.1.0 | 2026-04-18 | QR code management, admin-only RLS, custom Tailwind theme, transaction editing |

---

## Glossary

- **Quỹ**: Fund/pool
- **Thành viên**: Member
- **Đóng tiền**: Contribution/payment
- **Thu chi**: Income/expense ledger
- **Tổng quan**: Overview/dashboard
- **Trạng thái**: Status
- **Giao dịch**: Transaction
- **VNĐ**: Vietnamese Dong (currency)

---

**Document Owner**: Development Team
**Last Reviewed**: April 18, 2026
**Next Review**: July 18, 2026
