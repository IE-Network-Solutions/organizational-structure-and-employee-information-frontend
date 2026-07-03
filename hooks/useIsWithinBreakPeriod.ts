import { useEffect, useState } from 'react';
import { useGetBreakTypes } from '@/store/server/features/timesheet/breakType/queries';
import { isWithinBreakPeriod } from '@/helpers/formatTo';

/**
 * Returns whether the current time is within any configured break window
 * (lunch, tea break, or any other break type the tenant has set up).
 *
 * Re-evaluates on a short interval so the Check-Out button is hidden once a
 * break starts and becomes visible again automatically when it ends, without
 * requiring a manual refresh.
 */
export const useIsWithinBreakPeriod = (): boolean => {
  const { data: breakTypeData } = useGetBreakTypes();
  const [withinBreakPeriod, setWithinBreakPeriod] = useState<boolean>(false);

  useEffect(() => {
    const breakTypes = breakTypeData?.items ?? [];

    const evaluate = () => setWithinBreakPeriod(isWithinBreakPeriod(breakTypes));

    evaluate();
    const timer = setInterval(evaluate, 1000);
    return () => clearInterval(timer);
  }, [breakTypeData]);

  return withinBreakPeriod;
};
