# Brainstorm: Mobile UI/UX - Dual Layout Approach

**Date:** 2026-04-18
**Status:** Approved
**Scope:** Tối ưu nhẹ — giữ desktop nguyên, tạo UI/UX mobile riêng

---

## Problem Statement

Ban Ban FC fund management app hiện có responsive cơ bản (hamburger menu, hidden columns, responsive grids) nhưng trải nghiệm mobile chưa professional:
- **Tables** khó đọc — cột bị ẩn, scroll ngang khó dùng
- **Forms/Modals** khó thao tác — touch target nhỏ, datepicker/select chưa mobile-friendly
- **Navigation** chưa tối ưu — hamburger menu OK nhưng thiếu quick access
- **Layout** chưa polish — spacing, font size chưa mobile-first

## Evaluated Approaches

### Approach A: Component-Level Polish
Upgrade từng component hiện tại (responsive table, better modal, etc.)
- **Pros:** Ít code, DRY
- **Cons:** Rủi ro ảnh hưởng desktop, khó tách biệt UX

### Approach B: Dual Layout ✅ (SELECTED)
Desktop giữ nguyên 100%, tạo mobile components riêng biệt.
- **Pros:** Zero risk desktop, iterate mobile độc lập, clear separation
- **Cons:** Maintain 2 bộ components (mitigated bởi shared data layer)

### Approach C: Full Redesign
Redesign toàn bộ mobile-first.
- **Pros:** Native-like UX
- **Cons:** Effort quá lớn, vượt scope "tối ưu nhẹ"

## Final Solution: Dual Layout

### Strategy
```
Desktop (≥ 768px): Giữ nguyên 100% existing components
Mobile  (< 768px): Render dedicated mobile components
```

### Tech Stack Addition
- **@headlessui/react** — Accessible, lightweight UI primitives (Dialog, Listbox, Transition)
- **useIsMobile() hook** — SSR-safe breakpoint detection

### Mobile UI Features

| Feature | Implementation |
|---------|---------------|
| **Bottom Navigation** | 5 fixed tabs: Tổng quan, Thành viên, Đóng tiền, Thu chi, QR |
| **Mobile Header** | Logo + page title, compact, no hamburger |
| **Card Lists** | Thay table → card per row, tap to expand |
| **Bottom Sheet** | Thay modal → slide-up full-width sheet |
| **Contribution View** | Grouped by month/member thay vì matrix |
| **Touch-first** | Button h-12, min 44x44px targets, generous spacing |
| **Form Controls** | Headless UI Listbox thay react-select, native date on mobile |

### File Structure
```
components/
├── mobile/
│   ├── bottom-nav.tsx          # Bottom tab navigation
│   ├── mobile-header.tsx       # Top header
│   ├── mobile-sheet.tsx        # Bottom sheet (Headless UI Dialog)
│   ├── member-list.tsx         # Card list view
│   ├── transaction-list.tsx    # Card list view
│   ├── contribution-view.tsx   # Grouped view
│   ├── dashboard-mobile.tsx    # Stacked cards
│   └── qr-code-list.tsx       # QR cards
├── hooks/
│   └── use-is-mobile.ts       # Breakpoint hook
├── members/    ← giữ nguyên (desktop)
├── transactions/ ← giữ nguyên
└── ...
```

### Integration Pattern
```tsx
// Page-level conditional render
const isMobile = useIsMobile();
return isMobile ? <MobileView data={data} /> : <DesktopView data={data} />;
```

## Risks & Mitigations

| Risk | Severity | Mitigation |
|------|----------|------------|
| SSR hydration mismatch | Medium | useIsMobile returns null on server, show skeleton |
| Maintain 2 component sets | Low | Data fetching stays in Server Components, only UI splits |
| ContributionMatrix too complex for cards | Medium | Use grouped list by month, not card-per-cell |

## Success Criteria
- All pages usable on 375px width (iPhone SE)
- Touch targets ≥ 44x44px
- No horizontal scroll trừ contribution matrix
- Bottom nav visible và functional
- Forms submittable without zooming
- Desktop UI unchanged

## Next Steps
→ Create implementation plan with phased delivery
