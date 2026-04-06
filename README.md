# Financial-Dashboard

---

## 🛠 Tech Stack

| Tool          | Version | Purpose                     |
| ------------- | ------- | --------------------------- |
| React         | 18      | UI framework                |
| TypeScript    | 5       | Type safety                 |
| Tailwind CSS  | 3       | Utility-first styling       |
| Redux Toolkit | 2       | Global state management     |
| Framer Motion | 11      | Animations & transitions    |
| Lucide React  | latest  | Icon library                |
| Recharts      | 2       | Charts & data visualization |

---

## 🚀 Installation

### Prerequisites

Make sure you have the following installed before starting:

- **Node.js** v16 or higher → check with `node -v`
- **npm** v8 or higher → check with `npm -v`

### Step 1 — Create the project

```bash
npx create-react-app frontend --template typescript
cd frontend
```

### Step 2 — Install dependencies

```bash
npm install tailwindcss @reduxjs/toolkit react-redux framer-motion lucide-react recharts
```

### Step 3 — Start the app

```bash
npm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## ✨ Features

### 1. Dashboard Overview

The main dashboard gives a complete snapshot of your financial health at a glance.

- **Summary Cards** — three cards showing Total Balance, Total Income, and Total Expenses. Each card shows a month-over-month trend badge (e.g. ↑ 12.5% from last month) calculated automatically from transaction data.
- **Balance Trend Chart** — a smooth area chart showing the last 6 months of income vs expenses side by side. Uses gradient fills, a custom tooltip with ₹ formatting, and is fully responsive.
- **Spending Breakdown Chart** — a donut chart showing expenses broken down by category. Hovering a slice or legend item highlights it and fades the others. Shows the total spend in the center.

---

---

### 2. Role Based UI

- **Viewer** — read-only access. The Add Transaction button and all edit/delete controls are hidden.
- **Admin** — full access. Can add new transactions, edit existing ones via a modal form, and delete with inline confirmation.

---

### 3. Add / Edit Transaction Modal (Admin only)

A polished modal form for creating and editing transactions.

- Toggle between **Expense** and **Income** type
- Fields: Description, Amount (₹), Category (select), Date (capped at today)
- **Validation** — shows per-field error messages only after the first submit attempt. Checks for empty fields, invalid amounts, and missing category.
- **Edit mode** — pre-fills all fields when editing an existing transaction.
- Closes on Escape key press or backdrop click.
- Spring animation on open/close.

---

### 4. Dark Mode

A full dark mode that works across every component.

- Toggle using the sun/moon icon button in the header.
- Uses Tailwind's `class` strategy — adds or removes the `dark` class on `<html>`.
- Theme is applied **synchronously** on page load (no flash of wrong theme).
- Preference is persisted to `localStorage` and restored on next visit.

---

### 5. Responsive Design

The layout adapts cleanly across all screen sizes.

- **Desktop (lg+)** — sidebar is always visible, transaction data shown in a full table.
- **Tablet (sm–lg)** — summary cards stack into a 2-column grid, charts stack vertically.
- **Mobile (< sm)** — sidebar becomes a slide-in drawer triggered by the hamburger button, transaction table switches to a card list.

---

### 6. Animations

Smooth interactions powered by Framer Motion throughout.

- Page cards and charts animate in with a staggered fade-up on first render.
- Sidebar drawer slides in from the left on mobile with a spring animation.
- Modal opens and closes with a scale + fade spring animation.
- Dark mode toggle icon rotates on switch between sun and moon.
- Role dropdown animates open and closed.
- Transaction rows animate in/out when filters change.
- Nav items shift slightly on hover.

---

## 🗃 State Management

Redux Toolkit manages all shared application state through three slices:

| Slice               | State                                          | Persisted            |
| ------------------- | ---------------------------------------------- | -------------------- |
| `transactionsSlice` | Array of all transactions                      | ✅ localStorage      |
| `filtersSlice`      | Search, type, category, sort field, sort order | ❌ resets on refresh |
| `roleSlice`         | Current role (admin / viewer)                  | ✅ localStorage      |

- Transactions are persisted via `store.subscribe()` in `index.tsx` — runs outside React so it never causes re-renders.
- On startup, each slice reads from `localStorage` synchronously in its own `loadInitial` function and falls back to defaults if nothing is saved.
- Dark mode is managed as local state inside `Layout.tsx` (not Redux) since it is purely a UI preference.

---

---

## 📝 Assumptions

- Currency is Indian Rupee (₹) with `en-IN` locale formatting throughout.
- All date calculations (current month, previous month) are based on the browser's local clock.
- There is no backend — all data is mock data stored in memory and persisted to localStorage.
- Role switching is frontend-only for demonstration. In a real app this would be driven by an authenticated session.
- The mock dataset covers November 2025 through April 2026 (6 months) to ensure all charts and insights have meaningful data on first load.
