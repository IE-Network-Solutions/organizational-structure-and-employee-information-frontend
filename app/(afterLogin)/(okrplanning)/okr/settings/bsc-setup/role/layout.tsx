import React from 'react';
import { redirect } from 'next/navigation';
import { USE_BSC_API } from '@/store/server/features/bsc/config';
import { bscKpiAdminHref } from '@/utils/bsc/scorecardTab';

/**
 * Per-role KPI sets are a prototype-only (mock) feature with no backend — in
 * BSC v1, KPIs are attached to a scorecard (Role scope) in the scorecard
 * wizard. With the real API on, send users there so nothing is "saved" that
 * never persists.
 */
export default function BscSetupRoleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (USE_BSC_API) {
    redirect(bscKpiAdminHref('bsc'));
  }
  return children;
}
