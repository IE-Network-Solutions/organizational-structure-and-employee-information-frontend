'use client';

import React from 'react';
import StatsCards from './StatsCards';
import HireToApplicantChart from './HireToApplicantChart';
import StagesChart from './StagesChart';
import RecruitmentPipeline from './RecruitmentPipeline';
import JobPostPerformance from './JobPostPerformance';

export default function DashboardComponent() {
  return (
    <div id="talent-acquisition-dashboard-component-div-container" data-cy="talent-acquisition-dashboard-component-div-container" className="space-y-8 pb-5">
      <StatsCards />
      <div id="talent-acquisition-dashboard-component-div-charts" data-cy="talent-acquisition-dashboard-component-div-charts" className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <HireToApplicantChart />
        <StagesChart />
      </div>
      <RecruitmentPipeline />
      <JobPostPerformance />
    </div>
  );
}
