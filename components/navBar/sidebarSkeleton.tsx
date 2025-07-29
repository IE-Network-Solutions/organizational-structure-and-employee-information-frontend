import React from 'react';

const SidebarSkeleton: React.FC = () => {
  return (
    <div className="w-64 h-full bg-white  p-4">
      {/* Menu items skeleton */}
      <div className="space-y-2">
        {/* Organization */}
        <div className="flex items-center gap-3 p-3  rounded-lg">
          <div className="w-5 h-5 bg-gray-300 rounded animate-pulse"></div>
          <div className="w-24 h-4 bg-gray-300 rounded animate-pulse"></div>
        </div>

        {/* Employees */}
        <div className="flex items-center gap-3 p-3">
          <div className="w-5 h-5 bg-gray-200 rounded animate-pulse"></div>
          <div className="w-20 h-4 bg-gray-200 rounded animate-pulse"></div>
        </div>

        {/* Talent Acquisition */}
        <div className="flex items-center gap-3 p-3">
          <div className="w-5 h-5 bg-gray-200 rounded animate-pulse"></div>
          <div className="w-32 h-4 bg-gray-200 rounded animate-pulse"></div>
        </div>

        {/* OKR */}
        <div className="flex items-center gap-3 p-3">
          <div className="w-5 h-5 bg-gray-200 rounded animate-pulse"></div>
          <div className="w-8 h-4 bg-gray-200 rounded animate-pulse"></div>
        </div>

        {/* CFR */}
        <div className="flex items-center gap-3 p-3">
          <div className="w-5 h-5 bg-gray-200 rounded animate-pulse"></div>
          <div className="w-8 h-4 bg-gray-200 rounded animate-pulse"></div>
        </div>

        {/* Learning & Growth */}
        <div className="flex items-center gap-3 p-3">
          <div className="w-5 h-5 bg-gray-200 rounded animate-pulse"></div>
          <div className="w-28 h-4 bg-gray-200 rounded animate-pulse"></div>
        </div>

        {/* Payroll */}
        <div className="flex items-center gap-3 p-3">
          <div className="w-5 h-5 bg-gray-200 rounded animate-pulse"></div>
          <div className="w-16 h-4 bg-gray-200 rounded animate-pulse"></div>
        </div>

        {/* Time & Attendance */}
        <div className="flex items-center gap-3 p-3">
          <div className="w-5 h-5 bg-gray-200 rounded animate-pulse"></div>
          <div className="w-32 h-4 bg-gray-200 rounded animate-pulse"></div>
        </div>

        {/* Compensation & Benefit */}
        <div className="flex items-center gap-3 p-3">
          <div className="w-5 h-5 bg-gray-200 rounded animate-pulse"></div>
          <div className="w-36 h-4 bg-gray-200 rounded animate-pulse"></div>
        </div>

        {/* Incentives */}
        <div className="flex items-center gap-3 p-3">
          <div className="w-5 h-5 bg-gray-200 rounded animate-pulse"></div>
          <div className="w-20 h-4 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>
    </div>
  );
};

export default SidebarSkeleton;
