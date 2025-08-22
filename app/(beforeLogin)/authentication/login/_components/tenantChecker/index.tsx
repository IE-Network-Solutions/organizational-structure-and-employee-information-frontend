'use client';

import { useGetTenantByDomain } from '@/store/server/features/employees/authentication/queries';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { useEffect } from 'react';

export const useTenantChecker = () => {
  const { hostname, setHostName } = useAuthenticationStore();

  useEffect(() => {
    setHostName(window.location.hostname);
  }, [setHostName]);

  const domainName = hostname?.split('.')[0];
  const isPwa = domainName === 'pwa';

  // Only run the query if isPwa is true
  const { data: tenantInfo, refetch } = useGetTenantByDomain({
    domain: domainName || '',
    isPwa: isPwa,
  });
  useEffect(() => {
    if (isPwa && domainName) {
      refetch(); // Only refetch if PWA is true
    }
  }, [domainName, isPwa, refetch]);

  return {
    tenant: {
      ...tenantInfo,
      isPwa,
    },
  };
};
