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
        <HireToApplicantChart data-cy="talent-acquisition-dashboard-hire-applicant-chart" />
        <StagesChart data-cy="talent-acquisition-dashboard-stages-chart" />
      </div>
      <RecruitmentPipeline data-cy="talent-acquisition-dashboard-recruitment-pipeline" />
      <JobPostPerformance data-cy="talent-acquisition-dashboard-job-post-performance" />
    </div>
  );
}
