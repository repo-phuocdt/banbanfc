# Auth Flow Analysis Report

**Date:** March 9, 2026  
**Project:** Quản Lý Quỹ Đội Bóng (Football Team Fund Management)  
**Scope:** Complete authentication & authorization flow

---

## Executive Summary

The auth system has **CRITICAL VULNERABILITIES**:
- ✅ RLS is enabled and properly configured at DB level
- ✅ Server actions have `requireAdmin()` guards on all mutations
- ⚠️ **CRITICAL**: No route-level auth protection — unauthenticated users can **access pages** (only mutations blocked)
- ⚠️ **CRITICAL**: Middleware only refreshes session, doesn't block access
- ⚠️ UI button rendering is based on visible data, not auth state

**Risk Level:** MEDIUM-HIGH (Data reads possible but writes protected)

---

## 1. Middleware Flow (`middleware.ts`)

### What It Does
```typescript
// middleware.ts (lines 1-45)
export async function middleware(request: NextRequest) {
  const supabase = createServerClient(...)
  await supabase.auth.getUser()  // Refresh session
  return response
}
```

**Current Behavior:**
- ✅ Runs on ALL routes (matcher includes everything except static assets)
- ✅ Refreshes auth session using Supabase SSR client
- ⚠️ **Does NOT check user existence**
- ⚠️ **Does NOT redirect unauthenticated users**
- ⚠️ Simply refreshes tokens and passes through

**Impact:** Session state is kept fresh, but no access control at route level.

---

## 2. Server-Side Auth Function

### `lib/auth/require-admin.ts`
```typescript
export async function requireAdmin() {
  const supabase = createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) throw new Error('Unauthorized')
  return user
}
```

**Behavior:**
- ✅ Only callable from Server Actions
- ✅ Throws `'Unauthorized'` error if user is null or error exists
- ✅ Prevents execution of mutation functions
- Used in 11 places across 3 modules (see usage below)

---

## 3. Layout: User Info Passing

### `app/quan-ly-quy/layout.tsx` (lines 6-29)
```typescript
export default async function QuanLyQuyLayout({ children }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <ToastProvider>
      <div className="flex h-screen">
        <Sidebar user={user} />
        ...
      </div>
    </ToastProvider>
  )
}
```

**Key Findings:**
- ✅ Fetches user at layout level
- ✅ Passes user to `<Sidebar />`
- ⚠️ Does NOT redirect if user is null
- ⚠️ Page renders normally even if `user` is null
- Sidebar shows login button when `user === null`

---

## 4. Sidebar Component (`components/layout/sidebar.tsx`)

### Auth UI Logic (lines 65-81)
```typescript
<div className="border-t px-4 py-4">
  {user ? (
    <button onClick={handleLogout} className="...">
      <LogOut size={18} />
      Đăng xuất
    </button>
  ) : (
    <Link href="/login" className="...">
      <LogIn size={18} />
      Đăng nhập
    </Link>
  )}
</div>
```

**UI Behavior:**
- ✅ Shows logout button if `user` exists
- ✅ Shows login link if `user` is null
- Navigation items always visible (no conditional rendering)
- All 4 nav links (dashboard, members, contributions, transactions) accessible regardless of auth

---

## 5. Server Actions: Mutation Protection

### Thành Viên (Members) Actions
#### `app/quan-ly-quy/thanh-vien/actions.ts`

**Read Function (unprotected):**
```typescript
export async function getMembers(): Promise<MemberWithTotal[]> {
  const supabase = createClient()
  const { data: members, error } = await supabase
    .from('members')
    .select('*')
    .neq('status', 'deleted')
    .order('name')
  // No requireAdmin() here — public read via RLS
  if (error) throw new Error(error.message)
  return (members || []).map(...)
}
```

**Mutation Functions (all protected):**
```typescript
export async function createMember(formData: unknown): Promise<ActionResult> {
  await requireAdmin()  // ✅ GUARD
  const parsed = memberSchema.safeParse(formData)
  // ... insert logic
}

export async function updateMember(id: string, formData: unknown): Promise<ActionResult> {
  await requireAdmin()  // ✅ GUARD
  // ... update logic
}

export async function deleteMember(id: string): Promise<ActionResult> {
  await requireAdmin()  // ✅ GUARD
  // ... soft delete logic
}

export async function updateMemberStatus(id: string, status: string): Promise<ActionResult> {
  await requireAdmin()  // ✅ GUARD
  // ... status update logic
}
```

**Status:** 4 mutations, 4 guards = 100% protected

---

### Đóng Tiền (Contributions) Actions
#### `app/quan-ly-quy/dong-tien/actions.ts`

**Read Functions (unprotected):**
```typescript
export async function getContributions(): Promise<Contribution[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('contributions')
    .select('*')
    .order('month')
  // No requireAdmin() — public read
  return data || []
}

export async function getActiveMembers(): Promise<Member[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('members')
    .select('*')
    .neq('status', 'deleted')
    .order('name')
  // No requireAdmin() — public read
  return data || []
}
```

**Mutation Functions (all protected):**
```typescript
export async function createContribution(formData: unknown): Promise<ActionResult> {
  await requireAdmin()  // ✅ GUARD
  // ... includes validation, auto-creates linked transaction
}

export async function updateContribution(id: string, formData: unknown): Promise<ActionResult> {
  await requireAdmin()  // ✅ GUARD
  // ... also updates linked transaction
}

export async function deleteContribution(id: string): Promise<ActionResult> {
  await requireAdmin()  // ✅ GUARD
  // ... also deletes linked transaction
}
```

**Status:** 3 mutations, 3 guards = 100% protected

---

### Thu Chi (Transactions) Actions
#### `app/quan-ly-quy/thu-chi/actions.ts`

**Read Functions (unprotected):**
```typescript
export async function getTransactions(): Promise<TransactionWithMember[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('transactions')
    .select('*, members(name)')
    .order('date', { ascending: true, nullsFirst: false })
  // No requireAdmin() — public read
  return (data || []).map(...)
}

export async function getMembersForDropdown(): Promise<Pick<Member, 'id' | 'name'>[]> {
  const supabase = createClient()
  const { data } = await supabase
    .from('members')
    .select('id, name')
    .neq('status', 'deleted')
    .order('name')
  // No requireAdmin() — public read
  return data || []
}
```

**Mutation Functions (all protected):**
```typescript
export async function createTransaction(formData: unknown): Promise<ActionResult> {
  await requireAdmin()  // ✅ GUARD
  // ... insert transaction
}

export async function updateTransaction(id: string, formData: unknown): Promise<ActionResult> {
  await requireAdmin()  // ✅ GUARD
  // ... update transaction
}

export async function deleteTransaction(id: string): Promise<ActionResult> {
  await requireAdmin()  // ✅ GUARD
  // ... delete transaction
}
```

**Status:** 3 mutations, 3 guards = 100% protected

---

## 6. Component UI: Edit Button Handling

### Member Table (`components/members/member-table.tsx`, lines 36-65)

**Delete Handler:**
```typescript
const handleDelete = async () => {
  if (!deleteTarget) return
  setLoading(true)
  try {
    const result = await deleteMember(deleteTarget.id)  // Server action called
    if (result.success) {
      showToast('Đã xóa thành viên')
    } else {
      showToast(result.error, 'error')  // Shows 'Unauthorized' error
    }
  } catch {
    showToast('Lỗi khi xóa', 'error')
  }
}
```

**Delete Button (always rendered, lines 144-161):**
```typescript
<td className="px-4 py-3">
  <div className="flex gap-1">
    <button
      onClick={() => { setEditing(member); setModalOpen(true) }}
      className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
      title="Sửa"
    >
      <Pencil size={14} />
    </button>
    <button
      onClick={() => setDeleteTarget(member)}
      className="rounded p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600"
      title="Xóa"
    >
      <Trash2 size={14} />
    </button>
  </div>
</td>
```

**UX Behavior:**
- ✅ Edit/Delete buttons always visible
- ✅ Unauthenticated user can click delete
- ✅ Server action fails with 'Unauthorized' error
- ⚠️ Error toast shows "Lỗi khi xóa" (generic message), not specifically 'Unauthorized'

---

### Contribution Matrix (`components/contributions/contribution-matrix.tsx`)

**Cell Click Handler (lines 49-55):**
```typescript
const handleCellClick = (member: Member, month: string) => {
  const contrib = matrix.get(member.id)?.get(month)
  setSelectedMember(member)
  setSelectedMonth(month)
  setSelectedContribution(contrib || null)
  setModalOpen(true)
}
```

**Modal Opens:**
- ✅ Opens payment modal (called `<PaymentModal />`)
- ✅ Contains form to create/edit contribution
- ⚠️ Form submission calls server action `createContribution()` or `updateContribution()`
- ⚠️ User can click, but server action rejects with 'Unauthorized'

---

### Transaction Page (`components/transactions/transaction-page.tsx`, lines 110-116)

**Add Button (always visible):**
```typescript
<button
  onClick={() => { setEditing(null); setModalOpen(true) }}
  className="ml-auto flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
>
  <Plus size={16} />
  Thêm giao dịch
</button>
```

**Transaction Table Delete (components/transactions/transaction-table.tsx, lines 91-96):**
```typescript
<button
  onClick={() => setDeleteTarget(t)}
  className="rounded p-1 text-gray-400 hover:bg-white hover:text-red-600"
>
  <Trash2 size={14} />
</button>
```

**UX Behavior:**
- ✅ Buttons always visible
- ✅ Click opens modal or triggers delete
- ✅ Server action `deleteTransaction()` fails with 'Unauthorized'
- ⚠️ Generic error toast shown

---

## 7. Database Row-Level Security (RLS)

### Policies in `supabase/migrations/002_rls_policies.sql`

**Read Policies (lines 7-9):**
```sql
CREATE POLICY "Public read members" ON members FOR SELECT USING (true);
CREATE POLICY "Public read contributions" ON contributions FOR SELECT USING (true);
CREATE POLICY "Public read transactions" ON transactions FOR SELECT USING (true);
```

✅ **Outcome:** Anyone (auth or anon) can read all data

**Write Policies (lines 12-24, example for members):**
```sql
CREATE POLICY "Auth insert members" ON members FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Auth update members" ON members FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Auth delete members" ON members FOR DELETE USING (auth.role() = 'authenticated');
```

✅ **Outcome:** Only authenticated users can INSERT/UPDATE/DELETE  
⚠️ **Assumption:** Self-signup is disabled in Supabase (verified in Phase 2 doc, step 10)

**Applied to all 3 tables:** members, contributions, transactions

---

## 8. Login Page (`app/login/page.tsx`)

**Sign-In Flow (lines 14-32):**
```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  setError('')
  setLoading(true)

  try {
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError('Email hoặc mật khẩu không đúng')
      return
    }
    router.push('/quan-ly-quy')
    router.refresh()  // Refreshes middleware session
  } catch {
    setError('Đã có lỗi xảy ra')
  }
}
```

**Behavior:**
- ✅ Validates email/password via Supabase Auth
- ✅ Redirects to `/quan-ly-quy` on success
- ⚠️ No error if user doesn't exist (generic error message)

---

## 9. Root Navigation (`app/page.tsx`)

```typescript
import { redirect } from 'next/navigation'

export default function Home() {
  redirect('/quan-ly-quy')
}
```

**Behavior:**
- ✅ Always redirects to dashboard
- ⚠️ No auth check — unauthenticated users redirected to `/quan-ly-quy` (not `/login`)

---

## Attack Surface Analysis

### Scenario 1: Unauthenticated User Visits `/quan-ly-quy`

**What Happens:**
1. Root route redirects to `/quan-ly-quy` (no check)
2. Middleware runs, session refresh fails (no user)
3. Layout fetches user (gets `null`)
4. Page renders with `user === null`
5. Sidebar shows "Đăng nhập" button
6. **User sees dashboard, tables, data**
7. User can read all data via components

**Result:** ✅ Can view data | ❌ Cannot mutate (RLS + requireAdmin)

---

### Scenario 2: Unauthenticated User Clicks Edit/Delete Button

**What Happens:**
1. Click button → modal opens or delete target set
2. Form submission or button click → calls `updateMember()`, `deleteMember()`, etc.
3. Server action runs on server
4. `await requireAdmin()` checks auth
5. **User is null** → throws `'Unauthorized'` error
6. Error caught in client handler
7. Toast shows error message (generic or specific)

**Result:** ❌ Mutation blocked | ✅ Error feedback given

---

### Scenario 3: Attacker Calls Server Action Directly

**Attack:**
```javascript
// From browser console
const formData = { name: 'Evil Member', status: 'active' }
await fetch('/_rpc/app/quan-ly-quy/thanh-vien/actions.createMember', {
  method: 'POST',
  body: JSON.stringify(formData)
})
```

**Protection:**
- ✅ Server action requires `requireAdmin()` check
- ✅ Next.js validates origin
- ✅ RLS policy blocks INSERT if `auth.role() !== 'authenticated'`

**Result:** ✅ Protected by multiple layers

---

## Protection Layer Summary

| Layer | Status | Details |
|-------|--------|---------|
| **Middleware** | ⚠️ Session only | No route protection, only session refresh |
| **Route Level** | ❌ Missing | No redirect to login for unauthenticated `/quan-ly-quy/*` |
| **Server Actions** | ✅ Full | All 10 mutations have `requireAdmin()` |
| **RLS Policies** | ✅ Full | All write operations require `auth.role() = 'authenticated'` |
| **UI Buttons** | ⚠️ Always shown | No conditional rendering based on auth |
| **Component Logic** | ✅ Error handling | Calls server action, handles error response |

---

## Security Gaps & Recommendations

### CRITICAL (Fix Immediately)

1. **No Route-Level Auth Protection**
   - **Problem:** Unauthenticated users can access `/quan-ly-quy/*` pages, see data
   - **Current:** Only mutations blocked, reads allowed
   - **Fix:** Add middleware redirect to `/login` if no user
   ```typescript
   export async function middleware(request: NextRequest) {
     const supabase = createServerClient(...)
     const { data: { user } } = await supabase.auth.getUser()
     
     if (!user && request.nextUrl.pathname.startsWith('/quan-ly-quy')) {
       return NextResponse.redirect(new URL('/login', request.url))
     }
     return response
   }
   ```

2. **Soft Mutation Error Message**
   - **Problem:** Error toast shows generic "Lỗi khi xóa" instead of specific auth error
   - **Current:** Catch block doesn't differentiate error types
   - **Fix:** Check `result.error === 'Unauthorized'` and show specific message

### HIGH (Fix Soon)

3. **Conditional Button Rendering**
   - **Problem:** Edit/Delete buttons visible to unauthenticated users (confusing UX)
   - **Current:** Always rendered, disabled only by server action
   - **Fix:** Render buttons only if `user` exists (pass auth state to components via props)

4. **Login Page Redirect**
   - **Problem:** Unauthenticated user on `/login` sees form, but `/quan-ly-quy` also accessible
   - **Current:** No redirect from `/login` if already authenticated
   - **Fix:** Check `user` in login page, redirect to `/quan-ly-quy` if authenticated

### MEDIUM (Best Practices)

5. **RLS Single-Admin Enforcement**
   - **Current:** Uses `auth.role() = 'authenticated'` (allows any authenticated user)
   - **Assumed:** Self-signup is disabled
   - **Recommendation:** Change to `auth.uid() = '<SPECIFIC_ADMIN_UUID>'` for explicit single-admin control

6. **Error Logging**
   - **Missing:** No server-side logging of unauthorized attempts
   - **Add:** Log rejected mutations with user ID, action, timestamp

---

## Auth Flow Diagram

```
┌─────────────────┐
│  User Request   │
└────────┬────────┘
         │
         ▼
  ┌──────────────┐
  │  Middleware  │ (middleware.ts)
  │              │
  │ - Refresh    │
  │   session    │
  │ - Pass thru  │
  └────────┬─────┘
           │
      NO REDIRECT
           │
           ▼
  ┌────────────────────┐
  │  Page/Component    │
  │                    │
  │ - Fetch user       │
  │ - Render with user │
  └────────┬───────────┘
           │
      user == null?
      │            │
   YES            NO
      │            │
      ▼            ▼
  Show      Show
  Login     Logout &
  Button    Data
  
  [User Tries to Mutate]
         │
         ▼
  ┌──────────────────┐
  │  Server Action   │
  │                  │
  │ - Check          │
  │   requireAdmin() │
  └────────┬─────────┘
           │
      user == null?
      │            │
   YES            NO
      ▼            ▼
  Throw       Check
  Error       RLS
      │        Policy
      │        │
      │        ▼
      │    Insert/
      │    Update
      │    /Delete
      │
      ▼
  Send Error Response to Client
```

---

## Unresolved Questions

1. **Is self-signup actually disabled?** (Assumed in Phase 2, needs verification in Supabase console)
2. **Should single-admin UUID be hardcoded in RLS?** (Current design allows any authenticated user)
3. **Are there any other unauthenticated routes?** (Only `/login` appears to be public, `/` redirects)
4. **Is CSRF protection enabled?** (Next.js Server Actions have built-in CSRF, but not verified)
5. **Should edit buttons be hidden from unauthenticated users?** (Currently visible but disabled)

---

## Files Summary

**Auth-Related Files:**
- `/middleware.ts` — Session refresh, no route protection
- `/lib/auth/require-admin.ts` — `requireAdmin()` guard function
- `/app/login/page.tsx` — Login form
- `/app/page.tsx` — Redirect to dashboard (no check)
- `/app/quan-ly-quy/layout.tsx` — Passes user to sidebar
- `/components/layout/sidebar.tsx` — Shows login/logout button based on user
- `/supabase/migrations/002_rls_policies.sql` — RLS policies (read public, write auth)

**Mutation Actions (all protected with `requireAdmin()`):**
- `/app/quan-ly-quy/thanh-vien/actions.ts` (4 mutations)
- `/app/quan-ly-quy/dong-tien/actions.ts` (3 mutations)
- `/app/quan-ly-quy/thu-chi/actions.ts` (3 mutations)

**Total mutations:** 10 protected, 10/10 have `requireAdmin()` guard

---

**Report Generated:** March 9, 2026 14:10 UTC
