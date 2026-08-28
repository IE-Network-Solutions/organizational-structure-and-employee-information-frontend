'use client';

import { useMemo } from 'react';
import { useGetPersonalRecognition } from '@/store/server/features/CFR/recognition/queries';
import { getTrendMeta, type RecognitionStat } from './shared';

/**
 * Splits the personal recognition response into the Engagement / KPI slides the
 * Appreciation and Reprimand cards rotate through.
 */
export function useRecognitionStats() {
  const { data: personalRecognition, isLoading } = useGetPersonalRecognition();

  const monthOverMonthDifference = (personalRecognition as any)
    ?.monthOverMonthDifference;

  const appreciationStats = useMemo<RecognitionStat[]>(
    () => [
      {
        id: 'engagement',
        label: 'Engagement',
        value:
          personalRecognition?.feedbackReceived?.Engagement?.appreciations || 0,
        ...getTrendMeta(
          monthOverMonthDifference?.feedbackReceived?.Engagement
            ?.appreciations || 0,
        ),
      },
      {
        id: 'kpi',
        label: 'KPI',
        value: personalRecognition?.feedbackReceived?.KPI?.appreciations || 0,
        ...getTrendMeta(
          monthOverMonthDifference?.feedbackReceived?.KPI?.appreciations || 0,
        ),
      },
    ],
    [personalRecognition, monthOverMonthDifference],
  );

  const reprimandStats = useMemo<RecognitionStat[]>(
    () => [
      {
        id: 'engagement',
        label: 'Engagement',
        value:
          personalRecognition?.feedbackReceived?.Engagement?.reprimands || 0,
        ...getTrendMeta(
          monthOverMonthDifference?.feedbackReceived?.Engagement?.reprimands ||
            0,
        ),
      },
      {
        id: 'kpi',
        label: 'KPI',
        value: personalRecognition?.feedbackReceived?.KPI?.reprimands || 0,
        ...getTrendMeta(
          monthOverMonthDifference?.feedbackReceived?.KPI?.reprimands || 0,
        ),
      },
    ],
    [personalRecognition, monthOverMonthDifference],
  );

  return { appreciationStats, reprimandStats, isLoading };
}
