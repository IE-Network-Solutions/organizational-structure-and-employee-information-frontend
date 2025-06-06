import React from 'react';
import { Card } from 'antd';
import { Doughnut } from 'react-chartjs-2';
import { Chart, ArcElement, Tooltip, Legend, ChartOptions } from 'chart.js'; // Import required elements
import { useGetCoursePermitted } from '@/store/server/features/dashboard/courses-permitted/queries';

// Register the chart.js components
Chart.register(ArcElement, Tooltip, Legend);

interface ChartData {
  labels: string[];
  datasets: {
    data: number[];
    backgroundColor: string[];
    borderWidth: number;
  }[];
}
const CoursePermitted: React.FC = () => {
  const { data: coursePermitted, isLoading } = useGetCoursePermitted();

  const data: ChartData = {
    labels: coursePermitted?.map((i) => i.categoryName) || [],
    datasets: [
      {
        data: coursePermitted?.map((i) => i.courseCount) || [], // Sample data for full-time, part-time, and others
        backgroundColor: ['#2f78ee', '#3636ee', '#1d9bf0'],
        borderWidth: 2,
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
  const totalCourseCount = coursePermitted?.reduce(
    (acc, curr) => acc + (Number(curr?.courseCount) || 0),
    0,
  );
  return (
    <Card loading={isLoading} className="w-full mx-auto">
      <div className="flex justify-between items-center mb-2">
        <h3 className=" text-gray-700 font-semibold text-lg">
          Course Permitted
        </h3>
      </div>

      <div className="grid items-center">
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
            <div className="font-bold text-2xl">{totalCourseCount}</div>
            <div className="font-light text-xs ">Total</div>
          </div>
        </div>
        <div style={{ marginTop: '2 0px' }}>
          {data.labels.map((label, i) => (
            <div key={i} className="flex justify-between">
              <div
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
                <span>{label}</span>
              </div>
              <span>{data.datasets[0].data[i]}</span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};

export default CoursePermitted;
