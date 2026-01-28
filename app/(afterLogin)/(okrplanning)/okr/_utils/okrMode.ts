import { useMemo } from 'react';
// import { useGetTenant } from '@/store/server/features/employees/authentication/queries';

/**
 * Hook to check if tenant is using Basic OKR mode
 * For now, this is hardcoded. Later it can be replaced with actual tenant data check
 * @returns {boolean} true if Basic OKR mode, false if Advanced OKR mode
 */
export const useIsBasicOkr = (): boolean => {
  // TODO: Replace with actual tenant data check when available
  // const { data: tenant } = useGetTenant();
  // return useMemo(() => {
  //   return tenant?.okrType === 'Basic' || tenant?.okrMode === 'Basic';
  // }, [tenant]);
  
  // Hardcoded for now
  return useMemo(() => false, []);
};
