'use client';

import { useGetTenantByDomain } from '@/store/server/features/employees/authentication/queries';
import { useEffect } from 'react';

export const useTenantChecker = () => {
  const hostname = window.location.hostname;
  const domainName = hostname?.split('.')[0] || hostname;
  const { data: tenantInfo, refetch } = useGetTenantByDomain(domainName);

  useEffect(() => {
    if (domainName) refetch();
  }, [domainName]);

  return {
    tenant: tenantInfo,
  };
};
