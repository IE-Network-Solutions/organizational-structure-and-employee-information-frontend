'use client';

import React from 'react';
import { Card, Select, DatePicker, Avatar } from 'antd';
import { Doughnut } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
    ChartOptions,
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';

// Register Chart.js components and plugins
ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels);

const { RangePicker } = DatePicker;

interface AttendanceData {
    name: string;
    date: string;
    status: {
        label: string;
        color: string;
    };
    late: number;
    absent: number;
}

const AttendanceReport: React.FC = () => {
    const attendanceData: AttendanceData[] = [
        {
            name: 'Hanna Baptista',
            date: 'Feb 26, 2025',
            status: { label: 'Late 7:45 AM', color: 'bg-yellow-100 text-yellow-700' },
            late: 6,
            absent: 4,
        },
        {
            name: 'Hanna Baptista',
            date: 'Feb 26, 2025',
            status: { label: 'On Time 7:10 AM', color: 'bg-indigo-100 text-indigo-700' },
            late: 1,
            absent: 0,
        },
        {
            name: 'Hanna Baptista',
            date: 'Feb 26, 2025',
            status: { label: 'Absent', color: 'bg-red-100 text-red-700' },
            late: 0,
            absent: 3,
        },
        {
            name: 'Hanna Baptista',
            date: 'Feb 26, 2025',
            status: { label: 'On Time 7:10 AM', color: 'bg-indigo-100 text-indigo-700' },
            late: 1,
            absent: 0,
        },
        {
            name: 'Hanna Baptista',
            date: 'Feb 26, 2025',
            status: { label: 'Late 7:45 AM', color: 'bg-yellow-100 text-yellow-700' },
            late: 6,
            absent: 4,
        },
    ];

    // Doughnut chart data
    const doughnutChartData = {
        labels: ['Late', 'Absent', 'Leave'],
        datasets: [
            {
                data: [110, 104, 106],
                backgroundColor: ['#8b5cf6', '#f87171', '#06b6d4'],
                borderWidth: 0,
            },
        ],
    };

    const options: ChartOptions<'doughnut'> = {
        responsive: true,
        cutout: '50%',
        plugins: {
            legend: {
                position: 'right',
                labels: {
                    usePointStyle: true,
                    boxWidth: 8,
                    padding: 20,
                },
            },
            tooltip: {
                callbacks: {
                    label: function (context) {
                        const label = context.label || '';
                        const value = context.parsed || 0;
                        return `${label}: ${value}`;
                    },
                },
            },
            datalabels: {
                color: '#ffffff',
                font: {
                    weight: 'bold',
                    size: 14,
                },
                formatter: (value: number, context: any) => {
                    const label = context.chart.data.labels?.[context.dataIndex];
                    return `${label}\n${value}`;
                },
            },
        },
    };

    return (
        <Card title="Attendance Report" className="h-full">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
                <p className="text-sm text-gray-600">Search Employee</p>
                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                    <Select defaultValue="Department" className="w-full sm:w-32 h-12">
                        <Select.Option value="All">All</Select.Option>
                        <Select.Option value="IT">IT</Select.Option>
                        <Select.Option value="HR">HR</Select.Option>
                    </Select>
                    <RangePicker className="w-full sm:w-auto h-12" />
                </div>
            </div>

            <div className="grid grid-cols-12 gap-6 items-center">
                {/* Doughnut Chart */}
                <div className="col-span-12 md:col-span-7 flex justify-center">
                    <div className="w-72 h-72 md:w-96 md:h-96">
                        <Doughnut data={doughnutChartData} options={options} />
                    </div>
                </div>

                {/* Attendance List */}
                <div className="space-y-3 col-span-12 md:col-span-5">
                    {attendanceData.map((item, index) => (
                        <div
                            key={index}
                            className="bg-white rounded-xl px-4 py-2 border flex items-center justify-between shadow-sm"
                        >
                            {/* Left Side */}
                            <div className="flex items-center space-x-3">
                                <Avatar
                                    className="w-7 h-7"
                                    src="https://randomuser.me/api/portraits/women/44.jpg"
                                />
                                <div>
                                    <p className="text-xs font-medium text-gray-800">{item.name}</p>
                                    <span
                                        className={`text-xs px-2 py-0.5 rounded font-medium inline-block ${item.status.color}`}
                                    >
                                        {item.status.label}
                                    </span>
                                </div>
                            </div>

                            {/* Right Side */}
                            <div className="text-right">
                                <p className="text-xs font-semibold text-gray-700">{item.date}</p>
                                <div className="mt-1 flex justify-end gap-2">
                                    <span className="text-xs bg-yellow-100 text-yellow-700 font-medium px-2 py-0.5 rounded">
                                        L: {item.late}
                                    </span>
                                    <span className="text-xs bg-red-100 text-red-700 font-medium px-2 py-0.5 rounded">
                                        A: {item.absent}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </Card>
    );
};

export default AttendanceReport;
