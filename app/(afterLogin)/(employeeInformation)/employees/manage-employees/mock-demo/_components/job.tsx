'use client';

import { Button, Col, Row, Tag } from 'antd';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import dayjs from 'dayjs';
import { DEMO_LOGGED_IN_EMPLOYEE_ID } from '@/types/timesheet/workSchedule';
import { useGetUserShiftAssignments } from '@/store/server/features/timesheet/workSchedule/queries';
import {
  durationHours,
  formatTimeRangeMeridiem,
} from '@/store/server/features/timesheet/workSchedule/helpers';
import { FieldBlock, FieldGrid, InfoCard } from './shared';
import { formatServiceYear, MOCK_JOINED_DATE, MOCK_PROFILE } from './profile';

const EMPTY_ASSIGNMENTS: NonNullable<
  ReturnType<typeof useGetUserShiftAssignments>['data']
> = [];

export default function MockJob() {
  const { data: assignmentsData } = useGetUserShiftAssignments(
    DEMO_LOGGED_IN_EMPLOYEE_ID,
  );
  const assignments = assignmentsData ?? EMPTY_ASSIGNMENTS;
  const primaryAssignment = assignments[0];
  const blueprint = primaryAssignment?.blueprint;
  const assignedShifts = primaryAssignment?.shifts ?? [];

  const dailyHours = blueprint
    ? durationHours(blueprint.defaultStartTime, blueprint.defaultEndTime)
    : 0;
  const totalHours = blueprint
    ? Number((dailyHours * blueprint.activeWeekdays.length).toFixed(1))
    : 0;

  return (
    <div data-cy="mock-employee-demo-job">
      <Row gutter={16}>
        <Col lg={12} sm={24} xs={24}>
          <InfoCard
            title="Employment Information"
            titleBold={false}
            dataCy="mock-employee-demo-employment-card"
          >
            <FieldGrid
              dataCy="mock-employee-demo-employment-grid"
              items={[
                {
                  label: 'Service Year',
                  value: formatServiceYear(MOCK_JOINED_DATE),
                  dataCy: 'mock-employee-demo-employment-service-year',
                },
                {
                  label: 'Joined Date',
                  value: dayjs(MOCK_JOINED_DATE).format('DD MMMM, YYYY'),
                  dataCy: 'mock-employee-demo-employment-joined-date',
                },
              ]}
            />
          </InfoCard>
          <InfoCard
            title="Work Schedule"
            titleBold={false}
            dataCy="mock-employee-demo-work-schedule-card"
          >
            <Row gutter={[24, 0]}>
              <Col lg={12} className="flex flex-col">
                <FieldBlock
                  label="Current Schedule"
                  value={blueprint?.title || '—'}
                  dataCy="mock-employee-demo-current-schedule"
                />
              </Col>
              <Col lg={12} className="flex flex-col">
                <FieldBlock
                  label="Daily Working hours"
                  value={dailyHours > 0 ? `${dailyHours} hours` : '—'}
                  dataCy="mock-employee-demo-daily-hours"
                />
              </Col>
            </Row>
            <Row gutter={[24, 0]}>
              <Col lg={12} className="flex flex-col">
                <FieldBlock
                  label="Total Working Hours"
                  value={
                    totalHours > 0 ? `${Math.round(totalHours)} Hours` : '—'
                  }
                  dataCy="mock-employee-demo-total-hours"
                />
              </Col>
            </Row>
            {assignedShifts.length > 0 && (
              <div data-cy="mock-employee-demo-assigned-shifts">
                <p
                  className="m-0 mb-2 text-sm font-normal text-[#4d4d4d]"
                  data-cy="mock-employee-demo-assigned-shifts-label"
                >
                  Assigned Shifts
                </p>
                <div
                  className="flex flex-wrap gap-1.5"
                  data-cy="mock-employee-demo-assigned-shifts-list"
                >
                  {assignedShifts.map((shift) => (
                    <Tag
                      key={shift.id}
                      className="!m-0 !text-[11px] !leading-5"
                      data-cy={`mock-employee-demo-assigned-shift-${shift.id}`}
                    >
                      {shift.name} ·{' '}
                      {formatTimeRangeMeridiem(shift.startTime, shift.endTime)}
                    </Tag>
                  ))}
                </div>
              </div>
            )}
          </InfoCard>
        </Col>
        <Col lg={12} sm={24} xs={24}>
          <InfoCard
            title="Job Information"
            titleBold={false}
            extra={
              <Button
                type="default"
                className="h-6 w-6 border-0"
                size="small"
                data-cy="mock-employee-demo-job-information-menu-btn"
              >
                <MoreHorizIcon style={{ fontSize: 14 }} />
              </Button>
            }
            dataCy="mock-employee-demo-job-information-card"
          >
            <FieldGrid
              dataCy="mock-employee-demo-job-information-grid"
              items={[
                {
                  label: 'Title',
                  value: MOCK_PROFILE.job.title,
                  dataCy: 'mock-employee-demo-job-title',
                },
                {
                  label: 'Salary',
                  value: MOCK_PROFILE.job.salary,
                  dataCy: 'mock-employee-demo-job-salary',
                },
                {
                  label: 'Type',
                  value: MOCK_PROFILE.job.type,
                  dataCy: 'mock-employee-demo-job-type',
                },
                {
                  label: 'Status',
                  value: MOCK_PROFILE.job.status,
                  dataCy: 'mock-employee-demo-job-status',
                },
                {
                  label: 'Office',
                  value: MOCK_PROFILE.job.office,
                  dataCy: 'mock-employee-demo-job-office',
                },
                {
                  label: 'Effective Date',
                  value: dayjs(MOCK_JOINED_DATE).format('DD MMM YYYY'),
                  dataCy: 'mock-employee-demo-job-effective-date',
                },
                {
                  label: 'Position',
                  value: MOCK_PROFILE.job.position,
                  dataCy: 'mock-employee-demo-job-position',
                },
                {
                  label: 'Manager',
                  value: MOCK_PROFILE.job.manager,
                  dataCy: 'mock-employee-demo-job-manager',
                },
                {
                  label: 'Department',
                  value: MOCK_PROFILE.job.department,
                  dataCy: 'mock-employee-demo-job-department',
                },
              ]}
            />
          </InfoCard>
        </Col>
      </Row>
    </div>
  );
}
