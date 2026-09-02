'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useBscUiStore } from '@/store/uistate/features/bsc';

/** Legacy settings route — BSC scorecards live under My Scorecard. */
export default function BscSetupRedirectPage() {
  const router = useRouter();
  const setScorecardTab = useBscUiStore((s) => s.setScorecardTab);

  useEffect(() => {
    setScorecardTab('bsc');
    router.replace('/bsc/my-scorecard');
  }, [router, setScorecardTab]);

  return (
    <div
      className="py-16 text-center text-gray-400"
      data-cy="bsc-setup-redirect"
    >
      Redirecting…
    </div>
  );
}
