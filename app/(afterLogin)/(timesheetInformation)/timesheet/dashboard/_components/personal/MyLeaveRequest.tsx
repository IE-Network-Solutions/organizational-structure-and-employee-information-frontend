import { Button, Card, Tag } from 'antd';
import React from 'react';

const MyLeaveRequest: React.FC = () => {
  return (
    <Card className="shadow">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-[16px] font-semibold">My Leave Requests</h3>
        <Button type="primary">Request</Button>
      </div>
      <div className="flex flex-col h-48 overflow-y-auto scrollbar-none">
        {[
          { type: 'Annual Leave', date: '1-20 Jun 2025', status: 'Pending' },
          { type: 'Sick Leave', date: '1-20 Jun 2025', status: 'Approved' },
          { type: 'Unpaid Leave', date: '1-20 Jun 2025', status: 'Rejected' },
        ].map((req, index) => (
          <div key={index} className="mb-2 border p-2 rounded-md">
            <div className="flex justify-between items-center">
              <div>
                <p className=" text-sm font-normal">{req.type}</p>
                <p className="font-medium text-sm">{req.date}</p>
              </div>
              <div className="flex flex-col justify-end items-end">
                <p className="text-xs">
                  Requested on <strong> 20 June 2025</strong>{' '}
                </p>
                <Tag
                  style={{ marginInlineEnd: 0, border: 'none' }}
                  className={
                    req.status === 'Approved'
                      ? ' bg-green-500/20 text-green-700 font-semibold'
                      : req.status === 'Pending'
                        ? 'text-yellow-500 bg-yellow-500/20 font-semibold '
                        : 'text-red-500 bg-red-500/20 font-semibold'
                  }
                >
                  {req.status}
                </Tag>{' '}
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default MyLeaveRequest;
