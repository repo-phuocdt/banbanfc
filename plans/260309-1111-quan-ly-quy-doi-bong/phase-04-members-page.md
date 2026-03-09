# Phase 4: Members Page (Thành Viên)

## Overview
- **Priority:** P1
- **Status:** done
- **Effort:** 3h
- CRUD table for team members with status management, search, filter.

## Context
- Path: `/quan-ly-quy/thanh-vien`
- Simplest CRUD page — build first to establish patterns for other pages.

## Requirements

### Functional
- Table: STT, Họ tên, Trạng thái, Ngày tham gia, Tổng đã đóng, Ghi chú, Actions
- Status badges: green (Đang hoạt động), red (Đã nghỉ), yellow (Tạm nghỉ)
- Inactive members: muted text + strikethrough name
- "Thêm thành viên" button → modal with form
- Edit member → modal (reuse same form)
- Change status via dropdown in actions
- Search by name, filter by status
- Confirmation dialog before delete

### Non-functional
- Loading skeleton while fetching
- Empty state when no members
- Toast on CRUD success/error
- Alternating row colors

## Related Code Files

### Create
- `/app/quan-ly-quy/thanh-vien/page.tsx` — page component (Server Component, fetches data)
- `/components/members/member-table.tsx` — client component, table + search/filter
- `/components/members/member-form-modal.tsx` — add/edit member modal
- `/app/quan-ly-quy/thanh-vien/actions.ts` — server actions (CRUD)

## Architecture

```
page.tsx (Server) → fetch members + contribution sums
  └── MemberTable (Client)
        ├── search/filter controls
        ├── table rows
        ├── MemberFormModal (add/edit)
        └── ConfirmDialog (delete)
```

## Implementation Steps

1. Create server actions in `actions.ts`:
   - `getMembers()` — fetch all members with total contribution sum (LEFT JOIN contributions, GROUP BY)
   - `createMember(data)` — insert member
   - `updateMember(id, data)` — update member
   - `deleteMember(id)` — delete member (cascade deletes contributions)
   - `updateMemberStatus(id, status)` — quick status change
2. Create `page.tsx`:
   - Fetch members via server action
   - Pass to MemberTable client component
3. Create `MemberTable`:
   - State: searchQuery, statusFilter, modalOpen, editingMember
   - Filter logic: name includes search (case-insensitive), status matches filter
   - Table columns with proper formatting
   - Row styling: inactive = `opacity-50 line-through` on name
   - Actions column: Edit button, Status dropdown, Delete button
4. Create `MemberFormModal`:
   - React Hook Form with fields: name (required), status (dropdown), note
   - Validates name not empty
   - On submit: call createMember or updateMember action
   - Close modal + show toast on success
   - Revalidate page data after mutation
5. Wire up delete with ConfirmDialog
6. Add loading skeleton in page.tsx (Suspense)

## Todo List

- [x] Create server actions (CRUD)
- [x] Create page.tsx with data fetching
- [x] Create MemberTable with search/filter
- [x] Create MemberFormModal (add/edit)
- [x] Wire up status change dropdown
- [x] Wire up delete with confirmation
- [x] Add loading skeleton
- [x] Add empty state
- [x] Test all CRUD operations
- [x] Verify contribution sum displays correctly

## Success Criteria

- All 31 seeded members display in table
- Search filters by name in real-time
- Status filter shows correct subset
- Add member → appears in table immediately
- Edit member → changes reflect immediately
- Delete member → removed with confirmation
- Inactive members show muted/strikethrough style
- "Tổng đã đóng" column shows correct sum from contributions table

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| Revalidation after mutation | Medium | Use `revalidatePath()` in server actions |
| Duplicate member names | Low | Show warning toast, no hard constraint |
| Cascade delete removes contributions | Medium | ConfirmDialog warns "sẽ xóa toàn bộ lịch sử đóng tiền" |
