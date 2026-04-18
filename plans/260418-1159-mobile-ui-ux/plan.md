---
title: "Mobile UI/UX - Dual Layout"
description: "Giữ desktop nguyên, tạo UI/UX mobile riêng biệt với Headless UI + Tailwind"
status: in-progress
priority: P2
effort: 16h
branch: feat/mobile-ui
tags: [mobile, ui-ux, headless-ui, tailwind, responsive]
created: 2026-04-18
---

# Mobile UI/UX — Dual Layout Implementation Plan

## Summary

Tạo bộ mobile components riêng biệt cho tất cả pages. Desktop giữ nguyên 100%. Mobile render components chuyên dụng qua `useIsMobile()` hook. Thêm bottom navigation, card lists thay tables, bottom sheet thay modals.

## Brainstorm Report
- [brainstorm-260418-1159-mobile-ui-ux.md](../reports/brainstorm-260418-1159-mobile-ui-ux.md)

## Strategy
```
Desktop (≥ 768px): Existing components — ZERO changes
Mobile  (< 768px): Dedicated mobile components
```

## Phases

| # | Phase | Status | Effort | Files |
|---|-------|--------|--------|-------|
| 01 | [Foundation](phase-01-foundation.md) | done | 2h | hook, install, layout shell |
| 02 | [Navigation](phase-02-navigation.md) | done | 2h | bottom-nav, mobile-header |
| 03 | [Shared Mobile UI](phase-03-shared-mobile-ui.md) | done | 2h | bottom-sheet, card-item |
| 04 | [Dashboard Mobile](phase-04-dashboard-mobile.md) | done | 2h | summary, chart, recent |
| 05 | [Members Mobile](phase-05-members-mobile.md) | done | 2h | member card list, form |
| 06 | [Transactions Mobile](phase-06-transactions-mobile.md) | done | 2h | transaction card list, form |
| 07 | [Contributions Mobile](phase-07-contributions-mobile.md) | done | 2h | grouped contribution view |
| 08 | [QR Codes Mobile](phase-08-qr-codes-mobile.md) | done | 2h | QR card list |

## Dependencies
- Phase 01 → all other phases
- Phase 02 → Phase 04-08 (navigation needed first)
- Phase 03 → Phase 05-08 (shared UI components)

## Key Decisions
- Breakpoint: 768px (Tailwind `md:`)
- `useIsMobile()` returns `null` on SSR → show skeleton to avoid hydration mismatch
- Headless UI for Dialog (bottom sheet), Listbox (select), Transition (animations)
- Data fetching stays in Server Component pages — mobile components receive same props
