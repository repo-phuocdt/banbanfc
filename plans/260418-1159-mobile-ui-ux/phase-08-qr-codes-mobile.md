# Phase 08: QR Codes Mobile

**Priority:** P3
**Status:** done
**Effort:** 2h
**Blocked by:** Phase 01, Phase 02, Phase 03

## Overview

Optimize QR code display for mobile. Current grid layout is decent but needs polish for single-column mobile view.

## Key Insights

- QrCodeManager (189 LOC): grid `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`
- Already single column on mobile — but cards are large with max-h-80 images
- Key actions: copy account number, download QR image, edit/delete (admin)
- Data: `QrCode` with `image_data` (base64)

## Requirements

### Functional
- Full-width QR cards, optimized image sizing
- Prominent copy-account-number button
- Swipe between QR codes (optional enhancement)
- Admin: FAB for adding QR code

### Non-functional
- QR image: sized to fit viewport width with padding
- Copy feedback: toast or inline check icon
- Cards stack vertically with clear separation

## Related Code Files

### Reference
- `components/qr-codes/qr-code-manager.tsx` (189 LOC)
- `components/qr-codes/qr-code-form-modal.tsx` — form
- `app/quan-ly-quy/qr-chuyen-tien/page.tsx` — data fetching

### Create
- `components/mobile/qr-code-list.tsx` — mobile QR view

### Modify
- `app/quan-ly-quy/qr-chuyen-tien/page.tsx` — conditional render

## Implementation Steps

1. Create `components/mobile/qr-code-list.tsx`
   ```tsx
   // Props: { qrCodes: QrCode[], isAdmin: boolean }
   // - Full-width cards, centered QR image
   // - QR image: w-full max-w-[280px] mx-auto
   // - Bank details: bank name, account name, account number
   // - Copy button: large, full-width, prominent
   // - Download button
   // - Admin actions: edit/delete via MobileSheet
   // - Inactive QR: dimmed with "Không hoạt động" badge
   ```

2. Update `app/quan-ly-quy/qr-chuyen-tien/page.tsx`
   - Create client wrapper
   - `useIsMobile()` → QrCodeList (mobile) or QrCodeManager (desktop)

3. Run `pnpm build`

## Todo List

- [ ] Create `components/mobile/qr-code-list.tsx`
- [ ] Update page for conditional render
- [ ] Verify copy-to-clipboard works on mobile
- [ ] Verify QR image scales correctly
- [ ] Build passes

## Success Criteria

- QR codes display cleanly on mobile
- Copy account number works with feedback
- QR image readable (not too small)
- Admin actions accessible
