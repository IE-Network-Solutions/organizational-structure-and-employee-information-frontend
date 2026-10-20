'use client';

import { useSearchParams } from 'next/navigation';
import { parseVpTrack } from '@/store/server/features/okrplanning/okr/dashboard/VP/useVpTrackScore';
import Header from './_components/header';
import TotalScoreCard from './_components/total-score-card';
import CriteriaBreakdown from './_components/criteria-breakdown';
import VPScoreBreakdownChart from './_components/vp-score-breakdown-chart';

const VPUpdatePage = () => {
  // ?track=MONTH (default) or ?track=SESSION: each dashboard card opens its own breakdown.
  const track = parseVpTrack(useSearchParams().get('track'));
  const isMonthly = track === 'MONTH';

  return (
    <div className="min-h-screen" data-cy="vp-update-page">
      <div className="space-y-4" data-cy="vp-update-page-content">
        <Header track={track} />
        <TotalScoreCard track={track} />

        <div
          className={`grid grid-cols-1 gap-4 ${isMonthly ? 'xl:grid-cols-2' : ''}`}
          data-cy="vp-update-page-grid"
        >
          <CriteriaBreakdown track={track} />
          {/* The month-by-month chart only applies to the monthly track. */}
          {isMonthly && <VPScoreBreakdownChart />}
        </div>
      </div>
    </div>
  );
};

export default VPUpdatePage;
