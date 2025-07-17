'use client';

import React from 'react';
import DashboardHeader from './_components/adminPanel/DashboardHeader';
import AdminPanel from './_components/adminPanel';
import { TimeAndAttendaceDashboardStore } from '@/store/uistate/features/timesheet/dashboard';
import PersonalDashboard from './_components/personal';

export default function Dashboard() {
  const { activeTab } = TimeAndAttendaceDashboardStore();

  return (
    <div className="min-h-screen space-y-4 bg-[#f5f5f5]">
      <DashboardHeader />
      {activeTab === 'admin' ? (
        <div className={`transition-all duration-500 ease-in-out`}>
          <AdminPanel />
        </div>
      ) : (
        <div
          className={`transition-all duration-500 ease-in-out 
                    `}
        >
          <PersonalDashboard />
        </div>
      )}
    </div>
  );
}
