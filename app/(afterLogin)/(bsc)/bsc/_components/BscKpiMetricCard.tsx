'use client';

import React, { useLayoutEffect, useRef, useState } from 'react';
import { Progress } from 'antd';
import { formatScore } from '@/utils/bsc/rollup';

/** Shared KPI tile height and chrome (dashboard-aligned). */
export const bscKpiMetricCardHeightClass = 'h-[122px]';

export const bscKpiMetricCardBorderClass =
  'shadow-none rounded-lg border border-[#D9D9D9] bg-white px-3 pt-3 pb-5';

/** Vertical metric tile (Recent Score, roll-ups). */
export const bscKpiMetricCardShellClass = `flex ${bscKpiMetricCardHeightClass} flex-none flex-col gap-4 ${bscKpiMetricCardBorderClass}`;

/** Horizontal summary tile (KPI name + donut). */
export const bscKpiSummaryCardShellClass = `flex ${bscKpiMetricCardHeightClass} min-w-0 flex-1 flex-none items-center gap-3 ${bscKpiMetricCardBorderClass}`;

const kpiIcon = (
  <svg
    data-cy="bsckpimetriccard-svg-20"
    xmlns="http://www.w3.org/2000/svg"
    height="24px"
    viewBox="0 -960 960 960"
    width="24px"
    fill="#1677FF"
    aria-hidden
  >
    <path
      data-cy="bsckpimetriccard-path-28"
      d="M160-160v-320h160v320H160Zm240 0v-560h160v560H400Zm240 0v-200h160v200H640Z"
    />
  </svg>
);

type Props = {
  label: string;
  percent: number;
  dataCy: string;
  onClick?: () => void;
  className?: string;
};

export default function BscKpiMetricCard({
  label,
  percent,
  dataCy,
  onClick,
  className = '',
}: Props) {
  const value = Math.min(Math.max(Number(percent) || 0, 0), 100);
  const display = `${formatScore(value)}%`;
  const clickable = Boolean(onClick);

  const shellClass = `${bscKpiMetricCardShellClass} ${className} ${
    clickable ? 'cursor-pointer text-left' : 'cursor-default'
  }`;

  const content = (
    <>
      <div
        className="flex items-center justify-between"
        data-cy={`${dataCy}-header`}
      >
        <div
          className="flex h-[34px] w-[34px] items-center justify-center rounded-[4px] bg-[#E6F4FF]"
          data-cy={`${dataCy}-icon`}
        >
          {kpiIcon}
        </div>
        <div
          className="font-semibold text-[27px] leading-7 tracking-normal text-gray-900"
          data-cy={`${dataCy}-value`}
        >
          {display}
        </div>
      </div>
      <div className="mt-3 flex flex-col" data-cy={`${dataCy}-body`}>
        <div
          className="w-full text-start text-base font-normal text-gray-500"
          data-cy={`${dataCy}-label`}
        >
          {label}
        </div>
        <div className="flex items-center gap-2" data-cy={`${dataCy}-progress`}>
          <Progress
            size="small"
            percent={value}
            showInfo={false}
            strokeColor="#1f4fd8"
            trailColor="#e5e7eb"
            className="!m-0 w-full [&_.ant-progress-outer]:!w-full"
          />
        </div>
      </div>
    </>
  );

  if (clickable) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={shellClass}
        data-cy={dataCy}
      >
        {content}
      </button>
    );
  }

  return (
    <div className={shellClass} data-cy={dataCy}>
      {content}
    </div>
  );
}

const chipClassName =
  'm-0 inline-flex h-5 max-w-[148px] shrink-0 truncate rounded border border-[#91caff] bg-[#e6f4ff] px-1.5 text-[11px] font-normal leading-5 text-[#1677ff]';

type OverflowChipRowProps = {
  items: string[];
  onViewMore?: () => void;
  dataCy: string;
};

function OverflowChipRow({ items, onViewMore, dataCy }: OverflowChipRowProps) {
  const visibleRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const moreMeasureRef = useRef<HTMLButtonElement>(null);
  const [visibleCount, setVisibleCount] = useState(items.length);

  useLayoutEffect(() => {
    const visible = visibleRef.current;
    const measure = measureRef.current;
    if (!visible || !measure) return;

    const update = () => {
      const available = visible.clientWidth;
      const chips = Array.from(
        measure.querySelectorAll<HTMLElement>('[data-name-chip]'),
      );
      const moreWidth = moreMeasureRef.current?.offsetWidth ?? 72;
      const gap = 6;
      let used = 0;
      let count = 0;

      for (let i = 0; i < chips.length; i += 1) {
        const width = chips[i].offsetWidth;
        const isLast = i === chips.length - 1;
        const extra = isLast ? 0 : moreWidth + gap;
        const next = used + width + (count > 0 ? gap : 0) + extra;
        if (next > available) break;
        used += width + (count > 0 ? gap : 0);
        count += 1;
      }

      setVisibleCount(count);
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(visible);
    return () => observer.disconnect();
  }, [items]);

  if (!items.length) {
    return (
      <span
        className="text-[12px] text-[#8F94A3]"
        data-cy={`${dataCy}-empty`}
      >
        None assigned
      </span>
    );
  }

  const hasMore = visibleCount < items.length;
  const shown = items.slice(0, Math.max(visibleCount, 0));

  return (
    <div className="relative min-w-0" data-cy={`${dataCy}-chips`}>
      <div
        ref={measureRef}
        className="pointer-events-none invisible absolute left-0 top-0 flex h-5 items-center gap-1.5 whitespace-nowrap"
        aria-hidden
      >
        {items.map((item, index) => (
          <span key={`${item}-${index}`} data-name-chip className={chipClassName}>
            {item}
          </span>
        ))}
        <button
          ref={moreMeasureRef}
          type="button"
          tabIndex={-1}
          className="shrink-0 border-none bg-transparent p-0 text-[12px] font-medium text-[#1677ff]"
        >
          View more
        </button>
      </div>
      <div
        ref={visibleRef}
        className="flex min-w-0 items-center gap-1.5 overflow-hidden"
      >
        {shown.map((item, index) => (
          <span
            key={`${item}-${index}`}
            data-name-chip
            className={chipClassName}
            title={item}
          >
            {item}
          </span>
        ))}
        {hasMore ? (
          <button
            type="button"
            onClick={onViewMore}
            className="shrink-0 cursor-pointer border-none bg-transparent p-0 text-[12px] font-medium text-[#1677ff] hover:underline"
            data-cy={`${dataCy}-view-more`}
          >
            View more
          </button>
        ) : null}
      </div>
    </div>
  );
}

type CountCardProps = {
  label: string;
  items: string[];
  dataCy: string;
  onViewMore?: () => void;
  className?: string;
};

/** Count tile matching KPI card chrome (Departments, Roles, People). */
export function BscKpiCountCard({
  label,
  items,
  dataCy,
  onViewMore,
  className = '',
}: CountCardProps) {
  return (
    <div
      className={`${bscKpiMetricCardShellClass} justify-between ${className}`}
      data-cy={dataCy}
    >
      <div
        className="flex items-center justify-between gap-2"
        data-cy={`${dataCy}-header`}
      >
        <div className="flex min-w-0 items-center gap-2">
          <div
            className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-[4px] bg-[#E6F4FF]"
            data-cy={`${dataCy}-icon`}
          >
            {kpiIcon}
          </div>
          <span
            className="truncate text-base font-normal text-gray-500"
            data-cy={`${dataCy}-label`}
          >
            {label}
          </span>
        </div>
        <div
          className="shrink-0 font-semibold text-[27px] leading-7 tracking-normal text-gray-900"
          data-cy={`${dataCy}-value`}
        >
          {items.length}
        </div>
      </div>
      <OverflowChipRow
        items={items}
        onViewMore={onViewMore}
        dataCy={dataCy}
      />
    </div>
  );
}


