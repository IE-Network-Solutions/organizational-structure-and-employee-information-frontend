'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const ZKTAddonRedirectPage = () => {
  const router = useRouter();

  useEffect(() => {
    router.replace('/timesheet/settings/attendance-devices');
  }, [router]);

  return (
    <p
      className="mb-0 text-sm text-gray-500 text-center"
      data-cy="timesheet-settings-zkt-addon-redirect"
    >
      Redirecting to Attendance Devices…
    </p>
  );
};

export default ZKTAddonRedirectPage;
