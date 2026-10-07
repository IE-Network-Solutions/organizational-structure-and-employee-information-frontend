'use client';

import type { ReactNode } from 'react';
import { Avatar, Card, Skeleton } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { MdOutlineCake, MdCardGiftcard } from 'react-icons/md';
import { useGetBirthDay } from '@/store/server/features/dashboard/birthday/queries';
import { useGetWorkAnniversary } from '@/store/server/features/dashboard/work-anniversary/queries';
import type { BirthDayData } from '@/store/server/features/dashboard/birthday/queries';
import type { WorkAnniversaryData } from '@/store/server/features/dashboard/work-anniversary/queries';

type JobUser = BirthDayData['user'] & {
  employeeJobInformation?: Array<{ position?: { name?: string } }>;
};

function getDisplayName(user: {
  firstName?: string;
  middleName?: string | null;
}) {
  return `${user?.firstName || ''} ${user?.middleName || ''}`.trim();
}

function getPosition(user: JobUser) {
  return user?.employeeJobInformation?.[0]?.position?.name || '';
}

function getAnniversaryYears(joinedDate: string): number {
  const start = new Date(joinedDate);
  const now = new Date();
  if (Number.isNaN(start.getTime())) return 0;
  let years = now.getFullYear() - start.getFullYear();
  const monthDiff = now.getMonth() - start.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < start.getDate())) {
    years -= 1;
  }
  return Math.max(0, years);
}

function formatYearsLabel(years: number) {
  if (years <= 0) return '—';
  return `${years} Year${years === 1 ? '' : 's'}`;
}

function ListRowSkeleton({ withBadge }: { withBadge?: boolean }) {
  return (
    <div
      className="flex items-center justify-between gap-3 py-2 first:pt-0 last:pb-0"
      data-cy="dashboard-event-essentials-row-skeleton"
    >
      <div
        className="flex items-center gap-3 min-w-0 flex-1"
        data-cy="dashboard-event-essentials-row-skeleton-main"
      >
        <Skeleton.Avatar active size={40} />
        <div
          className="flex flex-col gap-1 min-w-0 flex-1"
          data-cy="dashboard-event-essentials-row-skeleton-text"
        >
          <Skeleton.Input active size="small" className="!h-4 !w-32 !min-w-0" />
          <Skeleton.Input active size="small" className="!h-3 !w-24 !min-w-0" />
        </div>
      </div>
      {withBadge ? (
        <Skeleton.Input
          active
          size="small"
          className="!h-6 !w-14 !min-w-0 shrink-0"
        />
      ) : null}
    </div>
  );
}

function EssentialsCardSkeleton({ withBadge }: { withBadge?: boolean }) {
  return (
    <Card
      bordered={false}
      bodyStyle={{ padding: 0 }}
      className="p-4 md:p-5 bg-white rounded-[10px] border border-[#E5E7EB] shadow-none"
      data-cy="dashboard-event-essentials-card-skeleton"
    >
      <div
        className="flex items-center gap-2 pb-3"
        data-cy="dashboard-event-essentials-card-skeleton-header"
      >
        <Skeleton.Avatar
          active
          shape="square"
          size={28}
          className="!rounded-md"
        />
        <Skeleton.Input active size="small" className="!h-4 !w-40 !min-w-0" />
      </div>
      <ListRowSkeleton withBadge={withBadge} />
      <ListRowSkeleton withBadge={withBadge} />
    </Card>
  );
}

function BirthdayRow({ person }: { person: BirthDayData }) {
  const user = person.user as JobUser;
  const name = getDisplayName(user);
  const role = getPosition(user);

  return (
    <div
      className="flex items-start gap-3 py-2"
      data-cy="dashboard-event-essentials-birthday-row"
    >
      {user?.profileImage ? (
        <Avatar
          size={40}
          src={user.profileImage}
          alt={name}
          className="shrink-0"
          data-cy="dashboard-event-essentials-birthday-avatar"
        />
      ) : (
        <Avatar
          size={40}
          icon={
            <UserOutlined data-cy="dashboard-event-essentials-birthday-avatar-icon" />
          }
          className="shrink-0"
          data-cy="dashboard-event-essentials-birthday-avatar-default"
        />
      )}
      <div
        className="min-w-0 flex-1"
        data-cy="dashboard-event-essentials-birthday-text"
      >
        <p
          className="text-sm font-semibold text-gray-900 leading-tight"
          data-cy="dashboard-event-essentials-birthday-name"
        >
          {name || '—'}
        </p>
        {role ? (
          <p
            className="text-xs text-gray-500 mt-0.5"
            data-cy="dashboard-event-essentials-birthday-role"
          >
            {role}
          </p>
        ) : null}
      </div>
    </div>
  );
}

function AnniversaryRow({ person }: { person: WorkAnniversaryData }) {
  const user = person.user as JobUser;
  const name = getDisplayName(user);
  const role = getPosition(user);
  const years = getAnniversaryYears(person.joinedDate);

  return (
    <div
      className="flex items-center justify-between gap-3 py-2.5 first:pt-0 border-b border-[#F3F4F6] last:border-b-0 last:pb-0"
      data-cy="dashboard-event-essentials-anniversary-row"
    >
      <div
        className="flex items-start gap-3 min-w-0 flex-1"
        data-cy="dashboard-event-essentials-anniversary-main"
      >
        {user?.profileImage ? (
          <Avatar
            size={40}
            src={user.profileImage}
            alt={name}
            className="shrink-0"
            data-cy="dashboard-event-essentials-anniversary-avatar"
          />
        ) : (
          <Avatar
            size={40}
            icon={
              <UserOutlined data-cy="dashboard-event-essentials-anniversary-avatar-icon" />
            }
            className="shrink-0"
            data-cy="dashboard-event-essentials-anniversary-avatar-default"
          />
        )}
        <div
          className="min-w-0 flex-1"
          data-cy="dashboard-event-essentials-anniversary-text"
        >
          <p
            className="text-sm font-semibold text-gray-900 leading-tight"
            data-cy="dashboard-event-essentials-anniversary-name"
          >
            {name || '—'}
          </p>
          {role ? (
            <p
              className="text-xs text-gray-500 mt-0.5"
              data-cy="dashboard-event-essentials-anniversary-role"
            >
              {role}
            </p>
          ) : null}
        </div>
      </div>
      <span
        className="shrink-0 inline-flex items-center justify-center px-2 py-1 text-xs font-normal text-gray-700 bg-gray-50 border border-gray-200 rounded"
        data-cy="dashboard-event-essentials-anniversary-badge"
      >
        {formatYearsLabel(years)}
      </span>
    </div>
  );
}

function EssentialsListCard({
  title,
  icon,
  iconWrapClass,
  children,
  dataCy,
}: {
  title: string;
  icon: ReactNode;
  iconWrapClass: string;
  children: ReactNode;
  dataCy: string;
}) {
  return (
    <Card
      bordered={false}
      bodyStyle={{ padding: 0 }}
      className="p-4 bg-white rounded-lg border border-[#E5E7EB] shadow-none flex flex-col h-full min-h-[152px]"
      data-cy={dataCy}
    >
      <div
        className="flex items-center gap-2 pb-1"
        data-cy={`${dataCy}-header`}
      >
        <span
          className={`inline-flex items-center justify-center w-8 h-8 rounded-md text-lg ${iconWrapClass}`}
          data-cy={`${dataCy}-icon`}
        >
          {icon}
        </span>
        <span
          className="text-sm font-semibold text-gray-900"
          data-cy={`${dataCy}-title`}
        >
          {title}
        </span>
      </div>
      <div
        className="h-[95px] overflow-y-auto scrollbar-none"
        data-cy={`${dataCy}-scroll`}
      >
        <div className="flex-1 mt-2 h-[48px]" data-cy={`${dataCy}-body`}>
          {children}
        </div>
      </div>
    </Card>
  );
}

export function TodaysBirthdaysEssentialsCard() {
  const { data: birthDays, isLoading: birthdayLoading } = useGetBirthDay();
  const birthdays = birthDays ?? [];

  if (birthdayLoading) return <EssentialsCardSkeleton />;

  return (
    <EssentialsListCard
      title="Today's Birthdays"
      icon={<MdOutlineCake />}
      iconWrapClass="bg-[#FFF0F6] text-[#F759AB]"
      dataCy="dashboard-event-essentials-birthdays-card"
    >
      {birthdays.length === 0 ? (
        <div
          className="text-sm text-gray-500 flex items-center justify-center py-8"
          data-cy="dashboard-event-essentials-birthdays-empty"
        >
          No birthdays today
        </div>
      ) : (
        birthdays.map((person, index) => (
          <BirthdayRow
            key={`${person.user?.firstName}-${index}`}
            person={person}
          />
        ))
      )}
    </EssentialsListCard>
  );
}

export function WorkAnniversariesEssentialsCard() {
  const { data: workAnniversaries, isLoading: anniversaryLoading } =
    useGetWorkAnniversary();
  const anniversaries = workAnniversaries ?? [];

  if (anniversaryLoading) return <EssentialsCardSkeleton withBadge />;

  return (
    <EssentialsListCard
      title="Work Anniversaries"
      icon={<MdCardGiftcard />}
      iconWrapClass="bg-[#FFF7E6] text-[#FA8C16]"
      dataCy="dashboard-event-essentials-anniversaries-card"
    >
      {anniversaries.length === 0 ? (
        <div
          className="text-sm text-gray-500 flex items-center justify-center py-8"
          data-cy="dashboard-event-essentials-anniversaries-empty"
        >
          No work anniversaries today
        </div>
      ) : (
        anniversaries.map((person, index) => (
          <AnniversaryRow
            key={`${person.user?.firstName}-${person.joinedDate}-${index}`}
            person={person}
          />
        ))
      )}
    </EssentialsListCard>
  );
}

export default function EventEssentials() {
  return (
    <div
      className="grid grid-cols-1 md:grid-cols-2 gap-4 "
      data-cy="dashboard-event-essentials"
    >
      <TodaysBirthdaysEssentialsCard />
      <WorkAnniversariesEssentialsCard />
    </div>
  );
}
