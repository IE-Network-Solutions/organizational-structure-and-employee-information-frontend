import { FC, PropsWithChildren } from 'react';
import { classNames } from '@/utils/classNames';

interface InfoItemProps extends PropsWithChildren {
  value: string;
  info?: string;
  size?: 'medium' | 'large';
}

const InfoItem: FC<InfoItemProps> = ({
  value,
  info,
  size = 'medium',
  children,
}) => {
  const textClass = classNames(
    'text-gray-900',
    {
      ['text-xs']: size === 'medium',
      ['text-sm']: size === 'large',
      ['font-medium']: size === 'large',
    },
    [],
  );

  return (
    <div
      className="flex justify-between px-1 py-2 rounded-[10px] border border-gray-300 bg-gray-100"
      id={`time-attendance-view-attendance-sidebar-info-item-${value}-container`}
      data-cy={`time-attendance-view-attendance-sidebar-info-item-${value}-container`}
    >
      <div
        className={textClass}
        id={`time-attendance-view-attendance-sidebar-info-item-${value}-value`}
        data-cy={`time-attendance-view-attendance-sidebar-info-item-${value}-value`}
      >
        {value}
      </div>
      {children}
      {info && (
        <div
          className={textClass}
          id={`time-attendance-view-attendance-sidebar-info-item-${value}-info`}
          data-cy={`time-attendance-view-attendance-sidebar-info-item-${value}-info`}
        >
          {info}
        </div>
      )}
    </div>
  );
};

export default InfoItem;
