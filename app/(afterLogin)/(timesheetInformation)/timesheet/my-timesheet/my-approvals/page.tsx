'use client';

import { Typography } from 'antd';

const { Title } = Typography;

export default function MyApprovalsPage() {
  return (
    <div
      id="time-attendance-my-timesheet-my-approvals-page"
      data-cy="time-attendance-my-timesheet-my-approvals-page"
    >
      <Title level={5} className="!mb-0 !text-gray-700">
        My Approvals content will go here (approval table, search, filter).
      </Title>
    </div>
  );
}
