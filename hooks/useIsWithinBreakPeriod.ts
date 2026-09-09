import { useEffect, useMemo, useState } from 'react';
import { useGetMySchedule } from '@/store/server/features/timesheet/shiftSwap/queries';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { isWithinBreakPeriod } from '@/helpers/formatTo';
import { BreakType } from '@/types/timesheet/breakType';
import dayjs from 'dayjs';

/**
 * Returns whether the current time is within any break window attached to
 * the current user's effective shift today. Empty shift breaks → not in break.
 */
export const useIsWithinBreakPeriod = (): boolean => {
  const userId = useAuthenticationStore((s) => s.userId);
  const today = dayjs().format('YYYY-MM-DD');
  const { data: scheduleData } = useGetMySchedule(
    userId,
    today,
    today,
    !!userId,
  );
  const [withinBreakPeriod, setWithinBreakPeriod] = useState<boolean>(false);

  const effectiveBreakTypes = useMemo((): BreakType[] => {
    const days = Array.isArray(scheduleData)
      ? scheduleData
      : (scheduleData?.days ?? []);
    const todayDay = days.find((d) => d.date === today);
    const resolved = todayDay?.breaks ?? [];
    return resolved.map((br) => ({
      id: br.breakTypeId ?? br.id,
      title: br.title ?? '',
      description: null,
      startAt: br.startAt,
      endAt: br.endAt,
      startAtFrom: br.startAtFrom,
      startAtTo: br.startAtTo,
      endAtFrom: br.endAtFrom,
      endAtTo: br.endAtTo,
    }));
  }, [scheduleData, today]);

  useEffect(() => {
    const evaluate = () =>
      setWithinBreakPeriod(isWithinBreakPeriod(effectiveBreakTypes));

    evaluate();
    const timer = setInterval(evaluate, 1000);
    return () => clearInterval(timer);
  }, [effectiveBreakTypes]);

  return withinBreakPeriod;
};
