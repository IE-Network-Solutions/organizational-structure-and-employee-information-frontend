# Tailwind theme reference

This file summarizes the project's Tailwind theme from `tailwind.config.ts`. Use these values in UI work instead of hardcoding colors or breakpoints.

## Colors (theme.extend.colors)

| Token | Value |
|-------|--------|
| primary | #1E40AF |
| secondary | #1D9BF0 |
| success | #0BA259 |
| success-second | #55c790 |
| warning | #E6BB20 |
| warning-second | #ffde65 |
| error | #E03137 |
| error-second | #fa3a3a |
| orange | #FE964A |
| blue | #0062FF |
| purple | #8C62FF |
| light_purple | #E7E7FF |
| lightblue | #d3e4f0 |

Use as: `text-primary`, `bg-secondary`, `border-error`, `text-success`, etc. For `success-second` use `success-second` (with hyphen in class names where Tailwind supports it).

## Screens (breakpoints)

| Name | Value |
|------|--------|
| custom | 741px |
| mobile-sm | 320px |
| mobile-md | 480px |
| mobile-lg | 640px |
| tablet-sm | 768px |
| tablet-md | 900px |
| tablet-lg | 1024px |

Use as: `md:...`, `tablet-sm:...`, `mobile-lg:...`, etc., depending on what's extended in the config.

## Other theme extensions

- **fontFamily.sans:** Calibre, sans-serif
- **height:** `half-vw` = calc(50vw)
- **gridTemplateColumns:**
  - `leave-balance-slider`: 40px minmax(0, 1fr) 40px
  - `course-list`: repeat(auto-fill, minmax(300px, 1fr))

## Plugins

- `tailwind-scrollbar` — for scrollbar styling.

## Config note

The config sets `important: true`, so Tailwind utilities can override other styles when needed.
