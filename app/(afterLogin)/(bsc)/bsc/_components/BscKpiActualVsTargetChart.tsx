'use client';

import React, { useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
  type ChartOptions,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export type ActualTargetPoint = {
  label: string;
  actual: number | null;
  target: number | null;
};

type Props = {
  points: ActualTargetPoint[];
  unit?: string;
  dataCy: string;
};

export default function BscKpiActualVsTargetChart({
  points,
  unit,
  dataCy,
}: Props) {
  const data = useMemo(
    () => ({
      labels: points.map((p) => p.label),
      datasets: [
        {
          label: 'Actual',
          data: points.map((p) => p.actual),
          backgroundColor: 'rgba(178, 178, 255, 1)',
          barThickness: 22,
        },
        {
          label: 'Target',
          data: points.map((p) => p.target),
          backgroundColor: 'rgba(54, 54, 240, 1)',
          barThickness: 22,
        },
      ],
    }),
    [points],
  );

  const options: ChartOptions<'bar'> = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: { boxWidth: 12, color: '#555', font: { size: 12 } },
        },
        tooltip: {
          callbacks: {
            label: (ctx) => {
              const v = ctx.parsed.y;
              if (v == null) return `${ctx.dataset.label}: —`;
              const suffix = unit ? ` ${unit}` : '';
              return `${ctx.dataset.label}: ${v}${suffix}`;
            },
          },
        },
      },
      scales: {
        x: {
          ticks: { color: '#555', font: { size: 11 } },
          grid: { display: false },
        },
        y: {
          ticks: { color: '#555', font: { size: 11 } },
          grid: { color: 'rgba(200, 200, 200, 0.25)' },
        },
      },
    }),
    [unit],
  );

  return (
    <div className="h-[240px] w-full" data-cy={dataCy}>
      <Bar data={data} options={options} />
    </div>
  );
}
