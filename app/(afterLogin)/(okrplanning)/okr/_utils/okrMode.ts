import { useMemo } from 'react';
import { useOKRStore } from '@/store/uistate/features/okrplanning/okr';

/**
 * Hook to check if tenant is using Basic OKR mode
 * @returns {boolean} true if Basic OKR mode, false if Advanced OKR mode or not set
 */
export const useIsBasicOkr = (): boolean => {
  const okrMode = useOKRStore((state) => state.okrMode);

  return useMemo(() => okrMode === 'Basic', [okrMode]);
};
