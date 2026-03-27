---
name: ui-redesign-standards
description: UI redesign and frontend styling in this codebase use only the repo's approved packages (Ant Design, MUI, Tailwind, Emotion) and must follow data-cy and CI rules. Use this skill whenever the user mentions UI redesign, restyling, new components, layout changes, design system, or changing how the UI looks — even if they don't say "redesign" or "standards."
---

# UI Redesign Standards

This skill anchors UI redesign and frontend work to this repo's existing packages and CI/lint rules. Follow it so changes are consistent, pass CI, and avoid repetitive questions about which libraries to use.

## Approved packages

Use **only** these packages for UI and styling. Do not add new UI or CSS libraries.

| Purpose | Package | Notes |
|--------|---------|--------|
| Buttons, Modals, Forms, Tables, Drawers | `antd` | Primary UI kit. Use Ant Design for form controls, modals, buttons, layout primitives. |
| Icons / Material components | `@mui/material`, `@mui/icons-material` | Use for icons and any MUI-specific patterns already in the app. |
| Layout, spacing, colors, typography | `tailwindcss` | Custom theme in `tailwind.config.ts`: `primary`, `secondary`, `success`, `warning`, `error`, etc.; custom screens (`custom`, `mobile-*`, `tablet-*`). Use Tailwind for layout and theme-driven styling. |
| Styling (when needed) | `@emotion/react`, `@emotion/styled` | For component-level styling only when Tailwind is insufficient. |

**Rule:** Do not introduce new UI or CSS libraries (no new component library, no new CSS-in-JS beyond Emotion). Use only the packages above.

## Tailwind theme

The project theme is defined in `tailwind.config.ts`. Use these values instead of hardcoding hex/rgb so styling stays consistent and future redesigns are easier.

- **Colors:** `primary`, `secondary`, `success`, `success-second`, `warning`, `warning-second`, `error`, `error-second`, `orange`, `blue`, `purple`, `light_purple`, `lightblue`
- **Screens:** `custom` (741px), `mobile-sm` (320px), `mobile-md` (480px), `mobile-lg` (640px), `tablet-sm` (768px), `tablet-md` (900px), `tablet-lg` (1024px)
- **Other:** `fontFamily.sans` (Calibre), `tailwind-scrollbar` plugin, custom grid templates (`leave-balance-slider`, `course-list`)

Prefer utility classes like `text-primary`, `bg-secondary`, `text-success`, `border-error`. For full details, see `references/tailwind-theme.md` when needed.

## data-cy and CI rules

### data-cy (required)

The repo enforces `local-rules/data-cy-required` in `.eslintrc.json` for all `*.jsx` and `*.tsx` files:

- Every **lowercase (HTML) JSX element** must have a `data-cy` attribute: `<div>`, `<span>`, `<p>`, `<button>`, `<input>`, `<a>`, etc.
- **PascalCase components** are exempt (e.g. `<Button />`, `<Modal />`). The rule only applies to HTML elements.
- Prefer **semantic, stable** selectors (e.g. `data-cy="confirm-modal-footer"`, `data-cy="user-table-row"`) over long path-like strings, so tests and future edits stay readable.

When adding or changing JSX, add `data-cy` to any new HTML elements so lint passes.

### CI

CI (`.github/workflows/ci.yml`) runs on push/PR to `develop`, `main`, and `develop-redesign-branch`:

1. `npm run lint` — ESLint (including data-cy) must pass.
2. `npm run format` — Prettier must pass.
3. `npm run build` — Next.js build must succeed.

All touched files must pass lint and format. See `references/lint-and-ci.md` for a short reference.

## Usage guidelines (reduce repetition)

- **Ant Design vs MUI:** Use Ant Design for buttons, modals, forms, tables, drawers. Use MUI where the codebase already uses it (e.g. icons). Do not introduce a second pattern for the same primitive.
- **Tailwind vs Emotion:** Prefer Tailwind for layout, spacing, and theme colors. Use Emotion only when Tailwind is insufficient (e.g. dynamic or complex component-level styles).
- **No new libraries:** Do not suggest or add new UI/CSS libraries. Proceed with the approved stack above without asking "should I use X?" — use Ant Design for controls, Tailwind for layout and theme, MUI for existing icon/pattern usage.

## Summary

1. Use only antd, MUI, Tailwind, Emotion for UI and styling.
2. Use Tailwind theme values from `tailwind.config.ts` for colors and breakpoints.
3. Add `data-cy` to every HTML element in JSX; prefer semantic names.
4. Ensure changes pass `npm run lint` and `npm run format` (CI will run them).
