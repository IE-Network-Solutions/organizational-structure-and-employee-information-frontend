import React from 'react';
import CustomBreadcrumb from '@/components/common/breadCramp';
import { TimeAndAttendaceDashboardStore } from '@/store/uistate/features/timesheet/dashboard';
import { useSearchParams } from 'next/navigation';
import CheckControl from '../../../my-timesheet/_components/checkControls/index';

const DashboardHeader: React.FC = () => {
  const { activeTab, setActiveTab } = TimeAndAttendaceDashboardStore();
  const searchParams = useSearchParams();
  const hasEmployeeAttendance = searchParams.has('employeeAttendance');

  return (
    <div
      className="mb-6"
      id="time-attendance-dashboard-header-wrapper-div"
      data-cy="time-attendance-dashboard-header-wrapper-div"
    >
      <div
        className="flex flex-wrap justify-between items-center"
        id="time-attendance-dashboard-header-layout-div"
        data-cy="time-attendance-dashboard-header-layout-div"
      >
        <CustomBreadcrumb
          className="text-sm"
          title="Time and attendance"
          subtitle={
            hasEmployeeAttendance
              ? 'Manage employee Timesheet'
              : 'Manage Your TimeSheet'
          }
          data-cy="time-attendance-dashboard-header-breadcrumb-component"
        />
        <div
          className="flex items-center gap-3"
          id="time-attendance-dashboard-header-actions-div"
          data-cy="time-attendance-dashboard-header-actions-div"
        >
          {activeTab === 'personal' && (
            <CheckControl data-cy="time-attendance-dashboard-header-check-control-component" />
          )}

          <div
            className="flex items-center bg-[#f8f8f8] border border-gray-300 rounded-lg w-fit h-16 p-1 gap-10"
            id="time-attendance-dashboard-header-tab-toggle-div"
            data-cy="time-attendance-dashboard-header-tab-toggle-div"
          >
            <button
              onClick={() => setActiveTab('admin')}
              className={
                activeTab === 'admin'
                  ? 'flex-1 sm:flex-none sm:px-6 lg:px-8 h-10 sm:h-12 bg-white text-black text-sm rounded-md transition-all duration-300 shadow-md font-medium'
                  : 'flex-1 sm:flex-none sm:px-4 lg:px-6 h-full bg-transparent text-black text-sm transition-all duration-300 font-medium'
              }
              id="time-attendance-dashboard-header-admin-button"
              data-cy="time-attendance-dashboard-header-admin-button"
            >
              Admin Page
            </button>
            <button
              onClick={() => setActiveTab('personal')}
              className={
                activeTab === 'personal'
                  ? 'flex-1 sm:flex-none sm:px-6 lg:px-8 h-10 sm:h-12 bg-white text-black text-sm rounded-md transition-all duration-300 shadow-md font-medium'
                  : 'flex-1 sm:flex-none sm:px-4 lg:px-6 h-full bg-transparent text-black text-sm transition-all duration-300 font-medium'
              }
              id="time-attendance-dashboard-header-personal-button"
              data-cy="time-attendance-dashboard-header-personal-button"
            >
              Personal
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;
