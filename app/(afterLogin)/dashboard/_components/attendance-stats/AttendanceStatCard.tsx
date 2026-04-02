'use client';

import React from 'react';
import { Card } from 'antd';
import type { CSSProperties } from 'react';

type AttendanceStatCardProps = {
  title: string;
  value: any;
  footer?: React.ReactNode;
  icon: React.ReactNode;
  iconBgClassName: string;
  iconStyle?: CSSProperties;
  dataCy?: string;
};

export default function AttendanceStatCard({
  title,
  value,
  footer,
  icon,
  iconBgClassName,
  iconStyle,
  dataCy,
}: AttendanceStatCardProps) {
  const cy = dataCy ?? 'attendance-stat-card';
  return (
    <Card
      bordered={false}
      bodyStyle={{ padding: 12 }}
      className="bg-white rounded-lg border border-[#E5E7EB] shadow-none h-[109px]"
      data-cy={dataCy}
    >
      <div className="flex flex-col h-full" data-cy={`${cy}-body`}>
        <div className="flex items-center gap-3" data-cy={`${cy}-header`}>
          <span
            className={`w-[34px] h-[34px] rounded-[4px] ${iconBgClassName} flex items-center justify-center shrink-0`}
            style={iconStyle}
            data-cy={`${cy}-icon`}
          >
            {icon}
          </span>
          <p
            className="text-base text-black/70 font-bold leading-4"
            data-cy={`${cy}-title`}
          >
            {title}
          </p>
        </div>

        <div
          className="flex items-center  gap-2 mt-3"
          data-cy={`${cy}-value-row`}
        >
          <div className="leading-[1.1] tabular-nums" data-cy={`${cy}-value`}>
            {value}
          </div>
          {footer ? (
            <div
              className="text-gray-500 font-normal text-[12px] mt-1 leading-4"
              data-cy={`${cy}-footer`}
            >
              {footer}
            </div>
          ) : null}
        </div>
      </div>
    </Card>
  );
}
