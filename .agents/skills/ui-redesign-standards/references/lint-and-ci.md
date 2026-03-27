# Lint and CI summary

Short reference for the UI redesign standards skill. Details live in the repo root.

## data-cy rule (local-rules/data-cy-required)

- **Where:** `eslint-plugin-local-rules/rules/data-cy-required.js`, enabled in `.eslintrc.json` via override for `*.jsx` and `*.tsx`.
- **What:** Every **lowercase** JSX element (HTML tag) must have a `data-cy` attribute.
- **Exempt:** PascalCase components (e.g. `<Button />`, `<Modal />`), JSX fragments, JSXMemberExpression (e.g. `React.Suspense`).
- **Required on:** `<div>`, `<span>`, `<p>`, `<button>`, `<a>`, `<input>`, `<section>`, etc. — any tag that starts with a lowercase letter.

Prefer semantic names (e.g. `data-cy="submit-button"`) over long path-style strings.

## ESLint

- **Config:** `.eslintrc.json`
- **Notable rules:** `no-console: error`, `prettier/prettier: error`, TypeScript naming conventions, and `local-rules/data-cy-required` for JSX/TSX.
- **Run:** `npm run lint` (uses `--rulesdir eslint-rules` for local rules).

## Prettier

- **Run:** `npm run format` — formats code; CI expects it to pass.

## CI (GitHub Actions)

- **Workflow:** `.github/workflows/ci.yml`
- **Triggers:** Push and pull_request to `develop`, `main`, `develop-redesign-branch`.
- **Steps:** `npm install` → `npm run lint` → `npm run format` → `npm run build` (with Next.js env vars).

All UI changes must pass lint and format so CI stays green.
