import React from 'react';
import VPChart from './chart';
import CriteriaCard from './criteriaCard';
import VPGraph from './graphs';

const VPdashboard: React.FC = () => {
  return (
    <div className="h-auto w-full p-8 bg-white rounded-md ">
      <VPChart />
      <CriteriaCard />
      <VPGraph />
    </div>
  );
};

export default VPdashboard;
