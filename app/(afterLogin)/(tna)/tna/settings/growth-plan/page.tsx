'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/** Legacy route — Skill Settings replaced Growth Plan settings. */
export default function GrowthPlanSettingsRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/tna/settings/skill-settings');
  }, [router]);
  return null;
}
