'use client';

import React from 'react';
import DashboardHeader from './_components/adminPanel/DashboardHeader';
import DashboardComponent from './_components/adminPanel';

export default function Dashboard() {
  return (
    <div className="min-h-screen space-y-4 bg-[#f4f4f4]">
      <DashboardHeader />

      <DashboardComponent />
    </div>
  );
}
