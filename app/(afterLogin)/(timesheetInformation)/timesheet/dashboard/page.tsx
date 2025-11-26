'use client';

import React from 'react';
import DashboardHeader from './_components/adminPanel/DashboardHeader';
import AdminPanel from './_components/adminPanel';
import { TimeAndAttendaceDashboardStore } from '@/store/uistate/features/timesheet/dashboard';
import PersonalDashboard from './_components/personal';

export default function Dashboard() {
  const { activeTab } = TimeAndAttendaceDashboardStore();

  return (
    <div
      className="min-h-screen space-y-4 bg-[#f5f5f5]"
      id="time-attendance-dashboard-container-main-div"
      data-cy="time-attendance-dashboard-container-main-div"
    >
      <DashboardHeader
        data-cy="time-attendance-dashboard-header-view-component"
      />

      {activeTab === 'admin' ? (
        <div
          className="transition-all duration-500 ease-in-out"
          id="time-attendance-dashboard-adminpanel-view-div"
          data-cy="time-attendance-dashboard-adminpanel-view-div"
        >
          <AdminPanel
            data-cy="time-attendance-dashboard-adminpanel-view-component"
          />
        </div>
      ) : (
        <div
        className={`transition-all duration-500 ease-in-out mb-4 
          `}
          id="time-attendance-dashboard-personalpanel-view-div"
          data-cy="time-attendance-dashboard-personalpanel-view-div"
        >
          <PersonalDashboard
            data-cy="time-attendance-dashboard-personalpanel-view-component"/>
        </div>
      )}
    </div>
  );
}
