'use client';
import React from 'react';
import ActionPlans from '../action-plan';
import ApprovalStatus from '../approval-status';
import SuperStart from '../superStart';
import { useGetAllPlanningPeriods } from '@/store/server/features/employees/planning/planningPeriod/queries';
import RookStarsList from '@/app/(afterLogin)/(okr)/_components/rookStarsList';
import JobSummary from '../job-summary';

const RightBar = () => {
  const { data: allPlanningPeriods } = useGetAllPlanningPeriods();

  const planningPeriod = allPlanningPeriods?.items?.find(
    (planningPeriod) => planningPeriod.name == 'Weekly',
  );
  return (
    <div className="col-span-1 lg:col-span-6 flex flex-col gap-4">
      <ActionPlans />
      <ApprovalStatus />
      <SuperStart />
      <RookStarsList
        planningPeriodId={planningPeriod ? planningPeriod.id : ''}
        title="Leaders"
      />
      <RookStarsList
        planningPeriodId={planningPeriod ? planningPeriod.id : ''}
        title="Employee"
      />
      <JobSummary />
    </div>
  );
};

export default RightBar;
