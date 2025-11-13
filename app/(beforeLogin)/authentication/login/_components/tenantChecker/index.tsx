'use client';

import { useGetTenantByDomain } from '@/store/server/features/employees/authentication/queries';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { useEffect } from 'react';

export const useTenantChecker = () => {
  const { hostname, setHostName } = useAuthenticationStore();

  useEffect(() => {
    setHostName(window.location.hostname);
  }, [setHostName]);

  // Derive tenant domain name only for real subdomains; skip localhost/IPs
  const deriveDomainName = (h: string | undefined) => {
    if (!h) return '';
    // Skip localhost and IPv4 addresses in local dev
    if (h === 'localhost' || /^\d+\.\d+\.\d+\.\d+$/.test(h)) return '';
    const parts = h.split('.');
    // Expect subdomain.domain.tld (length >= 3)
    if (parts.length < 3) return '';
    return parts[0];
  };

  const domainName = deriveDomainName(hostname ?? undefined);

  const { data: tenantInfo, refetch } = useGetTenantByDomain({
    domain: domainName || '',
  });

  useEffect(() => {
    if (domainName) {
      refetch();
    }
  }, [domainName, refetch]);

  return {
    tenant: {
      ...tenantInfo,
    },
  };
};
