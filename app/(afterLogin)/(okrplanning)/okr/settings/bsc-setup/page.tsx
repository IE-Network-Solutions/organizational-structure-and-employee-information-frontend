'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { bscKpiAdminHref } from '@/utils/bsc/scorecardTab';

/** Legacy settings route — scorecards live under BSC → KPI. */
export default function BscSetupRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace(bscKpiAdminHref('bsc'));
  }, [router]);

  return (
    <div
      className="py-16 text-center text-gray-400"
      data-cy="bsc-setup-redirect"
    >
      Redirecting…
    </div>
  );
}
