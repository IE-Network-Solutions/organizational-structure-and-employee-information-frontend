'use client';

import React, { useCallback } from 'react';
import AISuggestionsModal from '@/components/ai/AISuggestionsModal';

export type PlanningKrAiKeyResult = {
  id: string;
  title: string;
  metricType: { name: string };
  milestones?: Array<{ id: string | number; title: string; status?: string }>;
  progress?: string | number;
};

interface PlanningKrAISuggestionsProps {
  keyResult: PlanningKrAiKeyResult;
  form: any;
  handleAddBoard: (id: string, metadata?: Record<string, unknown>) => void;
  handleAddName: (values: Record<string, any>, key: string) => void;
  planTypeName: string;
  hasParentPlan: boolean;
  getWeeklyPlanTasks?: () => Array<{
    id: string;
    task: string;
    krId?: string;
    milestoneId?: string | null;
  }>;
  userId: string;
  planningPeriodId: string;
  planningUserId: string;
  /** Daily plan row: parent weekly task id so AI runs without picking task again. */
  inlineWeeklyPlanTaskId?: string;
}

export default function PlanningKrAISuggestions({
  keyResult,
  form,
  handleAddBoard,
  handleAddName,
  planTypeName,
  hasParentPlan,
  getWeeklyPlanTasks,
  userId,
  planningPeriodId,
  planningUserId,
  inlineWeeklyPlanTaskId,
}: PlanningKrAISuggestionsProps) {
  const progressNum = Number(keyResult.progress ?? 0);
  const hideForCompleteKr = !Number.isFinite(progressNum) || progressNum >= 100;

  const getKeyResults = useCallback(
    () => [
      {
        id: String(keyResult.id),
        title: keyResult.title,
        metricType: keyResult.metricType,
        milestones: keyResult.milestones,
        progress: keyResult.progress,
      },
    ],
    [keyResult],
  );

  const onAddBoard = useCallback(
    (key: string) => {
      handleAddBoard(key);
    },
    [handleAddBoard],
  );

  if (hideForCompleteKr) {
    return null;
  }

  return (
    <AISuggestionsModal
      getKeyResults={getKeyResults}
      getWeeklyPlanTasks={getWeeklyPlanTasks}
      form={form}
      handleAddBoard={onAddBoard}
      handleAddName={handleAddName}
      planTypeName={planTypeName}
      hasParentPlan={hasParentPlan}
      resolveListNameForKR={(id) => `names-${id}`}
      resolveBoardKeyForKR={(id) => id}
      userId={userId}
      planningPeriodId={planningPeriodId}
      planningUserId={planningUserId}
      singleKeyResultScope
      triggerVariant="compact"
      triggerDataCySuffix={String(keyResult.id)}
      planningInlineGenerate
      inlineWeeklyPlanTaskId={inlineWeeklyPlanTaskId}
    />
  );
}
