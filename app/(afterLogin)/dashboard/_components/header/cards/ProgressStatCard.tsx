'use client';

import type { ReactNode } from 'react';
import { Card, Progress } from 'antd';
import { okrHeaderCardShellClass } from './shared';

interface ProgressStatCardProps {
  label: string;
  /** Already formatted, e.g. `42%`. */
  value: ReactNode;
  percent: number;
  icon: ReactNode;
  iconBgClassName: string;
  labelClassName?: string;
  onClick?: () => void;
  dataCy: string;
}

/**
 * The "value on the right, progress bar underneath" KPI card shared by
 * Your Average OKR, Company OKR and Total Variable Pay.
 */
export default function ProgressStatCard({
  label,
  value,
  percent,
  icon,
  iconBgClassName,
  labelClassName = 'text-gray-500',
  onClick,
  dataCy,
}: ProgressStatCardProps) {
  return (
    <Card
      bordered={false}
      bodyStyle={{ padding: 0 }}
      className={`${okrHeaderCardShellClass}${onClick ? ' cursor-pointer' : ''}`}
      onClick={onClick}
      data-cy={dataCy}
    >
      <div
        className="flex items-center justify-between"
        data-cy="okr-card-header"
      >
        <div
          className={`rounded-[4px] ${iconBgClassName} flex items-center justify-center w-[34px] h-[34px]`}
          data-cy="okr-card-icon-container"
        >
          {icon}
        </div>
        <div
          className="font-semibold text-[27px] leading-7 tracking-normal text-gray-900"
          data-cy="okr-card-value"
        >
          {value}
        </div>
      </div>
      <div className="flex flex-col mt-3" data-cy={`${dataCy}-body`}>
        <div
          className={`${labelClassName} w-full font-normal text-base text-start`}
          data-cy="okr-card-label"
        >
          {label}
        </div>
        <div className="flex gap-2 items-center" data-cy="okr-card-details">
          <Progress
            percent={percent}
            showInfo={false}
            strokeColor="#1f4fd8"
            trailColor="#e5e7eb"
          />
        </div>
      </div>
    </Card>
  );
}
