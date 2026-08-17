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
          { title: 'Mock Employee' },
        ]}
        data-cy="mock-employee-demo-breadcrumb"
      />

      <div
        className="mb-4 rounded-lg border border-[#BFDBFE] bg-[#EFF6FF] px-4 py-3"
        data-cy="mock-employee-demo-banner"
      >
        <p className="mb-0 text-sm font-medium text-[#1E40AF]">
          Demo employee profile
        </p>
        <p className="mb-0 text-xs text-[#1D4ED8]">
          Mock data only. The Job section highlights assigned shifts as the
          difference from a standard day-hours schedule.
        </p>
      </div>

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
          <span className="text-base font-normal text-[#4d4d4d]">
            Job · Work Schedule
          </span>
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

        <div
          className="rounded-xl border-2 border-[#93C5FD] bg-white p-4"
          data-cy="mock-employee-demo-assigned-shifts"
        >
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <p className="mb-0 text-sm font-semibold text-[#1E40AF]">
              Assigned Shifts
            </p>
            <Tag color="blue" className="!m-0">
              Difference from day-hours only
            </Tag>
          </div>
          <p className="mb-3 text-xs text-gray-500">
            This employee is assigned named shifts inside the schedule window —
            not only full-day hours.
          </p>

          {assignments.length === 0 ? (
            <p className="mb-0 text-sm text-gray-500">No shifts assigned.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {assignments.map((assignment) => (
                <div
                  key={assignment.id}
                  className="rounded-lg border border-[#BFDBFE] bg-[#F8FBFF] px-3 py-3"
                  data-cy={`mock-employee-demo-assignment-${assignment.id}`}
                >
                  <p className="mb-2 text-sm font-medium text-[#4d4d4d]">
                    {assignment.blueprint.title}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {assignment.shifts.length > 0 ? (
                      assignment.shifts.map((shift) => (
                        <Tag
                          key={shift.id}
                          color="blue"
                          className="!m-0 !px-2 !py-1 !text-xs"
                          data-cy={`mock-employee-demo-shift-${shift.id}`}
                        >
                          {shift.name} ·{' '}
                          {formatTimeRange(shift.startTime, shift.endTime)} ·{' '}
                          {shift.weekdays.map((day) => day.slice(0, 3)).join(', ')}
                        </Tag>
                      ))
                    ) : (
                      <Tag className="!m-0">Day hours only</Tag>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
