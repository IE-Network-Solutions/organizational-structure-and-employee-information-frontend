'use client';

import React from 'react';
import DashboardHeader from './_components/adminPanel/DashboardHeader';
import DashboardComponent from './_components/adminPanel';

export default function Dashboard() {
  return (
    <div id="talent-acquisition-dashboard-page-div-container" data-cy="talent-acquisition-dashboard-page-div-container" className="min-h-screen space-y-4 bg-[#f4f4f4]">
      <DashboardHeader data-cy="talent-acquisition-dashboard-page-header" />

      <DashboardComponent data-cy="talent-acquisition-dashboard-page-component" />
    </div>
  );
}
