import { useEffect, useMemo, useState } from 'react';
import { useGetMySchedule } from '@/store/server/features/timesheet/shiftSwap/queries';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import {
  isWithinBreakLeaveBand,
  isWithinBreakPeriod,
  isWithinBreakReturnBand,
} from '@/helpers/formatTo';
import { BreakType } from '@/types/timesheet/breakType';
import dayjs from 'dayjs';

const useEffectiveBreakTypes = (): BreakType[] => {
  const userId = useAuthenticationStore((s) => s.userId);
  const today = dayjs().format('YYYY-MM-DD');
  const { data: scheduleData } = useGetMySchedule(
    userId,
    today,
    today,
    !!userId,
  );

  return useMemo((): BreakType[] => {
    const days = Array.isArray(scheduleData)
      ? scheduleData
      : (scheduleData?.days ?? []);
    const todayDay = days.find((d) => d.date === today);
    const resolved = todayDay?.breaks ?? [];
    return resolved.map(
      (br) =>
        ({
          id: br.breakTypeId ?? br.id,
          title: br.title ?? '',
          description: null,
          startAt: br.startAt ?? '',
          endAt: br.endAt ?? '',
          startAtFrom: br.startAtFrom,
          startAtTo: br.startAtTo,
          endAtFrom: br.endAtFrom,
          endAtTo: br.endAtTo,
          captureStartAt: br.captureStartAt,
          captureEndAt: br.captureEndAt,
        }) as BreakType,
    );
  }, [scheduleData, today]);
};

/**
 * Returns whether the current time is within any break window attached to
 * the current user's effective shift today. Empty shift breaks → not in break.
 */
export const useIsWithinBreakPeriod = (): boolean => {
  const effectiveBreakTypes = useEffectiveBreakTypes();
  const [withinBreakPeriod, setWithinBreakPeriod] = useState<boolean>(false);

  useEffect(() => {
    const evaluate = () =>
      setWithinBreakPeriod(isWithinBreakPeriod(effectiveBreakTypes));

    evaluate();
    const timer = setInterval(evaluate, 1000);
    return () => clearInterval(timer);
  }, [effectiveBreakTypes]);

  return withinBreakPeriod;
};

/** Remote Break Check Out visibility (Allowed leave band / scheduled fallback). */
export const useIsWithinBreakLeaveBand = (): boolean => {
  const effectiveBreakTypes = useEffectiveBreakTypes();
  const [within, setWithin] = useState(false);

  useEffect(() => {
    const evaluate = () =>
      setWithin(isWithinBreakLeaveBand(effectiveBreakTypes));
    evaluate();
    const timer = setInterval(evaluate, 1000);
    return () => clearInterval(timer);
  }, [effectiveBreakTypes]);

  return within;
};

/** Remote Break Check In visibility (Allowed return band / scheduled fallback). */
export const useIsWithinBreakReturnBand = (): boolean => {
  const effectiveBreakTypes = useEffectiveBreakTypes();
  const [within, setWithin] = useState(false);

  useEffect(() => {
    const evaluate = () =>
      setWithin(isWithinBreakReturnBand(effectiveBreakTypes));
    evaluate();
    const timer = setInterval(evaluate, 1000);
    return () => clearInterval(timer);
  }, [effectiveBreakTypes]);

  return within;
};
