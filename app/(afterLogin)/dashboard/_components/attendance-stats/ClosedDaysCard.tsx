'use client';

import React, { useEffect, useState } from 'react';
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
  carouselIntervalMs?: number;
};

const slidePercent = (index: number, length: number) =>
  length > 0 ? (index * 100) / length : 0;

export default function ClosedDaysCard({
  title,
  count,
  periodLabel,
  items,
  icon,
  iconBgClassName,
  dataCy,
  carouselIntervalMs = 3000,
}: ClosedDaysCardProps) {
  const cy = dataCy ?? 'closed-days-card';
  const list = items ?? [];
  const [slideIndex, setSlideIndex] = useState(0);

  useEffect(() => {
    setSlideIndex(0);
  }, [list.length]);

  useEffect(() => {
    if (list.length <= 1) return;
    const interval = setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % list.length);
    }, carouselIntervalMs);
    return () => clearInterval(interval);
  }, [list.length, carouselIntervalMs]);

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

        <div
          className="mt-3 overflow-hidden min-h-[2.5rem]"
          data-cy={`${cy}-detail`}
        >
          {list.length === 0 ? (
            <p
              className="text-black/70 font-normal text-sm "
              data-cy={`${cy}-empty`}
            >
              No closed days
            </p>
          ) : list.length === 1 ? (
            <div className="flex flex-col" data-cy={`${cy}-first-item`}>
              <p
                className="text-black/70 font-normal text-sm "
                data-cy={`${cy}-first-date`}
              >
                {list[0].date}
              </p>
              <p
                className="text-black/45 font-normal text-sm "
                data-cy={`${cy}-first-name`}
              >
                {list[0].name}
              </p>
            </div>
          ) : (
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{
                width: `${list.length * 100}%`,
                transform: `translateX(-${slidePercent(slideIndex, list.length)}%)`,
              }}
              data-cy={`${cy}-detail-slider`}
            >
              {list.map((item, i) => (
                <div
                  key={`${item.date}-${item.name}-${i}`}
                  className="flex shrink-0 flex-col"
                  style={{ width: `${100 / list.length}%` }}
                  data-cy={`${cy}-slide-${i}`}
                >
                  <p
                    className="text-black/70 font-normal text-sm "
                    data-cy={`${cy}-slide-${i}-date`}
                  >
                    {item.date}
                  </p>
                  <p
                    className="text-black/45 font-normal text-sm "
                    data-cy={`${cy}-slide-${i}-name`}
                  >
                    {item.name}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
