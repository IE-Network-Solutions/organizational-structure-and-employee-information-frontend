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

  const { data: tenantInfo, refetch } = useGetTenantByDomain({
    domain: domainName || '',
  });

  useEffect(() => {
    if (domainName) {
      refetch(); // Only refetch if PWA is true
    }
  }, [domainName, refetch]);

  return {
    tenant: {
      ...tenantInfo,
    },
  };
};
