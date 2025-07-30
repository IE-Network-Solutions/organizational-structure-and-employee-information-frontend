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
    <div className="mb-6">
      <div className="flex flex-wrap justify-between items-center">
        <CustomBreadcrumb
          className="text-sm"
          title="Time and attendance"
          subtitle={
            hasEmployeeAttendance
              ? 'Manage employee Timesheet'
              : 'Manage Your TimeSheet'
          }
        />
        <div className="flex items-center gap-3">
          {activeTab === 'personal' && <CheckControl />}

          <div className="flex items-center bg-gray-50 shadow-md rounded-lg w-fit h-12 p-1 gap-3">
            <button
              onClick={() => setActiveTab('admin')}
              className={
                activeTab === 'admin'
                  ? ' px-4  h-full bg-white text-black text-sm rounded-md transition-all duration-300 shadow-sm'
                  : ' px-4 h-full bg-transparent text-black text-sm transition-all duration-300'
              }
            >
              Admin Page
            </button>
            <button
              onClick={() => setActiveTab('personal')}
              className={
                activeTab === 'personal'
                  ? ' px-4 h-full bg-white text-black text-sm rounded-md transition-all duration-300 shadow-sm'
                  : ' px-4  h-full bg-transparent text-black text-sm transition-all duration-300'
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
