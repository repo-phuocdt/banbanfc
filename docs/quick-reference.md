# Quick Reference Guide

**Project**: Quản Lý Quỹ Đội Bóng
**Last Updated**: April 18, 2026
**Version**: 1.1.0

> Fast lookup guide for common tasks. For detailed info, see full documentation.

---

## Setup (5 minutes)

```bash
# 1. Clone & install
git clone <repo>
cd banbanfc
npm install

# 2. Configure environment
cp .env.local.example .env.local
# Edit .env.local with Supabase credentials

# 3. Run dev server
npm run dev
# Open http://localhost:3000
```

**Credentials needed** (from Supabase dashboard):
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

---

## Project Structure at a Glance

```
app/               → Pages & routes
├─ login/          → Auth page
└─ quan-ly-quy/    → Main app
   ├─ page.tsx     → Dashboard
   ├─ thanh-vien/  → Members
   ├─ dong-tien/   → Contributions
   └─ thu-chi/     → Transactions

components/        → React components
├─ ui/             → Buttons, modals, badges
├─ layout/         → Sidebar, breadcrumb
├─ dashboard/      → Charts, cards
├─ members/        → Member list & form
├─ contributions/  → Matrix view
├─ transactions/   → Ledger & form
└─ qr-codes/       → QR upload & gallery (NEW)

lib/               → Utilities
├─ types/          → TypeScript interfaces
├─ auth/           → Authentication
├─ supabase/       → Database client
├─ utils/          → Format, constants
└─ validations/    → Zod schemas

docs/              → Documentation
├─ project-overview-pdr.md      → Requirements
├─ code-standards.md            → Dev guidelines
├─ system-architecture.md       → Design
├─ codebase-summary.md          → File inventory
└─ quick-reference.md           → This file
```

---

## Common Commands

```bash
# Development
npm run dev                # Start dev server
npm run build             # Build for production
npm start                 # Run production server
npm run lint              # Check code style

# Database
# → Go to Supabase dashboard and run SQL queries

# Testing (future)
npm test                  # Run tests
npm run test:coverage     # Coverage report
```

---

## Adding a New Feature (Checklist)

### 1. Database Changes (if needed)
- [ ] Create migration in Supabase dashboard
- [ ] Update `/lib/types/database.ts` with new interfaces
- [ ] Update Zod schemas in `/lib/validations/schemas.ts`

### 2. Create Page
- [ ] Create `/app/quan-ly-quy/[feature]/page.tsx` (Server Component)
- [ ] Add `getdata()` server function in same folder
- [ ] Pass data to client components

### 3. Create Components
- [ ] Create `/components/[feature]/` directory
- [ ] Add feature components (Client Components with `'use client'`)
- [ ] Create form modal component if needed
- [ ] Create actions.ts with server actions for mutations

### 4. Server Actions
- [ ] Add `'use server'` directive
- [ ] Call `await requireAdmin()` at start
- [ ] Validate input with Zod schema
- [ ] Return `ActionResult<T>` type
- [ ] Call `revalidatePath()` after mutations

### 5. UI Integration
- [ ] Add navigation link in `/components/layout/sidebar.tsx`
- [ ] Use consistent colors (green=success, red=danger, blue=primary)
- [ ] Add error handling & toast notifications
- [ ] Test responsive design (mobile, tablet, desktop)

### 6. Documentation
- [ ] Update `/docs/codebase-summary.md` with new files
- [ ] Update `/docs/code-standards.md` if new patterns used
- [ ] Update README.md if user-facing feature

---

## Code Patterns (Copy-Paste)

### Server Action Template
```typescript
// app/quan-ly-quy/[feature]/actions.ts
'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth/require-admin'
import { featureSchema } from '@/lib/validations/schemas'
import type { ActionResult } from '@/lib/types/action-result'

export async function createFeature(formData: unknown): Promise<ActionResult> {
  await requireAdmin()

  const parsed = featureSchema.safeParse(formData)
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message }
  }

  try {
    const supabase = createClient()
    const { error } = await supabase.from('table_name').insert(parsed.data)

    if (error) return { success: false, error: error.message }

    revalidatePath('/quan-ly-quy/[feature]')
    return { success: true }
  } catch (err) {
    return { success: false, error: 'Unexpected error' }
  }
}
```

### Client Component with Form
```typescript
// components/[feature]/form-modal.tsx
'use client'

import { useState } from 'react'
import { Modal } from '@/components/ui/modal'
import { showToast } from '@/components/ui/toast'
import { createFeature } from '@/app/quan-ly-quy/[feature]/actions'

interface FormModalProps {
  isOpen: boolean
  onClose: () => void
}

export function FormModal({ isOpen, onClose }: FormModalProps) {
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const result = await createFeature(Object.fromEntries(formData))

    if (result.success) {
      showToast('Success!')
      onClose()
    } else {
      showToast(result.error, 'error')
    }

    setLoading(false)
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* form fields */}
        <button type="submit" disabled={loading}>
          Submit
        </button>
      </form>
    </Modal>
  )
}
```

### Validation Schema
```typescript
// lib/validations/schemas.ts
import { z } from 'zod'

export const featureSchema = z.object({
  name: z.string().min(1, 'Required field'),
  email: z.string().email('Invalid email'),
  amount: z.number().int().positive('Must be positive'),
  status: z.enum(['active', 'inactive']),
  note: z.string().optional().nullable(),
})

export type FeatureFormData = z.infer<typeof featureSchema>
```

### Data Table with Filters
```typescript
// components/[feature]/data-table.tsx
'use client'

import { useState, useMemo } from 'react'

interface DataTableProps<T> {
  data: T[]
  columns: { header: string; key: keyof T }[]
}

export function DataTable<T extends { id: string }>({ data, columns }: DataTableProps<T>) {
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    return data.filter(item =>
      JSON.stringify(item).toLowerCase().includes(search.toLowerCase())
    )
  }, [data, search])

  return (
    <div>
      <input
        type="text"
        placeholder="Search..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-4 w-full px-3 py-2 border rounded"
      />

      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b">
            {columns.map(col => (
              <th key={String(col.key)} className="px-4 py-2 text-left">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filtered.map((row, i) => (
            <tr key={row.id} className={i % 2 ? 'bg-gray-50' : ''}>
              {columns.map(col => (
                <td key={String(col.key)} className="px-4 py-2">
                  {String(row[col.key])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
```

---

## Naming Quick Reference

| Type | Format | Example |
|------|--------|---------|
| Files | kebab-case | `member-table.tsx`, `format.ts` |
| Components | PascalCase | `MemberTable`, `FormModal` |
| Functions | camelCase | `formatCurrency()`, `getMembers()` |
| Constants | UPPER_SNAKE_CASE | `DEFAULT_CONTRIBUTION`, `INCOME_CATEGORIES` |
| DB Tables | snake_case, plural | `members`, `contributions`, `transactions` |
| DB Columns | snake_case | `member_id`, `joined_at`, `created_at` |
| CSS Classes | Tailwind utilities | `px-4`, `bg-green-100`, `text-red-800` |

---

## Color System

| Color | Usage | Classes |
|-------|-------|---------|
| **Green** | Success, income, active | `bg-green-100 text-green-800`, `text-green-600` |
| **Red** | Error, expense, deleted | `bg-red-100 text-red-800`, `text-red-600` |
| **Blue** | Primary, info | `text-blue-600`, `bg-blue-100` |
| **Yellow** | Warning, paused | `bg-yellow-100 text-yellow-800` |
| **Gray** | Muted, inactive, neutral | `text-gray-500`, `bg-gray-100` |

---

## Database Quick Lookup

### Members Table
```sql
SELECT * FROM members
WHERE status != 'deleted'
ORDER BY name;
```

### Contributions for Member
```sql
SELECT * FROM contributions
WHERE member_id = '{member_id}'
ORDER BY month DESC;
```

### Transactions by Date
```sql
SELECT * FROM transactions
WHERE date BETWEEN '2025-01-01' AND '2025-12-31'
ORDER BY date DESC;
```

### Running Balance Calculation
```typescript
let balance = 0
transactions.forEach(t => {
  balance += t.type === 'income' ? t.amount : -t.amount
})
```

---

## Debugging Tips

### Page Not Rendering
1. Check browser console for errors
2. Verify authentication (middleware running)
3. Check Supabase connection in `.env.local`
4. Try: `rm -rf .next && npm run dev`

### Data Not Appearing
1. Check Supabase dashboard for actual data
2. Verify RLS policies allow your user
3. Check query in Supabase SQL editor
4. Verify `revalidatePath()` called after mutations

### Form Submit Not Working
1. Check server action exists in `actions.ts`
2. Verify `'use server'` directive present
3. Check Zod schema matches form data
4. Check browser Network tab for errors

### Styles Not Applied
1. Check Tailwind class spelling
2. Verify Tailwind config includes file path
3. Try: clear Next.js cache (`rm -rf .next`)
4. Check dark mode not enabled

---

## Performance Checklist

- [ ] Use `Promise.all()` for parallel queries
- [ ] Use dynamic imports for heavy components
- [ ] Use Suspense for streaming UI
- [ ] Index foreign keys in database
- [ ] Call `revalidatePath()` correctly
- [ ] No N+1 queries in loops
- [ ] No console.logs in production
- [ ] No localStorage for sensitive data

---

## Security Checklist

- [ ] Call `requireAdmin()` in all server actions
- [ ] Validate input with Zod schema
- [ ] Never return sensitive errors to client
- [ ] Use Supabase RLS policies
- [ ] No hardcoded secrets in code
- [ ] HTTPS in production
- [ ] HTTP-only cookies (Supabase default)

---

## Git Workflow

```bash
# Create feature branch
git checkout -b feature/member-soft-delete

# Make changes and test locally
npm run dev

# Commit with conventional format
git commit -m "feat(members): add soft delete functionality"

# Push to remote
git push -u origin feature/member-soft-delete

# Create pull request on GitHub
gh pr create --title "feat(members): add soft delete" --body "Description..."

# After review & approval, merge
git checkout main
git pull
git merge feature/member-soft-delete
```

**Commit Types**:
- `feat:` new feature
- `fix:` bug fix
- `docs:` documentation
- `refactor:` code restructuring
- `test:` tests
- `chore:` dependencies, config

---

## Useful Links

| Resource | URL |
|----------|-----|
| Next.js Docs | https://nextjs.org/docs |
| React Docs | https://react.dev |
| Tailwind CSS | https://tailwindcss.com/docs |
| Supabase Docs | https://supabase.com/docs |
| TypeScript | https://www.typescriptlang.org/docs |
| Zod | https://zod.dev |

---

## Contact & Support

- **Questions about architecture?** → Read `/docs/system-architecture.md`
- **Questions about code standards?** → Read `/docs/code-standards.md`
- **Questions about requirements?** → Read `/docs/project-overview-pdr.md`
- **Want to understand the code?** → Read `/docs/codebase-summary.md`
- **Need to deploy?** → See README.md "Deploy" section

---

## Document Map

```
README.md
├─ For: New developers, non-technical users
├─ Contains: Features, setup, troubleshooting
└─ Read first: Yes

project-overview-pdr.md
├─ For: Stakeholders, QA engineers
├─ Contains: Requirements, acceptance criteria, roadmap
└─ When: Planning, testing, requirements verification

code-standards.md
├─ For: Developers, code reviewers
├─ Contains: How to write code, patterns, guidelines
└─ When: Writing code, code review, onboarding

system-architecture.md
├─ For: Architects, senior developers
├─ Contains: Design decisions, data flows, deployment
└─ When: Understanding "why", planning changes

codebase-summary.md
├─ For: Developers, DevOps
├─ Contains: File inventory, design patterns, metrics
└─ When: Exploring code, understanding structure

quick-reference.md (this file)
├─ For: Developers in a hurry
├─ Contains: Quick setup, common tasks, snippets
└─ When: Fast lookup, copy-paste patterns
```

---

**Last Updated**: April 18, 2026
**Maintained By**: Development Team
**Version**: 1.1.0
