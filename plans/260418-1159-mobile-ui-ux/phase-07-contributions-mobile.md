# Phase 07: Contributions Mobile

**Priority:** P2
**Status:** done
**Effort:** 2h
**Blocked by:** Phase 01, Phase 02, Phase 03

## Overview

Replace contribution matrix (member × month table) with grouped list view on mobile. Matrix is the most challenging component for mobile.

## Key Insights

- ContributionMatrix (212 LOC): horizontal scrolling table with sticky headers
- Structure: rows = members, columns = months (YYYY-MM)
- Cells: contribution amount or empty (click to record payment)
- Current mobile: horizontal scroll with sticky first column — functional but clunky
- Data: `contributions: Contribution[], members: Member[]`
- Matrix built from: `Map<member_id, Map<month, Contribution>>`

## Requirements

### Functional
- **View mode toggle**: "Theo tháng" (by month) / "Theo thành viên" (by member)
- By month: select month dropdown → list all members with paid/unpaid status
- By member: select member → show all months with paid/unpaid status
- Tap unpaid item → record payment (admin only via MobileSheet)
- Summary: total collected / expected for selected month

### Non-functional
- Default view: current month, "Theo tháng" mode
- Clear visual distinction: paid (green check) vs unpaid (gray/red)
- Month selector: horizontal scrollable pills

## Related Code Files

### Reference
- `components/contributions/contribution-matrix.tsx` (212 LOC)
- `components/contributions/payment-modal.tsx` — payment recording form
- `app/quan-ly-quy/dong-tien/page.tsx` — data fetching

### Create
- `components/mobile/contribution-view.tsx` — grouped list view

### Modify
- `app/quan-ly-quy/dong-tien/page.tsx` — conditional render

## Implementation Steps

1. Create `components/mobile/contribution-view.tsx`
   ```tsx
   // Props: { contributions: Contribution[], members: Member[], isAuthenticated?: boolean }
   // State: viewMode ('by-month' | 'by-member'), selectedMonth, selectedMember
   //
   // By Month view:
   //   - Month selector: horizontal scroll pills (current month default)
   //   - Member list:
   //     - Paid: name + amount + date + green check
   //     - Unpaid: name + "Chưa đóng" + tap to pay (admin)
   //   - Summary card: X/Y members paid, total amount
   //
   // By Member view:
   //   - Member selector: dropdown or search
   //   - Month list: vertical cards
   //     - Paid months: green, amount + date
   //     - Unpaid months: gray, "Chưa đóng"
   //   - Summary: total contributed
   ```

2. Update `app/quan-ly-quy/dong-tien/page.tsx`
   - Create client wrapper
   - `useIsMobile()` → ContributionView (mobile) or ContributionMatrix (desktop)

3. Payment flow on mobile
   - Tap unpaid item → open MobileSheet with payment form
   - Reuse PaymentModal logic, render in MobileSheet

4. Run `pnpm build`

## Todo List

- [ ] Create `components/mobile/contribution-view.tsx`
- [ ] Implement "by month" view
- [ ] Implement "by member" view
- [ ] Implement month selector pills
- [ ] Update page for conditional render
- [ ] Verify payment recording works
- [ ] Build passes

## Success Criteria

- Contribution data fully accessible without horizontal scroll
- Both view modes functional
- Payment recording works for admins
- Summary stats visible
- Month navigation intuitive

## Risk Assessment

| Risk | Severity | Mitigation |
|------|----------|------------|
| Complex data transformation | Medium | Reuse matrix building logic from existing component |
| Many months to display | Low | Horizontal scroll pills + default to current month |
