'use client';

import React, { useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler,
  type ChartOptions,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler,
);

export type CadencePoint = {
  label: string;
  score: number | null;
};

type Props = {
  points: CadencePoint[];
  dataCy: string;
};

export default function BscKpiCadenceLineChart({ points, dataCy }: Props) {
  const data = useMemo(
    () => ({
      labels: points.map((p) => p.label),
      datasets: [
        {
          label: 'Score %',
          data: points.map((p) => (p.score == null ? null : p.score)),
          borderColor: '#1f4fd8',
          backgroundColor: 'rgba(31, 79, 216, 0.12)',
          borderWidth: 2,
          pointBackgroundColor: '#1f4fd8',
          pointBorderColor: '#fff',
          pointRadius: 4,
          pointHoverRadius: 6,
          tension: 0.35,
          fill: true,
          spanGaps: false,
        },
      ],
    }),
    [points],
  );

  const options: ChartOptions<'line'> = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx) => {
              const v = ctx.parsed.y;
              return v == null ? 'Not reported' : `Score: ${v.toFixed(1)}%`;
            },
          },
        },
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: '#6b7280', font: { size: 11 } },
        },
        y: {
          min: 0,
          max: 100,
          ticks: {
            color: '#6b7280',
            font: { size: 11 },
            callback: (value) => `${value}%`,
          },
          grid: { color: 'rgba(148, 163, 184, 0.35)' },
        },
      },
    }),
    [],
  );

  return (
    <div className="h-[240px] w-full" data-cy={dataCy}>
      <Line data={data} options={options} />
    </div>
  );
}
