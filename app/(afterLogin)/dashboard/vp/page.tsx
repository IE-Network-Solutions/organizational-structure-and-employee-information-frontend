'use client';

import Header from './_components/header';
import TotalScoreCard from './_components/total-score-card';
import CriteriaBreakdown from './_components/criteria-breakdown';
import VPScoreBreakdownChart from './_components/vp-score-breakdown-chart';

const VPUpdatePage = () => {
  return (
    <div className="min-h-screen  p-4">
      <div className="space-y-4">
        <Header />
        <TotalScoreCard />

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <CriteriaBreakdown />
          <VPScoreBreakdownChart />
        </div>
      </div>
    </div>
  );
};

export default VPUpdatePage;
