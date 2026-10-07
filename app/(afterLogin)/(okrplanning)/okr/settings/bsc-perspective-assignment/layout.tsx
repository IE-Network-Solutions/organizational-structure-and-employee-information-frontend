import React from 'react';
import { redirect } from 'next/navigation';
import { USE_BSC_API } from '@/store/server/features/bsc/config';
import { bscKpiAdminHref } from '@/utils/bsc/scorecardTab';

/**
 * Per-role perspective weights are a prototype-only (mock) feature with no
 * backend — BSC v1 weights KPIs on the scorecard itself (must total 100%).
 * With the real API on, send users to scorecard setup instead of a page whose
 * saves would never persist.
 */
export default function BscPerspectiveAssignmentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (USE_BSC_API) {
    redirect(bscKpiAdminHref('bsc'));
  }
  return children;
}
