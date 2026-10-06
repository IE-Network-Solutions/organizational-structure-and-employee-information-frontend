import classNames from 'classnames';

/** Secondary filter pill (e.g. TNA / Training) — matches Plan & Report's period pills. */
export const approvalPillClass = (isActive: boolean) =>
  classNames(
    'inline-flex h-8 shrink-0 items-center rounded-md px-3 transition-colors',
    'text-[13px]',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-1',
    isActive
      ? 'bg-shell-tint font-semibold text-brand'
      : 'font-medium text-shell-muted hover:bg-shell-wash hover:text-shell-ink',
  );
