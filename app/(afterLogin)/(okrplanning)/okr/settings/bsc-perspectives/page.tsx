'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { bscKpiAdminHref } from '@/utils/bsc/scorecardTab';

/** Legacy settings route — KPI catalog lives under BSC → KPI. */
export default function BscPerspectivesRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace(bscKpiAdminHref('kpis'));
  }, [router]);

  return (
    <div
      className="py-16 text-center text-gray-400"
      data-cy="bsc-kpis-redirect"
    >
      Redirecting…
    </div>
  );
}
