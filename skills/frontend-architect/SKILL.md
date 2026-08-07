---
name: frontend-architect
description: Expert frontend architecture and UI engineering for React, Next.js/App Router, TypeScript, Tailwind, shadcn/ui, accessibility, performance, design systems, Web3 transaction UX, and production-quality interfaces. Use when building components/pages, reviewing frontend code, implementing mockups, improving UX polish, fixing responsiveness, optimizing Core Web Vitals/INP, or designing frontend architecture.
---

# Frontend Architect

Use this skill to ship frontend work that feels polished, performs well, and stays maintainable.

## First moves

1. Inspect the existing stack: framework, router, package manager, styling system, component library, state/data libraries, test setup, and design tokens.
2. Reuse project conventions before introducing new abstractions.
3. If the task is visual, check for `brand.md`, design files, screenshots, or existing components. If no brand exists, use the project's current style rather than inventing a new identity.
4. When exact framework APIs matter, verify against the lockfile and current docs.

## Modern frontend defaults

- React 19+ patterns where available, while respecting the project's pinned React version.
- Next.js App Router, Server Components, Server Actions, streaming, and caching only when they simplify the product and fit deployment constraints.
- TypeScript strict mode, explicit domain types, and generated API/contract types when possible.
- Tailwind CSS and shadcn/ui are good defaults if the project already uses them; avoid adding heavy UI libraries casually.
- Server state belongs in data-fetching/cache tools (e.g. framework loaders or TanStack Query). Client state is for UI state, forms, and local interactions.

## UI craft standards

- Hierarchy first: clear page purpose, primary action, secondary actions, and scannable sections.
- Use consistent spacing and rhythm. An 8px base grid with smaller 4px adjustments is a reliable default.
- Use semantic tokens for colors, typography, radii, shadows, and borders.
- WCAG 2.2 AA is the minimum accessibility target; AAA contrast is great when it does not harm the design.
- Every interactive element needs visible hover/focus/active/disabled states.
- Empty, loading, error, success, and permission-denied states are part of the feature, not afterthoughts.
- Motion should clarify cause/effect. Respect `prefers-reduced-motion`.

## Architecture standards

- Keep components small enough to understand, but avoid splitting until boundaries are meaningful.
- Separate presentational components from data/side-effect orchestration when it improves testability.
- Prefer named exports for shared modules unless the project convention differs.
- Co-locate route-specific components; extract shared components only after reuse is clear.
- Keep forms explicit: schema validation, field-level errors, submit state, optimistic behavior only when rollback is safe.
- Treat URL state as product state for filters, search, tabs, pagination, and shareable views.

## Performance checklist

Core Web Vitals priorities:

- LCP under 2.5s for key pages.
- CLS under 0.1.
- INP under 200ms; FID is obsolete for modern Core Web Vitals reporting.

Common fixes:

- Reduce client JavaScript; keep server-rendered/static work off the client when possible.
- Lazy-load heavy components and third-party scripts.
- Use optimized images with correct dimensions and priority only for true hero assets.
- Avoid unnecessary global providers and client components high in the tree.
- Memoize only when measurement or obvious expensive work justifies it.
- Virtualize very large lists and tables.

## Accessibility checklist

- Keyboard navigation works for all flows.
- Focus order is logical and focus is managed after dialogs, route changes, and async actions.
- Use semantic HTML before ARIA. Add ARIA only to fill semantic gaps.
- Inputs have labels, descriptions, validation messages, and autocomplete where appropriate.
- Toasts/alerts are announced accessibly and not the only place critical information appears.
- Color is not the only status indicator.

## Web3 transaction UX

When building blockchain UIs:

- Model transaction state explicitly: idle → preparing/simulating → wallet confirmation → submitted → confirming/indexing → success or recoverable error.
- Show chain, wallet, amount, token, recipient/spender, fees, and irreversible consequences.
- Handle wrong network, disconnected wallet, rejected signature, insufficient funds, reverted transaction, dropped/replaced transaction, and RPC/indexer lag.
- Use viem/wagmi for EVM when present; use modern Solana wallet-standard/@solana tooling when working on Solana projects.
- Never use JavaScript floating point for token amounts. Use integer/base-unit math and safe formatting.

## Review checklist

For code reviews, prioritize:

1. User-impacting bugs and broken flows.
2. Accessibility blockers.
3. Data consistency and form/transaction edge cases.
4. Performance regressions and excessive client JS.
5. Type safety and maintainability.
6. Visual polish and consistency.

## Output style

- For builds: implement the smallest polished slice, include states, and mention manual QA steps.
- For reviews: list findings with severity, file path, reason, and concrete fix.
- For architecture: provide recommended structure, tradeoffs, migration steps, and what not to abstract yet.
