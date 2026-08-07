'use client';

import dayjs from 'dayjs';
import { Badge, Button, Card, Col, Empty, Flex, Row, Typography } from 'antd';
import StatusBadge from '@/components/common/statusBadge/statusBadge';
import { useShiftSwapStore } from '@/store/uistate/features/timesheet/shiftSwap';
import {
  SHIFT_SWAP_STATUS_LABEL,
  ShiftAssignment,
} from '@/types/timesheet/shiftSwap';
import {
  formatShiftTime,
  matchesFilters,
  swapStatusTheme,
} from '../shared/utils';
import FilterBar from '../shared/FilterBar';
import { DirectoryPerson } from '../shared/utils';
import SectionHeader from '../shared/SectionHeader';

type OverviewDashboardProps = {
  people: DirectoryPerson[];
};

const StatCard = ({
  label,
  value,
  hint,
}: {
  label: string;
  value: number | string;
  hint?: string;
}) => (
  <Card size="small" className="border-[#D9D9D9]">
    <Flex vertical gap={4}>
      <Typography.Text className="text-xs font-medium text-gray-500">
        {label}
      </Typography.Text>
      <Typography.Text className="text-2xl font-bold text-[#4d4d4d]">
        {value}
      </Typography.Text>
      {hint ? (
        <Typography.Text className="text-xs text-gray-400">
          {hint}
        </Typography.Text>
      ) : null}
    </Flex>
  </Card>
);

const OverviewDashboard = ({ people }: OverviewDashboardProps) => {
  const {
    templates,
    assignments,
    swapRequests,
    auditLogs,
    notifications,
    filters,
    setActiveSection,
    markNotificationsRead,
  } = useShiftSwapStore();

  const templateMap = Object.fromEntries(
    templates.map((item) => [item.id, item]),
  );
  const filteredAssignments = assignments.filter((item) =>
    matchesFilters(item, filters, templateMap[item.shiftTemplateId]),
  );
  const today = dayjs().format('YYYY-MM-DD');
  const todaysAssignments = filteredAssignments.filter(
    (item) => item.date === today,
  );
  const pendingSwaps = swapRequests.filter((item) =>
    item.status.startsWith('pending'),
  );
  const coverageByDepartment = todaysAssignments.reduce<Record<string, number>>(
    (acc, item) => {
      const key = item.departmentName || 'Unassigned';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    },
    {},
  );

  const unread = notifications.filter((item) => !item.read).length;

  return (
    <div
      id="time-attendance-settings-shift-swap-overview"
      data-cy="time-attendance-settings-shift-swap-overview"
    >
      <SectionHeader
        title="Shift & Swap Overview"
        description="Monitor assigned shifts, pending swaps, coverage, and recent scheduling activity."
        extra={
          <Badge count={unread}>
            <Button onClick={markNotificationsRead} className="h-10">
              Notifications
            </Button>
          </Badge>
        }
      />

      <Card className="border-[#D9D9D9] mb-4">
        <FilterBar people={people} templates={templates} />
      </Card>

      <Row gutter={[16, 16]} className="mb-4">
        <Col xs={24} sm={12} xl={6}>
          <StatCard
            label="Assigned shifts"
            value={filteredAssignments.length}
            hint="Matching current filters"
          />
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <StatCard
            label="Pending swaps"
            value={pendingSwaps.length}
            hint="Awaiting confirmation or approval"
          />
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <StatCard
            label="Today's coverage"
            value={todaysAssignments.length}
            hint={`${Object.keys(coverageByDepartment).length} departments`}
          />
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <StatCard
            label="Active templates"
            value={templates.filter((item) => item.isActive).length}
          />
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} xl={16}>
          <Card className="border-[#D9D9D9]">
            <Flex justify="space-between" align="center" className="mb-3">
              <Typography.Text className="text-sm font-semibold text-[#4d4d4d]">
                Today&apos;s assigned shifts
              </Typography.Text>
              <Button type="link" onClick={() => setActiveSection('schedule')}>
                Open calendar
              </Button>
            </Flex>
            <Flex vertical gap={8} className="max-h-[320px] overflow-auto">
              {todaysAssignments.length ? (
                todaysAssignments.map((item: ShiftAssignment) => {
                  const template = templateMap[item.shiftTemplateId];
                  return (
                    <Card
                      key={item.id}
                      size="small"
                      className="border-[#F0F0F0]"
                    >
                      <Flex justify="space-between" align="center" gap={12}>
                        <Flex align="center" gap={12} className="min-w-0">
                          <Flex
                            className="h-8 w-1.5 rounded-full shrink-0"
                            style={{
                              backgroundColor: template?.color || '#3636F0',
                            }}
                          />
                          <Flex vertical className="min-w-0">
                            <Typography.Text
                              ellipsis
                              className="text-sm font-semibold text-[#4d4d4d]"
                            >
                              {item.employeeName}
                            </Typography.Text>
                            <Typography.Text
                              ellipsis
                              className="text-xs text-gray-500"
                            >
                              {item.departmentName || '—'} ·{' '}
                              {item.locationName || '—'}
                            </Typography.Text>
                          </Flex>
                        </Flex>
                        <Flex vertical align="end" className="shrink-0">
                          <Typography.Text className="text-sm font-medium">
                            {template?.name}
                          </Typography.Text>
                          <Typography.Text className="text-xs text-gray-500">
                            {formatShiftTime(template)}
                          </Typography.Text>
                        </Flex>
                      </Flex>
                    </Card>
                  );
                })
              ) : (
                <Empty
                  description="No shifts assigned today for the selected filters"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              )}
            </Flex>
          </Card>
        </Col>

        <Col xs={24} xl={8}>
          <Flex vertical gap={16}>
            <Card className="border-[#D9D9D9]">
              <Flex justify="space-between" align="center" className="mb-3">
                <Typography.Text className="text-sm font-semibold text-[#4d4d4d]">
                  Pending swap requests
                </Typography.Text>
                <Button type="link" onClick={() => setActiveSection('swaps')}>
                  Review
                </Button>
              </Flex>
              <Flex vertical gap={8}>
                {pendingSwaps.length ? (
                  pendingSwaps.slice(0, 5).map((item) => (
                    <Card
                      key={item.id}
                      size="small"
                      className="border-[#F0F0F0]"
                    >
                      <Typography.Text className="text-sm font-medium text-[#4d4d4d]">
                        {item.requesterName} ↔ {item.counterpartName}
                      </Typography.Text>
                      <StatusBadge
                        theme={swapStatusTheme(item.status)}
                        className="mt-2"
                      >
                        {SHIFT_SWAP_STATUS_LABEL[item.status]}
                      </StatusBadge>
                    </Card>
                  ))
                ) : (
                  <Empty
                    description="All caught up"
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                  />
                )}
              </Flex>
            </Card>

            <Card className="border-[#D9D9D9]">
              <Typography.Text className="text-sm font-semibold text-[#4d4d4d] mb-3 block">
                Staffing coverage
              </Typography.Text>
              <Flex vertical gap={8}>
                {Object.entries(coverageByDepartment).length ? (
                  Object.entries(coverageByDepartment).map(([name, count]) => (
                    <Flex
                      key={name}
                      justify="space-between"
                      align="center"
                      className="text-sm"
                    >
                      <Typography.Text className="text-[#4d4d4d]">
                        {name}
                      </Typography.Text>
                      <Typography.Text className="font-semibold">
                        {count}
                      </Typography.Text>
                    </Flex>
                  ))
                ) : (
                  <Typography.Text className="text-sm text-gray-500">
                    No coverage today.
                  </Typography.Text>
                )}
              </Flex>
            </Card>
          </Flex>
        </Col>
      </Row>

      <Row gutter={[16, 16]} className="mt-4">
        <Col xs={24} lg={12}>
          <Card className="border-[#D9D9D9]">
            <Typography.Text className="text-sm font-semibold text-[#4d4d4d] mb-3 block">
              Recent scheduling activity
            </Typography.Text>
            <Flex vertical gap={8} className="max-h-[240px] overflow-auto">
              {auditLogs.slice(0, 8).map((item) => (
                <Flex
                  key={item.id}
                  vertical
                  className="text-sm border-b border-[#F5F5F5] pb-2"
                >
                  <Typography.Text className="font-medium text-[#4d4d4d]">
                    {item.description}
                  </Typography.Text>
                  <Typography.Text className="text-xs text-gray-500">
                    {item.actorName} ·{' '}
                    {dayjs(item.timestamp).format('MMM D, HH:mm')}
                  </Typography.Text>
                </Flex>
              ))}
            </Flex>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card className="border-[#D9D9D9]">
            <Typography.Text className="text-sm font-semibold text-[#4d4d4d] mb-3 block">
              In-app notifications
            </Typography.Text>
            <Flex vertical gap={8} className="max-h-[240px] overflow-auto">
              {notifications.slice(0, 8).map((item) => (
                <Card
                  key={item.id}
                  size="small"
                  className={
                    item.read
                      ? 'border-[#F0F0F0]'
                      : 'border-[#2155CD] bg-[#EFF4FF]'
                  }
                >
                  <Typography.Text className="text-sm font-semibold text-[#4d4d4d] block">
                    {item.title}
                  </Typography.Text>
                  <Typography.Text className="text-xs text-gray-600">
                    {item.message}
                  </Typography.Text>
                </Card>
              ))}
            </Flex>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default OverviewDashboard;
