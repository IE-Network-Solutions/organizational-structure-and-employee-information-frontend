'use client';
import React from 'react';
import { Avatar, Card, Dropdown, MenuProps, Skeleton, Tooltip } from 'antd';
import { CalendarOutlined, CheckCircleFilled } from '@ant-design/icons';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import dayjs from 'dayjs';
import { useQuery } from 'react-query';
import { getUser } from '@/store/server/features/employees/employeeManagment/queries';

export interface AssignedPlanChip {
  id: string;
  name: string;
  drivesOkrProgress: boolean;
}

interface AssigneeCardProps {
  userId: string;
  /** Employee from the (slow) bulk list when it has already loaded. */
  bulkEmployee?: any;
  plans: AssignedPlanChip[];
  updatedAt?: string;
  menuItems: MenuProps['items'];
}

const AVATAR_COLORS = [
  { bg: '#EFF6FF', fg: '#1D4ED8' },
  { bg: '#F0FDF4', fg: '#15803D' },
  { bg: '#FEF3C7', fg: '#B45309' },
  { bg: '#FDF2F8', fg: '#BE185D' },
  { bg: '#F5F3FF', fg: '#6D28D9' },
  { bg: '#ECFEFF', fg: '#0E7490' },
];

function avatarColor(userId: string) {
  let hash = 0;
  for (const char of userId) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

const AssigneeCard: React.FC<AssigneeCardProps> = ({
  userId,
  bulkEmployee,
  plans,
  updatedAt,
  menuItems,
}) => {
  // One small request per card instead of waiting on the full employee list.
  const { data: fetchedEmployee } = useQuery(
    ['assigneeUser', userId],
    () => getUser(userId),
    {
      enabled: !bulkEmployee && !!userId,
      staleTime: 10 * 60_000,
      refetchOnWindowFocus: false,
    },
  );

  const employee = bulkEmployee ?? fetchedEmployee;
  const fullName = employee
    ? [employee.firstName, employee.middleName, employee.lastName]
        .filter(Boolean)
        .join(' ')
    : '';
  const initials = fullName
    .split(' ')
    .map((part) => part[0]?.toUpperCase())
    .join('')
    .slice(0, 2);
  const color = avatarColor(userId);
  const okrPlan = plans.find((plan) => plan.drivesOkrProgress);

  return (
    <Card
      bordered
      className="group rounded-xl border-[#EEF0F4] transition-all hover:border-[#c7d2fe] hover:shadow-md"
      style={{
        background: '#FFFFFF',
        boxShadow: '0 1px 2px rgba(16,24,40,.04)',
      }}
      bodyStyle={{ padding: 16 }}
      id={`okr-planning-assignation-card-${userId}`}
      data-cy={`okr-planning-assignation-card-${userId}`}
    >
      <div
        className="flex items-start gap-3"
        data-cy={`okr-planning-assignation-card-content-${userId}`}
      >
        {employee ? (
          <Avatar
            size={44}
            src={employee.profileImage || undefined}
            style={{ background: color.bg, color: color.fg, fontWeight: 600 }}
            data-cy={`okr-planning-assignation-card-avatar-${userId}`}
          >
            {initials}
          </Avatar>
        ) : (
          <Skeleton.Avatar active size={44} />
        )}

        <div
          className="min-w-0 flex-1"
          data-cy={`okr-planning-assignation-card-content-block-${userId}`}
        >
          <div
            className="flex items-start justify-between gap-1"
            data-cy={`okr-planning-assignation-card-name-row-${userId}`}
          >
            <div
              className="min-w-0"
              data-cy={`okr-planning-assignation-card-identity-${userId}`}
            >
              {employee ? (
                <>
                  <p
                    className="m-0 truncate text-sm font-semibold leading-5 text-gray-800"
                    title={fullName}
                    id={`okr-planning-assignation-card-name-${userId}`}
                    data-cy={`okr-planning-assignation-card-name-${userId}`}
                  >
                    {fullName || '-'}
                  </p>
                  {employee.email ? (
                    <p
                      className="m-0 truncate text-xs leading-4 text-gray-400"
                      title={employee.email}
                      data-cy={`okr-planning-assignation-card-email-${userId}`}
                    >
                      {employee.email}
                    </p>
                  ) : null}
                </>
              ) : (
                <Skeleton
                  active
                  title={{ width: 120 }}
                  paragraph={{ rows: 1, width: 160 }}
                  className="[&_.ant-skeleton-paragraph]:!mt-2"
                />
              )}
            </div>
            <Dropdown
              menu={{ items: menuItems }}
              trigger={['click']}
              placement="bottomRight"
              overlayClassName="custom-menu-dropdown"
            >
              <button
                type="button"
                className="flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-md border-none bg-transparent p-0 text-[#8c8c8c] transition-colors hover:bg-gray-100 hover:text-[#262626]"
                onClick={(e) => e.stopPropagation()}
                data-cy={`okr-planning-assignation-card-menu-button-${userId}`}
              >
                <MoreHorizIcon style={{ fontSize: 16 }} />
              </button>
            </Dropdown>
          </div>
        </div>
      </div>

      <div
        className="mt-3 flex flex-wrap items-center gap-1.5"
        data-cy={`okr-planning-assignation-card-plans-${userId}`}
      >
        {plans.map((plan) =>
          plan.drivesOkrProgress ? (
            <Tooltip
              key={plan.id}
              title="Reports on this plan progress Key Results and the Average OKR"
            >
              <span
                className="inline-flex items-center gap-1 rounded-md border border-[#2b54ad] bg-[#EFF6FF] px-2.5 py-0.5 text-xs font-medium text-[#2b54ad]"
                data-cy={`okr-planning-assignation-card-tag-${userId}-${plan.id}`}
              >
                <CheckCircleFilled style={{ fontSize: 11 }} />
                {plan.name}
              </span>
            </Tooltip>
          ) : (
            <span
              key={plan.id}
              className="inline-flex items-center rounded-md border border-[#E5E7EB] bg-[#F9FAFB] px-2.5 py-0.5 text-xs text-[#6B7280]"
              data-cy={`okr-planning-assignation-card-tag-${userId}-${plan.id}`}
            >
              {plan.name}
            </span>
          ),
        )}
      </div>

      <div
        className="mt-3 flex items-center justify-between border-t border-[#F3F4F6] pt-2.5 text-xs text-gray-400"
        data-cy={`okr-planning-assignation-card-meta-${userId}`}
      >
        <span
          className="flex items-center gap-1"
          data-cy={`okr-planning-assignation-card-date-${userId}`}
        >
          <CalendarOutlined style={{ fontSize: 11 }} />
          {updatedAt ? dayjs(updatedAt).format('DD MMM YYYY') : '-'}
        </span>
        <span data-cy={`okr-planning-assignation-card-progress-note-${userId}`}>
          {okrPlan
            ? `Progresses on ${okrPlan.name}`
            : 'Progresses on every plan'}
        </span>
      </div>
    </Card>
  );
};

export default AssigneeCard;
