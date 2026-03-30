'use client';

import React, { useState } from 'react';
import MeetingActionPlan from './MeetingActionPlan';
import SurveyActionPlanCard from './SureyActionPlanCard';
import { usePerformanceUIState } from '@/store/uistate/features/performance';

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
    const { selectedTab, setSelectedTab } = usePerformanceUIState();
    return (
    <div className="flex flex-col gap-4">
    
      {selectedTab === 'meeting' ? <MeetingActionPlan sessionId={sessionId} monthOptions={monthOptions} /> : <SurveyActionPlanCard sessionId={sessionId} monthId={monthId} monthOptions={monthOptions} onMonthChange={onMonthChange} />}
    </div>
  );
}

export { MeetingActionPlan, SurveyActionPlanCard };
