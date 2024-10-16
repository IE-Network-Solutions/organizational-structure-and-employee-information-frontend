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
        borderWidth: 1,
      },
    ],
  };

  const options: ChartOptions<'doughnut'> = {
    cutout: '60%',
    plugins: {
      legend: {
        display: false,
        position: 'right',
        labels: {
          color: '#333',
          font: {
            size: 14,
            weight: 'bold',
          },
          padding: 20,
          generateLabels: (chart: any) => {
            const data = chart.data;
            const labels = data.labels || [];
            const datasets = data.datasets || [];
            return labels.map((label: string, i: number) => {
              const dataset = datasets[0];
              const backgroundColor = dataset.backgroundColor[i];
              return {
                text: label,
                fillStyle: backgroundColor,
                strokeStyle: backgroundColor,
                lineWidth: 2,
                hidden: !chart.getDatasetMeta(0).data[i].hidden,
                index: i,
              };
            });
          },
        },
      },
    },
    elements: {
      arc: {
        borderWidth: 2,
      },
    },
  };

  return (
    <Card loading={isLoading} className="w-full mx-auto ">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-gray-700 font-semibold text-sm">Employee Stat</h3>
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
        <div className="flex items-center">
          <div
            style={{
              position: 'relative',
              maxWidth: '130px',
              maxHeight: '130px',
              margin: '0 auto',
            }}
          >
            <Doughnut data={data} options={options} />
            <div
              className="absolute text-center bg-white shadow-lg w-16 h-16 rounded-full flex flex-col items-center justify-center px-3 z-0"
              style={{
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: '-1',
              }}
            >
              <div className="font-bold text-xl">{totalCount}</div>
              <div className="font-light text-[8px]">Total Emp</div>
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
