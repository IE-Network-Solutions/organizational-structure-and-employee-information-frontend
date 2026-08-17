'use client';

import Link from 'next/link';
import { Breadcrumb, Card, Col, Row, Tag } from 'antd';
import { DEMO_LOGGED_IN_EMPLOYEE_ID } from '@/types/timesheet/workSchedule';
import { MOCK_EMPLOYEES } from '@/store/server/features/timesheet/workSchedule/mockData';
import { useGetUserShiftAssignments } from '@/store/server/features/timesheet/workSchedule/queries';
import { formatTimeRange } from '@/store/server/features/timesheet/workSchedule/helpers';
import { getEmployeeDisplayName } from '@/store/server/features/timesheet/workSchedule/mockService';

const MOCK_EMPLOYEE =
  MOCK_EMPLOYEES.find((item) => item.id === DEMO_LOGGED_IN_EMPLOYEE_ID) ??
  MOCK_EMPLOYEES[0];

const EMPTY_ASSIGNMENTS: NonNullable<
  ReturnType<typeof useGetUserShiftAssignments>['data']
> = [];

export default function MockEmployeeDemoPage() {
  const { data: assignmentsData } = useGetUserShiftAssignments(
    DEMO_LOGGED_IN_EMPLOYEE_ID,
  );
  const assignments = assignmentsData ?? EMPTY_ASSIGNMENTS;
  const primaryAssignment = assignments[0];
  const shiftTags = assignments.flatMap((assignment) =>
    assignment.shifts.length > 0
      ? assignment.shifts.map((shift) => ({
          key: `${assignment.id}-${shift.id}`,
          label: `${shift.name} · ${formatTimeRange(shift.startTime, shift.endTime)}`,
        }))
      : [
          {
            key: assignment.id,
            label: `${assignment.blueprint.title} · Day hours only`,
          },
        ],
  );

  return (
    <div
      className="h-auto w-auto px-3 sm:px-6"
      data-cy="mock-employee-demo-page"
      id="mock-employee-demo-page"
    >
      <Breadcrumb
        className="mb-4"
        items={[
          {
            title: (
              <Link href="/employees/manage-employees">Manage Employees</Link>
            ),
          },
          { title: getEmployeeDisplayName(MOCK_EMPLOYEE) },
        ]}
        data-cy="mock-employee-demo-breadcrumb"
      />

      <h2
        className="mb-4 text-lg font-semibold text-[#4d4d4d]"
        data-cy="mock-employee-demo-header"
      >
        {getEmployeeDisplayName(MOCK_EMPLOYEE)}
      </h2>

      <Card
        className="mb-4 rounded-lg"
        bordered={false}
        style={{ background: '#F9FAFB', boxShadow: 'none' }}
        data-cy="mock-employee-demo-basic-card"
      >
        <Row gutter={[24, 16]}>
          <Col xs={24} md={8}>
            <p className="mb-0.5 text-sm text-[#4d4d4d]">Full Name</p>
            <p className="mb-0 text-base text-[#4d4d4d] font-medium">
              {getEmployeeDisplayName(MOCK_EMPLOYEE)}
            </p>
          </Col>
          <Col xs={24} md={8}>
            <p className="mb-0.5 text-sm text-[#4d4d4d]">Email</p>
            <p className="mb-0 text-base text-[#4d4d4d]">
              {MOCK_EMPLOYEE.email}
            </p>
          </Col>
          <Col xs={24} md={8}>
            <p className="mb-0.5 text-sm text-[#4d4d4d]">Job Title</p>
            <p className="mb-0 text-base text-[#4d4d4d]">
              {MOCK_EMPLOYEE.jobTitle}
            </p>
          </Col>
          <Col xs={24} md={8}>
            <p className="mb-0.5 text-sm text-[#4d4d4d]">Department</p>
            <p className="mb-0 text-base text-[#4d4d4d]">Operations</p>
          </Col>
          <Col xs={24} md={8}>
            <p className="mb-0.5 text-sm text-[#4d4d4d]">Employment Type</p>
            <p className="mb-0 text-base text-[#4d4d4d]">Permanent</p>
          </Col>
          <Col xs={24} md={8}>
            <p className="mb-0.5 text-sm text-[#4d4d4d]">Status</p>
            <Tag color="success" className="!m-0">
              Active
            </Tag>
          </Col>
        </Row>
      </Card>

      <Card
        title={
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-base font-normal text-[#4d4d4d]">
              Work Schedule
            </span>
            <Tag
              color="blue"
              className="!m-0 !text-[10px] !leading-4 !px-1.5"
              data-cy="mock-employee-demo-work-schedule-mock-tag"
            >
              Mock
            </Tag>
          </div>
        }
        className="rounded-lg"
        bordered={false}
        style={{ background: '#F9FAFB', boxShadow: 'none' }}
        headStyle={{
          borderBottom: 'none',
          background: '#F9FAFB',
          paddingLeft: 16,
          paddingRight: 16,
        }}
        bodyStyle={{ padding: '12px 16px', background: '#F9FAFB' }}
        data-cy="mock-employee-demo-job-card"
      >
        <Row gutter={[24, 0]}>
          <Col xs={24} lg={12}>
            <div className="mb-5">
              <p className="mb-0.5 text-sm text-[#4d4d4d]">Current Schedule</p>
              <p className="mb-0 text-base text-[#4d4d4d]">
                {primaryAssignment?.blueprint.title || '—'}
              </p>
            </div>
          </Col>
          <Col xs={24} lg={12}>
            <div className="mb-5">
              <p className="mb-0.5 text-sm text-[#4d4d4d]">Work Window</p>
              <p className="mb-0 text-base text-[#4d4d4d]">
                {primaryAssignment
                  ? formatTimeRange(
                      primaryAssignment.blueprint.defaultStartTime,
                      primaryAssignment.blueprint.defaultEndTime,
                    )
                  : '—'}
              </p>
            </div>
          </Col>
        </Row>

        <div data-cy="mock-employee-demo-assigned-shifts">
          <p className="mb-2 text-sm text-[#4d4d4d]">Assigned Shifts</p>
          {shiftTags.length === 0 ? (
            <p className="mb-0 text-sm text-gray-500">No shifts assigned.</p>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {shiftTags.map((shift) => (
                <Tag
                  key={shift.key}
                  className="!m-0 !text-[11px] !leading-5"
                  data-cy={`mock-employee-demo-shift-${shift.key}`}
                >
                  {shift.label}
                </Tag>
              ))}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
