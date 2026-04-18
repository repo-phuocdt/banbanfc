# Code Standards & Codebase Structure

**Project**: Quản Lý Quỹ Đội Bóng
**Version**: 1.1.0
**Last Updated**: April 18, 2026

## Overview

This document defines code standards, architecture patterns, and project structure for the Quản Lý Quỹ Đội Bóng application. All developers must follow these standards for consistency and maintainability.

---

## Project Structure

```
banbanfc/
├── app/                              # Next.js 14 App Router
│   ├── layout.tsx                   # Root layout wrapper
│   ├── page.tsx                     # Home redirect
│   ├── login/
│   │   └── page.tsx                # Login page
│   └── quan-ly-quy/                # Main app routes
│       ├── layout.tsx              # Sidebar + breadcrumb layout
│       ├── page.tsx                # Dashboard
│       ├── thanh-vien/             # Members management
│       │   ├── page.tsx            # Members list page
│       │   └── actions.ts          # Member server actions
│       ├── dong-tien/              # Contribution matrix
│       │   ├── page.tsx            # Contribution matrix page
│       │   └── actions.ts          # Contribution server actions
│       ├── thu-chi/                # Transaction ledger
│       │   ├── page.tsx            # Ledger page
│       │   └── actions.ts          # Transaction server actions
│       └── qr-chuyen-tien/         # QR codes (NEW)
│           ├── page.tsx            # QR codes page
│           └── actions.ts          # QR server actions
├── components/                       # Reusable React components
│   ├── ui/                         # Base UI primitives
│   │   ├── modal.tsx              # Modal dialog
│   │   ├── badge.tsx              # Status/type badges
│   │   ├── confirm-dialog.tsx      # Confirmation dialog
│   │   ├── toast.tsx              # Toast notifications
│   │   ├── skeleton.tsx           # Loading skeleton
│   │   └── empty-state.tsx        # Empty state message
│   ├── shared/                     # Shared components
│   │   ├── currency-display.tsx   # VNĐ formatting wrapper
│   │   └── date-display.tsx       # Date formatting wrapper
│   ├── layout/                     # Layout components
│   │   ├── sidebar.tsx            # Main sidebar navigation (desktop)
│   │   ├── breadcrumb.tsx         # Breadcrumb navigation
│   │   └── layout-shell.tsx       # Layout switcher (desktop/mobile)
│   ├── mobile/                     # Mobile-only components (NEW)
│   │   ├── mobile-layout.tsx      # Mobile shell (header+nav+content)
│   │   ├── mobile-header.tsx      # Compact top header
│   │   ├── bottom-nav.tsx         # Fixed bottom navigation (5 tabs)
│   │   ├── mobile-sheet.tsx       # Bottom sheet modal
│   │   ├── mobile-card.tsx        # Reusable card for lists
│   │   ├── dashboard-mobile.tsx   # Dashboard mobile view
│   │   ├── member-list.tsx        # Members card list
│   │   ├── transaction-list.tsx   # Transactions card list
│   │   ├── contribution-view.tsx  # Contributions grouped view
│   │   └── qr-code-list.tsx       # QR codes optimized grid
│   ├── dashboard/                  # Dashboard widgets (desktop)
│   │   ├── summary-cards.tsx      # Top summary metrics
│   │   ├── monthly-chart.tsx      # Income vs expense chart
│   │   ├── recent-transactions.tsx# Recent transactions list
│   │   └── dashboard-switch.tsx   # Desktop/mobile switcher
│   ├── members/                    # Member components (desktop)
│   │   ├── member-table.tsx       # Members data table
│   │   ├── member-form-modal.tsx  # Member form modal
│   │   └── member-switch.tsx      # Desktop/mobile switcher
│   ├── contributions/              # Contribution components (desktop)
│   │   ├── contribution-matrix.tsx# Matrix view
│   │   ├── payment-modal.tsx      # Payment recording modal
│   │   └── contribution-switch.tsx# Desktop/mobile switcher
│   ├── transactions/               # Transaction components (desktop)
│   │   ├── transaction-page.tsx   # Ledger container
│   │   ├── transaction-table.tsx  # Ledger data table
│   │   ├── transaction-form-modal.tsx# Transaction form
│   │   └── summary-panel.tsx      # Right-side summary
│   └── qr-codes/                   # QR code components
│       ├── qr-code-manager.tsx    # QR list & actions (desktop)
│       ├── qr-code-form-modal.tsx # QR upload form
│       └── qr-code-switch.tsx     # Desktop/mobile switcher
├── lib/                             # Utilities, types, config
│   ├── types/
│   │   ├── database.ts            # Database model interfaces
│   │   └── action-result.ts       # Server action result type
│   ├── auth/
│   │   └── require-admin.ts       # Admin auth middleware
│   ├── supabase/
│   │   ├── client.ts              # Browser Supabase client
│   │   ├── server.ts              # Server Supabase client
│   │   └── schema.sql             # Database schema
│   ├── utils/
│   │   ├── format.ts              # Currency, date formatters
│   │   └── constants.ts           # App constants
│   └── validations/
│       └── schemas.ts             # Zod validation schemas
├── docs/                            # Documentation
│   ├── project-overview-pdr.md    # Project requirements
│   ├── code-standards.md          # This file
│   ├── system-architecture.md     # Architecture details
│   └── codebase-summary.md        # Codebase overview
├── middleware.ts                    # Next.js auth middleware
├── package.json                     # Dependencies
├── tsconfig.json                    # TypeScript config
├── next.config.js                   # Next.js config
├── tailwind.config.js               # Tailwind CSS config
└── .env.local.example               # Environment template
```

---

## Naming Conventions

### Files & Directories
- **Components**: `PascalCase.tsx` (e.g., `MemberTable.tsx`)
- **Pages**: `page.tsx` in route directory (Next.js convention)
- **Server Actions**: `actions.ts` in route directory
- **Utilities**: `kebab-case.ts` (e.g., `format.ts`, `constants.ts`)
- **Types**: `kebab-case.ts` (e.g., `database.ts`, `action-result.ts`)
- **Styles**: Inline Tailwind (no separate CSS files)

### TypeScript Variables & Functions
- **Functions**: `camelCase` (e.g., `formatCurrency`, `requireAdmin`)
- **Constants**: `UPPER_SNAKE_CASE` (e.g., `DEFAULT_CONTRIBUTION`, `STATUS_LABELS`)
- **Types/Interfaces**: `PascalCase` (e.g., `Member`, `ActionResult`, `Transaction`)
- **Enums**: `PascalCase` values (in Zod or custom types)

### Database
- **Tables**: `snake_case`, plural (e.g., `members`, `contributions`, `transactions`)
- **Columns**: `snake_case` (e.g., `member_id`, `joined_at`, `paid_at`)
- **Foreign keys**: `{table}_id` (e.g., `member_id` → members.id)
- **Timestamps**: `created_at`, `updated_at`, `paid_at`

### CSS Classes
- **Tailwind**: Use full class names (no custom abbreviations)
- **Spacing**: Use Tailwind scale (p-4, m-6, gap-8)
- **Responsive**: `md:`, `lg:` prefixes for breakpoints
- **States**: `hover:`, `focus:`, `disabled:` prefixes
- **Colors**: Semantic names (green-100, red-800, blue-600)

---

## Code Quality Standards

### TypeScript
- **Strict Mode**: `strict: true` in tsconfig.json
- **No `any`**: Always provide explicit types
- **Interfaces**: Use for object shapes (not types)
- **Generics**: Use for reusable functions/components
- **Error Handling**: Try-catch blocks with typed error responses

```typescript
// Good
interface Member {
  id: string
  name: string
  status: 'active' | 'inactive' | 'paused'
}

function formatCurrency(amount: number): string {
  return amount.toLocaleString('vi-VN')
}

// Avoid
const member: any = { ... }  // No 'any'
function format(amount) { ... }  // No untyped params
```

### Components
- **Functional**: All components are functional (React 18+)
- **Use Client**: Mark interactive components with `'use client'`
- **Props**: Always type props interface
- **Size**: Keep under 200 LOC per file (split if larger)
- **Reusability**: Extract common patterns into shared components

```typescript
// Good
'use client'
import { FC } from 'react'
interface MemberTableProps {
  members: Member[]
  onEdit: (id: string) => void
}
const MemberTable: FC<MemberTableProps> = ({ members, onEdit }) => {
  return <table>{/* ... */}</table>
}
export default MemberTable

// Avoid
export default function MemberTable(props: any) { ... }  // No typing
const MemberTable = ({ members }) => { ... }  // Props interface missing
```

### Server Actions
- **Async**: Always async (server actions are async)
- **Validation**: Use Zod schema before mutation
- **Error Handling**: Return `ActionResult<T>` type
- **Auth**: Call `requireAdmin()` at start for write operations
- **Revalidation**: Call `revalidatePath()` after mutations

```typescript
// Good
'use server'
import { memberSchema } from '@/lib/validations/schemas'
import { requireAdmin } from '@/lib/auth/require-admin'
import type { ActionResult } from '@/lib/types/action-result'

export async function createMember(formData: unknown): Promise<ActionResult> {
  await requireAdmin()
  const parsed = memberSchema.safeParse(formData)
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message }
  }
  try {
    const supabase = createClient()
    const { error } = await supabase.from('members').insert(...)
    if (error) return { success: false, error: error.message }
    revalidatePath('/quan-ly-quy/thanh-vien')
    return { success: true }
  } catch (err) {
    return { success: false, error: 'Database error' }
  }
}
```

### Validation
- **Schema**: All forms use Zod schema in `/lib/validations/schemas.ts`
- **Server & Client**: Validate on both sides (client for UX, server for security)
- **Messages**: Vietnamese error messages
- **Required**: Explicit `.min()`, `.regex()` validations

```typescript
// In lib/validations/schemas.ts
export const memberSchema = z.object({
  name: z.string().min(1, 'Tên không được để trống'),
  status: z.enum(['active', 'inactive', 'paused']),
  note: z.string().optional().nullable(),
})

// In component
const parsed = memberSchema.safeParse(formData)
if (!parsed.success) {
  setErrors(parsed.error.errors)  // Display to user
}
```

### Error Handling
- **ActionResult**: Consistent return type for server actions
- **Toast**: Show success/error feedback to user
- **Logging**: Minimal (relying on Supabase logs)
- **Fallbacks**: Graceful degradation on network/DB errors

```typescript
type ActionResult<T = void> =
  | { success: true; data?: T }
  | { success: false; error: string }

// Usage
const result = await createMember(formData)
if (result.success) {
  showToast('Thêm thành viên thành công')
} else {
  showToast(result.error, 'error')
}
```

### Performance
- **No N+1 Queries**: Batch related data fetches
- **Dynamic Imports**: Use `next/dynamic` for large components
- **Parallel Fetches**: Use `Promise.all()` where possible
- **Memoization**: Use `useMemo`, `useCallback` sparingly (only if proven needed)
- **Image Optimization**: Use `next/image` (none currently, future consideration)

```typescript
// Good - parallel fetches
const [income, expense, members] = await Promise.all([
  supabase.from('transactions').select('amount').eq('type', 'income'),
  supabase.from('transactions').select('amount').eq('type', 'expense'),
  supabase.from('members').select('*').eq('status', 'active'),
])

// Avoid
const income = await supabase.from('transactions')...  // Sequential
const expense = await supabase.from('transactions')...
const members = await supabase.from('members')...
```

---

## Mobile & Desktop Layout Pattern

### useIsMobile Hook
**Purpose**: Detect mobile viewport without hydration mismatch

```typescript
// hooks/use-is-mobile.ts
'use client'
import { useState, useEffect } from 'react'

const MOBILE_BREAKPOINT = 768

export function useIsMobile(): boolean | null {
  const [isMobile, setIsMobile] = useState<boolean | null>(null)
  
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])
  
  return isMobile  // null on SSR, boolean on client
}
```

**Usage**: Only in Client Components. Returns `null` during SSR to prevent hydration mismatches.

### Switch Component Pattern
**Purpose**: Bridge Server Components (data fetch) to Client conditional rendering

```typescript
// components/dashboard/dashboard-switch.tsx
'use client'
import { useIsMobile } from '@/hooks/use-is-mobile'
import { Skeleton } from '@/components/ui/skeleton'
import DashboardMobile from '@/components/mobile/dashboard-mobile'
import Dashboard from './dashboard'

interface DashboardSwitchProps {
  // same props as desktop Dashboard
  totalIncome: number
  totalExpense: number
  activeMembers: number
  monthlyData: MonthlyData[]
  recentTransactions: TransactionWithMember[]
}

export default function DashboardSwitch(props: DashboardSwitchProps) {
  const isMobile = useIsMobile()
  
  if (isMobile === null) {
    return <Skeleton className="h-96" />  // SSR fallback
  }
  
  return isMobile ? (
    <DashboardMobile {...props} />
  ) : (
    <Dashboard {...props} />
  )
}
```

**Usage in Server Component**:
```typescript
// app/quan-ly-quy/page.tsx (Server Component)
export default async function DashboardPage() {
  const data = await fetchDashboardData()
  return <DashboardSwitch {...data} />  {/* Switch on client */}
}
```

**Benefits**:
- Data fetching stays server-side (efficient)
- Layout switching happens client-side (fast)
- No duplicate data fetch
- Mobile components never SSR

---

## React & Next.js Patterns

### Server vs Client Components
- **Server Components**: Default for all page components
- **Client Components**: Only for interactivity (forms, modals, state)
- **Server Actions**: Mutations (create, update, delete)
- **No Page-level State**: Use server components + revalidatePath instead

```typescript
// page.tsx (Server Component)
export default async function MembersPage() {
  const members = await getMembers()
  return (
    <div>
      <MemberTable members={members} />  {/* Client component with handler */}
    </div>
  )
}

// member-table.tsx (Client Component)
'use client'
export default function MemberTable({ members, onDelete }) {
  const [selected, setSelected] = useState<string | null>(null)
  return <table>{/* ... */}</table>
}
```

### Data Fetching
- **Parallel**: Use `Promise.all()` for independent queries
- **Caching**: Next.js default caching (revalidatePath on mutations)
- **Streaming**: Use Suspense for non-blocking component loading
- **Error Handling**: Try-catch at fetch, throw error to error boundary

```typescript
// Good - Suspense + streaming
async function DashboardContent() {
  const data = await fetchData()
  return <Dashboard data={data} />
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardContent />
    </Suspense>
  )
}
```

### Forms
- **React Hook Form**: All forms use this library
- **Zod Validation**: Schema-driven validation
- **Controlled Inputs**: onChange handlers update state
- **Submit**: onClick button handler calls server action

```typescript
'use client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { memberSchema } from '@/lib/validations/schemas'

export function MemberForm() {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(memberSchema),
  })

  const onSubmit = async (data) => {
    const result = await createMember(data)
    if (result.success) {
      // success
    } else {
      // error
    }
  }

  return <form onSubmit={handleSubmit(onSubmit)}>...</form>
}
```

---

## Mobile Component Patterns

**Mobile Layout Components**:
- `MobileSheet`: Headless UI-based bottom sheet (replaces Modal on mobile)
- `MobileCard`: Card component for list items (replaces table rows)
- `BottomNav`: Fixed-bottom tab navigation
- `MobileHeader`: Compact sticky top bar

**Feature Mobile Views** (suffix: `-mobile`, `-list`, `-view`):
- Receive same data props as desktop components
- Return `null` on SSR (avoid hydration mismatch)
- Use card-based layouts, stacked vertically
- Touch targets: ≥44px height

**Example**:
```typescript
// components/mobile/member-list.tsx
'use client'
export function MemberList({ members }: { members: MemberWithTotal[] }) {
  const [expanded, setExpanded] = useState<string | null>(null)
  
  return (
    <div className="space-y-3 px-4">
      {members.map(m => (
        <MobileCard
          key={m.id}
          title={m.name}
          subtitle={m.status}
          metadata={`${formatCurrency(m.total_contributed)}`}
          onClick={() => setExpanded(expanded === m.id ? null : m.id)}
        >
          {expanded === m.id && (
            <div className="border-t pt-3 mt-3">
              <p className="text-sm text-gray-600">{m.note}</p>
            </div>
          )}
        </MobileCard>
      ))}
    </div>
  )
}
```

---

## Styling Standards

### Tailwind CSS
- **Utilities First**: Use Tailwind classes, no custom CSS
- **Color Palette**: Semantic colors (green = success, red = danger, blue = primary)
- **Responsive**: Mobile-first design with `md:`, `lg:` prefixes
- **Consistency**: Use design tokens (spacing, colors, sizes)

```typescript
// Good
<div className="space-y-4 p-6 rounded-lg bg-white shadow">
  <h2 className="text-lg font-bold text-gray-900">Title</h2>
  <p className="text-sm text-gray-600">Description</p>
</div>

// Avoid
<div style={{ padding: '24px', borderRadius: '8px' }}>  // Inline styles
  <h2 style={{ fontSize: '18px', fontWeight: 'bold' }}>
```

### Color System
| Color | Semantic | Usage |
|-------|----------|-------|
| Green | Success/Income | Badges, success messages, positive amounts |
| Red | Danger/Expense | Error messages, expense amounts, inactive |
| Blue | Primary/Info | Links, primary buttons, balance info |
| Yellow | Warning | Paused status, caution messages |
| Gray | Neutral | Disabled, muted text, inactive items |

---

## Database Standards

### Supabase Client
- **Server**: Use `createClient()` from `/lib/supabase/server.ts`
- **Browser**: Use `createClient()` from `/lib/supabase/client.ts`
- **SSR**: Server client handles cookie updates

```typescript
// In Server Component
import { createClient } from '@/lib/supabase/server'
const supabase = createClient()
const { data } = await supabase.from('members').select('*')

// In Client Component (if needed)
import { createClient } from '@/lib/supabase/client'
const supabase = createClient()
const { data } = await supabase.from('members').select('*')
```

### Queries
- **Select**: Use `select('*')` or specific columns
- **Filtering**: Use `.eq()`, `.neq()`, `.gt()`, `.lt()` methods
- **Ordering**: `.order('column_name', { ascending: false })`
- **Limit**: `.limit(10)` for pagination

```typescript
// Good
const { data } = await supabase
  .from('transactions')
  .select('*')
  .eq('type', 'income')
  .order('date', { ascending: false })
  .limit(10)

// Avoid
const { data } = await supabase.rpc('raw_sql', ...)  // Raw SQL (security risk)
```

### RLS Policies
- **Read**: Public (anyone can view data)
- **Write**: Admin-only (custom is_admin() function checks JWT metadata)
- **Delete**: Not used (soft deletes with status='deleted')
- **Audit**: created_at, updated_at on all tables

```sql
-- Admin-only RLS policy (updated)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN (auth.jwt()->'app_metadata'->>'is_admin')::boolean;
END;
$$ LANGUAGE plpgsql STABLE;

CREATE POLICY "Enable read access for all"
ON public.members FOR SELECT
USING (true);

CREATE POLICY "Enable write for admin users only"
ON public.members FOR INSERT, UPDATE, DELETE
WITH CHECK (is_admin());
```

---

## Authentication & Authorization

### Access Control
- **Login**: Email/password via Supabase Auth
- **Pages**: Publicly viewable without authentication
- **Middleware**: Refreshes session only, does NOT redirect
- **Server Actions**: Call `requireAdmin()` to ensure authenticated AND is_admin
- **Soft Delete**: Users can't access deleted members in dropdowns

```typescript
// lib/auth/require-admin.ts
export async function requireAdmin() {
  const supabase = createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) {
    return { error: 'Not authenticated' }
  }
  const isAdmin = user.app_metadata?.is_admin === true
  if (!isAdmin) {
    return { error: 'Admin access required' }
  }
  return { user }
}

// Use in server action (returns ActionResult, doesn't throw)
export async function createMember(formData) {
  const auth = await requireAdmin()
  if (auth.error) {
    return { success: false, error: auth.error }
  }
  // ... mutation code
}
```

### Session Management
- **Middleware**: Runs on every request, refreshes session
- **Cookies**: Supabase manages auth cookies
- **Logout**: Clear session via Supabase client

```typescript
// middleware.ts
export async function middleware(request: NextRequest) {
  const response = NextResponse.next()
  const supabase = createServerClient(..., { cookies: { ... } })
  await supabase.auth.getUser()  // Refreshes session
  return response
}
```

---

## Testing Standards

### Unit Tests (Future)
- Location: `__tests__/` directory next to source
- Framework: Jest (recommended) or Vitest
- Coverage: 80%+ for utility functions

### Integration Tests (Future)
- Location: `tests/integration/`
- Framework: Jest + Supertest (for API routes)
- Fixtures: Sample data in `tests/fixtures/`

### E2E Tests (Future)
- Framework: Playwright or Cypress
- Scope: User workflows (login, create member, record payment)
- CI: Run on PRs before merge

---

## Documentation Standards

### Code Comments
- **Why, not what**: Explain intent, not obvious code
- **Sparse**: Prefer self-documenting code
- **TypeScript types**: Types serve as documentation

```typescript
// Good
// Calculate running balance by iterating transactions in date order
const balance = transactions.reduce((sum, t) => {
  return sum + (t.type === 'income' ? t.amount : -t.amount)
}, 0)

// Avoid
// Add amount to balance  (too obvious)
let balance = 0
balance += amount
```

### README
- Location: `/README.md` at project root
- Content: Quick start, features, tech stack, deployment
- Audience: New developers, stakeholders

### Documentation Files
- Location: `/docs/` directory
- Files:
  - `project-overview-pdr.md`: Requirements & acceptance criteria
  - `code-standards.md`: This file
  - `system-architecture.md`: Architecture & design decisions
  - `codebase-summary.md`: High-level codebase overview

---

## Git & Version Control

### Commit Messages
- **Format**: Conventional commits (`feat:`, `fix:`, `docs:`, `refactor:`)
- **Scope**: Feature or component (optional)
- **Message**: Clear, concise (50 chars max for title)
- **No AI**: Don't mention Claude, GPT, etc.

```
feat(members): add member soft delete

- Implement soft delete via status='deleted'
- Exclude deleted members from dropdowns
- Preserve historical contribution data

Closes #123
```

### Branches
- **Main**: Production code (protected)
- **Dev**: Integration branch (if multi-developer)
- **Feature**: `feature/{name}` for new features
- **Bug**: `fix/{name}` for bug fixes

### Pull Requests
- **Title**: Conventional commit format
- **Description**: What changed, why, how to test
- **Review**: Code review before merge
- **Tests**: All tests pass before merge

---

## Common Patterns

### Data Fetching in Server Components
```typescript
async function DashboardContent() {
  const supabase = createClient()
  const [income, expense, recent] = await Promise.all([
    supabase.from('transactions').select('amount').eq('type', 'income'),
    supabase.from('transactions').select('amount').eq('type', 'expense'),
    supabase.from('transactions').select('*').order('date', { ascending: false }).limit(10),
  ])
  return <Dashboard income={income} expense={expense} recent={recent} />
}
```

### Form Modal
```typescript
'use client'
interface FormModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data) => Promise<ActionResult>
  children?: React.ReactNode
}
export function FormModal({ isOpen, onClose, onSubmit, children }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <form onSubmit={async (e) => {
        e.preventDefault()
        const result = await onSubmit(new FormData(e.currentTarget))
        if (result.success) onClose()
      }}>
        {children}
      </form>
    </Modal>
  )
}
```

### Action Result Pattern
```typescript
// Server action
export async function createMember(data: unknown): Promise<ActionResult> {
  await requireAdmin()
  const parsed = memberSchema.safeParse(data)
  if (!parsed.success) return { success: false, error: parsed.error.errors[0].message }
  try {
    const supabase = createClient()
    const { error } = await supabase.from('members').insert(parsed.data)
    if (error) return { success: false, error: error.message }
    revalidatePath('/quan-ly-quy/thanh-vien')
    return { success: true }
  } catch (err) {
    return { success: false, error: 'Unexpected error' }
  }
}

// Client usage
const result = await createMember(formData)
if (result.success) {
  showToast('Success!')
} else {
  showToast(result.error, 'error')
}
```

---

## File Size Limits

- **Components**: Keep under 200 LOC (split if larger)
- **Server Actions**: Keep under 150 LOC (extract helpers)
- **Utilities**: No size limit, but keep focused
- **Documentation**: Target 800 LOC (split into sections if larger)

---

## Linting & Formatting

### ESLint
- **Config**: `eslint-config-next` (Next.js default)
- **Rules**: Enforce React best practices, no unused variables
- **Fixing**: `npm run lint -- --fix`

### Prettier (Optional)
- **Config**: 2-space indentation, single quotes
- **Run**: Pre-commit hook (if configured)

### TypeScript
- **Strict Mode**: All files
- **Check**: `npm run build` or `tsc --noEmit`

---

## Development Workflow

### Before Commit
1. Run TypeScript check: `npm run build` (or `tsc`)
2. Run linter: `npm run lint`
3. Test manually in dev server
4. Review code for standards compliance

### Before Push
1. Ensure all tests pass (future)
2. Check no console errors/warnings
3. Verify commit message format
4. Rebase on latest main (if needed)

### Before Deploy
1. Full build succeeds
2. All tests pass
3. No TypeScript errors
4. Manual testing of critical paths

---

## Troubleshooting

### TypeScript Errors
- Check `tsconfig.json` `strict: true`
- Explicit types on all params/return values
- Use `satisfies` for const assertions

### Component Not Re-rendering
- Check if using Server Component (convert to Client)
- Verify `revalidatePath()` called after mutation
- Check `useState` hook (not available in Server Components)

### Slow Page Load
- Use `Promise.all()` for parallel fetches
- Check network tab for waterfall queries
- Consider dynamic imports for large components

### Style Not Applied
- Check Tailwind class spelling (typos disable class)
- Verify dark mode not enabled (if using dark: prefix)
- Clear next build cache: `rm -rf .next && npm run dev`

---

## Resources

- **Next.js 14 Docs**: https://nextjs.org/docs
- **React 18 Docs**: https://react.dev
- **Tailwind CSS**: https://tailwindcss.com/docs
- **Supabase**: https://supabase.com/docs
- **React Hook Form**: https://react-hook-form.com
- **Zod**: https://zod.dev

---

**Document Owner**: Development Team
**Last Updated**: April 18, 2026
**Next Review**: July 18, 2026
