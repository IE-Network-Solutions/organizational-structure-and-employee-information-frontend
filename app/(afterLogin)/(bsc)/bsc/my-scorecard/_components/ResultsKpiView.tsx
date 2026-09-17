'use client';

import React from 'react';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import EmployeeKpiTable from './EmployeeKpiTable';

type Props = {
  canViewTeamKpi?: boolean;
  canViewAllEmployeeKpi?: boolean;
};

/**
 * Single Results page: employee KPI table with Team / All scope in Filter.
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
    <EmployeeKpiTable
      canViewTeamKpi={canViewTeamKpi}
      canViewAllEmployeeKpi={canViewAllEmployeeKpi}
    />
  );
}
