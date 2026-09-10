'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/** Legacy route — announcement channel settings live under Announcement. */
export default function AnnouncementChannelsSettingsRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/organization/announcement?settings=1');
  }, [router]);

  return null;
}
