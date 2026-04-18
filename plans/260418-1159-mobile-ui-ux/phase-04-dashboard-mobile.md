# Phase 04: Dashboard Mobile

**Priority:** P2
**Status:** done
**Effort:** 2h
**Blocked by:** Phase 01, Phase 02

## Overview

Mobile-optimized dashboard with stacked summary cards, compact chart, and recent transactions list.

## Key Insights

- Current `SummaryCards`: 4 cards in `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4` — already OK on mobile
- `MonthlyChart`: `h-[250px] sm:h-[300px]` — needs touch-friendly tooltips
- `RecentTransactions`: table with hidden columns — replace with card list
- Dashboard page fetches: totalIncome, totalExpense, activeMembers, monthlyData, recentTransactions

## Requirements

### Functional
- Summary cards: 2x2 grid, larger text
- Chart: full-width, touch-friendly (tap instead of hover for tooltips)
- Recent transactions: card list instead of table, show type + amount + description
- Quick action: FAB or prominent "Thêm giao dịch" button

### Non-functional
- Cards should be visually distinct with color coding
- Chart height: 200px on mobile

## Related Code Files

### Reference
- `components/dashboard/summary-cards.tsx` (37 LOC)
- `components/dashboard/monthly-chart.tsx`
- `components/dashboard/recent-transactions.tsx`
- `app/quan-ly-quy/page.tsx` — data fetching

### Create
- `components/mobile/dashboard-mobile.tsx` — mobile dashboard view

### Modify
- `app/quan-ly-quy/page.tsx` — conditional render mobile vs desktop

## Implementation Steps

1. Create `components/mobile/dashboard-mobile.tsx`
   ```tsx
   // Props: same as desktop dashboard data
   // Layout: vertical stack
   //   - 2x2 summary cards (compact, colored borders)
   //   - Monthly chart (h-[200px], full width)
   //   - Recent transactions as card list
   //     Each card: date + description + amount (color-coded)
   ```

2. Update `app/quan-ly-quy/page.tsx`
   - Page is Server Component — cannot use hooks directly
   - Create `DashboardContent` client wrapper
   - `useIsMobile()` → render DashboardMobile or existing desktop components

3. Run `pnpm build`

## Todo List

- [ ] Create `components/mobile/dashboard-mobile.tsx`
- [ ] Create client wrapper in page or separate component
- [ ] Verify chart renders correctly on mobile width
- [ ] Build passes

## Success Criteria

- Dashboard readable on 375px width
- Summary metrics prominent and color-coded
- Recent transactions show essential info without table
- Chart touch-friendly
