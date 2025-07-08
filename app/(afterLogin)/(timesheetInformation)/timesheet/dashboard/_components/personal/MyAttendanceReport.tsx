import { Card, DatePicker, Select, Tag } from 'antd';
import React from 'react';
const { Option } = Select;
const { RangePicker } = DatePicker;
const MyAttendanceReport: React.FC = () => {
  return (
    <Card className="shadow">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-[16px] font-semibold">My Attendance Report</h3>
        <div className="space-x-2 flex items-center ">
          <Select defaultValue="Departments" className="w-32  h-12">
            <Option value="All">All</Option>
            <Option value="IT">IT</Option>
            <Option value="HR">HR</Option>
          </Select>

          <RangePicker className="w-32  h-12" />
        </div>
      </div>
      <div className="flex flex-col h-48 overflow-y-auto scrollbar-none">
        {[
          {
            type: 'Annual Leave',
            date: '1-20 Jun 2025',
            status: 'late',
            time: '7:45 AM',
          },
          {
            type: 'Sick Leave',
            date: '1-20 Jun 2025',
            status: 'on time',
            time: '7:10 AM',
          },
          {
            type: 'Unpaid Leave',
            date: '1-20 Jun 2025',
            status: 'absent',
            time: '',
          },
          {
            type: 'Unpaid Leave',
            date: '1-20 Jun 2025',
            status: 'absent',
            time: '',
          },
        ].map((req, index) => (
          <div key={index} className="mb-2 border p-4 rounded-md">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium text-sm">{req.date}</p>
              </div>
              <div className="flex flex-col justify-end items-end">
                <Tag
                  style={{ marginInlineEnd: 0, border: 'none' }}
                  className={` capitalize ${
                    req.status === 'on time'
                      ? ' bg-purple/20 text-purple font-semibold'
                      : req.status === 'late'
                        ? 'text-yellow-500 bg-yellow-500/20 font-semibold '
                        : 'text-red-500 bg-red-500/20 font-semibold'
                  }`}
                >
                  {req.status} {req.time}{' '}
                </Tag>{' '}
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default MyAttendanceReport;
