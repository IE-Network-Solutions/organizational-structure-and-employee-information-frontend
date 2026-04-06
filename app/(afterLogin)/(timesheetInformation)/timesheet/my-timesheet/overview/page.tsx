'use client';

import { Row, Col } from 'antd';
import CurrentTimeCard from '../_components/overview/CurrentTimeCard';
import RecentAttendanceCard from '../_components/overview/RecentAttendanceCard';
import RecentLeaveRequestCard from '../_components/overview/RecentLeaveRequestCard';

export default function OverviewPage() {
  return (
    <div
      id="time-attendance-my-timesheet-overview-page"
      data-cy="time-attendance-my-timesheet-overview-page"
      className="space-y-2"
    >
      <Row gutter={[12, 12]}>
        <Col xs={24}>
          <CurrentTimeCard />
        </Col>
        <Col xs={24} lg={12} className="flex flex-col">
          <RecentAttendanceCard />
        </Col>
        <Col xs={24} lg={12} className="flex flex-col">
          <RecentLeaveRequestCard />
        </Col>
      </Row>
    </div>
  );
}
