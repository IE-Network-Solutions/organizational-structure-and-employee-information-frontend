'use client';
import React from 'react';
import ApprovalStatus from '../approval-status';

const RightBar = ({ type }: { type: string }) => {
  return (
    <div
      className="col-span-1 lg:col-span-6 flex flex-col gap-6"
      data-cy="dashboard-right-bar"
    >
      <ApprovalStatus type={type} />
    </div>
  );
};

export default RightBar;
