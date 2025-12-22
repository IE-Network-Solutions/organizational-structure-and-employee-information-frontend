'use client';
import React from 'react';
import VPChart from '../_components/vpDashboard/chart';
import CriteriaCard from '../_components/vpDashboard/criteriaCard';
import VPGraph from '../_components/vpDashboard/graphs';

interface Params {
  employeeId: string;
}
interface VPDashboardProps {
  params: Params;
}

function VpDashBoardWithID({ params: { employeeId } }: VPDashboardProps) {
  return (
    <div
      className="h-auto w-full p-8 bg-white rounded-md "
      id="okr-vpdashboard-container-display-div"
      data-cy="okr-vpdashboard-container-display-div"
    >
      <VPChart data-cy="okr-vpdashboard-chart" id={employeeId} />
      <CriteriaCard data-cy="okr-vpdashboard-criteria-card" id={employeeId} />
      <VPGraph data-cy="okr-vpdashboard-graphs" id={employeeId} />
    </div>
  );
}

export default VpDashBoardWithID;
