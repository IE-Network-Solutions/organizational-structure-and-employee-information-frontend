'use client';

import React, { useMemo } from 'react';
import {
  MdEvent,
  MdEventBusy,
  MdGroups,
  MdOutlinePendingActions,
  MdOutlinePersonAdd,
  MdOutlinePersonRemove,
} from 'react-icons/md';
import { Skeleton } from 'antd';

import StatsCard from '../../manage-employees/_components/statsCard';

const iconWithBackground = ({
  icon,
  wrapperClassName,
}: {
  icon: React.ReactNode;
  wrapperClassName: string;
}) => {
  return (
    <span
      className={`w-8 h-8 rounded-sm ${wrapperClassName} flex items-center justify-center`}
      data-cy="employee-dashboard-stats-icon-wrap"
    >
      {icon}
    </span>
  );
};

type DashboardStatBlock = {
  value: number;
  changeSinceLastMonth: number;
};

export type CombinedHrDashboardStats = {
  totalEmployees?: DashboardStatBlock;
  newHires?: DashboardStatBlock;
  activeDepartments?: DashboardStatBlock;
  resignedStaff?: DashboardStatBlock;
  pendingLeaveRequests?: DashboardStatBlock;
  absences?: DashboardStatBlock;
  onLeaveToday?: DashboardStatBlock;
};

type EmployeeDashboardStatsCardsProps = {
  combinedHrData?: CombinedHrDashboardStats;
  loading?: boolean;
};

function statChange(block: DashboardStatBlock | undefined) {
  return block?.changeSinceLastMonth ?? 0;
}

export default function EmployeeDashboardStatsCards({
  combinedHrData,
  loading,
}: EmployeeDashboardStatsCardsProps) {
  const changeSinceLabel = 'Since Last Month';

  const cards = useMemo(
    () =>
      [
        {
          title: 'All Employees',
          value: combinedHrData?.totalEmployees?.value ?? 0,
          change: statChange(combinedHrData?.totalEmployees),
          icon: iconWithBackground({
            icon: <MdGroups className="text-orangebg" size={18} />,
            wrapperClassName: 'bg-lightorange',
          }),
          id: 'employee-dashboard-stats-all-employees',
          dataCy: 'employee-dashboard-stats-all-employees',
        },
        {
          title: 'New Hires',
          value: combinedHrData?.newHires?.value ?? 0,
          change: statChange(combinedHrData?.newHires),
          icon: iconWithBackground({
            icon: <MdOutlinePersonAdd className="text-greenbg" size={18} />,
            wrapperClassName: 'bg-[#F6FFED]',
          }),
          id: 'employee-dashboard-stats-new-hires',
          dataCy: 'employee-dashboard-stats-new-hires',
        },
        {
          title: 'Resignations',
          value: combinedHrData?.resignedStaff?.value ?? 0,
          change: statChange(combinedHrData?.resignedStaff),
          icon: iconWithBackground({
            icon: <MdOutlinePersonRemove className="text-red-500" size={18} />,
            wrapperClassName: 'bg-red-50',
          }),
          id: 'employee-dashboard-stats-resigned-staff',
          dataCy: 'employee-dashboard-stats-resigned-staff',
        },
        {
          title: 'On Leave',
          value: combinedHrData?.onLeaveToday?.value ?? 0,
          change: statChange(combinedHrData?.onLeaveToday),
          icon: iconWithBackground({
            icon: <MdEvent className="text-blue" size={18} />,
            wrapperClassName: 'bg-lightblue',
          }),
          id: 'employee-dashboard-stats-on-leave-today',
          dataCy: 'employee-dashboard-stats-on-leave-today',
        },
        {
          title: 'Pending Requests',
          value: combinedHrData?.pendingLeaveRequests?.value ?? 0,
          change: statChange(combinedHrData?.pendingLeaveRequests),
          icon: iconWithBackground({
            icon: <MdOutlinePendingActions className="text-blue" size={18} />,
            wrapperClassName: 'bg-lightblue',
          }),
          id: 'employee-dashboard-stats-pending-leave-requests',
          dataCy: 'employee-dashboard-stats-pending-leave-requests',
        },
        {
          title: 'Absences',
          value: combinedHrData?.absences?.value ?? 0,
          change: statChange(combinedHrData?.absences),
          icon: iconWithBackground({
            icon: <MdEventBusy className="text-red-500" size={18} />,
            wrapperClassName: 'bg-red-50',
          }),
          id: 'employee-dashboard-stats-absences',
          dataCy: 'employee-dashboard-stats-absences',
        },
      ] as const,
    [combinedHrData],
  );

  return (
    <div
      className="flex flex-row overflow-x-auto gap-4 scrollbar-none px-1"
      id="employee-dashboard-stats-grid"
      data-cy="employee-dashboard-stats-grid"
    >
      {loading
        ? Array.from({ length: 7 }).map((item, i) => {
            void item;
            return (
              <div
                key={i}
                className="min-w-[280px]"
                data-cy={`employee-dashboard-stats-skeleton-${i}`}
              >
                <Skeleton
                  active
                  paragraph={{ rows: 2 }}
                  className="rounded-lg p-3"
                />
              </div>
            );
          })
        : cards.map((c) => (
            <div
              key={c.id}
              className="min-w-[280px]"
              data-cy={`employee-dashboard-stats-item-${c.id}`}
            >
              <StatsCard
                title={c.title}
                value={c.value}
                change={c.change}
                changeLabel={changeSinceLabel}
                icon={c.icon}
                id={c.id}
                data-cy={c.dataCy}
              />
            </div>
          ))}
    </div>
  );
}
