'use client';
import React from 'react';
import Plan from '../plan';
import ApprovalStatus from '../approval-status';

const LeftBar = ({ type }: { type: string }) => {
  return (
    <div data-cy="dashboard-left-bar-wrapper" className="h-full">
      <div className="flex h-full flex-col gap-4" data-cy="dashboard-left-bar">
        <Plan />
        <ApprovalStatus type={type} />
      </div>
    </div>
  );
};

export default LeftBar;
