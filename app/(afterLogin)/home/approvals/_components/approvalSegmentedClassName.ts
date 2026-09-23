import classNames from 'classnames';

export const approvalToolbarSegmentedClassName = classNames(
  'home-approvals-toolbar-segmented !inline-flex !w-max max-w-full !shrink-0 !rounded-xl !border !border-slate-100 !bg-slate-50/70 !p-1.5',
  '!h-[50px] sm:!h-[50px] sm:!self-center',
  '[&_.ant-segmented-group]:!w-max [&_.ant-segmented-group]:!min-h-0 [&_.ant-segmented-group]:!items-stretch [&_.ant-segmented-group]:!justify-start',
  '[&_.ant-segmented-thumb]:!h-full [&_.ant-segmented-thumb]:!bg-white [&_.ant-segmented-thumb]:!py-0 [&_.ant-segmented-thumb]:!shadow-sm',
  '[&_.ant-segmented-item]:!flex [&_.ant-segmented-item]:!flex-none [&_.ant-segmented-item]:!items-center [&_.ant-segmented-item]:!justify-center [&_.ant-segmented-item]:!self-stretch [&_.ant-segmented-item]:!bg-transparent',
  '[&_.ant-segmented-item-selected]:!z-[1] [&_.ant-segmented-item-selected]:!rounded-md [&_.ant-segmented-item-selected]:!shadow-sm',
  '[&_.ant-segmented-item-label]:!flex [&_.ant-segmented-item-label]:!h-9 [&_.ant-segmented-item-label]:!min-h-9 [&_.ant-segmented-item-label]:!items-center [&_.ant-segmented-item-label]:!justify-center [&_.ant-segmented-item-label]:!whitespace-nowrap [&_.ant-segmented-item-label]:!font-medium [&_.ant-segmented-item-label]:!text-slate-600 [&_.ant-segmented-item-label]:!px-3.5 [&_.ant-segmented-item-label]:!py-0 [&_.ant-segmented-item-label]:!text-[14px] sm:[&_.ant-segmented-item-label]:!h-9 sm:[&_.ant-segmented-item-label]:!min-h-9 sm:[&_.ant-segmented-item-label]:!px-4.5 sm:[&_.ant-segmented-item-label]:!py-0 sm:[&_.ant-segmented-item-label]:!text-[14px]',
  '[&_.ant-segmented-item-selected_.ant-segmented-item-label]:!text-slate-900',
);

/** Secondary filter pill (e.g. TNA / Training) — matches Plan & Report's period pills. */
export const approvalPillClass = (isActive: boolean) =>
  classNames(
    'inline-flex h-8 shrink-0 items-center rounded-md px-3 transition-colors',
    'text-[13px]',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-1',
    isActive
      ? 'bg-shell-tint font-semibold text-primary'
      : 'font-medium text-shell-muted hover:bg-shell-wash hover:text-shell-ink',
  );
