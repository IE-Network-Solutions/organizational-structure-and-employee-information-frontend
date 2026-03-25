'use client';

import { redirect } from 'next/navigation';

export default function OrgChartPage() {
  redirect('/organization/chart/org-structure');
  return null;
}
