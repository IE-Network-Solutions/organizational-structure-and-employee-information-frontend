import React, { FC, PropsWithChildren } from 'react';
import { classNames } from '@/utils/classNames';

interface StatusBadgeProps extends PropsWithChildren {
  theme?: 'secondary' | 'warning' | 'success' | 'danger';
  className?: string;
}

const StatusBadge: FC<StatusBadgeProps> = ({
  theme = 'secondary',
  className = '',
  children,
}) => {
  const badgeClass = classNames(
    'min-h-6 py-1 px-4 flex items-center justify-center rounded-lg font-bold text-[10px] w-max',
    {
      ['bg-success-second/20']: theme === 'success',
      ['text-success']: theme === 'success',
      ['bg-warning-second/20']: theme === 'warning',
      ['text-warning']: theme === 'warning',
      ['bg-error-second/20']: theme === 'danger',
      ['text-error']: theme === 'danger',
      ['bg-secondary/20']: theme === 'secondary',
      ['text-secondary']: theme === 'secondary',
    },
    [className],
  );

  return <div className={badgeClass}>{children}</div>;
};

export default StatusBadge;
