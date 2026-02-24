'use client';

import { Typography } from 'antd';

const { Title } = Typography;

export default function LeavePage() {
  return (
    <div
      id="time-attendance-my-timesheet-leave-page"
      data-cy="time-attendance-my-timesheet-leave-page"
    >
      <Title level={5} className="!mb-0 !text-gray-700">
        Leave content will go here (Leave Balance cards, Leave Requests table).
      </Title>
    </div>
  );
}
