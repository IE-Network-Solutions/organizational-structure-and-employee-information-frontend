import React from 'react';
import { Card, Select } from 'antd';
import { Doughnut } from 'react-chartjs-2';
import { Chart, ArcElement, Tooltip, Legend, ChartOptions } from 'chart.js'; // Import required elements

// Register the chart.js components
Chart.register(ArcElement, Tooltip, Legend);
const { Option } = Select;

const JobSummary = () => {
  const data = {
    labels: ['Active', 'Inactive', 'Closed'],
    datasets: [
      {
        data: [45, 30, 10], // Sample data for active, inactive, and closed jobs
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
            size: 12,
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
    <Card className="w-full mx-auto shadow-md h-64">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-gray-700 font-semibold text-lg">Job Summary</h3>
        <Select
          bordered={false}
          defaultValue="All Time"
          className="text-gray-500"
        >
          <Option value="All Time">All Time</Option>
          <Option value="This Year">This Year</Option>
          <Option value="This Month">This Month</Option>
        </Select>
      </div>

      <div className="flex items-center">
        <div
          style={{
            position: 'relative',
            maxWidth: '150px',
            maxHeight: '150px',
            margin: '0 auto',
          }}
        >
          <Doughnut data={data} options={options} />
          <div
            className="absolute text-center  bg-white shadow-lg shadow-slate-400 w-20 h-20 rounded-full flex flex-col items-center justify-center   px-3 z-0 "
            style={{
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
            }}
          >
            <div className="font-bold text-2xl">45</div>
            <div className="font-light text-xs ">Active</div>
          </div>
        </div>
        <div style={{ marginLeft: '20px' }}>
          {data.labels.map((label, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '10px',
              }}
            >
              <div
                style={{
                  width: '15px',
                  height: '15px',
                  borderRadius: '50%',
                  backgroundColor: data.datasets[0].backgroundColor[i],
                  marginRight: '10px',
                }}
              />
              <span className="text-sm">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};

export default JobSummary;
