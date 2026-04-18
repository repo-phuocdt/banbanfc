# Phase 03: Shared Mobile UI Components

**Priority:** P1
**Status:** done
**Effort:** 2h
**Blocked by:** Phase 01

## Overview

Create reusable mobile UI primitives: bottom sheet (replaces modal), card item (replaces table row), and mobile-optimized form controls.

## Key Insights

- Current `Modal` uses HTML `<dialog>` — works but not optimized for mobile
- Headless UI `Dialog` + `Transition` provides better mobile UX (slide-up, backdrop)
- Card items need consistent layout: primary info + secondary info + action
- Form inputs need larger touch targets on mobile (h-12 vs h-10)

## Requirements

### Functional
- Bottom sheet: slide-up from bottom, full width, swipeable close area
- Card item: generic card with title, subtitle, metadata, actions
- Mobile form wrapper: larger inputs, stacked layout

### Non-functional
- Bottom sheet max height: 90vh
- Smooth 300ms transitions
- Card tap feedback (active state)

## Related Code Files

### Reference
- `components/ui/modal.tsx` — current modal (47 LOC)

### Create
- `components/mobile/mobile-sheet.tsx` — Headless UI bottom sheet
- `components/mobile/mobile-card.tsx` — reusable card for list items

## Implementation Steps

1. Create `components/mobile/mobile-sheet.tsx`
   ```tsx
   // Headless UI Dialog + Transition
   // Props: { open, onClose, title, children, footer? }
   // Slide up from bottom, rounded-t-2xl
   // Drag handle bar at top (visual cue)
   // Max height 90vh, overflow-y-auto for content
   // Backdrop: bg-black/50
   ```

2. Create `components/mobile/mobile-card.tsx`
   ```tsx
   // Reusable card wrapper for list items
   // Props: { children, onClick?, className? }
   // bg-white rounded-xl shadow-card p-4
   // Active state: active:bg-gray-50
   // Optional chevron right icon when clickable
   ```

3. Run `pnpm build`

## Todo List

- [ ] Create `components/mobile/mobile-sheet.tsx`
- [ ] Create `components/mobile/mobile-card.tsx`
- [ ] Verify Headless UI Dialog works with existing setup
- [ ] Build passes

## Success Criteria

- Bottom sheet slides up smoothly
- Sheet closes on backdrop click
- Card items render consistently
- All components accessible (keyboard + screen reader)
