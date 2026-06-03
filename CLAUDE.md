# Project Rules

## Tech Stack

- React 19 + TypeScript
- Single page, no router — the app is composed directly in `main.tsx`
- Data fetching with React 19 `use` — no data-fetching libraries (no React Query/SWR), no caching layer
- Native controlled forms with manual validation — no form libraries (no React Hook Form/Zod)
- CSS Modules with `rem`/`em` units — no Tailwind, no `px` for sizing/spacing
- No media queries. Use flexboxes or grids for responsiveness
- use WCAG guidlines
- Vitest + React Testing Library for tests
- Native `fetch` — no axios

## Project Structure

```
src/
├── lib/         # Low-level utilities (http.ts)
├── api/         # One file per API call
├── types/       # TypeScript types
├── context/     # React Context providers
├── components/
  ├── atoms/       # Atomic design: basic building blocks
  ├── molecules/   # Atomic design: composed atoms
  ├── organisms/   # Atomic design: composed molecules
  ├── templates/   # Page shells (PageLayout, ErrorBoundary)
  ├── pages/       # Top-level page components
└── main.tsx     # App entry, composes PageLayout + page
```

## Architecture Rules

- use SOLID principles
- use ATOMIC design

### HTTP layer (`src/lib/http.ts`)

- All fetch configuration lives here: base URL, default headers, error throwing
- Exports named functions: `get`, `post`, `put`
- Throws on non-2xx responses — never swallows errors

### API functions (`src/api/`)

- One file per API call, named after the operation (e.g. `getProducts.ts`, `createApplication.ts`)
- Each imports from `../lib/http`
- Default export, async function

```ts
import { get } from "../lib/http";
import type { Product } from "../types";

export default async function getProducts() {
  return get<Product[]>("/products");
}
```

### Data fetching (React 19 `use`)

- Fetch **inside components** with the `use` hook — it unwraps a promise and suspends until it resolves
- `<Suspense>` in `PageLayout` renders the fallback while the promise is pending
- A **rejected** promise re-throws during render and is caught by the `ErrorBoundary` — let API errors propagate, don't swallow them
- Promises passed to `use` must be **stable across renders**, or `use` re-suspends forever. For data fetched once (e.g. `/meta`), memoize the promise at **module scope** in the api file and return the same one. No caching library and no React `cache` (that's Server-Components only and can't run in this client SPA)
- Clear the stored promise on rejection so an `ErrorBoundary` retry re-fetches
- Interactive, per-keystroke queries (e.g. place search) use local `useState`, not `use` — they shouldn't suspend the tree
- Persisting the **user's own** data (report history → statistics) is a separate concern: use `localStorage`/IndexedDB, not the fetch layer

### App entry (`src/main.tsx`)

- No router. `main.tsx` mounts `PageLayout` wrapping the page component
- `ErrorBoundary` is a class component (`getDerivedStateFromError` / `componentDidCatch`) — it catches render errors, including promises rejected inside `use`
- `<Suspense>` in `PageLayout` shows the fallback while `use` resolves data

### Component rules

- Follow **atomic design**: atoms → molecules → organisms → templates → pages
- Each component lives in its own folder with `Component.tsx`, `Component.module.css`, and optionally `Component.test.tsx`
- SOLID applies: one responsibility per file — `PageLayout` is layout only, `ErrorBoundary` is error UI only
- `forwardRef` on any input atom so parent components can pass a `ref` (focus, scroll, measure)

### Styling

- CSS Modules for all components
- Design tokens (colors, spacing, font sizes) defined as CSS custom properties in `src/index.css`
- All sizing in `rem`/`em` — `px` only for borders (`1px`)
- use OKLCH colors

### State management

- React Context for state shared widely across the tree — no Redux
- Keep context lean: only state that truly needs to be shared belongs there
- Most state lives in cached fetch data (read via `use`) or local `useState`

### Forms

- Native controlled forms — one `useState` per field, no form libraries
- Validation is plain derived state in the component (e.g. a `canSubmit` guard); surface inline error messages
- Associate every input with a `<label htmlFor>` and set `aria-invalid`/`aria-describedby` on errors for WCAG

### Tests

- Vitest + React Testing Library
- Test file co-located with the component (`Component.test.tsx`)
- Test behaviour, not implementation
