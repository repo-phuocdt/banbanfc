# Phase 01: Foundation

**Priority:** P0 — Blocks all other phases
**Status:** done
**Effort:** 2h

## Overview

Install Headless UI, create `useIsMobile()` hook, update layout to support dual rendering.

## Key Insights

- Next.js SSR renders on server where `window` is undefined — hook must return `null` initially
- Tailwind `md:` breakpoint = 768px — use same value in hook for consistency
- Layout (`app/quan-ly-quy/layout.tsx`) wraps all pages — ideal place for mobile/desktop split
- Sidebar currently handles its own mobile hamburger — mobile layout will replace this entirely

## Requirements

### Functional
- `useIsMobile()` hook: SSR-safe, returns `boolean | null`
- Mobile layout wrapper: hides sidebar, shows mobile header + bottom nav
- Desktop layout: unchanged

### Non-functional
- No hydration mismatch warnings
- Hook must debounce resize events
- Skeleton shown during SSR → client hydration

## Architecture

```
app/quan-ly-quy/layout.tsx
  ├─ Desktop (≥768px): Sidebar + main content (existing)
  └─ Mobile (<768px): MobileHeader + main content + BottomNav (new)

hooks/use-is-mobile.ts → shared hook
```

## Related Code Files

### Modify
- `app/quan-ly-quy/layout.tsx` — wrap children with mobile/desktop conditional
- `package.json` — add @headlessui/react

### Create
- `hooks/use-is-mobile.ts` — breakpoint detection hook
- `components/mobile/mobile-layout.tsx` — mobile shell (header + content + bottom nav)

## Implementation Steps

1. Install `@headlessui/react`
   ```bash
   pnpm add @headlessui/react
   ```

2. Create `hooks/use-is-mobile.ts`
   ```tsx
   'use client';
   import { useState, useEffect } from 'react';

   const MOBILE_BREAKPOINT = 768;

   export function useIsMobile(): boolean | null {
     const [isMobile, setIsMobile] = useState<boolean | null>(null);

     useEffect(() => {
       const check = () => setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
       check();
       window.addEventListener('resize', check);
       return () => window.removeEventListener('resize', check);
     }, []);

     return isMobile;
   }
   ```

3. Create `components/mobile/mobile-layout.tsx`
   - Client component wrapping: MobileHeader + children + BottomNav
   - Placeholder components for header/nav (built in Phase 02)

4. Update `app/quan-ly-quy/layout.tsx`
   - Import `useIsMobile` — BUT layout is Server Component
   - Solution: Create a `LayoutShell` client component that wraps children
   - Server layout fetches user, passes to `LayoutShell`
   - `LayoutShell` uses `useIsMobile()` to decide Sidebar vs MobileLayout
   - When `isMobile === null` (SSR): render skeleton

5. Run `pnpm build` to verify no TypeScript errors

## Todo List

- [x] Install @headlessui/react
- [x] Create `hooks/use-is-mobile.ts`
- [x] Create `components/mobile/mobile-layout.tsx` (shell)
- [x] Create `components/layout/layout-shell.tsx` (client wrapper)
- [x] Update `app/quan-ly-quy/layout.tsx` to use LayoutShell
- [x] Verify build passes
- [x] Verify desktop UI unchanged

## Success Criteria

- `useIsMobile()` returns correct value on resize
- No SSR hydration mismatch
- Desktop layout identical to current
- Mobile shows placeholder layout shell
- Build passes

## Risk Assessment

| Risk | Severity | Mitigation |
|------|----------|------------|
| Hydration mismatch | Medium | Return `null` on server, show skeleton |
| Layout flash on load | Low | CSS `@media` for initial render, JS takes over |
| Sidebar state lost | Low | Mobile layout is separate — sidebar untouched |
