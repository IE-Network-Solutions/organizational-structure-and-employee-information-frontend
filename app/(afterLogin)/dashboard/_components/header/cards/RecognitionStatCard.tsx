'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { Card } from 'antd';
import { IoMdTrendingDown, IoMdTrendingUp } from 'react-icons/io';
import {
  okrHeaderCardShellClass,
  slidePercent,
  type RecognitionStat,
} from './shared';

interface RecognitionStatCardProps {
  label: string;
  stats: RecognitionStat[];
  icon: ReactNode;
  iconBgClassName: string;
  dataCy: string;
}

/**
 * KPI card whose value and trend rotate through one slide per dimension
 * (Engagement / KPI). Used by both Appreciation and Reprimand.
 */
export default function RecognitionStatCard({
  label,
  stats,
  icon,
  iconBgClassName,
  dataCy,
}: RecognitionStatCardProps) {
  const [slideIndex, setSlideIndex] = useState(0);

  useEffect(() => {
    if (stats.length <= 1) return;
    const interval = setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % stats.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [stats.length]);

  const offset = slidePercent(slideIndex, stats.length);

  return (
    <Card
      bordered={false}
      bodyStyle={{ padding: 0 }}
      className={`${okrHeaderCardShellClass} transition-transform duration-300`}
      data-cy={dataCy}
    >
      <div
        className="flex items-center justify-between"
        data-cy={`${dataCy}-header`}
      >
        <div
          className="grid grid-cols-12 items-center gap-2"
          data-cy={`${dataCy}-title-grid`}
        >
          <div
            className={`col-span-4 rounded-[4px] ${iconBgClassName} flex items-center justify-center max-w-[34px] max-h-[34px] w-[34px] h-[34px]`}
            data-cy={`${dataCy}-icon-container`}
          >
            {icon}
          </div>
          <div
            className="col-span-8 text-gray-500 font-normal text-base w-full text-start"
            data-cy={`${dataCy}-label`}
          >
            {label}
          </div>
        </div>

        <div
          className="min-w-[3rem] max-w-[40%] flex-none overflow-hidden text-right"
          data-cy={`${dataCy}-value`}
        >
          <div
            className="flex transition-transform duration-500 ease-in-out"
            style={{
              width: `${stats.length * 100}%`,
              transform: `translateX(-${offset}%)`,
            }}
            data-cy={`${dataCy}-value-slider`}
          >
            {stats.map((stat) => (
              <div
                key={stat.id}
                className="flex shrink-0 items-center justify-end tabular-nums"
                style={{ width: `${100 / stats.length}%` }}
                data-cy={`${dataCy}-value-slide-${stat.id}`}
              >
                <span
                  className="font-semibold text-[27px] leading-none tracking-normal text-gray-900"
                  data-cy={`${dataCy}-value-${stat.id}`}
                >
                  {stat.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-3 overflow-hidden" data-cy={`${dataCy}-body`}>
        <div
          className="flex transition-transform duration-500 ease-in-out"
          style={{
            width: `${stats.length * 100}%`,
            transform: `translateX(-${offset}%)`,
          }}
          data-cy={`${dataCy}-trend-row`}
        >
          {stats.map((stat) => {
            const isUp = stat.trendDirection === 'up';
            return (
              <div
                key={stat.id}
                className="flex shrink-0 items-center justify-between text-xs mt-6"
                style={{ width: `${100 / stats.length}%` }}
                data-cy={`${dataCy}-trend-slide-${stat.id}`}
              >
                <span
                  className="text-gray-500 text-sm"
                  data-cy={`${dataCy}-dimension`}
                >
                  {stat.label}
                </span>
                <div
                  className="flex items-center gap-1 text-sm"
                  data-cy={`${dataCy}-trend-meta`}
                >
                  <span
                    className={`${isUp ? 'text-[#52C41A]' : 'text-red-500'} flex items-center gap-1`}
                    data-cy={`${dataCy}-trend`}
                  >
                    {isUp ? (
                      <IoMdTrendingUp
                        size={14}
                        className="text-[#52C41A]"
                        data-cy={`${dataCy}-trend-icon-up`}
                      />
                    ) : (
                      <IoMdTrendingDown
                        size={14}
                        className="text-red-500"
                        data-cy={`${dataCy}-trend-icon-down`}
                      />
                    )}
                    {stat.trendLabel}
                  </span>
                  <span
                    className="text-gray-500"
                    data-cy={`${dataCy}-trend-period`}
                  >
                    Last Month
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}
