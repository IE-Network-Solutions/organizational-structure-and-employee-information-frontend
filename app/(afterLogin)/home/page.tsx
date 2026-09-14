'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { HOME_BASE } from '@/config/homeTabs';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    router.replace(`${HOME_BASE}/overview`);
  }, [router]);

  return null;
}
