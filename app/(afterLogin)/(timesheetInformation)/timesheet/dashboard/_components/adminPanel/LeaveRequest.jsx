import React from 'react';
import { Card, Input, DatePicker, Select, Avatar } from 'antd';
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

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const { Option } = Select;

const LeaveRequest = () => {
    const leaveRequests = [
        {
          name: 'Hanna Baptista',
          type: 'Annual Leave',
          tagColor: 'bg-violet-200 text-violet-800',
          dateRange: '1 - 20 Feb 2025',
          requested: '25 Jan 2025',
        },
        {
          name: 'Hanna Baptista',
          type: 'Sick Leave',
          tagColor: 'bg-yellow-100 text-yellow-700',
          dateRange: '1 - 20 Feb 2025',
          requested: '25 Jan 2025',
        },
        {
          name: 'Hanna Baptista',
          type: 'Emergency',
          tagColor: 'bg-green-100 text-green-700',
          dateRange: '1 - 20 Feb 2025',
          requested: '25 Jan 2025',
        },
        {
          name: 'Hanna Baptista',
          type: 'Sick Leave',
          tagColor: 'bg-yellow-100 text-yellow-700',
          dateRange: '1 - 20 Feb 2025',
          requested: '25 Jan 2025',
        },
      ];
    
      const leaveTypes = [
        { label: 'Annual', backgroundColor: '#a78bfa', data: [30, 30, 30, 0, 0, 30, 30, 30, 30, 0, 0, 20] },
        { label: 'Sick', backgroundColor: '#fca5a5', data: [20, 25, 15, 0, 0, 20, 25, 28, 20, 25, 18, 20] },
        { label: 'Emergency', backgroundColor: '#6ee7b7', data: [10, 12, 8, 0, 0, 10, 12, 15, 13, 5, 0, 10] },
        { label: 'Maternity', backgroundColor: '#fcd34d', data: [20, 25, 15, 0, 0, 25, 30, 28, 22, 10, 0, 20] },
        { label: 'paternity', backgroundColor: '#93c5fd', data: [0, 10, 12, 0, 0, 5, 15, 12, 20, 0, 0, 5] },
        { label: 'Unpaid', backgroundColor: '#38bdf8', data: [0, 8, 10, 0, 0, 5, 10, 15, 18, 0, 0, 10] },
             ];
      const barData  = {
        labels: [
          'Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec',
        ],
        datasets: leaveTypes.map((leave, index) => ({
          label: leave.label,
          data: Array.from({ length: 12 }, () => Math.floor(Math.random() * 80 + 20)),
          backgroundColor: leave?.backgroundColor?.replace('bg-', '').replace('-', ''),
          stack: 'leave',
          barThickness: 15, //
        })),
      };
    
      const barOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
                labels: {
                  boxWidth: 12,
                },
              },
              datalabels:{display:false},
          title: {
            display: false,
            text: 'Leave Distribution',
          },
        },
        interaction: {
          mode: 'index',
          intersect: false,
        },
        scales: {
            x: {
                stacked: true,
                ticks: {
                  maxRotation: 0,
                  minRotation: 0,
                },
                maxBarThickness: 4, // 👈 Optional: sets a max limit for bar width
              },
         
          y: {
            stacked: true,
            beginAtZero: true,
            max: 500,
            width: 5,
          },
         
        },
      };

  return (
    <Card className="p-4">
      <div className="grid grid-cols-12 gap-4">
        {/* Left panel */}
        <div className="col-span-12 md:col-span-4">
          <h2 className="text-lg font-semibold">Leave Request</h2>
          <p className="text-sm text-gray-500 mb-4">Pending Requests</p>
          <div className="flex  gap-2 mb-4">
            <Input className='h-12' placeholder="Search Employee" />
            <DatePicker className="w-full h-12" />
          </div>
          <div className='h-64 overflow-y-auto scrollbar-none space-y-2'>

            {leaveRequests.map((item, index) => (
              <div key={index} className="bg-white border rounded-xl px-4 py-2 flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <Avatar src="https://randomuser.me/api/portraits/women/44.jpg" size={32} />
                  <div>
                    <p className="text-sm font-medium">{item.name}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${item.tagColor}`}>{item.type}</span>
                  </div>
                </div>
                <div className="text-right text-xs text-gray-500">
                  <p>Requested: {item.requested}</p>
                  <p>{item.dateRange}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right panel - Chart */}
        <div className="col-span-12 md:col-span-8">
          <div className="flex justify-end mb-2">
            <Select defaultValue="Department" className="w-40 h-12">
              <Option value="IT">IT</Option>
              <Option value="HR">HR</Option>
              <Option value="Finance">Finance</Option>
            </Select>
          </div>
          <Bar className='h-86  ' data={barData} options={barOptions}  />
        </div>
      </div>
    </Card>
  );
};

export default LeaveRequest;
