'use client';
import React from 'react';
import ActionPlans from '../action-plan';
import ApprovalStatus from '../approval-status';
import SuperStart from '../superStart';
import RookStarsList from '../rookStarsList';
import JobSummary from '../job-summary';
import {
  useGetRockStar,
  useGetWeeklyLeader,
} from '@/store/server/features/dashboard/recognitions/queries';

const RightBar = () => {


  return (
    <div
      className="col-span-1 lg:col-span-6 flex flex-col gap-6"
      data-cy="dashboard-right-bar"
    >

      <ApprovalStatus />
      {/* <ActionPlans />
      <SuperStart />
      <RookStarsList title="Leaders" data={weeklyLeaderData ?? []} />
      <RookStarsList title="Employee" data={rockStarData ?? []} />
      <JobSummary /> */}
    </div>
  );
};

export default RightBar;
