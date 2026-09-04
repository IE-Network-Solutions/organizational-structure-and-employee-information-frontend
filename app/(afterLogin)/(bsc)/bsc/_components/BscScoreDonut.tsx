'use client';

import React, { useMemo } from 'react';
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  type ChartOptions,
} from 'chart.js';
import { formatScore } from '@/utils/bsc/rollup';

ChartJS.register(ArcElement, Tooltip, Legend);

const DEFAULT_COLORS = [
  '#1c3ca5',
  '#1f4fd8',
  '#4F8CFF',
  '#22C55E',
  '#FACC15',
  '#06B6D4',
  '#8B5CF6',
  '#9ca3af',
];

export type BscDonutSegment = {
  label: string;
  value: number;
  color?: string;
};

type Props = {
  centerValue: number;
  centerSuffix?: string;
  segments: BscDonutSegment[];
  dataCy: string;
  sizeClassName?: string;
};

/**
 * VP-style attainment / contribution donut (presentation only).
 * Pattern mirrors variable-pay `vpScoreCard` cutout + center overlay.
 */
export default function BscScoreDonut({
  centerValue,
  centerSuffix = '%',
  segments,
  dataCy,
  sizeClassName = 'h-[120px] w-[120px] md:h-[140px] md:w-[140px]',
}: Props) {
  const chartData = useMemo(() => {
    const values = segments.map((s) => Math.max(0, Number(s.value) || 0));
    const hasData = values.some((v) => v > 0);
    return {
      labels: segments.map((s) => s.label),
      datasets: [
        {
          data: hasData ? values : [1],
          backgroundColor: hasData
            ? segments.map(
                (s, i) => s.color || DEFAULT_COLORS[i % DEFAULT_COLORS.length],
              )
            : ['#e5e7eb'],
          borderWidth: 0,
          borderRadius: 2,
          spacing: 2,
          hoverOffset: 0,
        },
      ],
    };
  }, [segments]);

  const chartOptions: ChartOptions<'doughnut'> = useMemo(
    () => ({
      cutout: '70%',
      plugins: {
        legend: { display: false },
        tooltip: {
          enabled: segments.some((s) => s.value > 0),
          callbacks: {
            title: (items) => items?.[0]?.label ?? '',
            label: (context) => {
              const index = context.dataIndex ?? 0;
              const item = segments[index];
              const raw = Number(context.raw ?? item?.value ?? 0);
              return `${item?.label || 'Score'}: ${formatScore(raw)}%`;
            },
          },
        },
      },
      elements: {
        arc: { borderWidth: 0 },
      },
    }),
    [segments],
  );

  return (
    <div
      className={`relative flex-shrink-0 ${sizeClassName}`}
      data-cy={dataCy}
    >
      <Doughnut data={chartData} options={chartOptions} />
      <div
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
        data-cy={`${dataCy}-center`}
      >
        <span
          className="text-xl font-bold text-gray-900 md:text-2xl"
          data-cy={`${dataCy}-center-value`}
        >
          {formatScore(centerValue)}
          {centerSuffix}
        </span>
      </div>
    </div>
  );
}
