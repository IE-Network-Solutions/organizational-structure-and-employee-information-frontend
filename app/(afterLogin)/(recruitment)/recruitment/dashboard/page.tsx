'use client';

import React from 'react';
import DashboardHeader from './_components/adminPanel/DashboardHeader';
import DashboardComponent from './_components/adminPanel';

export default function Dashboard() {
  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen space-y-4">
      <DashboardHeader />

      <DashboardComponent />
    </div>
  );
}
