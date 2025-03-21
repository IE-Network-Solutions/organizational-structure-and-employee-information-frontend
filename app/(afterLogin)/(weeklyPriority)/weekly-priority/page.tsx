'use client';
import CustomBreadcrumb from '@/components/common/breadCramp';
import React from 'react';
import { useWeeklyPriorityStore } from '@/store/uistate/features/weeklyPriority/useStore';
import Department from './_components/department-team/department';

function Page(): JSX.Element {
  const { activeTab, setActiveTab } = useWeeklyPriorityStore();

  return (
    <div>
      <div className="h-full min-h-screen w-auto p-4">
        <div className="flex flex-wrap justify-between items-center">
          <CustomBreadcrumb
            className="text-sm"
            title="Weekly Priority"
            subtitle="OKR setting"
          />
          <div className="flex items-center bg-gray-50 shadow-md rounded-lg w-fit h-12 p-1 gap-3">
            <button
              onClick={() => setActiveTab(1)}
              className={
                activeTab === 1
                  ? ' px-4 h-full bg-white text-black text-sm rounded-md transition-all duration-300 shadow-sm'
                  : ' px-4 h-full bg-transparent text-black text-sm transition-all duration-300'
              }
            >
              Department
            </button>
            <button
              onClick={() => setActiveTab(2)}
              className={
                activeTab === 2
                  ? ' px-4 h-full bg-white text-black text-sm rounded-md transition-all duration-300 shadow-sm'
                  : ' px-4 h-full bg-transparent text-black text-sm transition-all duration-300'
              }
            >
              Team
            </button>
          </div>
        </div>
        <div className="mt-4">
         <Department />
        </div>
      </div>
    </div>
  );
}

export default Page;
