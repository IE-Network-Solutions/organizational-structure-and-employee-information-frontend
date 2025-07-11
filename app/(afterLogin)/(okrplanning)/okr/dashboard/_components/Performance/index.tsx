import { Select, Spin } from 'antd';
import React, { useEffect, useState } from 'react';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { useGetAssignedPlanningPeriodForUserId } from '@/store/server/features/employees/planning/planningPeriod/queries';
import { useGetReporting } from '@/store/server/features/okrPlanningAndReporting/queries';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

const Performance: React.FC = () => {
  const { userId } = useAuthenticationStore();
  const { data: assignedPeriods } = useGetAssignedPlanningPeriodForUserId();
  const [selectedPeriod, setSelectedPeriod] = useState('Weekly');
  const [selectedPeriodId, setSelectedPeriodId] = useState<string | undefined>(
    undefined,
  );

  // Find available period types for the user
  const availablePeriods = assignedPeriods?.map(
    (p: any) => p.planningPeriod?.name,
  ) || ['Daily', 'Weekly', 'Monthly'];

  // Find the periodId for the selected period
  useEffect(() => {
    if (assignedPeriods) {
      const found = assignedPeriods.find(
        (p: any) => p.planningPeriod?.name === selectedPeriod,
      );
      setSelectedPeriodId(found?.planningPeriodId);
    }
  }, [assignedPeriods, selectedPeriod]);

  // Fetch reporting data for the selected period
  const { data: reportData, isLoading } = useGetReporting({
    userId: [userId],
    planPeriodId: selectedPeriodId ?? '',
    pageReporting: 1,
    pageSizeReporting: 100,
  });

  // Helper to get start of week (Monday) and start/end of month
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - ((today.getDay() + 6) % 7)); // Monday

  let filteredItems = reportData?.items || [];
  if (selectedPeriod === 'Daily') {
    // For daily, sort by createdAt date and take the last 5 days
    filteredItems = filteredItems
      .sort(
        (a: any, b: any) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
      .slice(0, 5)
      .reverse();
  } else if (selectedPeriod === 'Weekly') {
    // For weekly, sort by createdAt date and take the last 4 weeks
    filteredItems = filteredItems
      .sort(
        (a: any, b: any) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
      .slice(0, 4)
      .reverse();
  } else if (selectedPeriod === 'Monthly') {
    filteredItems = filteredItems
      .sort(
        (a: any, b: any) =>
          Number(b.monthNumber || 0) - Number(a.monthNumber || 0),
      )
      .slice(0, 3)
      .reverse();
  }

  // --- Bar color logic for all periods ---
  let barColors: string[] = [];
  if (filteredItems.length > 0) {
    const scores = filteredItems.map((item: any) => {
      const scoreStr = item?.reportScore || '0%%';
      const numericScore = parseFloat(scoreStr.replace('%%', ''));
      return isNaN(numericScore) ? 0 : numericScore;
    });
    const max = Math.max(...scores);
    const min = Math.min(...scores);
    barColors = scores.map((score: number) => {
      if (score === max) return '#4C4CFF'; // Highest Average Score
      if (score === min) return '#E0E0FF'; // Low Average Score
      return '#8C8CFF'; // Average Score
    });
  }

  const chartLabels =
    filteredItems.map((item: any, idx: number) => {
      if (selectedPeriod === 'Daily') {
        // Format date as DD/MM/YYYY for daily view
        const date = new Date(item.createdAt);
        return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
      }
      if (selectedPeriod === 'Weekly') {
        // Use Week 1, Week 2, ...
        return `Week ${idx + 1}`;
      }
      if (selectedPeriod === 'Monthly') return item?.monthName || '';
      return '';
    }) || [];

  const chartScores =
    filteredItems.map((item: any) => {
      const scoreStr = item?.reportScore || '0%%';
      const numericScore = parseFloat(scoreStr.replace('%%', ''));
      return isNaN(numericScore) ? 0 : numericScore;
    }) || [];

  const chartData = {
    labels: chartLabels,
    datasets: [
      {
        label: 'Score',
        data: chartScores,
        backgroundColor: barColors,
        borderRadius: 10,
        barThickness: 40,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: false },
      tooltip: { enabled: true },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: { stepSize: 20 },
        grid: { color: '#F0F0F0' },
      },
      x: {
        grid: { display: false },
        ticks: { font: { family: 'inherit', size: 14 } },
      },
    },
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6 w-full h-full min-h-[420px] flex flex-col pb-4">
      <div className="flex justify-between items-center mb-2">
        <div className="text-xl font-bold text-gray-800">Performance</div>
        <Select
          placeholder="Period"
          allowClear={false}
          className="w-28 h-9 rounded-md text-base font-normal"
          value={selectedPeriod}
          onChange={setSelectedPeriod}
          dropdownStyle={{ minWidth: '100px' }}
        >
          {['Daily', 'Weekly', 'Monthly']
            .filter((p) => availablePeriods.includes(p))
            .map((period) => (
              <Select.Option key={period} value={period}>
                {period}
              </Select.Option>
            ))}
        </Select>
      </div>
      <div className="flex-1 flex items-center justify-center">
        {isLoading ? <Spin /> : <Bar data={chartData} options={chartOptions} />}
      </div>
      {/* Custom Legend for all periods */}
      <div className="flex w-full justify-between mt-6 px-8">
        <div className="flex items-center gap-3">
          <span
            className="inline-block w-5 h-5 rounded-md"
            style={{ background: '#4C4CFF' }}
          ></span>
          <span className="text-xs text-gray-700 font-medium">
            Highest Average Score
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span
            className="inline-block w-5 h-5 rounded-md"
            style={{ background: '#8C8CFF' }}
          ></span>
          <span className="text-xs text-gray-700 font-medium">
            Average Score
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span
            className="inline-block w-5 h-5 rounded-md"
            style={{ background: '#E0E0FF' }}
          ></span>
          <span className="text-xs text-gray-700 font-medium">
            Low Average Score
          </span>
        </div>
      </div>
    </div>
  );
};

export default Performance;
