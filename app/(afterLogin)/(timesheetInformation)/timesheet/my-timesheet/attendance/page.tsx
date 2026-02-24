'use client';

import { Typography } from 'antd';

const { Title } = Typography;

export default function AttendancePage() {
  return (
    <div
      id="time-attendance-my-timesheet-attendance-page"
      data-cy="time-attendance-my-timesheet-attendance-page"
    >
      <Title level={5} className="!mb-0 !text-gray-700">
        Attendance content will go here (summary cards, filters, table, export).
      </Title>
    </div>
  );
}
