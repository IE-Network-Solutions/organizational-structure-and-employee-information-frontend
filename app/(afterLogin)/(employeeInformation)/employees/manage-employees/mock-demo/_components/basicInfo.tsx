'use client';

import { Avatar, Card, Tag } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { MockEmployee } from '@/types/timesheet/workSchedule';
import { getEmployeeDisplayName } from '@/store/server/features/timesheet/workSchedule/helpers';
import { formatServiceYear, MOCK_JOINED_DATE, MOCK_PROFILE } from './profile';

export default function MockBasicInfo({ employee }: { employee: MockEmployee }) {
  return (
    <Card
      className="mb-3 rounded-lg bg-[#F9FAFB]"
      id="mock-employee-demo-basic-info-card"
      data-cy="mock-employee-demo-basic-info-card"
    >
      <div
        className="mb-6 flex flex-wrap items-start gap-4"
        data-cy="mock-employee-demo-basic-info-content"
      >
        <Avatar
          size={48}
          icon={<UserOutlined />}
          data-cy="mock-employee-demo-avatar"
        />
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <h5
            className="m-0 text-sm font-normal text-[#4d4d4d]"
            data-cy="mock-employee-demo-name"
          >
            {getEmployeeDisplayName(employee)}
          </h5>
          <p
            className="m-0 text-sm font-normal text-[#bababa]"
            data-cy="mock-employee-demo-email"
          >
            {employee.email}
          </p>
        </div>
        <Tag
          className="m-0 border border-[#91caff] bg-[#e6f4ff] text-[#1677ff]"
          data-cy="mock-employee-demo-status"
        >
          Active
        </Tag>
      </div>

      <div
        className="grid grid-cols-2 gap-6 border-gray-100 pt-4 sm:grid-cols-4"
        data-cy="mock-employee-demo-basic-info-details"
      >
        <div data-cy="mock-employee-demo-joined">
          <p className="m-0 mb-0.5 text-sm font-normal text-[#bababa]">
            Joined at
          </p>
          <p className="m-0 text-sm font-normal text-[#4d4d4d]">
            {dayjs(MOCK_JOINED_DATE).format('DD MMMM, YYYY')}
          </p>
        </div>
        <div data-cy="mock-employee-demo-address">
          <p className="m-0 mb-0.5 text-sm font-normal text-[#bababa]">
            Address
          </p>
          <p className="m-0 text-sm font-normal text-[#4d4d4d]">
            {MOCK_PROFILE.addressLine}
          </p>
        </div>
        <div data-cy="mock-employee-demo-service-year">
          <p className="m-0 mb-0.5 text-sm font-normal text-[#bababa]">
            Service Year
          </p>
          <p className="m-0 text-sm font-normal text-[#4d4d4d]">
            {formatServiceYear(MOCK_JOINED_DATE)}
          </p>
        </div>
        <div data-cy="mock-employee-demo-office">
          <p className="m-0 mb-0.5 text-sm font-normal text-[#bababa]">
            Office
          </p>
          <p className="m-0 text-sm font-normal text-[#4d4d4d]">
            {MOCK_PROFILE.office}
          </p>
        </div>
      </div>
    </Card>
  );
}
