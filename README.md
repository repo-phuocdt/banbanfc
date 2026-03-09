# Quản Lý Quỹ Đội Bóng

A modern web application for managing Vietnamese amateur football team finances. Track member contributions, monitor expenses, and visualize fund flows with ease.

[Vietnamese] (English docs in `/docs`)

## Overview

**Quản Lý Quỹ Đội Bóng** (Football Team Fund Management) is an internal tool built for amateur football teams to:

- Manage team membership with status tracking
- Record and track monthly member contributions
- Maintain comprehensive income/expense ledger with running balance
- Visualize financial data with interactive charts
- Quickly access key metrics via dashboard

## Quick Start

### Prerequisites

- Node.js 18+ (using nvm recommended)
- Supabase project (free tier sufficient)
- Environment variables (see setup)

### Setup

1. Clone and install dependencies:
   ```bash
   npm install
   ```

2. Configure environment variables:
   ```bash
   cp .env.local.example .env.local
   ```
   Then add your Supabase credentials:
   - `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Public anon key
   - `SUPABASE_SERVICE_ROLE_KEY`: Service role key (for server-side auth)

3. Create database tables (SQL file available in project):
   ```sql
   -- Run Supabase SQL queries from /lib/supabase/schema.sql
   ```

4. Start development server:
   ```bash
   npm run dev
   ```

5. Open http://localhost:3000 and login

### Deploy

```bash
npm run build
npm start
```

## Tech Stack

- **Frontend**: Next.js 14 App Router, React 18, TypeScript
- **Styling**: Tailwind CSS v3
- **Forms**: React Hook Form + Zod validation
- **Database**: Supabase (PostgreSQL) with RLS
- **Charts**: Recharts
- **Auth**: Supabase Authentication (admin-only)
- **Date/Time**: date-fns with Vietnamese locale

## Key Features

### 1. Dashboard (`/quan-ly-quy`)
- **Summary Cards**: Total income, expenses, balance, active member count
- **Monthly Chart**: Income vs expense trend visualization
- **Recent Transactions**: 10 latest transactions for quick overview

### 2. Members (`/quan-ly-quy/thanh-vien`)
- Full member CRUD with search/filter by name and status
- Status management: Active (Đang hoạt động), Paused (Tạm nghỉ), Inactive (Đã nghỉ)
- Soft delete: Inactive members excluded from dropdowns but retained for history
- View total contributions per member

### 3. Contribution Matrix (`/quan-ly-quy/dong-tien`)
- Spreadsheet-like view: members × months
- **Sticky columns**: Name always visible when scrolling months
- Click unpaid cells to record payment (default 200,000 VNĐ)
- Auto-creates transaction entry when contribution logged
- Responsive with horizontal scroll on mobile

### 4. Transaction Ledger (`/quan-ly-quy/thu-chi`)
- Complete income/expense log with running balance calculation
- Color-coded rows: green for income, red for expenses
- Filters: date range, member, type, category
- Rich category system (8 income + 8 expense categories)
- Summary panel: totals and transaction count
- Sorted newest first, balance correctly computed

### 5. Authentication
- Admin-only access via Supabase email/password
- Middleware protects all `/quan-ly-quy/*` routes
- Auto-redirect to login for unauthorized access

## File Structure

```
banbanfc/
├── app/                          # Next.js app router
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Redirect to dashboard
│   ├── login/page.tsx           # Login page
│   └── quan-ly-quy/             # Main app routes
│       ├── layout.tsx           # Sidebar + layout
│       ├── page.tsx             # Dashboard
│       ├── thanh-vien/          # Members
│       ├── dong-tien/           # Contributions
│       └── thu-chi/             # Transactions
├── components/                   # React components
│   ├── ui/                      # Base UI (badge, modal, etc)
│   ├── layout/                  # Sidebar, breadcrumb
│   ├── dashboard/               # Dashboard widgets
│   ├── members/                 # Member table & forms
│   ├── contributions/           # Contribution matrix
│   └── transactions/            # Transaction ledger
├── lib/                          # Utilities & config
│   ├── types/                   # TypeScript types
│   ├── auth/                    # Authentication
│   ├── supabase/                # Supabase clients
│   ├── utils/                   # Formatting, constants
│   └── validations/             # Zod schemas
├── docs/                         # Documentation
├── middleware.ts                 # Auth middleware
└── package.json
```

## Architecture Patterns

### Server Components + Server Actions
- Page components fetch data server-side
- Interactive components are Client Components (`use client`)
- Data mutations via Server Actions with `requireAdmin()` guard
- Result type: `ActionResult<T>` for consistent error handling

### Type-Safe API
All database types defined in `/lib/types/database.ts`:
- `Member`: Team member with status
- `Contribution`: Monthly payment tracking
- `Transaction`: Income/expense ledger entry

### Validation
All forms use Zod schemas in `/lib/validations/schemas.ts`:
- `memberSchema`: name, status, optional note
- `contributionSchema`: member_id, month, amount
- `transactionSchema`: type, amount, category, optional member

### Soft Deletes
Members are soft-deleted (status='deleted'), preserving historical data while excluding from active lists.

### Auto-Create Transactions
When a contribution is created, system automatically creates corresponding transaction entry for ledger accuracy.

## Code Standards

- **No inline styles**: Tailwind CSS only
- **Component size**: Under 200 LOC per file (split as needed)
- **Error handling**: Try-catch + ActionResult type
- **Security**: RLS enabled, authenticated mutations, no public write
- **Performance**: Parallel data fetches, dynamic imports for charts
- **Naming**: snake_case for DB columns, camelCase for TypeScript

## Database Schema

**Members Table**
- `id` (uuid, pk)
- `name` (text, unique)
- `status` (enum: active, inactive, paused, deleted)
- `joined_at` (timestamp)
- `note` (text, nullable)
- `created_at`, `updated_at`

**Contributions Table**
- `id` (uuid, pk)
- `member_id` (uuid, fk → members)
- `month` (text, 'YYYY-MM' format)
- `amount` (integer)
- `paid_at` (timestamp, nullable)
- `created_at`

**Transactions Table**
- `id` (uuid, pk)
- `date` (timestamp, nullable)
- `type` (enum: income, expense)
- `amount` (integer)
- `category` (text)
- `description` (text)
- `member_id` (uuid, nullable, fk → members)
- `contribution_id` (uuid, nullable, fk → contributions)
- `created_at`

## Common Tasks

### Add New Member
1. Navigate to "Thành viên" page
2. Click "Thêm thành viên"
3. Fill name, select status, optional note
4. Submit

### Record Payment
1. Go to "Đóng tiền" page
2. Find member row and payment month column
3. Click unpaid cell (empty or light)
4. Confirm amount (default 200,000) and save

### Add Transaction
1. Navigate to "Thu chi" page
2. Click "Thêm giao dịch"
3. Select date, type (income/expense), amount, category
4. Optional: attach to member
5. Submit

### Export/Backup
Currently manual export via Supabase dashboard. Future: Add CSV/Excel export.

## Troubleshooting

**Login redirects but stays on /login**
- Check Supabase credentials in `.env.local`
- Verify user exists in Supabase Auth
- Check middleware.ts is running (browser console)

**Contribution changes don't appear**
- Refresh page (client-side cache)
- Check Supabase RLS policies allow your user writes
- Verify contribution_id is properly set

**Charts not rendering**
- Chart is dynamically loaded (client-side)
- Check browser console for errors
- Ensure data exists for date range

**Running balance incorrect**
- Transactions must have `date` field
- Balance assumes transactions sorted by date
- Check for NULL dates in data

## Performance Tips

- Dashboard loads in parallel: income, expenses, members, chart data
- Contribution matrix is virtualized for large member counts
- Member table uses filters client-side for fast searching
- Chart is dynamic import (lazy loaded)

## Roadmap

- Export to Excel/CSV
- Bulk import members (CSV)
- SMS/Zalo notifications for contributions
- Monthly reconciliation reports
- Photo receipts for transactions
- Expense approval workflow

## Support

For bug reports or feature requests, contact team lead or check plan documents in `/plans`.

## License

Internal use only (Vietnamese amateur football team).

---

**Latest Update**: March 9, 2026
**Maintained By**: Development team
**Documentation**: See `/docs/` folder
