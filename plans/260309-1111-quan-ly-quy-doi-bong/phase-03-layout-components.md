# Phase 3: Layout + Sidebar + Shared Components

## Overview
- **Priority:** P1 (blocking all page implementations)
- **Status:** done
- **Effort:** 3h
- Build sidebar layout, navigation, and reusable UI components.

## Requirements

### Functional
- Collapsible sidebar with 4 nav items + icons
- Active nav item highlighted
- Login/logout button in sidebar footer
- Reusable components: Modal, Badge, Toast, Skeleton, EmptyState, ConfirmDialog, CurrencyDisplay

### Non-functional
- Responsive: sidebar collapses to hamburger on mobile
- Vietnamese labels throughout
- Tailwind only (no inline styles)

## Related Code Files

### Create
- `/app/quan-ly-quy/layout.tsx` — sidebar layout wrapper
- `/components/layout/sidebar.tsx` — sidebar nav component
- `/components/layout/breadcrumb.tsx` — breadcrumb component
- `/components/ui/modal.tsx` — reusable modal (dialog)
- `/components/ui/badge.tsx` — status badge (active/inactive/paused)
- `/components/ui/toast.tsx` — toast notification system
- `/components/ui/skeleton.tsx` — loading skeleton
- `/components/ui/empty-state.tsx` — empty state with icon + message
- `/components/ui/confirm-dialog.tsx` — confirmation dialog
- `/components/shared/currency-display.tsx` — formatted VND display
- `/components/shared/date-display.tsx` — formatted date display
- `/app/login/page.tsx` — admin login page
- `/lib/auth/require-admin.ts` — `requireAdmin()` helper for server actions
- `/lib/validations/schemas.ts` — zod schemas: memberSchema, contributionSchema, transactionSchema
- `/lib/types/action-result.ts` — `ActionResult<T>` type definition

## Implementation Steps

1. Create sidebar component with nav items:
   - Tổng quan (BarChart3 icon) → `/quan-ly-quy`
   - Thành viên (Users icon) → `/quan-ly-quy/thanh-vien`
   - Đóng tiền (Wallet icon) → `/quan-ly-quy/dong-tien`
   - Thu chi (Receipt icon) → `/quan-ly-quy/thu-chi`
   - Use `lucide-react` for icons (install)
   - Header: "Quỹ Đội Bóng" with football emoji
   - Footer: Login/Logout button
2. Create layout.tsx wrapping sidebar + main content area
   - Mobile: hamburger toggle, sidebar as overlay
   - Desktop: fixed sidebar 256px, main content with left margin
3. Create breadcrumb from pathname segments
4. Build UI components (each <80 lines):
   - **Modal**: portal-based, backdrop click to close, title/children/footer slots
   - **Badge**: variant prop for status colors (green/red/yellow)
   - **Toast**: context provider + hook `useToast()`, auto-dismiss 3s
   - **Skeleton**: pulse animation, configurable height/width
   - **EmptyState**: icon + title + description + optional action button
   - **ConfirmDialog**: extends Modal, "Xác nhận" / "Hủy" buttons, danger variant
5. Build shared components:
   - **CurrencyDisplay**: renders formatted VND with color based on income/expense
   - **DateDisplay**: renders DD/MM/YYYY format
6. Create login page:
   - Email + password form
   - Call `supabase.auth.signInWithPassword()`
   - Redirect to `/quan-ly-quy` on success
   - Error toast on failure
7. Create `requireAdmin()` helper (`/lib/auth/require-admin.ts`):
   ```ts
   export async function requireAdmin() {
     const supabase = createServerClient()
     const { data: { user }, error } = await supabase.auth.getUser()
     if (error || !user) throw new Error('Unauthorized')
     return user
   }
   ```
   Every mutating server action in Phases 4–6 must call `await requireAdmin()` as its first statement.
8. Create `/lib/types/action-result.ts`:
   ```ts
   export type ActionResult<T = void> =
     | { success: true; data?: T }
     | { success: false; error: string }
   ```
   All server actions return this type. UI components show toast based on `result.success`.
9. Create `/lib/validations/schemas.ts` with zod schemas:
   - `memberSchema` — name (string, min 1), status (enum), note (optional string)
   - `contributionSchema` — member_id (uuid), month (YYYY-MM regex), amount (positive integer), note (optional)
   - `transactionSchema` — date (optional date), type (income|expense), amount (positive integer), category (string), description (string), member_id (optional uuid), note (optional)
10. Add logout server action to sidebar:
    - Sidebar footer shows "Đăng xuất" button when user is logged in
    - Calls `supabase.auth.signOut()` then redirects to `/login`

## Todo List

- [x] Install lucide-react
- [x] Create sidebar component
- [x] Create quan-ly-quy layout with sidebar
- [x] Create breadcrumb
- [x] Create Modal component
- [x] Create Badge component
- [x] Create Toast provider + hook
- [x] Create Skeleton component
- [x] Create EmptyState component
- [x] Create ConfirmDialog component
- [x] Create CurrencyDisplay
- [x] Create DateDisplay
- [x] Create login page
- [x] Create `requireAdmin()` helper
- [x] Create `ActionResult<T>` type
- [x] Create zod validation schemas (memberSchema, contributionSchema, transactionSchema)
- [x] Add logout button to sidebar (visible when logged in)
- [x] Test responsive sidebar toggle
- [x] Verify build passes

## Success Criteria

- Sidebar renders with 4 nav items, active item highlighted
- Sidebar collapses on mobile with hamburger toggle
- All UI components render correctly in isolation
- Login page authenticates against Supabase
- Toast notifications appear and auto-dismiss
- `npm run build` passes

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| Modal focus trap accessibility | Medium | Use native `<dialog>` element or simple portal |
| Toast z-index conflicts | Low | Use fixed z-50 container |
| Sidebar state persistence | Low | Use localStorage for collapse state |
