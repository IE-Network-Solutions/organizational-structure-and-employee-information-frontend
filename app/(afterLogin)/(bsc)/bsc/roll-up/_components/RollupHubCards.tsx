'use client';

import React from 'react';
import RollupProgressCard from '@/app/(afterLogin)/(bsc)/bsc/_components/RollupProgressCard';
import type { RollupSummary } from '@/utils/bsc/rollup';
import type { ResultsScope } from '@/utils/bsc/scorecardTab';

type Props = {
  companyRollup: RollupSummary;
  deptRollups: RollupSummary[];
  resultsScope: ResultsScope;
  companyLabel: string;
  onCompanyClick: () => void;
  onDepartmentClick: (departmentName: string) => void;
};

export default function RollupHubCards({
  companyRollup,
  deptRollups,
  resultsScope,
  companyLabel,
  onCompanyClick,
  onDepartmentClick,
}: Props) {
  return (
    <div
      className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4"
      data-cy="bsc-rollup-hub-cards"
    >
      <RollupProgressCard
        rollup={companyRollup}
        label={companyLabel}
        onClick={onCompanyClick}
        dataCy="bsc-rollup-hub-company"
      />
      {resultsScope === 'all'
        ? deptRollups.map((rollup) => (
            <RollupProgressCard
              key={rollup.departmentName || rollup.label}
              rollup={rollup}
              onClick={() => {
                if (rollup.departmentName) {
                  onDepartmentClick(rollup.departmentName);
                }
              }}
              dataCy={`bsc-rollup-hub-dept-${rollup.departmentName}`}
            />
          ))
        : null}
    </div>
  );
}
