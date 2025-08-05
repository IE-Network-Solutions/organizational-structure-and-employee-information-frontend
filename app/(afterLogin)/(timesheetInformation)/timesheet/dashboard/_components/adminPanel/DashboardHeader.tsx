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
    <div className="mb-4 sm:mb-6 px-3 sm:px-0">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div className="flex  flex-row justify-between items-center gap-4">
          <CustomBreadcrumb
            className="text-sm"
            title="Time and attendance"
            subtitle={
              hasEmployeeAttendance
                ? 'Manage employee Timesheet'
                : 'Manage Your TimeSheet'
            }
          />
          {activeTab === 'personal' && (
            <div className="md:hidden block">
              <CheckControl />
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-center sm:justify-end justify-center gap-3">
          {activeTab === 'personal' && (
            <div className="w-full sm:w-auto md:block hidden">
              <CheckControl />
            </div>
          )}

          <div className="flex items-center bg-[#f8f8f8] border border-gray-300 rounded-lg w-full sm:w-fit h-14 sm:h-16 p-1 gap-1 sm:gap-2">
            <button
              onClick={() => setActiveTab('admin')}
              className={
                activeTab === 'admin'
                  ? 'flex-1 sm:flex-none sm:px-6 lg:px-8 h-10 sm:h-12 bg-white text-black text-sm rounded-md transition-all duration-300 shadow-md font-medium'
                  : 'flex-1 sm:flex-none sm:px-4 lg:px-6 h-full bg-transparent text-black text-sm transition-all duration-300 font-medium'
              }
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
