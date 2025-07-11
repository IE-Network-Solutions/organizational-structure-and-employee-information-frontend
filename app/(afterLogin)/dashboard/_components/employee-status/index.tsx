import React from 'react';
import { Card, Empty, Select } from 'antd';
import { Doughnut } from 'react-chartjs-2';
import { Chart, ArcElement, Tooltip, Legend } from 'chart.js';
import { useGetEmployeeStatus } from '@/store/server/features/dashboard/employee-status/queries';
import { useEmployeeStatusDashboardStateStore } from '@/store/uistate/features/dashboard/employee-status';

// Register the chart.js components
Chart.register(ArcElement, Tooltip, Legend);

const { Option } = Select;

// Define the type for the chart's dataset
interface ChartData {
  labels: string[];
  datasets: {
    data: number[];
    backgroundColor: string[];
    borderWidth: number;
    hoverOffset: number;
  }[];
}

const EmploymentStats: React.FC = () => {
  const { typeId, setTypeId } = useEmployeeStatusDashboardStateStore();
  const { data: employeeStatus, isLoading } = useGetEmployeeStatus(typeId);
  const labels = employeeStatus?.map((status) => status.name); // ['Full-time', 'Part-time', 'Contractor']
  const dataValues = employeeStatus?.map((status) => status.count);
  const totalCount = employeeStatus?.reduce(
    (acc, status) => acc + Number(status.count),
    0,
  );
  const data: ChartData = {
    labels: labels || [],
    datasets: [
      {
        data: dataValues || [], // Sample data for full-time, part-time, and others
        backgroundColor: [
          '#3636F0', // Primary blue
          '#4F8CFF', // Light blue
          '#3EC3FF', // Cyan
          '#22C55E', // Green
          '#FACC15', // Yellow
          '#EF4444', // Red
          '#8B5CF6', // Purple
          '#F97316', // Orange
          '#06B6D4', // Teal
          '#84CC16', // Lime
        ],
        borderWidth: 4,
        hoverOffset: 10,
      },
    ],
  };

  const options = {
    cutout: '70%',
    plugins: {
      legend: { display: false },
      tooltip: { enabled: true },
      datalabels: { display: false },
    },
    elements: {
      arc: { borderWidth: 0 },
    },
  };

  return (
    <Card
      loading={isLoading}
      className="w-full mx-auto h-[316px] overflow-hidden  flex flex-col p-4"
      bodyStyle={{ padding: '0px', margin: '0px' }}
    >
      <div className="flex justify-between items-center mb-2 h-[20%] ">
        <h3 className=" font-bold text-lg">Employee Status</h3>
        <Select
          bordered={false}
          defaultValue="All Time"
          className="text-gray-500 w-28"
          onChange={(value) => setTypeId(value)}
        >
          <Option value="">All</Option>
          {employeeStatus?.map((i) => (
            <Option key={i.id} value={i.id}>
              {i.name}
            </Option>
          ))}
        </Select>
      </div>

      {employeeStatus?.length ? (
        <div className="flex-1 flex items-center justify-between h-[80%] gap-1 mt-5 ">
          <div className="relative flex items-center justify-center w-[180px] h-[180px] overflow-visible z-10">
            <Doughnut data={data} options={options} className="z-20" />
            <div
              className="absolute left-1/2 top-1/2 flex flex-col items-center justify-center z-0"
              style={{ transform: 'translate(-50%, -50%)' }}
            >
              <div
                className="bg-white border border-gray-200 shadow-md rounded-full flex flex-col items-center justify-center"
                style={{ width: 60, height: 60 }}
              >
                <span className="font-bold text-2xl text-gray-900">
                  {totalCount?.toLocaleString()}
                </span>
                <span className="text-sm text-gray-400">Total</span>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            {data.labels.map((label: string, i: number) => (
              <div key={i} className="flex items-center mb-2 gap-2">
                <div
                  style={{
                    backgroundColor: data.datasets[0].backgroundColor[i],
                  }}
                  className="w-3 h-3 rounded-full mr-2"
                />
                <span className="text-xs font-medium">{label}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <Empty />
      )}
    </Card>
  );
};

export default EmploymentStats;
