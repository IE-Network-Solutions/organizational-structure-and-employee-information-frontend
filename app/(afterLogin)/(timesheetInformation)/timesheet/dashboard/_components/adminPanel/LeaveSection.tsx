'use client';

import React, { useState } from 'react';
import { Card, Select, DatePicker, Avatar, Tag, Input } from 'antd';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

const { Option } = Select;
const { RangePicker } = DatePicker;

interface LeaveData {
    name: string;
    period: string;
    days: string;
    type: string;
    avatar: string;
}

const LeaveSection: React.FC = () => {
    const [selectedDepartment, setSelectedDepartment] = useState('All');

    const leaveData: LeaveData[] = [
        { name: 'Hanna Baptista', period: '26 Feb 2025 to 30 Feb 2025', days: '5 Days', type: 'Annual Leave', avatar: 'HB' },
        { name: 'Hanna Baptista', period: '26 Feb 2025 to 30 Feb 2025', days: '5 Days', type: 'Annual Leave', avatar: 'HB' },
        { name: 'Hanna Baptista', period: '26 Feb 2025 to 30 Feb 2025', days: '5 Days', type: 'Annual Leave', avatar: 'HB' },
        { name: 'Hanna Baptista', period: '26 Feb 2025 to 30 Feb 2025', days: '5 Days', type: 'Annual Leave', avatar: 'HB' },
        { name: 'Hanna Baptista', period: '26 Feb 2025 to 30 Feb 2025', days: '5 Days', type: 'Annual Leave', avatar: 'HB' },
    ];

    // Line chart data for employee trends
    const lineChartData = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        datasets: [
            {
                label: 'Number of Employees on leave',
                data: [20, 75, 45, 25, 30, 40, 35, 80, 45, 40, 35, 30],
                borderColor: '#8979FF', // New line color (e.g., Indigo-600)
    backgroundColor: 'rgba(79, 70, 229, 0.1)', // Lighter fill
    borderWidth: 1.5, // Line thickness
    tension: 0.4,
    fill: true,
    pointRadius: 2.5, // Optional: increase point size
    pointBackgroundColor: '#ffffff', // Point color
            },
        ],
    };

   const lineChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
 datalabels: { display: false },

  },
  scales: {
    y: {
      beginAtZero: true,
      min: 0,
      max: 100,
      ticks: {
        stepSize: 20,
        color: '#333',
      },
      grid: {
        color: 'rgba(0, 0, 0, 0.1)',
      },
    },
    x: {
      grid: {
        display: true,
      },
    },
  },
};


    return (
        <Card title="Leave" className="h-full">


            {/* Leave List */}
            <div className='grid grid-cols-12 gap-4 items-start'>
                <div className="space-y-3 mb-4 col-span-5">
                    <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                        <Input placeholder='Search employee' className="w-full" />
                        <Select
                            defaultValue="Department"
                            className="w-full  h-12"
                            onChange={setSelectedDepartment}
                        >
                            <Option value="All">All</Option>
                            <Option value="IT">IT</Option>
                            <Option value="HR">HR</Option>
                        </Select>

                    </div>

                    <div className='h-64 overflow-y-auto scrollbar-none space-y-2'>
                        {leaveData.map((leave, index) => (
                            <div key={index} className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-3 py-1 bg-white border   rounded-lg gap-3 ">
                                <div className="flex items-center gap-3">
                                    <Avatar className="bg-purple-500 w-4 h-4">{leave.avatar}</Avatar>
                                    <div>
                                        <p className=" text-gray-800 text-[12px]">{leave.name}</p>
                                        <p className="text-black     text-[12px] font-medium">{leave.period}</p>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-0">
                                    <span className="text-sm font-medium text-sm">{leave.days}</span>
                                    <Tag style={{ marginInlineEnd: 0 }} className='ml-0 text-blue bg-[#b2b2ff] text-[12px] font-normal'>{leave.type}</Tag>
                                </div>
                            </div>
                        ))}
                    </div>

                </div>
                <div className="h-64 w-full  col-span-7">

                    <div className="flex flex-col sm:flex-row justify-between items-end mb-4 gap-4 w-full">
                        <p className="text-purple-600 text-[12px] flex items-center gap-2"><svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect y="7" width="16" height="2" fill="#8979FF" />
                            <circle cx="8" cy="8" r="3.5" fill="white" stroke="#8979FF" />
                        </svg>
                            Number of Employees on leave: 108</p>
                        <div className='space-x-2 flex items-center '>
                            <Select
                                defaultValue="Departments"
                                className="w-32  h-12"
                                onChange={setSelectedDepartment}
                            >
                                <Option value="All">All</Option>
                                <Option value="IT">IT</Option>
                                <Option value="HR">HR</Option>
                            </Select>

                            <RangePicker className="w-32  h-12" />
                        </div>
                    </div>
                    <Line data={lineChartData} options={lineChartOptions} />
                </div>
            </div>
            {/* Chart */}

        </Card>
    );
};

export default LeaveSection; 