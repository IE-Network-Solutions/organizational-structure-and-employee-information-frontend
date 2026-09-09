'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/** Legacy route — schedule + swap live on /schedule now. */
export default function ShiftSwapRedirectPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/timesheet/my-timesheet/schedule');
  }, [router]);
  return null;
}
