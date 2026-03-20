'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { Card, DatePicker } from 'antd';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

const { RangePicker } = DatePicker;

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

export default function HireVsResignationTrendChart({
  'data-cy': dataCy = 'hire-vs-resignation-trend',
}: {
  'data-cy'?: string;
}) {
  // UI-only date range (wire to API later if you have an endpoint).
  const [range, setRange] = useState<[any, any] | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 640px)');
    const handleViewportChange = (event: MediaQueryListEvent) => {
      setIsMobile(event.matches);
    };

    setIsMobile(mediaQuery.matches);
    mediaQuery.addEventListener('change', handleViewportChange);

    return () => {
      mediaQuery.removeEventListener('change', handleViewportChange);
    };
  }, []);

  const chartData = useMemo(() => {
    // Example values to match the attached UI shape.
    // Replace with API data once you provide/confirm the endpoint.
    const labels = ['Feb', 'Jan', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const hire = [40, 60, 15, 65, 30, 20, 35, 55, 60, 25, 75, 65];
    const resignation = [15, 10, 50, 70, 100, 20, 30, 25, 45, 60, 25, 70];

    return {
      labels,
      datasets: [
        {
          label: 'Hire',
          data: hire,
          backgroundColor: '#1D4ED8', // blue
          borderRadius: {
            topLeft: 25,
            topRight: 25,
            bottomLeft: 0,
            bottomRight: 0,
          },
        },
        {
          label: 'Resignation',
          data: resignation,
          backgroundColor: '#EF4444', // red
          borderRadius: {
            topLeft: 25,
            topRight: 25,
            bottomLeft: 0,
            bottomRight: 0,
          },
        },
      ],
    };
  }, []);

  const options = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top' as const,
          labels: {
            boxWidth: isMobile ? 8 : 10,
            boxHeight: isMobile ? 8 : 10,
            padding: isMobile ? 8 : 10,
            font: {
              size: isMobile ? 11 : 12,
            },
          },
        },
        title: {
          display: false,
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 100,
          ticks: {
            stepSize: 25,
            font: {
              size: isMobile ? 10 : 12,
            },
          },
          grid: {
            color: '#E5E7EB',
          },
        },
        x: {
          grid: {
            display: false,
          },
          ticks: {
            maxRotation: 0,
            minRotation: 0,
            autoSkip: isMobile,
            maxTicksLimit: isMobile ? 6 : 12,
            font: {
              size: isMobile ? 10 : 12,
            },
          },
        },
      },
    }),
    [isMobile],
  );

  return (
    <Card
      className="shadow-sm border border-gray-200 rounded-lg min-h-[355px] w-full h-full"
      bodyStyle={{ padding: 16 }}
      id="hire-vs-resignation-trend-card"
      data-cy={dataCy}
    >
      <div
        className="mb-2 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-start sm:gap-4"
        id="hire-vs-resignation-trend-header"
        data-cy="hire-vs-resignation-trend-header"
      >
        <div>
          <h3 className="text-[16px] font-semibold text-gray-900">
            Hire vs Resignation Trend
          </h3>
        </div>

        <RangePicker
          value={range as any}
          onChange={(value) => setRange(value ? (value as any) : null)}
          className="h-9 w-full sm:w-auto"
          id="hire-vs-resignation-trend-date-range"
          data-cy="hire-vs-resignation-trend-date-range"
        />
      </div>

      <div
        className="h-[220px] sm:h-[281px]"
        id="hire-vs-resignation-trend-chart-wrapper"
        data-cy="hire-vs-resignation-trend-chart-wrapper"
      >
        <Bar
          options={options as any}
          data={chartData as any}
          id="hire-vs-resignation-trend-chart"
          data-cy="hire-vs-resignation-trend-chart"
          style={{
            opacity: 1,
            transform: 'rotate(0deg)',
            width: '100%',
            height: '100%',
          }}
        />
      </div>
    </Card>
  );
}

