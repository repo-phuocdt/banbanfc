---
title: "Quản Lý Quỹ Đội Bóng - Fund Management Web App"
description: "Vietnamese football team fund management app with Supabase, Next.js 14, member tracking, contribution matrix, transaction ledger, dashboard"
status: done
priority: P1
effort: 30h
branch: main
tags: [nextjs, supabase, typescript, tailwind, crud, vietnamese]
created: 2026-03-09
---

# Quản Lý Quỹ Đội Bóng — Implementation Plan

## Summary

Web app for Vietnamese amateur football team to manage monthly member contributions and expenses. 4 pages: Dashboard, Members, Contribution Matrix, Transaction Ledger. Public read, admin-only write via Supabase Auth + RLS.

## Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 14 App Router + TypeScript |
| Styling | Tailwind CSS |
| Database | Supabase PostgreSQL (direct `@supabase/supabase-js`) |
| Auth | Supabase Auth (email/password, RLS) |
| Charts | Recharts |
| Forms | React Hook Form |
| Dates | date-fns (vi locale) |
| Deploy | Vercel |

## Data Models

- **Member** — id, name, status, joinedAt, note
- **Contribution** — id, memberId, month, amount, paidAt, note
- **Transaction** — id, date, type, amount, category, description, memberId, note

## Phases

| # | Phase | Effort | Status | File |
|---|-------|--------|--------|------|
| 1 | Project Setup | 2h | done | [phase-01](phase-01-project-setup.md) |
| 2 | DB Schema + RLS + Seed | 2h | done | [phase-02](phase-02-database-schema.md) |
| 3 | Layout + Shared Components | 4h | done | [phase-03](phase-03-layout-components.md) |
| 4 | Members Page | 4h | done | [phase-04](phase-04-members-page.md) |
| 5 | Transaction Ledger Page | 4h | done | [phase-05](phase-05-transaction-ledger.md) |
| 6 | Contribution Matrix Page | 4h | done | [phase-06](phase-06-contribution-matrix.md) |
| 7 | Dashboard + Charts | 2h | done | [phase-07](phase-07-dashboard.md) |
| 8 | CSV Import + Polish | 2h | done | [phase-08](phase-08-import-polish.md) |

## Key Dependencies

- Phase 1 → all others
- Phase 2 → Phases 4-8
- Phase 3 → Phases 4-8
- Phase 4 → Phases 5, 6 (member dropdown needed)
- Phases 4-6 → Phase 7 (dashboard aggregates data from all tables)

## Auth Model

- Public anon read on all tables (via RLS `SELECT` policy for `anon` role)
- Admin write requires login (RLS `INSERT/UPDATE/DELETE` for `authenticated` role)
- Single admin account created via Supabase dashboard

## Project Structure

```
app/
├── quan-ly-quy/
│   ├── layout.tsx          # Sidebar layout
│   ├── page.tsx            # Dashboard
│   ├── thanh-vien/page.tsx # Members
│   ├── dong-tien/page.tsx  # Contribution matrix
│   └── thu-chi/page.tsx    # Transaction ledger
├── login/page.tsx          # Admin login
├── layout.tsx              # Root layout
└── globals.css
components/
├── ui/                     # Badge, Modal, Toast, Skeleton, EmptyState, ConfirmDialog
├── layout/                 # Sidebar, Breadcrumb
└── shared/                 # CurrencyDisplay, DataTable, DateDisplay
lib/
├── supabase/
│   ├── client.ts           # Browser client
│   ├── server.ts           # Server client
│   └── middleware.ts        # Auth middleware
├── utils/
│   ├── format.ts           # formatCurrency, formatDate
│   └── constants.ts        # Categories, colors, defaults
└── types/
    └── database.ts         # TypeScript types matching DB schema
scripts/
└── import-csv.ts           # One-time CSV import
```

## Validation Log

### Session 1 — 2026-03-09

| Question | Decision | Applied To |
|----------|----------|------------|
| Contribution auto-creates Transaction? | Yes, hiển thị cả ở Thu chi | Phase 2, 6 |
| Member delete policy | Soft-delete (status='deleted', ẩn khỏi UI) | Phase 2, 4 |
| Bulk month payment | Tạo nhiều records riêng (1 contribution/tháng) | Phase 6 |
| Admin account setup | Tạo tay trên Supabase dashboard | Phase 1 |
| Running balance khi filter | Tính trên ALL data, filter chỉ ẩn/hiện dòng | Phase 5 |
| UI component library | Tailwind thuần, không shadcn | Phase 3 |
| Unknown date handling | Bắt buộc chọn ngày (default hôm nay) | Phase 5 |

## Red Team Review

### Session — 2026-03-09
**Findings:** 15 (13 accepted, 2 rejected)
**Severity:** 3 Critical, 7 High, 3 Medium

| # | Finding | Severity | Disposition | Applied To |
|---|---------|----------|-------------|------------|
| 1 | Contribution-Transaction linkage | Critical | Accept | Phase 2, 6 |
| 2 | RLS self-signup open | Critical | Accept | Phase 1, 2 |
| 3 | Server actions no auth check | Critical | Accept | Phase 3, 4-6 |
| 4 | Running balance contradicts | High | Accept | Phase 5 |
| 5 | CSV name collision | High | Accept | Phase 2, 8 |
| 6 | CASCADE DELETE destroys history | High | Accept | Phase 2 |
| 7 | No server-side validation | High | Accept | Phase 1, 3 |
| 8 | 20h estimate unrealistic | High | Accept | plan.md |
| 9 | No logout | High | Accept | Phase 3 |
| 10 | Edge cases unaddressed | High | Accept | Phase 5, 6 |
| 11 | Service role key unprotected | Medium | Accept | Phase 8 |
| 12 | Month range unbounded | Medium | Accept | Phase 6 |
| 13 | Error handling undefined | Medium | Accept | Phase 3 |
| 14 | CSRF not documented | Medium | Reject | N/A |
| 15 | Supabase over-engineering | Critical | Reject | N/A |
