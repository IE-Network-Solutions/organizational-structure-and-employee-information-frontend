'use client';

import { Typography } from 'antd';

const { Title } = Typography;

export default function OverviewPage() {
  return (
    <div
      id="time-attendance-my-timesheet-overview-page"
      data-cy="time-attendance-my-timesheet-overview-page"
    >
      <Title level={5} className="!mb-0 !text-gray-700">
        Overview content will go here (Current Time, Recent Attendance, Recent Leave).
      </Title>
    </div>
  );
}
