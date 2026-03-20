'use client';

import React from 'react';
import {
  MdCalendarToday,
  MdEvent,
  MdEventBusy,
  MdGroups,
  MdOutlinePendingActions,
  MdOutlinePersonAdd,
  MdOutlinePersonRemove,
  MdPersonAdd,
  MdPersonOff,
  MdPersonRemove,
} from 'react-icons/md';

import StatsCard from '../../manage-employees/_components/statsCard';

const iconWithBackground = ({
  icon,
  wrapperClassName,
}: {
  icon: React.ReactNode;
  wrapperClassName: string;
}) => {
  return <span className={`w-8 h-8 rounded-sm ${wrapperClassName} flex items-center justify-center`}>{icon}</span>;
};

export default function EmployeeDashboardStatsCards() {
  const changeSinceLabel = 'Since Last Month';

  return (
    <div
      className="flex flex-row overflow-x-auto gap-4 scrollbar-none px-1"
      id="employee-dashboard-stats-grid"
      data-cy="employee-dashboard-stats-grid"
    >
      <div className="min-w-[280px]">
      <StatsCard
        title="All Employees"
        value={120}
        change={3}
        changeLabel={changeSinceLabel}
        icon={iconWithBackground({
          icon: <MdGroups className="text-orangebg" size={18} />,
          wrapperClassName: 'bg-lightorange',
        })}
        id="employee-dashboard-stats-all-employees"
        data-cy="employee-dashboard-stats-all-employees"
      />
      </div>

      <div className="min-w-[280px]"> 
         <StatsCard
        title="New Hires"
        value={5}
        change={3}
        changeLabel={changeSinceLabel}
        icon={iconWithBackground({
          icon: <MdOutlinePersonAdd  className="text-green-600" size={18} />,
          wrapperClassName: 'bg-green-50',
        })}
        id="employee-dashboard-stats-new-hires"
        data-cy="employee-dashboard-stats-new-hires"
      />
      </div>
     
      <div className="min-w-[280px]"> 
      <StatsCard
        title="Resignations"
        value={0}
        change={3}
        changeLabel={changeSinceLabel}
        icon={iconWithBackground({
          icon: <MdOutlinePersonRemove  className="text-red-500" size={18} />,
          wrapperClassName: 'bg-red-50',
        })}
        id="employee-dashboard-stats-resignations"
        data-cy="employee-dashboard-stats-resignations"
      />
      </div>
      <div className="min-w-[280px]"> 
      <StatsCard
        title="On Leave"
        value={6}
        change={3}
        changeLabel={changeSinceLabel}
        icon={iconWithBackground({
          icon: <MdEvent  className="text-blue" size={18} />,
          wrapperClassName: 'bg-lightblue',
        })}
        id="employee-dashboard-stats-on-leave"
        data-cy="employee-dashboard-stats-on-leave"
      />
      </div>
      <div className="min-w-[280px]"> 
      <StatsCard
        title="Pending Request"
        value={20}
        change={3}
        changeLabel={changeSinceLabel}
        icon={iconWithBackground({
          icon: <MdOutlinePendingActions className="text-blue" size={18} />,
          wrapperClassName: 'bg-lightblue',
        })}
        id="employee-dashboard-stats-pending-request"
        data-cy="employee-dashboard-stats-pending-request"
      />
      </div>  
        
      <div className="min-w-[280px]"> 
      <StatsCard
        title="Absences"
        value={0}
        change={3}
        changeLabel={changeSinceLabel}
        icon={iconWithBackground({
          icon: <MdEventBusy  className="text-red-500" size={18} />,
          wrapperClassName: 'bg-red-50',
        })}
        id="employee-dashboard-stats-absences"
        data-cy="employee-dashboard-stats-absences"
      />
      </div>
    </div>
  );
}

