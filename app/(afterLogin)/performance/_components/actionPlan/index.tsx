'use client';
/* eslint-disable local-rules/data-cy-required */

import React from 'react';
import MeetingActionPlan from './MeetingActionPlan';
import SurveyActionPlanCard from './SureyActionPlanCard';

export type ActionPlanCardProps = {
  sessionId?: string | null;
  monthId?: string | null;
  monthOptions?: Array<{
    id: string;
    name?: string | null;
    active?: boolean;
  }>;
  onMonthChange?: (monthId: string) => void;
};

export default function ActionPlanCard({
  sessionId,
  monthId,
  monthOptions,
  onMonthChange,
}: ActionPlanCardProps) {
  return (
    <div
      className="flex flex-col gap-4"
      data-cy="performance-action-plan-wrapper"
    >
      <SurveyActionPlanCard
        sessionId={sessionId}
        monthId={monthId}
        monthOptions={monthOptions}
        onMonthChange={onMonthChange}
      />
    </div>
  );
}

export { MeetingActionPlan, SurveyActionPlanCard };
