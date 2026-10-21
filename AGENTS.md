## Visual language

Keep new screens consistent with Selamnew Workspace's existing light interface.

- Use the existing Calibre body font from `app/globals.css` and Tailwind's `font-sans`. Ant Design controls inherit the Calibri stack in `providers/antdProvider.tsx`; do not introduce another font.
- For OKR and deadline planning, use Tailwind's `okr-primary` (`#1E40AF`), matching Ant Design's `colorPrimary`. The separate `primary` token is `#3636F0`; do not substitute it for the planning blue.
- Planning surfaces are white with pale slate backgrounds, `#F1F2F6` or slate-100 borders, `#161A2C` headings, and slate-500 / `#8F94A3` secondary text. Use blue-50 / `#DBEAFE` for restrained blue accents. Reserve red, amber, and green for meaningful task states.
- Repeated text sizes are 11–12px for metadata, 13–14px for task content, 16px for section titles, and 24px bold for page headings. Use medium or semibold task titles, rather than oversized display type.
- Follow the existing Tailwind spacing rhythm: gaps of 2–4 units and card padding of 3–4 units. Large detail surfaces can use 6–8 units. There is no separate project spacing-token file.
- Use rounded-md controls, rounded-xl inner cards, rounded-2xl outer panels, and rounded-full avatars. Ant Design's radius tokens are 6px and 8px.
- Use thin borders and restrained hover shadows on planning cards; overlays use the existing Ant Design shadows. Planning screens use flat backgrounds and have no decorative gradients.
- Deadline task and subtask forms use borderless controls, spacing, and pale metadata backgrounds. Avoid nested outlined containers; retain visible keyboard focus indicators.
- Preserve the shared breadcrumb and key-result panel. Keep styling scoped to the feature; avoid changing global tokens for one screen.
- Deadline planning exposes Tasks and Grouped view directly. Grouped plans use soft person headers and compact management actions, with department/assignee scoping and the existing permission rules.
