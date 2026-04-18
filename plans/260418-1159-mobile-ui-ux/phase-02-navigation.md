# Phase 02: Mobile Navigation

**Priority:** P0 — Needed by all page phases
**Status:** done
**Effort:** 2h
**Blocked by:** Phase 01

## Overview

Create bottom tab navigation and compact mobile header. Bottom nav replaces sidebar on mobile.

## Key Insights

- Sidebar has 5 nav items: Dashboard, Thành viên, Đóng tiền, Thu chi, QR
- Same 5 items go into bottom nav — icon + short label
- Mobile header: page title + optional action button (e.g., "Thêm")
- Bottom nav must be fixed at bottom, above safe area (iOS notch)

## Requirements

### Functional
- Bottom nav: 5 tabs with icons + Vietnamese labels
- Active tab highlighted with primary color
- Mobile header: page title from breadcrumb context, action button slot
- Login/logout accessible from header menu

### Non-functional
- Bottom nav height: 56-64px
- Touch targets: ≥ 44x44px
- Safe area padding for iOS (`pb-safe` or `env(safe-area-inset-bottom)`)

## Related Code Files

### Reference
- `components/layout/sidebar.tsx` — nav items, routes, icons

### Create
- `components/mobile/bottom-nav.tsx` — fixed bottom navigation
- `components/mobile/mobile-header.tsx` — compact top header

### Modify
- `components/mobile/mobile-layout.tsx` — integrate header + bottom nav

## Implementation Steps

1. Create `components/mobile/bottom-nav.tsx`
   ```tsx
   // 5 tabs: LayoutDashboard, Users, Wallet, ArrowLeftRight, QrCode
   // Fixed bottom, z-50, bg-white border-t
   // Active: text-primary-600, Inactive: text-gray-400
   // pb-[env(safe-area-inset-bottom)] for iOS safe area
   ```

2. Create `components/mobile/mobile-header.tsx`
   ```tsx
   // Sticky top, h-14, bg-white border-b shadow-sm
   // Left: Logo/brand or back button
   // Center: Page title
   // Right: Action button slot (optional) + user menu
   ```

3. Update `components/mobile/mobile-layout.tsx`
   - Import BottomNav + MobileHeader
   - Layout: header (sticky top) + scrollable content + bottom nav (fixed bottom)
   - Content area: `pb-16` to account for bottom nav height

4. Run `pnpm build`

## Todo List

- [x] Create `components/mobile/bottom-nav.tsx`
- [x] Create `components/mobile/mobile-header.tsx`
- [x] Update `components/mobile/mobile-layout.tsx`
- [x] Verify navigation works on all routes
- [x] Verify active tab state
- [x] Build passes

## Success Criteria

- Bottom nav shows on mobile, hidden on desktop
- Active tab matches current route
- Header shows correct page title
- All 5 pages accessible via bottom nav
- Safe area padding on iOS
