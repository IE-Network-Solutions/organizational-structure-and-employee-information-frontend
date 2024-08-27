import React, { FC, PropsWithChildren } from 'react';
import { classNames } from '@/utils/classNames';

export enum StatusBadgeTheme {
  secondary = 'secondary',
  warning = 'warning',
  success = 'success',
  danger = 'danger',
}

interface StatusBadgeProps extends PropsWithChildren {
  theme?: StatusBadgeTheme;
  className?: string;
}

const StatusBadge: FC<StatusBadgeProps> = ({
  theme = StatusBadgeTheme.secondary,
  className = '',
  children,
}) => {
  const badgeClass = classNames(
    'min-h-6 py-1 px-4 flex items-center justify-center rounded-lg font-bold text-[10px] w-max',
    {
      ['bg-success-second/20']: theme === StatusBadgeTheme.success,
      ['text-success']: theme === StatusBadgeTheme.success,
      ['bg-warning-second/20']: theme === StatusBadgeTheme.warning,
      ['text-warning']: theme === StatusBadgeTheme.warning,
      ['bg-error-second/20']: theme === StatusBadgeTheme.danger,
      ['text-error']: theme === StatusBadgeTheme.danger,
      ['bg-secondary/20']: theme === StatusBadgeTheme.secondary,
      ['text-secondary']: theme === StatusBadgeTheme.secondary,
    },
    [className],
  );

  return <div className={badgeClass}>{children}</div>;
};

export default StatusBadge;
