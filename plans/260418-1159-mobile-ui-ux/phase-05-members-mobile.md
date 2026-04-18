# Phase 05: Members Mobile

**Priority:** P2
**Status:** done
**Effort:** 2h
**Blocked by:** Phase 01, Phase 02, Phase 03

## Overview

Replace member table with card list on mobile. Each member = one card showing name, status, total contributed.

## Key Insights

- MemberTable (212 LOC): search + status filter + table with 7 columns
- Hidden columns on mobile: joined_at (sm), note (md) — still losing info
- Member actions: edit, delete (admin only)
- Data type: `MemberWithTotal { ...Member, total_contributed: number }`
- Sorting: active → paused → inactive → alphabetical

## Requirements

### Functional
- Search bar: full-width, sticky top
- Status filter: horizontal pill tabs instead of dropdown
- Member cards: name, status badge, total contributed, joined date
- Tap card → expand to show note + actions (edit/delete)
- Admin: FAB "Thêm thành viên" button

### Non-functional
- Cards animate on expand/collapse
- Status badge colors match existing (active=green, paused=yellow, inactive=gray)

## Related Code Files

### Reference
- `components/members/member-table.tsx` (212 LOC)
- `components/members/member-form-modal.tsx` — form for add/edit
- `app/quan-ly-quy/thanh-vien/page.tsx` — data fetching

### Create
- `components/mobile/member-list.tsx` — card list view

### Modify
- `app/quan-ly-quy/thanh-vien/page.tsx` — conditional render

## Implementation Steps

1. Create `components/mobile/member-list.tsx`
   ```tsx
   // Props: { members: MemberWithTotal[], isAuthenticated?: boolean }
   // - Sticky search bar + pill filter tabs
   // - Card list: MobileCard per member
   //   - Left: name + status badge
   //   - Right: total contributed (formatted VND)
   //   - Expanded: joined_at, note, edit/delete buttons
   // - FAB: "+" button bottom-right (above bottom nav)
   // - Uses MemberFormModal for add/edit (via MobileSheet on mobile)
   ```

2. Update `app/quan-ly-quy/thanh-vien/page.tsx`
   - Create client wrapper component
   - `useIsMobile()` → MemberList (mobile) or MemberTable (desktop)

3. Handle form modal
   - Reuse existing `MemberFormModal` logic but render inside `MobileSheet` on mobile
   - Or: create separate mobile form if MemberFormModal is too coupled

4. Run `pnpm build`

## Todo List

- [ ] Create `components/mobile/member-list.tsx`
- [ ] Update page to conditional render
- [ ] Verify search + filter work on mobile
- [ ] Verify add/edit form works in mobile sheet
- [ ] Build passes

## Success Criteria

- All member data visible without horizontal scroll
- Search and filter functional
- Edit/delete actions accessible (admin only)
- Card expand/collapse smooth
