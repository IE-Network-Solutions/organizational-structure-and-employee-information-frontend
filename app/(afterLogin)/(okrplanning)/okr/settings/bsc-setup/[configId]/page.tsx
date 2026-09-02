'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

/** Legacy settings detail route — scorecard detail now lives under /bsc/setup. */
export default function LegacyBscScorecardDetailRedirect() {
  const params = useParams();
  const router = useRouter();
  const configId = String(params?.configId || '');

  useEffect(() => {
    if (!configId) {
      router.replace('/bsc/my-scorecard');
      return;
    }
    router.replace(`/bsc/setup/${configId}`);
  }, [configId, router]);

  return (
    <div className="py-16 text-center text-gray-400">Redirecting…</div>
  );
}
