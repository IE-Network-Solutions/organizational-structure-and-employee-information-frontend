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
    <div className="flex items-center justify-between px-5 py-4 rounded-[10px] border border-gray-300 bg-gray-100">
      <div className={textClass}>{value}</div>
      {children}
      {info && <div className={textClass}>{info}</div>}
    </div>
  );
};

export default InfoItem;
