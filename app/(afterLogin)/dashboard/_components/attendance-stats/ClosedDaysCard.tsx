'use client';

import React from 'react';
import { Card } from 'antd';

type ClosedDayItem = {
  date: string;
  name: string;
};

type ClosedDaysCardProps = {
  title: string;
  count: number;
  periodLabel: string;
  items: ClosedDayItem[];
  icon: React.ReactNode;
  iconBgClassName: string;
  dataCy?: string;
};

export default function ClosedDaysCard({
  title,
  count,
  periodLabel,
  items,
  icon,
  iconBgClassName,
  dataCy,
}: ClosedDaysCardProps) {
  const first = items?.[0];
  const cy = dataCy ?? 'closed-days-card';

  return (
    <Card
      bordered={false}
      bodyStyle={{ padding: 12 }}
      className="bg-white rounded-lg border border-[#E5E7EB] shadow-none h-[109px]"
      data-cy={dataCy}
    >
      <div className="flex flex-col h-full" data-cy={`${cy}-body`}>
        <div
          className="flex items-center justify-between gap-4"
          data-cy={`${cy}-header-row`}
        >
          <div className="flex items-center gap-3" data-cy={`${cy}-title-row`}>
            <span
              className={`w-[34px] h-[34px] rounded-[4px] ${iconBgClassName} flex items-center justify-center shrink-0`}
              data-cy={`${cy}-icon`}
            >
              {icon}
            </span>
            <p
              className="text-black/70 font-bold text-base leading-4"
              data-cy={`${cy}-title`}
            >
              {title}
            </p>
          </div>

          <div className="text-right" data-cy={`${cy}-count-wrap`}>
            <div
              className="text-black font-bold text-base leading-5 tabular-nums"
              data-cy={`${cy}-count`}
            >
              {count}{' '}
              <span
                className="text-gray-500 font-normal text-14 leading-4"
                data-cy={`${cy}-period`}
              >
                {periodLabel}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-3" data-cy={`${cy}-detail`}>
          {first ? (
            <div className="flex flex-col" data-cy={`${cy}-first-item`}>
              <p
                className="text-black/70 font-normal text-sm "
                data-cy={`${cy}-first-date`}
              >
                {first.date}
              </p>
              <p
                className="text-black/45 font-normal text-sm "
                data-cy={`${cy}-first-name`}
              >
                {first.name}
              </p>
            </div>
          ) : (
            <p
              className="text-black/70 font-normal text-sm "
              data-cy={`${cy}-empty`}
            >
              No closed days
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}
