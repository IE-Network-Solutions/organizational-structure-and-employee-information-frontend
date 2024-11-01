// components/ApprovalStatus.tsx
import { FC } from 'react';
import { Empty, Select } from 'antd';
import ApprovalRequestCard from './approval-status-card';

const ApprovalStatus: FC = () => {
  const requests = [
    {
      name: 'Patricia Candra',
      date: '12 Mar 2024',
      time: '8:50 PM',
      type: 'Leave Request',
    },
    {
      name: 'Patricia Candra',
      date: '12 Mar 2024',
      time: '8:50 PM',
      type: 'Leave Request',
    },
    {
      name: 'Patricia Candra',
      date: '12 Mar 2024',
      time: '8:50 PM',
      type: 'Leave Request',
    },
    {
      name: 'Patricia Candra',
      date: '12 Mar 2024',
      time: '8:50 PM',
      type: 'Leave Request',
    },
    {
      name: 'Patricia Candra',
      date: '12 Mar 2024',
      time: '8:50 PM',
      type: 'Leave Request',
    },
    {
      name: 'Patricia Candra',
      date: '12 Mar 2024',
      time: '8:50 PM',
      type: 'Leave Request',
    },
  ];

  return (
    <div className="bg-white p-3 rounded-lg w-full">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-semibold">Approval Status</h4>
        <div className="flex items-center space-x-1 text-sm text-gray-500 cursor-pointer">
          <Select
            placeholder="select"
            allowClear
            className="min-w-10   text-sm font-semibold border-none"
            options={requests.map((item) => ({
              value: item.type,
              label: item.type,
            }))}
            defaultValue={requests[0].type}
            bordered={false}
          />
        </div>
      </div>

      <div className="md:h-[325px] overflow-y-auto scrollbar-none">
        {requests?.length ? (
          <div className="">
            {requests.map((request, index) => (
              <ApprovalRequestCard
                key={index}
                name={request.name}
                date={request.date}
                time={request.time}
                type={request.type}
              />
            ))}
          </div>
        ) : (
          <Empty />
        )}
      </div>
    </div>
  );
};

export default ApprovalStatus;
