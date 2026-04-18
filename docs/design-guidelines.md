# Design Guidelines

**Project**: Quản Lý Quỹ Đội Bóng (Football Team Fund Management)
**Version**: 1.0.0
**Last Updated**: April 18, 2026

---

## Design System Overview

Quản Lý Quỹ Đội Bóng uses a custom Tailwind CSS theme built on semantic design principles. This document defines the complete design system including colors, typography, spacing, and component patterns.

---

## Color System

### Primary Colors

| Name | Hex | Usage | Tailwind Class |
|------|-----|-------|---|
| **Primary Blue** | #3B82F6 | Links, primary buttons, headers | `text-primary`, `bg-primary` |
| **Success Green** | #10B981 | Income, active status, success badges | `text-income`, `bg-income` |
| **Danger Red** | #EF4444 | Expense, errors, delete actions | `text-expense`, `bg-expense` |
| **Dark Navy** | #1E293B | Backgrounds, dark text | `bg-dark`, `text-dark` |
| **Neutral Gray** | #6B7280 | Secondary text, disabled states | `text-gray-500` |

### Semantic Color Usage

```
Income (Green)
├─ Monthly contributions ✓
├─ Sponsorships ✓
├─ Active member badges ✓
└─ Success notifications ✓

Expense (Red)
├─ Team expenses ✗
├─ Inactive/deleted members ✗
├─ Error states ✗
└─ Warning notifications ✗

Primary (Blue)
├─ Primary buttons
├─ Links
├─ Headers
└─ Important metrics

Dark (Navy)
├─ Page backgrounds
├─ Card backgrounds
└─ Primary text
```

### Color Palette (Tailwind Extended)

```javascript
// tailwind.config.js
colors: {
  primary: {
    50: '#EFF6FF',
    100: '#DBEAFE',
    200: '#BFDBFE',
    500: '#3B82F6',  // Main
    600: '#2563EB',
    700: '#1D4ED8',
    800: '#1E40AF',
    900: '#1E3A8A',
  },
  income: {
    50: '#F0FDF4',
    100: '#DCFCE7',
    200: '#BBF7D0',
    500: '#10B981',  // Main
    600: '#059669',
    700: '#047857',
    800: '#065F46',
    900: '#064E3B',
  },
  expense: {
    50: '#FEF2F2',
    100: '#FEE2E2',
    200: '#FECACA',
    500: '#EF4444',  // Main
    600: '#DC2626',
    700: '#B91C1C',
    800: '#991B1B',
    900: '#7F1D1D',
  },
  dark: {
    50: '#F8FAFC',
    100: '#F1F5F9',
    200: '#E2E8F0',
    500: '#64748B',
    900: '#1E293B',  // Main
  },
}
```

---

## Typography

### Font Stack
```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto Oxide', 'Ubuntu', 'Cantarell',
  'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
```

### Text Scales

| Scale | Size | Weight | Usage | Example |
|-------|------|--------|-------|---------|
| **H1** | 32px | 700 (bold) | Page titles | "Quản Lý Quỹ" |
| **H2** | 24px | 700 (bold) | Section titles | "Thành viên" |
| **H3** | 20px | 600 (semibold) | Subsection titles | "Thống kê" |
| **Body** | 16px | 400 (normal) | Body text | Descriptions, labels |
| **Small** | 14px | 400 (normal) | Secondary text | Timestamps, hints |
| **Caption** | 12px | 400 (normal) | Fine print | Captions, metadata |

### Text Colors

```
Primary Text:       text-gray-900 (#111827)
Secondary Text:     text-gray-600 (#4B5563)
Muted Text:         text-gray-500 (#6B7280)
Disabled Text:      text-gray-400 (#9CA3AF)

Income Text:        text-income-700 (#047857)
Expense Text:       text-expense-700 (#B91C1C)
Success Text:       text-green-600
Error Text:         text-red-600
```

### Tailwind Text Classes

```typescript
// Titles
<h1 className="text-3xl font-bold text-gray-900">Title</h1>
<h2 className="text-2xl font-bold text-gray-900">Subtitle</h2>

// Body text
<p className="text-base text-gray-700">Normal paragraph</p>
<p className="text-sm text-gray-600">Small text</p>

// Semantic
<span className="text-income-700 font-semibold">+200.000 VNĐ</span>
<span className="text-expense-700 font-semibold">-100.000 VNĐ</span>
```

---

## Spacing System

All spacing uses Tailwind's standard scale (multiples of 4px):

| Value | Pixels | Usage |
|-------|--------|-------|
| 1 | 4px | Minimal gaps |
| 2 | 8px | Small gaps between elements |
| 3 | 12px | Icon spacing |
| 4 | 16px | Standard padding/margin |
| 6 | 24px | Section padding |
| 8 | 32px | Page padding |
| 12 | 48px | Large spacing |

### Common Patterns

```typescript
// Page padding
<div className="p-8">...</div>

// Card padding
<div className="p-6 rounded-lg shadow-card">...</div>

// Element spacing
<div className="space-y-4">
  <div>Item 1</div>
  <div>Item 2</div>
</div>

// Grid gaps
<div className="grid gap-6 grid-cols-3">...</div>

// Flex spacing
<div className="flex gap-4 items-center">...</div>
```

---

## Border Radius

| Radius | Pixels | Usage | Class |
|--------|--------|-------|-------|
| None | 0px | Sharp corners (rare) | `rounded-none` |
| Small | 4px | Button borders | `rounded-sm` |
| Default | 6px | Cards, inputs | `rounded` |
| Medium | 8px | Large cards | `rounded-lg` |
| Large | 12px | Modals, panels | `rounded-xl` |

### Common Usage

```typescript
// Input fields
<input className="rounded border..." />

// Cards
<div className="rounded-lg shadow-card p-6">...</div>

// Buttons
<button className="rounded px-4 py-2">Click</button>

// Modals
<div className="rounded-xl bg-white shadow-lg">...</div>
```

---

## Shadow System

### Custom Shadows

```javascript
// tailwind.config.js
boxShadow: {
  'card': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  'card-hover': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
}
```

### Usage

```typescript
// Card shadow
<div className="rounded-lg shadow-card">Card</div>

// Hover effect
<div className="rounded-lg shadow-card hover:shadow-card-hover transition">
  Interactive Card
</div>

// Subtle shadow
<div className="rounded shadow-sm">Subtle element</div>

// No shadow
<div className="shadow-none">No shadow</div>
```

---

## Component Patterns

### Buttons

#### Primary Button
```typescript
<button className="px-4 py-2 bg-primary-500 text-white rounded font-medium hover:bg-primary-600 transition">
  Add Member
</button>
```

#### Secondary Button
```typescript
<button className="px-4 py-2 bg-gray-100 text-gray-900 rounded font-medium hover:bg-gray-200 transition">
  Cancel
</button>
```

#### Danger Button
```typescript
<button className="px-4 py-2 bg-expense-500 text-white rounded font-medium hover:bg-expense-600 transition">
  Delete
</button>
```

### Badges

#### Status Badge (Active)
```typescript
<span className="inline-block px-3 py-1 bg-income-100 text-income-700 rounded-full text-sm font-medium">
  Đang hoạt động
</span>
```

#### Status Badge (Inactive)
```typescript
<span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
  Không hoạt động
</span>
```

#### Amount Badge
```typescript
<span className="text-income-700 font-semibold">200.000 VNĐ</span>
<span className="text-expense-700 font-semibold">-100.000 VNĐ</span>
```

### Form Fields

#### Input Field
```typescript
<div className="space-y-2">
  <label className="block text-sm font-medium text-gray-700">Name</label>
  <input
    type="text"
    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
    placeholder="Enter name"
  />
</div>
```

#### Select Field
```typescript
<div className="space-y-2">
  <label className="block text-sm font-medium text-gray-700">Status</label>
  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500">
    <option>Đang hoạt động</option>
    <option>Tạm dừng</option>
  </select>
</div>
```

#### Date Picker
```typescript
<div className="space-y-2">
  <label className="block text-sm font-medium text-gray-700">Date</label>
  <input
    type="date"
    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
  />
</div>
```

### Tables

```typescript
<table className="w-full">
  <thead>
    <tr className="border-b border-gray-200 bg-gray-50">
      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Amount</th>
    </tr>
  </thead>
  <tbody>
    <tr className="border-b border-gray-200 hover:bg-gray-50">
      <td className="px-6 py-3 text-gray-900">John</td>
      <td className="px-6 py-3 text-income-700">200.000</td>
    </tr>
  </tbody>
</table>
```

### Cards

#### Standard Card
```typescript
<div className="rounded-lg bg-white shadow-card p-6">
  <h3 className="text-lg font-bold text-gray-900 mb-4">Card Title</h3>
  <p className="text-gray-600">Card content goes here</p>
</div>
```

#### Metric Card
```typescript
<div className="rounded-lg bg-white shadow-card p-6">
  <p className="text-sm text-gray-600 mb-2">Tổng Thu</p>
  <p className="text-3xl font-bold text-income-700">5.000.000</p>
  <p className="text-xs text-gray-500 mt-2">VNĐ</p>
</div>
```

### Modals

```typescript
<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
  <div className="bg-white rounded-xl shadow-lg max-w-md w-full mx-4 p-6">
    <h2 className="text-xl font-bold text-gray-900 mb-4">Modal Title</h2>
    <p className="text-gray-600 mb-6">Modal content</p>
    <div className="flex gap-3 justify-end">
      <button className="px-4 py-2 bg-gray-100 text-gray-900 rounded font-medium">
        Cancel
      </button>
      <button className="px-4 py-2 bg-primary-500 text-white rounded font-medium">
        Confirm
      </button>
    </div>
  </div>
</div>
```

---

## Responsive Design

### Breakpoints

| Name | Width | Usage |
|------|-------|-------|
| **Mobile** | <768px | Small phones |
| **Tablet** | 768px-1024px | Tablets, large phones |
| **Desktop** | >1024px | Desktops, laptops |

### Tailwind Breakpoints

```typescript
// Mobile-first approach
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
  {/* 1 column on mobile, 2 on tablet, 3 on desktop */}
</div>

// Hidden on mobile
<div className="hidden md:block">Desktop only</div>

// Responsive padding
<div className="p-4 md:p-6 lg:p-8">Responsive padding</div>

// Responsive text
<h1 className="text-2xl md:text-3xl lg:text-4xl">Title</h1>
```

### Mobile Considerations

- Touch targets minimum 44x44px
- Single column layouts on mobile
- Large readable text (16px+)
- Sufficient spacing between interactive elements
- Horizontal scroll only for wide tables (with sticky headers)

---

## Accessibility

### Color Contrast

- Text on background: Minimum 4.5:1 for normal text
- UI components: Minimum 3:1
- All colors tested for WCAG AA compliance

### Interactive Elements

```typescript
// Button with focus state
<button className="px-4 py-2 bg-primary-500 text-white rounded focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
  Click me
</button>

// Form with labels
<label htmlFor="name" className="block text-sm font-medium text-gray-700">
  Name
</label>
<input id="name" type="text" className="..." />

// Links with underlines
<a href="#" className="text-primary-600 hover:underline">
  Link
</a>
```

### Semantic HTML

- Use `<button>` for buttons (not `<div>`)
- Use `<a>` for links
- Use form labels with `htmlFor`
- Use `<table>` for tabular data
- Use heading hierarchy (h1 → h6)

---

## Motion & Animations

### Transitions

```typescript
// Smooth transitions
<button className="bg-primary-500 hover:bg-primary-600 transition">
  Button
</button>

// With duration
<div className="transform transition-all duration-300 ease-in-out">
  Content
</div>

// Multiple properties
<div className="transition-all duration-200">
  Item
</div>
```

### Disable Animations

```typescript
// For accessibility
prefers-reduced-motion: reduce
```

---

## Dark Mode (Future)

Currently not implemented, but design system supports it:

```javascript
// tailwind.config.js (future)
darkMode: 'class',

colors: {
  dark: {
    bg: '#0F172A',
    surface: '#1E293B',
    text: '#F1F5F9',
  }
}
```

---

## Implementation Guidelines

### Do's
- Use Tailwind utility classes exclusively
- Follow the spacing scale (4px increments)
- Use semantic colors (income=green, expense=red)
- Keep components under 200 LOC
- Use custom shadows for depth
- Test responsive behavior
- Use focus states for accessibility

### Don'ts
- Don't use inline styles
- Don't create custom CSS files
- Don't break the spacing scale
- Don't use generic colors (just "blue")
- Don't forget accessibility
- Don't hardcode colors (use custom theme)
- Don't create oversized components

---

## Color Reference Guide

### By Feature

**Member Status**
- Active: income-500 (green)
- Paused: yellow-500
- Inactive: gray-500
- Deleted: red-500

**Transaction Type**
- Income: income-700 (green text), income-50 (light bg)
- Expense: expense-700 (red text), expense-50 (light bg)

**UI States**
- Success: income-500
- Error: expense-500
- Warning: yellow-500
- Info: primary-500

**Dashboard Metrics**
- Total Income: income-500
- Total Expense: expense-500
- Balance: primary-500
- Members: gray-500

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-04-18 | Initial design guidelines (Phase 3) |

---

**Document Owner**: Design Team / Frontend Lead  
**Last Reviewed**: April 18, 2026  
**Next Review**: July 18, 2026  
**Status**: Active
