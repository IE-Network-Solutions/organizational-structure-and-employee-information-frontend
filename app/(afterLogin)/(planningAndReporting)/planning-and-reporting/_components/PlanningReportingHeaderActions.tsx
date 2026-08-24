'use client';

import CustomButton from '@/components/common/buttons/customButton';
import { Tooltip } from 'antd';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { useFetchObjectives } from '@/store/server/features/employees/planning/queries';
import { AllPlanningPeriods } from '@/store/server/features/okrPlanningAndReporting/queries';
import { PlanningAndReportingStore } from '@/store/uistate/features/planningAndReporting/useStore';
import { useIsMobile } from '@/hooks/useIsMobile';

export function PlanningReportingHeaderActions() {
  const {
    setInlineEditPlanId,
    setActiveTab,
    setInlinePlanningMode,
    setMobilePlanComposerOpen,
    inlinePlanningMode,
    activeTab,
  } = PlanningAndReportingStore();
  const { isMobile, isTablet } = useIsMobile();
  const { userId } = useAuthenticationStore();
  const { data: objective } = useFetchObjectives(userId);
  const { data: userPlanningPeriods } = AllPlanningPeriods();

  const hasAssignedPeriod =
    Array.isArray(userPlanningPeriods) && userPlanningPeriods.length > 0;
  const hasObjectives = (objective?.items?.length ?? 0) > 0;

  if (activeTab !== 1) return null;

  const tooltipTitle = inlinePlanningMode
    ? 'Exit new plan creation'
    : !hasObjectives
      ? 'Create Objective before you Plan'
      : '';

  const createPlanDisabled = !inlinePlanningMode && !hasObjectives;

  return (
    <Tooltip title={tooltipTitle}>
      <div
        className="inline-block"
        data-cy="planning-reporting-header-actions-tooltip-inner"
      >
        {hasAssignedPeriod && (
          <CustomButton
            disabled={createPlanDisabled}
            title="Add plan"
            id="planning-header-create-plan"
            textClassName="text-sm font-semibold"
            style={{ paddingInline: 20 }}
            onClick={() => {
              if (!inlinePlanningMode) {
                setInlineEditPlanId(null);
                setActiveTab(1);
                setInlinePlanningMode(true);
                if (isMobile || isTablet) {
                  setMobilePlanComposerOpen(true);
                }
              }
            }}
            className="!h-10 !min-h-10 !w-auto !min-w-0 !bg-[#1E40AF] !text-white hover:!bg-[#1E3A8A]"
          />
        )}
      </div>
    </Tooltip>
  );
}
