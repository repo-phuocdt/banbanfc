# System Architecture

**Project**: Quản Lý Quỹ Đội Bóng
**Version**: 1.0.0
**Last Updated**: March 9, 2026

## Architecture Overview

Quản Lý Quỹ Đội Bóng is a full-stack web application using Next.js 14 with a client-server architecture. The system separates concerns across multiple layers:

- **Presentation Layer**: React components (server + client)
- **Business Logic Layer**: Server actions with validation
- **Data Access Layer**: Supabase client wrappers
- **Data Layer**: PostgreSQL database with RLS policies

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│              Browser / Client Application               │
│  (React Components, Tailwind CSS, React Hook Form)      │
└────────────────┬────────────────────────────────────────┘
                 │ (HTTP/HTTPS)
┌────────────────▼────────────────────────────────────────┐
│            Next.js 14 App Router                        │
│  ┌─────────────────────────────────────────────────┐   │
│  │ Server Components (Data Fetching)               │   │
│  │ ├─ Dashboard (page.tsx)                         │   │
│  │ ├─ Members (page.tsx + actions.ts)              │   │
│  │ ├─ Contributions (page.tsx + actions.ts)        │   │
│  │ └─ Transactions (page.tsx + actions.ts)         │   │
│  └─────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────┐   │
│  │ Server Actions (Business Logic)                 │   │
│  │ ├─ requireAdmin() validation                    │   │
│  │ ├─ Zod schema validation                        │   │
│  │ ├─ Database mutations                           │   │
│  │ └─ Cache revalidation                           │   │
│  └─────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────┐   │
│  │ Middleware (Auth & Session)                     │   │
│  │ ├─ Route protection                             │   │
│  │ ├─ Session refresh                              │   │
│  │ └─ Cookie management                            │   │
│  └─────────────────────────────────────────────────┘   │
└────────────────┬────────────────────────────────────────┘
                 │ (HTTPS/SSL)
┌────────────────▼────────────────────────────────────────┐
│              Supabase Cloud                             │
│  ┌─────────────────────────────────────────────────┐   │
│  │ PostgreSQL Database                             │   │
│  │ ├─ members (id, name, status, joined_at, ...)  │   │
│  │ ├─ contributions (id, member_id, month, ...)    │   │
│  │ └─ transactions (id, date, type, amount, ...)   │   │
│  └─────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────┐   │
│  │ Row-Level Security (RLS)                        │   │
│  │ ├─ Public read policies                         │   │
│  │ ├─ Authenticated write policies                 │   │
│  │ └─ Audit timestamps                             │   │
│  └─────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────┐   │
│  │ Authentication Service                          │   │
│  │ ├─ Email/password authentication                │   │
│  │ ├─ Session management                           │   │
│  │ └─ JWT token validation                         │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

---

## Deployment Topology

```
┌──────────────────────────────────────────┐
│         Vercel (Recommended)             │
│  ┌────────────────────────────────────┐  │
│  │ Next.js Production Build            │  │
│  │ ├─ App Router (pages + actions)      │  │
│  │ ├─ Static assets (CSS, JS)           │  │
│  │ ├─ Edge Functions (middleware)       │  │
│  │ └─ Serverless Functions (API)        │  │
│  └────────────────────────────────────┘  │
│  ┌────────────────────────────────────┐  │
│  │ Environment Variables               │  │
│  │ ├─ NEXT_PUBLIC_SUPABASE_URL         │  │
│  │ ├─ NEXT_PUBLIC_SUPABASE_ANON_KEY    │  │
│  │ └─ SUPABASE_SERVICE_ROLE_KEY        │  │
│  └────────────────────────────────────┘  │
└──────────────────────────────────────────┘
           │
           │ (HTTPS)
           │
┌──────────▼──────────────────────────────┐
│       Supabase.co (Cloud)                │
│  ┌────────────────────────────────────┐  │
│  │ PostgreSQL Database                 │  │
│  │ ├─ members table                    │  │
│  │ ├─ contributions table              │  │
│  │ └─ transactions table               │  │
│  └────────────────────────────────────┘  │
│  ┌────────────────────────────────────┐  │
│  │ Supabase Auth                       │  │
│  │ └─ User accounts & sessions         │  │
│  └────────────────────────────────────┘  │
└──────────────────────────────────────────┘
```

---

## Data Flow

### 1. Authentication Flow

```
User Login
├─ (1) POST /login (email, password)
├─ (2) Supabase Auth validates credentials
├─ (3) JWT token generated
├─ (4) Session cookie set
├─ (5) Middleware refreshes session on next request
└─ (6) User can access protected routes

User Logout
├─ (1) Click logout button
├─ (2) Clear session cookie
├─ (3) Redirect to /login
└─ (4) Next request shows login page
```

### 2. Page Load Flow (Dashboard Example)

```
User Navigates to /quan-ly-quy
│
├─ (1) Middleware checks auth session
│  └─ If not authenticated → redirect to /login
│
├─ (2) Server Component (page.tsx)
│  ├─ DashboardContent() runs on server
│  ├─ Parallel fetch data:
│  │  ├─ SELECT SUM(amount) FROM transactions WHERE type='income'
│  │  ├─ SELECT SUM(amount) FROM transactions WHERE type='expense'
│  │  ├─ SELECT COUNT(*) FROM members WHERE status='active'
│  │  ├─ SELECT * FROM transactions ORDER BY date
│  │  └─ SELECT * FROM transactions JOIN members ORDER BY date DESC LIMIT 10
│  └─ Aggregate & transform data
│
├─ (3) Server renders HTML with data
│
├─ (4) Client hydrates
│  ├─ React attaches event listeners
│  ├─ Client components become interactive
│  └─ Chart loads (dynamic import)
│
└─ (5) Page displays with summary cards, chart, recent transactions
```

### 3. Create Member Flow

```
User Submits Member Form
│
├─ (1) Client-side validation (React Hook Form)
│  └─ If invalid → show error messages
│
├─ (2) onClick → createMember(formData)
│  └─ Server Action called via POST
│
├─ (3) Server executes createMember()
│  ├─ Call requireAdmin() → check auth session
│  │  └─ If not authenticated → throw error
│  ├─ Parse formData with memberSchema (Zod)
│  │  └─ If invalid → return { success: false, error: "..." }
│  ├─ INSERT INTO members (...) VALUES (...)
│  │  └─ If duplicate name → return { success: false, error: "..." }
│  └─ Revalidate cache for /quan-ly-quy/thanh-vien
│
├─ (4) Return ActionResult to client
│  └─ { success: true } or { success: false, error: "..." }
│
├─ (5) Client shows toast notification
│  ├─ Success → "Thêm thành viên thành công"
│  └─ Error → display error message
│
├─ (6) Page re-renders
│  └─ New member appears in table (if cache revalidated correctly)
│
└─ (7) Close modal & reset form
```

### 4. Record Contribution Flow

```
User Clicks Unpaid Cell in Contribution Matrix
│
├─ (1) Opens payment modal (client-side)
│  └─ Pre-fill amount with 200,000 VNĐ
│
├─ (2) User edits amount (optional) & clicks Save
│  └─ Submit via recordContribution(memberId, month, amount)
│
├─ (3) Server Action: recordContribution()
│  ├─ Validate auth (requireAdmin)
│  ├─ Validate input (Zod schema)
│  ├─ BEGIN TRANSACTION
│  ├─ INSERT INTO contributions (member_id, month, amount, paid_at)
│  ├─ INSERT INTO transactions (type='income', category='Quỹ hàng tháng', amount, contribution_id)
│  │  └─ Auto-creates transaction entry
│  ├─ COMMIT TRANSACTION
│  └─ Revalidate /quan-ly-quy/dong-tien
│
├─ (4) Return { success: true }
│
├─ (5) Client updates UI
│  ├─ Cell turns green (paid)
│  ├─ Amount displays
│  ├─ Summary totals update
│  └─ Modal closes
│
└─ (6) Toast: "Ghi nhận đóng tiền thành công"
```

### 5. Filter & Search Flow

```
User Types in Member Name Search
│
├─ (1) onChange → updateSearchTerm(term)
│  └─ Set state (client-side, no server call)
│
├─ (2) Filter table in JavaScript
│  └─ members.filter(m => m.name.includes(term))
│
└─ (3) Re-render table immediately (instant feedback)

User Changes Status Filter
│
├─ (1) onChange → setStatusFilter(status)
│  └─ Set state (client-side)
│
├─ (2) Filter members by status
│  └─ members.filter(m => m.status === status || status === 'all')
│
└─ (3) Table updates (no server request)
```

---

## Component Architecture

### Page Components (Server Components)
Each page in `/app/quan-ly-quy/{feature}/page.tsx`:
- Fetch data via Supabase query
- Pass data to Client Components
- Wrap heavy components in Suspense

```typescript
// Server Component
export default async function MembersPage() {
  const members = await getMembers()  // Server function
  return (
    <div>
      <h1>Thành viên</h1>
      <Suspense fallback={<Skeleton />}>
        <MemberTable members={members} />  {/* Client Component */}
      </Suspense>
    </div>
  )
}
```

### Client Components (Interactive)
Located in `/components/{feature}/`:
- Handle user interactions (clicks, form input)
- Manage local state (selected rows, modal visibility)
- Call server actions for mutations

```typescript
// Client Component
'use client'
export function MemberTable({ members }) {
  const [selected, setSelected] = useState<string | null>(null)

  const handleDelete = async (id: string) => {
    const result = await deleteMember(id)
    if (result.success) {
      showToast('Xóa thành công')
    }
  }

  return <table>{/* ... */}</table>
}
```

### Server Action Layer
Located in `/app/{route}/actions.ts`:
- Pure TypeScript functions marked with `'use server'`
- Validate authorization (requireAdmin)
- Validate input (Zod schemas)
- Execute database mutations
- Revalidate related pages

```typescript
// Server Action
'use server'
export async function createMember(formData: unknown): Promise<ActionResult> {
  await requireAdmin()
  const parsed = memberSchema.safeParse(formData)
  if (!parsed.success) return { success: false, error: "..." }

  try {
    const supabase = createClient()
    const { error } = await supabase.from('members').insert(parsed.data)
    if (error) return { success: false, error: error.message }
    revalidatePath('/quan-ly-quy/thanh-vien')
    return { success: true }
  } catch (err) {
    return { success: false, error: 'Database error' }
  }
}
```

---

## Database Schema

### Members Table
```sql
CREATE TABLE members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'inactive', 'paused', 'deleted')),
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  note TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Relationships**:
- ← Contributions (1:many) via member_id
- ← Transactions (1:many) via member_id

**Soft Delete**: Set `status = 'deleted'` (not removed from table)

### Contributions Table
```sql
CREATE TABLE contributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES members(id),
  month TEXT NOT NULL,  -- 'YYYY-MM' format
  amount INTEGER NOT NULL CHECK (amount > 0),
  paid_at TIMESTAMP,
  note TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(member_id, month)  -- One entry per member per month
);
```

**Relationships**:
- → Member (many:1) via member_id
- ← Transactions (1:1) via contribution_id

**Auto-create Transaction**: Trigger on INSERT (or application logic)

### Transactions Table
```sql
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date TIMESTAMP,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  amount INTEGER NOT NULL CHECK (amount > 0),
  category TEXT NOT NULL,
  description TEXT,
  member_id UUID REFERENCES members(id),
  contribution_id UUID REFERENCES contributions(id),
  note TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_transactions_date ON transactions(date);
CREATE INDEX idx_transactions_member_id ON transactions(member_id);
CREATE INDEX idx_transactions_type ON transactions(type);
```

**Relationships**:
- → Member (many:1) via member_id (nullable)
- → Contribution (many:1) via contribution_id (nullable)

**Running Balance**: Calculated in application (not stored)

---

## RLS Policies

### Members Table
```sql
-- Public read (optional, for UI dropdowns)
CREATE POLICY "Enable read access for all authenticated users"
ON public.members FOR SELECT
USING (auth.role() = 'authenticated');

-- Authenticated write
CREATE POLICY "Enable write for authenticated users"
ON public.members FOR INSERT, UPDATE
WITH CHECK (auth.role() = 'authenticated');
```

### Contributions Table
```sql
-- Authenticated read & write
CREATE POLICY "Enable read access for authenticated users"
ON public.contributions FOR SELECT
USING (auth.role() = 'authenticated');

CREATE POLICY "Enable write for authenticated users"
ON public.contributions FOR INSERT, UPDATE
WITH CHECK (auth.role() = 'authenticated');
```

### Transactions Table
```sql
-- Authenticated read & write
CREATE POLICY "Enable read access for authenticated users"
ON public.transactions FOR SELECT
USING (auth.role() = 'authenticated');

CREATE POLICY "Enable write for authenticated users"
ON public.transactions FOR INSERT, UPDATE
WITH CHECK (auth.role() = 'authenticated');
```

---

## Authentication & Authorization

### Session Management
```typescript
// middleware.ts: Runs on every request
export async function middleware(request: NextRequest) {
  const supabase = createServerClient(...)
  await supabase.auth.getUser()  // Refresh session from cookies
  return response
}
```

### Protected Routes
```typescript
// Middleware config: Protect all routes except login, etc.
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|login).*)', ''],
}
```

### Server Action Authorization
```typescript
// Every mutation requires requireAdmin()
export async function createMember(data) {
  await requireAdmin()  // Throws if not authenticated
  // ... mutation logic
}
```

### Token Management
- **Token Type**: JWT (Supabase managed)
- **Expiration**: Long-lived (configurable in Supabase)
- **Refresh**: Automatic via middleware
- **Storage**: Secure HTTP-only cookies (Supabase handles)

---

## Error Handling

### Server-Side Errors
```typescript
// Validation Error
if (!parsed.success) {
  return { success: false, error: parsed.error.errors[0].message }
}

// Database Error
const { error } = await supabase.from(...).insert(...)
if (error) {
  if (error.code === '23505') return { success: false, error: 'Duplicate entry' }
  return { success: false, error: error.message }
}

// Unexpected Error
try { ... } catch (err) {
  return { success: false, error: 'Unexpected error' }
}
```

### Client-Side Handling
```typescript
const result = await createMember(formData)
if (result.success) {
  showToast('Thêm thành viên thành công')
  closeModal()
} else {
  showToast(result.error, 'error')  // Display error to user
}
```

### Network Errors
- Catch in server action try-catch
- Return ActionResult with error message
- User sees toast with guidance to retry

---

## Performance Optimizations

### Data Fetching
- **Parallel Queries**: Use `Promise.all()` for independent queries
- **Selective Columns**: Query only needed columns
- **Indexes**: Foreign keys indexed automatically by Supabase

```typescript
// Parallel fetches (faster than sequential)
const [income, expense, members] = await Promise.all([
  supabase.from('transactions').select('amount').eq('type', 'income'),
  supabase.from('transactions').select('amount').eq('type', 'expense'),
  supabase.from('members').select('*').eq('status', 'active'),
])
```

### Component Loading
- **Dynamic Imports**: Chart components loaded client-side
- **Suspense Boundaries**: Skeleton loaders for non-blocking UI

```typescript
const MonthlyChart = dynamic(
  () => import('@/components/dashboard/monthly-chart'),
  { ssr: false, loading: () => <Skeleton /> }
)
```

### Caching
- **Next.js Default**: Responses cached until revalidatePath() called
- **Browser Cache**: Static assets cached per deployment
- **Query Cache**: No explicit client-side caching (server-driven)

```typescript
// Invalidate cache after mutation
revalidatePath('/quan-ly-quy/thanh-vien')  // Re-fetch data on next visit
```

---

## Scaling Considerations

### Current Limits
- **Members**: 50-100 (dropdown performance)
- **Transactions**: 1000+ per year (acceptable)
- **Concurrent Users**: 5-10 (typical amateur team)

### Future Scaling
If team grows to 200+ members or multi-team:
1. **Pagination**: Add limit/offset to member lists
2. **Virtual Scrolling**: For large tables
3. **Search Optimization**: Full-text search on Supabase
4. **Denormalization**: Cache expensive aggregates (totals, balances)
5. **Separate Databases**: Multi-tenant architecture

---

## Security Measures

### Input Validation
- **Client**: React Hook Form validation for UX
- **Server**: Zod schema validation for security

### Database Security
- **RLS Enabled**: Only authenticated users can write
- **SQL Injection Prevention**: Parameterized queries (Supabase handles)
- **Audit Trail**: created_at timestamps on all records

### Authentication
- **Passwords**: Never stored in app (Supabase hashes)
- **Session**: HTTP-only cookies, not localStorage
- **HTTPS**: All traffic encrypted in transit

### API Security
- **CORS**: Supabase handles CORS headers
- **Rate Limiting**: Supabase default rate limits apply
- **DDoS Protection**: Supabase infrastructure protection

---

## Monitoring & Logging

### Application Logs
- **Console**: Toast messages for user feedback
- **Supabase Logs**: Auth logs, database query logs
- **Error Tracking**: Caught exceptions returned in ActionResult

### Database Monitoring
- **Supabase Dashboard**: Query performance, table sizes
- **Backups**: Automatic daily backups (Supabase default)
- **Replication**: Read replicas available (not configured currently)

---

## Disaster Recovery

### Data Backup
- **Automatic**: Supabase backs up daily
- **Manual**: Export from Supabase dashboard
- **Retention**: 30 days (Supabase default)

### Recovery Plan
1. **Corrupted Data**: Restore from backup (point-in-time recovery)
2. **Lost Data**: Restore from previous backup
3. **Outage**: Supabase 99.9% uptime SLA
4. **Application Deployment**: Revert to previous Vercel deployment

---

## Deployment Pipeline

```
Git Commit
  │
  ├─ GitHub Action triggers (if configured)
  │  └─ Run tests, linting
  │
├─ Vercel detects push to main
  │  ├─ Build: npm run build
  │  ├─ Deploy: Upload to Vercel edge network
  │  ├─ Environment: Load .env vars
  │  └─ Health Check: Verify deployment
  │
├─ DNS: vercel.app domain resolves to CDN
  │
└─ User visits app
   └─ Served from Vercel edge (CDN + serverless functions)
```

---

## Technology Decisions

| Decision | Rationale |
|----------|-----------|
| Next.js 14 App Router | Modern, full-stack framework with server components |
| React 18 | Latest stable, excellent performance |
| TypeScript | Type safety reduces bugs |
| Supabase | Managed database + auth, free tier sufficient |
| Tailwind CSS | Utility-first CSS, no custom CSS needed |
| React Hook Form | Lightweight, performant form handling |
| Zod | Runtime validation, good error messages |
| Recharts | Lightweight charting library |
| Server Actions | Next.js native, no separate API routes needed |

---

## Future Architecture Changes

### Potential Upgrades
1. **Database**: Migrate to PostgreSQL if Supabase insufficient
2. **API**: Separate GraphQL API for mobile app
3. **Caching**: Add Redis for expensive aggregates
4. **Search**: Full-text search integration (Elasticsearch)
5. **Events**: Message queue for async operations (Bull)
6. **Monitoring**: Sentry or DataDog for error tracking

### Breaking Changes
- Moving from Supabase to self-hosted PostgreSQL: Major refactor
- Switching to different ORM: Requires schema rewrite
- Multi-tenancy: Database schema redesign

---

## References

- **Next.js App Router**: https://nextjs.org/docs/app
- **Supabase PostgreSQL**: https://supabase.com/docs/guides/database
- **Row-Level Security**: https://supabase.com/docs/guides/auth/row-level-security
- **Server Actions**: https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations
- **React Server Components**: https://react.dev/reference/react/use

---

**Document Owner**: Development Team
**Last Updated**: March 9, 2026
**Next Review**: June 9, 2026
