'use client';

import React from 'react';
import { bscAccess } from '@/utils/bsc/permissions';
import EmployeeKpiTable from './EmployeeKpiTable';

type Props = {
  canViewTeamKpi?: boolean;
  canViewAllEmployeeKpi?: boolean;
};

/**
 * Results page: employee KPI table.
 * Always includes own ("My KPI") scope; Team / All use the BSC permission
 * group (view-team-bsc / view-company-bsc).
 */
export default function ResultsKpiView({
  canViewTeamKpi: canViewTeamProp,
  canViewAllEmployeeKpi: canViewAllProp,
}: Props) {
  const canViewTeamKpi = canViewTeamProp ?? bscAccess.viewTeam();
  const canViewAllEmployeeKpi = canViewAllProp ?? bscAccess.viewCompany();

  return (
    <EmployeeKpiTable
      canViewTeamKpi={canViewTeamKpi}
      canViewAllEmployeeKpi={canViewAllEmployeeKpi}
    />
  );
}
