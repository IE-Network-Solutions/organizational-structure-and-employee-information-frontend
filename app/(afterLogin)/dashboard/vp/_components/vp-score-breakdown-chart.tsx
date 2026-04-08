'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Title,
  Tooltip,
  type Plugin,
  type ChartOptions,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import dayjs from 'dayjs';
import { Skeleton } from 'antd';
import {
  useGetAllMonth,
  useGetVPLineGraphDataByMonth,
} from '@/store/server/features/okrplanning/okr/dashboard/VP/queries';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const barBackgroundPlugin: Plugin<'bar'> = {
  id: 'barBackgroundPlugin',
  beforeDatasetsDraw(chart) {
    const yScale = chart.scales.y;
    if (!yScale) return;

    const zeroPixel = yScale.getPixelForValue(0);
    const maxFromOptions = (
      chart.options.scales?.y as { max?: number } | undefined
    )?.max;
    const maxValue = typeof maxFromOptions === 'number' ? maxFromOptions : yScale.max;
    const topPixel = yScale.getPixelForValue(maxValue);

    const targetIndexes = chart.data.datasets
      .map((dataset, index) => ({ label: dataset.label, index }))
      .filter(({ label }) => label === 'VP Score')
      .map(({ index }) => index);

    const { ctx } = chart;
    ctx.save();
    ctx.fillStyle = '#F0F0F0';

    targetIndexes.forEach((datasetIndex) => {
      const meta = chart.getDatasetMeta(datasetIndex);
      meta.data.forEach((barElement) => {
        const { x, width } = barElement.getProps(['x', 'width'], true);
        const left = x - width / 2;
        const height = zeroPixel - topPixel;
        ctx.fillRect(left, topPixel, width, height);
      });
    });

    ctx.restore();
  },
};

const VPScoreBreakdownChart = () => {
  const userId = useAuthenticationStore.getState().userId;
  const { data: monthData } = useGetAllMonth();
  const [isMobile, setIsMobile] = useState(false);

  const selectedMonth = useMemo(
    () => monthData?.items?.map((month: any) => month.id) ?? [],
    [monthData],
  );

  const { data: lineGraphByMonth, isLoading } = useGetVPLineGraphDataByMonth(
    userId,
    selectedMonth,
  );

  const displayData = useMemo(() => {
    if (!lineGraphByMonth) return [];

    const mapped = lineGraphByMonth.map((item: any) => {
      const matchedMonth = monthData?.items?.find((m: any) => m.id === item.monthId);
      return {
        ...item,
        monthName: matchedMonth?.startDate
          ? dayjs(matchedMonth.startDate).format('MMMM')
          : matchedMonth?.name,
      };
    });

    return mapped.sort(
      (a: any, b: any) => dayjs(a.createdAt).valueOf() - dayjs(b.createdAt).valueOf(),
    );
  }, [lineGraphByMonth, monthData]);

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

  const chartData = {
    labels: displayData.map((month: any) =>
      month.monthName ? month.monthName.toUpperCase().slice(0, 3) : 'N/A',
    ),
    datasets: [
      {
        label: 'VP Score',
        data: displayData.map((item: any) => Number(item.vpScore ?? 0)),
        backgroundColor: '#1d4ed8',
        borderRadius: {
          topLeft: 100,
          topRight: 100,
          bottomLeft: 0,
          bottomRight: 0,
        },
        maxBarThickness: 22,
        borderSkipped: false as const,
        barPercentage: 0.62,
        categoryPercentage: 0.7,
      },
    ],
  };

  const yAxisMax = useMemo(() => {
    const all = (chartData.datasets[0]?.data ?? []) as number[];
    const peak = Math.max(0, ...all);
    if (peak === 0) return 100;
    return Math.ceil(peak / 25) * 25;
  }, [chartData.datasets]);

  const yAxisStep = useMemo(() => {
    const baseStep = Math.max(2, Math.ceil(yAxisMax / 6));
    return baseStep % 2 === 0 ? baseStep : baseStep + 1;
  }, [yAxisMax]);

  const options: ChartOptions<'bar'> = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
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
          max: yAxisMax,
          border: {
            display: true,
            color: '#D1D5DB',
            dash: [2, 4],
          },
          ticks: {
            stepSize: yAxisStep,
            color: '#8c8c8c',
            font: {
              size: isMobile ? 10 : 12,
            },
          },
          grid: {
            color: '#D1D5DB',
            borderDash: [1, 6],
          },
        },
        x: {
          border: {
            display: true,
            color: '#D1D5DB',
            dash: [2, 4],
          },
          grid: {
            display: true,
            color: '#D1D5DB',
            borderDash: [1, 6],
          },
          ticks: {
            maxRotation: 0,
            minRotation: 0,
            autoSkip: false,
            color: '#8c8c8c',
            font: {
              size: isMobile ? 10 : 12,
            },
          },
        },
      },
    }),
    [isMobile, yAxisMax, yAxisStep],
  );

  return (
    <div className="rounded-lg border border-[#e6e6e6] bg-white p-4 h-full min-h-[409px]">
      <h3 className="text-base font-bold text-[#2b2b2b] mb-4">VP Score Breakdown</h3>
      <div className="h-[360px]">
        {isLoading ? (
          <Skeleton active paragraph={{ rows: 8 }} />
        ) : (
          <Bar data={chartData} options={options} plugins={[barBackgroundPlugin]} />
        )}
      </div>
    </div>
  );
};

export default VPScoreBreakdownChart;
