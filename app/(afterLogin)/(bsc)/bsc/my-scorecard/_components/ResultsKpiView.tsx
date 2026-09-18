'use client';

import React from 'react';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import ResultsEmployeeTable from './ResultsEmployeeTable';

type Props = {
  canViewTeamKpi?: boolean;
  canViewAllEmployeeKpi?: boolean;
};

/**
 * Unified Results page: rollups, PEP audit summary, and employee directory.
 */
export default function ResultsKpiView({
  canViewTeamKpi: canViewTeamProp,
  canViewAllEmployeeKpi: canViewAllProp,
}: Props) {
  const canViewTeamKpi =
    canViewTeamProp ??
    AccessGuard.checkAccess({ permissions: [Permissions.ViewTeamOkr] });
  const canViewAllEmployeeKpi =
    canViewAllProp ??
    AccessGuard.checkAccess({ permissions: [Permissions.ViewCompanyOkr] });

  return (
    <div data-cy="bsc-results-view" className="-mt-3">
      <ResultsEmployeeTable
        canViewTeamKpi={canViewTeamKpi}
        canViewAllEmployeeKpi={canViewAllEmployeeKpi}
      />
    </div>
  );
}
