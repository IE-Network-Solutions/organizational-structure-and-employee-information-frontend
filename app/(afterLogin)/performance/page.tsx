'use client';

import React from 'react';
import OkrProgressCard from './_components/OkrProgressCard';
import FeedbackCard from './_components/FeedbackCard';
import TopOkrPerformersCard from './_components/TopOkrPerformersCard';
import FeedbackPerformersCard from './_components/FeedbackPerformersCard';
import ActionPlanCard from './_components/ActionPlanCard';

export default function PerformanceDashboardPage() {
  return (
    <div
      className="h-auto w-full p-4"
      data-cy="performance-dashboard-page"
    >
      <div className="">
        <h1 className="mb-6 text-2xl font-bold text-gray-900">
          Performance Dashboard
        </h1>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-6">
          <div className="flex flex-col gap-4 lg:col-span-2 lg:gap-6">
            <OkrProgressCard />
            <FeedbackCard />
          </div>
          <div className="flex flex-col gap-4 lg:gap-6">
            <TopOkrPerformersCard />
            <FeedbackPerformersCard />
            <ActionPlanCard />
          </div>
        </div>
      </div>
    </div>
  );
}
