import { Select, Spin } from 'antd';
import React, { useEffect, useState, useMemo } from 'react';
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

// Custom plugin for background bands (alternating horizontal stripes)
const backgroundBandsPlugin = {
  id: 'backgroundBands',
  beforeDraw: (chart: any) => {
    const { ctx, chartArea, scales } = chart;
    if (!chartArea) return;

    const yScale = scales.y;
    ctx.save();
    ctx.fillStyle = 'rgba(229, 231, 235, 0.4)'; // Light gray with opacity

    // Create alternating horizontal bands
    const bandHeight = yScale.height / 3; // 3 bands for 3 bars

    for (let i = 0; i < 3; i++) {
      const y = yScale.getPixelForValue(i) - (bandHeight / 2);
      if (y !== null && !isNaN(y)) {
        ctx.fillRect(chartArea.left, y, chartArea.width, bandHeight);
      }
    }
    ctx.restore();
  },
};

// Custom plugin for grid lines - ALL dotted
const customGridPlugin = {
  id: 'customGrid',
  afterDraw: (chart: any) => {
    const { ctx, chartArea, scales } = chart;
    if (!chartArea) return;

    const xScale = scales.x;
    const yScale = scales.y;

    ctx.save();
    ctx.strokeStyle = '#E5E7EB';
    ctx.lineWidth = 0.8;
    ctx.setLineDash([2, 3]); // ALL lines dotted

    // Draw vertical grid lines at 0, 10, 20, ..., 100
    for (let i = 0; i <= 100; i += 10) {
      const x = xScale.getPixelForValue(i);
      if (x !== null) {
        ctx.beginPath();
        ctx.moveTo(x, chartArea.top);
        ctx.lineTo(x, chartArea.bottom);
        ctx.stroke();
      }
    }

    // Draw FOUR horizontal dotted lines with bars positioned in the middle
    // Line 1: Above Month bar
    const line1Y = yScale.getPixelForValue(0) - (yScale.height / 2);
    // Line 2: Between Month and Week bars
    const line2Y = yScale.getPixelForValue(0) + (yScale.height / 2);
    // Line 3: Between Week and Day bars  
    const line3Y = yScale.getPixelForValue(1) + (yScale.height / 2);
    // Line 4: Below Day bar
    const line4Y = yScale.getPixelForValue(2) + (yScale.height / 2);

    [line1Y, line2Y, line3Y, line4Y].forEach((y) => {
      if (y !== null && !isNaN(y)) {
        ctx.beginPath();
        ctx.moveTo(chartArea.left, y);
        ctx.lineTo(chartArea.right, y);
        ctx.stroke();
      }
    });

    ctx.restore();
  },
};

// Custom plugin for value labels at the end of bars
const valueLabelsPlugin = {
  id: 'valueLabels',
  afterDraw: (chart: any) => {
    const { ctx, chartArea, data, scales } = chart;
    if (!chartArea) return;
    
    const xScale = scales.x;
    const yScale = scales.y;
    
    ctx.save();
    ctx.font = '500 12px inherit';
    ctx.fillStyle = '#374151';
    ctx.textAlign = 'left';
    
    data.datasets[0].data.forEach((value: number, index: number) => {
      const x = xScale.getPixelForValue(value) + 12; // 12px offset from bar end
      const y = yScale.getPixelForValue(index) + (yScale.height / 2) + 4; // Center vertically
      
      ctx.fillText(value.toFixed(2), x, y);
    });
    
    ctx.restore();
  }
};

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  customGridPlugin,
  valueLabelsPlugin,
  backgroundBandsPlugin
);

const Performance: React.FC = () => {
  const { userId } = useAuthenticationStore();
  const { data: assignedPeriods } = useGetAssignedPlanningPeriodForUserId();
  const [selectedPeriod, setSelectedPeriod] = useState('All');
  const [selectedPeriodId, setSelectedPeriodId] = useState<string | undefined>(
    undefined,
  );

  // Get available planning periods for the current user
  const availablePeriods = useMemo(() => {
    if (!assignedPeriods) return [];
    return assignedPeriods.map((p: any) => ({
      id: p.planningPeriodId,
      name: p.planningPeriod?.name || 'Unknown',
      intervalType: p.planningPeriod?.intervalType || 'unknown'
    }));
  }, [assignedPeriods]);

  // Find the periodId for the selected period
  useEffect(() => {
    if (assignedPeriods && selectedPeriod !== 'All') {
      const found = assignedPeriods.find(
        (p: any) => p.planningPeriodId === selectedPeriod,
      );
      setSelectedPeriodId(found?.planningPeriodId);
    } else {
      setSelectedPeriodId(undefined);
    }
  }, [assignedPeriods, selectedPeriod]);

  // Fetch reporting data for the selected period
  const { data: reportData, isLoading } = useGetReporting({
    userId: [userId],
    planPeriodId: selectedPeriodId ?? '',
    pageReporting: 1,
    pageSizeReporting: 100,
  });

  // For the "All" view, show all available planning periods with sample data
  let chartLabels: string[] = [];
  let chartScores: number[] = [];
  
  if (selectedPeriod === 'All') {
    // Show all available planning periods with sample data
    chartLabels = availablePeriods.map(p => p.name);
    // Generate sample scores for each period (you can replace this with actual aggregated data)
    chartScores = availablePeriods.map((_, index) => {
      const baseScore = 50;
      const variation = Math.random() * 40 + 20; // Random score between 20-60
      return Math.round((baseScore + variation) * 100) / 100;
    });
  } else {
    // Use actual data for specific periods
    let filteredItems = reportData?.items || [];
    
    // Sort by creation date for most recent items
    filteredItems = filteredItems
      .sort(
        (a: any, b: any) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
      .slice(0, 5) // Get last 5 items
      .reverse();

    // Generate labels based on the selected period type
    chartLabels = filteredItems.map((item: any, idx: number) => {
      const selectedPeriodData = availablePeriods.find(p => p.id === selectedPeriod);
      const periodName = selectedPeriodData?.name || 'Unknown';
      
      if (selectedPeriodData?.intervalType === 'day' || periodName.toLowerCase().includes('day')) {
        const date = new Date(item.createdAt);
        return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
      } else if (selectedPeriodData?.intervalType === 'week' || periodName.toLowerCase().includes('week')) {
        return `${periodName} ${idx + 1}`;
      } else if (selectedPeriodData?.intervalType === 'month' || periodName.toLowerCase().includes('month')) {
        return item?.monthName || `${periodName} ${idx + 1}`;
      } else {
        return `${periodName} ${idx + 1}`;
      }
    });

    chartScores = filteredItems.map((item: any) => {
      const scoreStr = item?.reportScore || '0%%';
      const numericScore = parseFloat(scoreStr.replace('%%', ''));
      return isNaN(numericScore) ? 0 : numericScore;
    });
  }

  const chartData = {
    labels: chartLabels,
    datasets: [
      {
        label: 'Score',
        data: chartScores,
        backgroundColor: '#A5A6F6', // Consistent light purple/lavender color
        borderRadius: 6,
        barThickness: 28, // Optimal thickness
      },
    ],
  };

  const chartOptions = {
    indexAxis: 'y' as const, // Horizontal bar chart
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: {
        left: 25,
        right: 50,
        top: 35,
        bottom: 25
      }
    },
    plugins: {
      legend: { display: false },
      title: { display: false },
      tooltip: { enabled: true },
    },
    scales: {
      x: {
        position: 'top' as const,
        beginAtZero: true,
        max: 100,
        ticks: { 
          stepSize: 10,
          font: { family: 'inherit', size: 11 },
          color: '#374151'
        },
        grid: { 
          display: false // Disable default grid, use custom plugin
        },
        border: {
          display: false
        }
      },
      y: {
        position: 'left' as const,
        grid: { 
          display: false // Disable default grid, use custom plugin
        },
        ticks: { 
          font: { family: 'inherit', size: 13 },
          color: '#374151',
          padding: 15 // Increase padding for better bar spacing
        },
        border: {
          display: false
        }
      },
    },
    elements: {
      bar: { 
        borderWidth: 0,
      },
    },
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6 w-full h-full min-h-[420px] flex flex-col pb-4">
      <div className="flex justify-between items-center mb-4">
        <div className="text-xl font-bold text-gray-800">Performance</div>
        <Select
          placeholder="Period"
          allowClear={false}
          className="w-28 h-9 rounded-md text-base font-normal"
          value={selectedPeriod}
          onChange={setSelectedPeriod}
          dropdownStyle={{ minWidth: '100px' }}
        >
          <Select.Option key="All" value="All">
            All
          </Select.Option>
          {availablePeriods.map((period) => (
            <Select.Option key={period.id} value={period.id}>
              {period.name}
            </Select.Option>
          ))}
        </Select>
      </div>
      <div className="flex-1 flex items-center justify-center">
        {isLoading ? <Spin /> : <Bar data={chartData} options={chartOptions} height={300} />}
      </div>
      {/* Simplified Legend */}
      <div className="flex justify-center mt-6">
        <div className="flex items-center gap-3">
          <span
            className="inline-block w-4 h-4 rounded-md"
            style={{ background: '#A5A6F6' }}
          ></span>
          <span className="text-sm text-gray-600 font-medium">
            Average Performance
          </span>
        </div>
      </div>
    </div>
  );
};

export default Performance;
