import React from 'react';

const SidebarSkeleton: React.FC = () => {
  return (
    <div className="w-64 h-full bg-white  p-4" data-cy="sidebar-skeleton">
      {/* Menu items skeleton */}
      <div className="space-y-2" data-cy="sidebar-skeleton-menu">
        {/* Organization */}
        <div
          className="flex items-center gap-3 p-3  rounded-lg"
          data-cy="sidebar-skeleton-item-organization"
        >
          <div
            className="w-5 h-5 bg-gray-300 rounded animate-pulse"
            data-cy="sidebar-skeleton-icon-organization"
          ></div>
          <div
            className="w-24 h-4 bg-gray-300 rounded animate-pulse"
            data-cy="sidebar-skeleton-text-organization"
          ></div>
        </div>

        {/* Employees */}
        <div
          className="flex items-center gap-3 p-3"
          data-cy="sidebar-skeleton-item-employees"
        >
          <div
            className="w-5 h-5 bg-gray-200 rounded animate-pulse"
            data-cy="sidebar-skeleton-icon-employees"
          ></div>
          <div
            className="w-20 h-4 bg-gray-200 rounded animate-pulse"
            data-cy="sidebar-skeleton-text-employees"
          ></div>
        </div>

        {/* Talent Acquisition */}
        <div
          className="flex items-center gap-3 p-3"
          data-cy="sidebar-skeleton-item-talent"
        >
          <div
            className="w-5 h-5 bg-gray-200 rounded animate-pulse"
            data-cy="sidebar-skeleton-icon-talent"
          ></div>
          <div
            className="w-32 h-4 bg-gray-200 rounded animate-pulse"
            data-cy="sidebar-skeleton-text-talent"
          ></div>
        </div>

        {/* OKR */}
        <div
          className="flex items-center gap-3 p-3"
          data-cy="sidebar-skeleton-item-okr"
        >
          <div
            className="w-5 h-5 bg-gray-200 rounded animate-pulse"
            data-cy="sidebar-skeleton-icon-okr"
          ></div>
          <div
            className="w-8 h-4 bg-gray-200 rounded animate-pulse"
            data-cy="sidebar-skeleton-text-okr"
          ></div>
        </div>

        {/* CFR */}
        <div
          className="flex items-center gap-3 p-3"
          data-cy="sidebar-skeleton-item-cfr"
        >
          <div
            className="w-5 h-5 bg-gray-200 rounded animate-pulse"
            data-cy="sidebar-skeleton-icon-cfr"
          ></div>
          <div
            className="w-8 h-4 bg-gray-200 rounded animate-pulse"
            data-cy="sidebar-skeleton-text-cfr"
          ></div>
        </div>

        {/* Learning & Growth */}
        <div
          className="flex items-center gap-3 p-3"
          data-cy="sidebar-skeleton-item-learning"
        >
          <div
            className="w-5 h-5 bg-gray-200 rounded animate-pulse"
            data-cy="sidebar-skeleton-icon-learning"
          ></div>
          <div
            className="w-28 h-4 bg-gray-200 rounded animate-pulse"
            data-cy="sidebar-skeleton-text-learning"
          ></div>
        </div>

        {/* Payroll */}
        <div
          className="flex items-center gap-3 p-3"
          data-cy="sidebar-skeleton-item-payroll"
        >
          <div
            className="w-5 h-5 bg-gray-200 rounded animate-pulse"
            data-cy="sidebar-skeleton-icon-payroll"
          ></div>
          <div
            className="w-16 h-4 bg-gray-200 rounded animate-pulse"
            data-cy="sidebar-skeleton-text-payroll"
          ></div>
        </div>

        {/* Time & Attendance */}
        <div
          className="flex items-center gap-3 p-3"
          data-cy="sidebar-skeleton-item-time"
        >
          <div
            className="w-5 h-5 bg-gray-200 rounded animate-pulse"
            data-cy="sidebar-skeleton-icon-time"
          ></div>
          <div
            className="w-32 h-4 bg-gray-200 rounded animate-pulse"
            data-cy="sidebar-skeleton-text-time"
          ></div>
        </div>

        {/* Compensation & Benefit */}
        <div
          className="flex items-center gap-3 p-3"
          data-cy="sidebar-skeleton-item-compensation"
        >
          <div
            className="w-5 h-5 bg-gray-200 rounded animate-pulse"
            data-cy="sidebar-skeleton-icon-compensation"
          ></div>
          <div
            className="w-36 h-4 bg-gray-200 rounded animate-pulse"
            data-cy="sidebar-skeleton-text-compensation"
          ></div>
        </div>

        {/* Incentives */}
        <div
          className="flex items-center gap-3 p-3"
          data-cy="sidebar-skeleton-item-incentives"
        >
          <div
            className="w-5 h-5 bg-gray-200 rounded animate-pulse"
            data-cy="sidebar-skeleton-icon-incentives"
          ></div>
          <div
            className="w-20 h-4 bg-gray-200 rounded animate-pulse"
            data-cy="sidebar-skeleton-text-incentives"
          ></div>
        </div>
      </div>
    </div>
  );
};

export default SidebarSkeleton;
