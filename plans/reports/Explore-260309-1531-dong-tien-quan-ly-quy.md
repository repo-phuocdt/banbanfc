# Explore Report: Quản Lý Quỹ (Fund Management) & Đóng Tiền (Payment Tracking)

**Date:** March 9, 2026
**Scope:** Complete exploration of "quan-ly-quy" and "dong-tien" features
**Status:** Complete

---

## Overview

The **Quản Lý Quỹ Đội Bóng** (Football Team Fund Management) app is a Next.js 14 + React 18 + TypeScript application built with Supabase backend. The "đóng tiền" (payment tracking) feature is the core contribution matrix that displays a spreadsheet-like view of members × months for recording monthly fund contributions.

**Key Stats:**
- ~23 React components
- ~8 TypeScript type/validation files
- ~10 server action files (CRUD operations)
- ~350 lines of application code (excluding node_modules)
- 3 main database tables: Members, Contributions, Transactions

---

## 1. Route & Page Files

### Main Page: `/quan-ly-quy/dong-tien` (Payment Tracking)

**File:** `/Users/er_macbook_306/Workspaces/banbanfc/app/quan-ly-quy/dong-tien/page.tsx` (40 LOC)

- Server component using Next.js Suspense
- Fetches members and contributions in parallel
- Passes data to `ContributionMatrix` client component
- Shows loading skeleton during data fetch
- Title: "Đóng tiền" (Pay Fund)
- Subtitle: "Bảng đóng quỹ hàng tháng" (Monthly fund payment sheet)

**Data Flow:**
```
page.tsx (Server)
  ├── getContributions() → fetch all contributions
  ├── getActiveMembers() → fetch non-deleted members
  └── Render → <ContributionMatrix />
```

### Server Actions File

**File:** `/Users/er_macbook_306/Workspaces/banbanfc/app/quan-ly-quy/dong-tien/actions.ts` (115 LOC)

**Functions:**

1. **`getContributions()`** — Query all contributions
   - Returns: `Contribution[]`
   - Ordered by month

2. **`getActiveMembers()`** — Query non-deleted members
   - Returns: `Member[]`
   - Filters: `neq('status', 'deleted')`
   - Ordered by name (Vietnamese locale)

3. **`createContribution(formData)`** — Record new payment (Mutation)
   - Guard: `await requireAdmin()` (admin-only)
   - Validates: month (YYYY-MM), amount > 0, not more than 2 months in future
   - Creates contribution record
   - **Auto-creates linked transaction** (type: 'income', category: 'Quỹ hàng tháng')
   - Returns: `ActionResult` (success or error message)
   - Revalidates: `/dong-tien`, `/thu-chi`, `/quan-ly-quy` (dashboard)

4. **`updateContribution(id, formData)`** — Modify existing payment
   - Guard: `await requireAdmin()`
   - Updates: amount, note
   - Also updates linked transaction amount
   - Returns: `ActionResult`

5. **`deleteContribution(id)`** — Remove payment record
   - Guard: `await requireAdmin()`
   - Deletes linked transaction first (FK constraint)
   - Deletes contribution
   - Returns: `ActionResult`

**Security:** All mutations require admin authentication via `requireAdmin()` guard.

---

## 2. Components

### ContributionMatrix Component

**File:** `/Users/er_macbook_306/Workspaces/banbanfc/components/contributions/contribution-matrix.tsx` (170 LOC)

**Purpose:** Spreadsheet-like table showing members × months

**Props:**
```typescript
{
  contributions: Contribution[]
  members: Member[]
  isAuthenticated?: boolean  // Enable click-to-edit
}
```

**Key Features:**

1. **Status Filter** (Client-side)
   - Options: Tất cả (All), Đang hoạt động (Active), Đã nghỉ (Inactive), Tạm nghỉ (Paused)
   - Updates display without server call

2. **Data Structure**
   - Builds `Map<memberId, Map<month, Contribution>>` for O(1) lookups
   - Derives month range from contribution data (earliest to latest month)
   - Sorts members: Active → Paused → Inactive (within each, alphabetically)

3. **Table Layout**
   - **Sticky Columns** (stay visible during horizontal scroll):
     - Column 1: STT (row number)
     - Column 2: Họ tên (name, min-width 140px)
   - **Month Columns**: Dynamic, one per month in data range
     - Formatted as "T8/2025" (T + month number / year)
     - Min-width 90px
   - **Summary Columns**:
     - Tổng (Total sum of all contributions for member)
     - Tháng (Count of months paid)

4. **Cell Styling**
   - **Paid cell** (green): `bg-income-bg text-income-text font-medium`
     - Shows formatted currency
     - Hover effect: `hover:bg-emerald-200` (if authenticated)
   - **Unpaid cell** (gray): `bg-gray-50 text-gray-300`
     - Shows "—" (em dash)
     - Hover: `hover:bg-gray-100` (if authenticated)

5. **Interactivity**
   - Click any cell (if authenticated) → opens PaymentModal
   - Modal state: `selectedMember`, `selectedMonth`, `selectedContribution`

6. **Inactive Members**
   - Shown with opacity 0.5 and strikethrough name
   - Can still record payments for them

### PaymentModal Component

**File:** `/Users/er_macbook_306/Workspaces/banbanfc/components/contributions/payment-modal.tsx` (162 LOC)

**Purpose:** Add/edit/delete contribution payments

**Props:**
```typescript
{
  open: boolean
  onClose: () => void
  member: Member | null
  month: string                    // 'YYYY-MM'
  contribution: Contribution | null  // null = create mode, non-null = edit mode
}
```

**Form Fields:**
1. **Tháng** (Month)
   - Disabled input (read-only, set by parent)
   - Format: YYYY-MM

2. **Số tiền** (Amount)
   - Number input
   - Default: 200,000 VNĐ (from `DEFAULT_CONTRIBUTION`)
   - Validates: must be positive integer

3. **Ghi chú** (Note)
   - Optional textarea (2 rows)

**Modes:**

- **Create Mode** (`contribution === null`)
  - Title: "Ghi nhận đóng tiền — {member.name}"
  - Button: "Lưu" (Save)
  - No delete button

- **Edit Mode** (`contribution !== null`)
  - Title: "Sửa đóng tiền — {member.name}"
  - Button: "Lưu" (Save)
  - Left side: Delete button (danger styling, red border)
  - Delete trigger: ConfirmDialog with warning

**Delete Confirmation:**
- Message: "Bạn có chắc muốn xóa khoản đóng này? Giao dịch thu liên kết cũng sẽ bị xóa."
- Translation: "Are you sure? The linked income transaction will also be deleted."

**Flow:**
1. User clicks cell in matrix
2. Modal opens with pre-filled amount (200k if new)
3. User edits and clicks Lưu
4. Calls `createContribution()` or `updateContribution()`
5. On success: toast notification, modal closes, matrix re-renders
6. On error: toast error message shown

**Error Handling:**
- Duplicate payment (same member, same month): "Thành viên đã đóng tháng này rồi"
- Invalid month: "Tháng không hợp lệ (quá xa trong tương lai)"
- Network errors: Generic "Đã có lỗi xảy ra"

---

## 3. Type Definitions

**File:** `/Users/er_macbook_306/Workspaces/banbanfc/lib/types/database.ts`

```typescript
interface Member {
  id: string                              // UUID
  name: string                            // Unique
  status: 'active' | 'inactive' | 'paused' | 'deleted'
  joined_at: string                       // ISO timestamp
  note: string | null
  created_at: string
  updated_at: string
}

interface Contribution {
  id: string                              // UUID
  member_id: string                       // FK → members.id
  month: string                           // 'YYYY-MM' format
  amount: number                          // Integer (VNĐ)
  paid_at: string                         // ISO timestamp
  note: string | null
  created_at: string
}

interface Transaction {
  id: string
  date: string | null                     // ISO timestamp
  type: 'income' | 'expense'
  amount: number
  category: string
  description: string
  member_id: string | null
  contribution_id: string | null          // FK → contributions.id
  note: string | null
  created_at: string
}
```

**Related Type:**
```typescript
type ActionResult<T = void> =
  | { success: true; data?: T }
  | { success: false; error: string }
```

---

## 4. Validation Schemas

**File:** `/Users/er_macbook_306/Workspaces/banbanfc/lib/validations/schemas.ts`

```typescript
const contributionSchema = z.object({
  member_id: z.string().uuid('ID thành viên không hợp lệ'),
  month: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, 'Tháng phải có dạng YYYY-MM'),
  amount: z.number().int().positive('Số tiền phải lớn hơn 0'),
  paid_at: z.string().optional(),
  note: z.string().optional().nullable(),
})
```

**Validation Rules:**
1. `member_id`: must be valid UUID
2. `month`: must match YYYY-MM (MM = 01-12)
3. `amount`: must be positive integer
4. Server-side: month cannot exceed current month + 2 (future-proofing)

---

## 5. Database Schema

**File:** `/Users/er_macbook_306/Workspaces/banbanfc/supabase/migrations/001_create_tables.sql`

### Contributions Table
```sql
CREATE TABLE contributions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE RESTRICT,
  month TEXT NOT NULL,                   -- 'YYYY-MM'
  amount INTEGER NOT NULL DEFAULT 200000,
  paid_at TIMESTAMPTZ DEFAULT now(),
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(member_id, month)              -- Prevent duplicate payments
);
```

**Key Constraint:** `UNIQUE(member_id, month)` prevents recording the same month twice for a member.

### Members Table (Related)
```sql
CREATE TABLE members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','inactive','paused','deleted')),
  joined_at TIMESTAMPTZ DEFAULT now(),
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### Transactions Table (Related)
```sql
CREATE TABLE transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date TIMESTAMPTZ DEFAULT now(),
  type TEXT NOT NULL CHECK (type IN ('income','expense')),
  amount INTEGER NOT NULL CHECK (amount > 0),
  category TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  member_id UUID REFERENCES members(id) ON DELETE SET NULL,
  contribution_id UUID REFERENCES contributions(id) ON DELETE SET NULL,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

**Auto-Link:** When a contribution is created, system automatically creates a transaction record with:
- `type: 'income'`
- `category: 'Quỹ hàng tháng'`
- `amount: <contribution.amount>`
- `contribution_id: <new contribution id>`

---

## 6. Database Security (RLS)

**File:** `/Users/er_macbook_306/Workspaces/banbanfc/supabase/migrations/002_rls_policies.sql`

**Policies for Contributions Table:**
- **SELECT:** `Public read contributions` (all users can read)
- **INSERT:** `Auth insert contributions` (authenticated users only)
- **UPDATE:** `Auth update contributions` (authenticated users only)
- **DELETE:** `Auth delete contributions` (authenticated users only)

**Additional Guard:** Application enforces `requireAdmin()` on all mutations.

---

## 7. Utility Functions

**File:** `/Users/er_macbook_306/Workspaces/banbanfc/lib/utils/format.ts`

```typescript
formatCurrency(amount: number): string
  // 200000 → "200.000" (Vietnamese locale)

formatMonth(month: string): string
  // '2025-08' → 'T8/2025' (for display in matrix headers)

formatMonthShort(month: string): string
  // '2025-08' → 'T8/25' (shorter variant)

formatDate(date: string | Date): string
  // ISO date → 'dd/MM/yyyy' in Vietnamese locale
```

**File:** `/Users/er_macbook_306/Workspaces/banbanfc/lib/utils/constants.ts`

```typescript
DEFAULT_CONTRIBUTION = 200000        // Default payment amount (VNĐ)

INCOME_CATEGORIES = [
  'Quỹ hàng tháng',                 // Monthly fund
  'Góp thêm',                        // Additional contribution
  'Tiền dư hoàn lại',                // Refund surplus
  'Khác',                            // Other
]

EXPENSE_CATEGORIES = [
  'Tiền sân',                        // Field rental
  'Tiền nước',                       // Water expense
  'Tiền sân + nước',                 // Field + water
  'Tiền áo/đồ',                      // Uniform/gear
  'Tiền nhậu',                       // Celebration (food/drink)
  'Khác',                            // Other
]

STATUS_LABELS = {
  active: 'Đang hoạt động',
  inactive: 'Đã nghỉ',
  paused: 'Tạm nghỉ',
}

STATUS_COLORS = {
  active: 'bg-emerald-50 text-emerald-700',
  inactive: 'bg-rose-50 text-rose-700',
  paused: 'bg-amber-50 text-amber-700',
}
```

---

## 8. Related Components & Features

### Parent Layout: `/quan-ly-quy/layout.tsx`
- Wraps all fund management routes
- Provides: Sidebar navigation, Breadcrumb, ToastProvider
- Auth check: Fetches current user from Supabase

### Related Routes (Same App Section):
1. **Dashboard** (`/quan-ly-quy`)
   - Summary cards: total income, expenses, balance, member count
   - Monthly chart (income vs expense)
   - Recent transactions list

2. **Members** (`/quan-ly-quy/thanh-vien`)
   - Member CRUD
   - Status management (active, paused, inactive, deleted)
   - Search/filter by name

3. **Transactions** (`/quan-ly-quy/thu-chi`)
   - Income/expense ledger
   - Filters: date range, member, type, category
   - Running balance calculation

### UI Components Used
- **Modal** (`components/ui/modal.tsx`) — Payment modal wrapper
- **ConfirmDialog** (`components/ui/confirm-dialog.tsx`) — Delete confirmation
- **StandaloneSelect** (`components/ui/select-field.tsx`) — Status filter dropdown
- **Toast** (`components/ui/toast.tsx`) — Success/error notifications
- **Skeleton** (`components/ui/skeleton.tsx`) — Loading state

---

## 9. Data Flow & Architecture

```
User Interface Layer
├── Page: /quan-ly-quy/dong-tien
│   └── Server Component (page.tsx)
│       ├── Fetch: getContributions()
│       ├── Fetch: getActiveMembers()
│       └── Render: <ContributionMatrix />
│
Client Components Layer
├── <ContributionMatrix />
│   ├── Builds: Map<memberId, Map<month, Contribution>>
│   ├── State: statusFilter, modal state
│   ├── Renders: Table with sticky columns
│   └── On click: Open PaymentModal
│
└── <PaymentModal />
    ├── State: form values, loading, delete confirmation
    ├── On submit:
    │   ├── Validate: month (YYYY-MM), amount > 0
    │   ├── Call: createContribution() or updateContribution()
    │   └── Server creates/updates:
    │       ├── Contribution record
    │       └── Auto-create Transaction (linked by contribution_id)
    └── On delete:
        ├── Confirm deletion
        └── deleteContribution() → also deletes linked Transaction
```

---

## 10. Key Features Breakdown

### Monthly Contribution Matrix
- **Grid:** Members (rows) × Months (columns)
- **Paid cells:** Green background, show amount
- **Unpaid cells:** Gray background, show "—"
- **Sticky columns:** Member name stays visible during horizontal scroll
- **Summary:** Total amount paid, count of months paid

### Quick Payment Recording
- Click any unpaid cell → modal opens
- Default amount: 200,000 VNĐ (Vietnamese standard contribution)
- Editable: amount, optional note
- One-click save → auto-creates income transaction

### Audit Trail
- Every contribution auto-creates a transaction entry
- Transaction links back to contribution via `contribution_id` FK
- Deleting contribution also deletes linked transaction
- Dashboard shows recent transactions (last 10)

### Member Status Integration
- Active members shown first (normal styling)
- Paused members grouped in middle
- Inactive members shown with muted/strikethrough styling
- Deleted members excluded from view
- Status filter allows quick view by status

---

## 11. File Inventory

### Page & Route Files
- `/app/quan-ly-quy/dong-tien/page.tsx` (40 LOC)
- `/app/quan-ly-quy/dong-tien/actions.ts` (115 LOC)

### Component Files
- `/components/contributions/contribution-matrix.tsx` (170 LOC)
- `/components/contributions/payment-modal.tsx` (162 LOC)

### Type & Validation Files
- `/lib/types/database.ts` (41 LOC) — Contribution interface
- `/lib/types/action-result.ts` (4 LOC) — ActionResult type
- `/lib/validations/schemas.ts` (30 LOC) — contributionSchema

### Utility Files
- `/lib/utils/format.ts` (24 LOC) — formatMonth(), formatCurrency()
- `/lib/utils/constants.ts` (30 LOC) — DEFAULT_CONTRIBUTION, categories

### Database Files
- `/supabase/migrations/001_create_tables.sql` — Contributions table schema
- `/supabase/migrations/002_rls_policies.sql` — RLS policies

### Documentation
- `/plans/260309-1111-quan-ly-quy-doi-bong/phase-06-contribution-matrix.md` — Phase spec

---

## 12. Performance & Security Notes

### Performance
- **Data fetching:** Parallel load (members + contributions)
- **Matrix rendering:** O(m × n) cells where m = members, n = months
  - Typical size: 20 members × 12 months = 240 cells (negligible)
- **Sticky columns:** Native CSS position: sticky (no JavaScript overhead)
- **Month range:** Derived from data, not from hardcoded range

### Security
- **RLS enabled** on all tables (Supabase Row Level Security)
- **Admin guard** on all mutations: `await requireAdmin()` checks user role
- **Unique constraint** on (member_id, month) prevents duplicate entries
- **FK constraints** protect referential integrity
- **Soft deletes** on members preserve historical transaction data
- **Auto-cascade:** Delete contribution → also delete linked transaction (via FK)

### Data Integrity
- Contributions can only be deleted by cascade from transactions table
- Members have `ON DELETE RESTRICT` to prevent orphaning contributions
- UNIQUE constraint prevents same member paying same month twice
- Month validation (YYYY-MM format) enforced at schema + validation level

---

## Summary

The **đóng tiền** (payment tracking) feature is a well-architected component of the fund management app:

✅ **Strengths:**
- Clear separation of concerns (page → matrix → modal)
- Type-safe validation (Zod + TypeScript)
- Auto-transaction creation for audit trail
- Sticky column design for usability
- Responsive table with proper scrolling
- Admin-only mutations with guard
- Comprehensive database constraints

⚠️ **Design Patterns Used:**
- Server components for data fetching
- Client components for interactivity
- Server actions for mutations
- Suspense + skeleton loading
- Toast notifications for feedback
- Modal as isolated form context

**Tech Stack:** Next.js 14, React 18, TypeScript, Tailwind CSS, Supabase, Zod

