import React from 'react';
import { Card, Empty, Select } from 'antd';
import { Doughnut } from 'react-chartjs-2';
import { Chart, ArcElement, Tooltip, Legend, ChartOptions } from 'chart.js';
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
        backgroundColor: ['#2f78ee', '#3636ee', '#1d9bf0'],
        borderWidth: 2,
      },
    ],
  };

  const options = {
    cutout: '60%',
    plugins: {
      legend: { display: false },
      tooltip: { enabled: true },
    },
    elements: {
      arc: { borderWidth: 0 },
    },
  };

  return (
    <Card
      loading={isLoading}
      className="w-full mx-auto h-[316px] overflow-hidden  flex flex-col"
    >
      <div className="flex justify-between items-center mb-2 h-[20%] ">
        <h3 className="text-gray-700 font-semibold text-lg">Employee Stat</h3>
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
        <div className="flex-1 flex items-center justify-between h-[80%] mt-10">
          <div className="relative flex items-center justify-center w-[180px] h-[180px] px-4 overflow-visible z-10">
            <Doughnut data={data} options={options} />
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
          <div style={{ marginLeft: '20px' }}>
            {data.labels.map((label: string, i: number) => (
              <div key={i} className="flex items-center mb-2">
                <div
                  style={{
                    backgroundColor: data.datasets[0].backgroundColor[i],
                  }}
                  className="w-3 h-3 rounded-full mr-2"
                />
                <span className="text-xs">{label}</span>
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
