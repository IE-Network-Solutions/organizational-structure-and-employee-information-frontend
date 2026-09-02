'use client';

import CustomButton from '@/components/common/buttons/customButton';
import { Tooltip } from 'antd';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { useFetchObjectives } from '@/store/server/features/employees/planning/queries';
import {
  AllPlanningPeriods,
  useDefaultPlanningPeriods,
  useGetPlanningPeriodsHierarchy,
  useGetUserPlanning,
} from '@/store/server/features/okrPlanningAndReporting/queries';
import { PlanningAndReportingStore } from '@/store/uistate/features/planningAndReporting/useStore';
import { useIsMobile } from '@/hooks/useIsMobile';

/**
 * Create Plan / Submit {period} primary actions for the page header (aligned with breadcrumb title).
 * Logic mirrors the buttons previously in planning/index and reporting/index.
 */
export function PlanningReportingHeaderActions() {
  const {
    setInlineEditPlanId,
    setActiveTab,
    setInlinePlanningMode,
    setMobilePlanComposerOpen,
    inlinePlanningMode,
    activeTab,
    activePlanPeriod,
    activePlanPeriodId,
  } = PlanningAndReportingStore();
  const { isMobile, isTablet } = useIsMobile();
  const { userId } = useAuthenticationStore();
  const { data: objective } = useFetchObjectives(userId);
  const { data: planningPeriods } = useDefaultPlanningPeriods();
  const { data: userPlanningPeriods } = AllPlanningPeriods();

  const planningPeriodId =
    activePlanPeriodId || userPlanningPeriods?.[activePlanPeriod - 1]?.id;
  const userPlanningPeriodId = userPlanningPeriods?.find(
    (item) => item?.planningPeriodId === planningPeriodId,
  )?.planningPeriodId;

  const getPlanningPeriodDetail = (id: string) => {
    const planningPeriodDetail = planningPeriods?.items?.find(
      (period: { id: string }) => period?.id === id,
    );
    return planningPeriodDetail || {};
  };
  const activeTabName = getPlanningPeriodDetail(planningPeriodId ?? '')?.name;

  const { data: allUserPlanning } = useGetUserPlanning(
    planningPeriodId ?? '',
    activePlanPeriod.toString(),
  );

  const { data: planningPeriodHierarchy, isLoading: hierarchyLoading } =
    useGetPlanningPeriodsHierarchy(userId, planningPeriodId || '');

  const isActive = planningPeriodHierarchy?.parentPlan
    ? (planningPeriodHierarchy?.parentPlan?.plans?.length ?? 0) === 0 ||
      (planningPeriodHierarchy?.parentPlan?.plans?.filter(
        (i: { isReported: boolean }) => !i.isReported,
      ).length ?? 0) === 0
    : false;

  if (activeTab === 1) {
    const tooltipTitle = inlinePlanningMode
      ? 'Exit new plan creation'
      : allUserPlanning?.length != 0
        ? `Report planned tasks before you create ${activeTabName} plan`
        : objective?.items?.length === 0
          ? 'Create Objective before you Plan'
          : planningPeriodHierarchy?.parentPlan?.plans?.length == 0 ||
              planningPeriodHierarchy?.parentPlan?.plans?.filter(
                (i: { isReported: boolean }) => i.isReported === false,
              )?.length == 0
            ? `Please create ${planningPeriodHierarchy?.parentPlan?.name} Plan before creating ${activeTabName} Plan`
            : '';

    const createPlanDisabled =
      !inlinePlanningMode &&
      ((allUserPlanning && allUserPlanning.length > 0) ||
        isActive ||
        (objective?.items?.length ?? 0) === 0);

    return (
      <Tooltip title={tooltipTitle}>
        <div
          className="inline-block"
          data-cy="planning-reporting-header-actions-tooltip-inner"
        >
          {userPlanningPeriodId && (
            <CustomButton
              disabled={createPlanDisabled}
              loading={hierarchyLoading}
              title={activeTabName ? `Add ${activeTabName}` : 'Add'}
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
              className={`${!userPlanningPeriodId ? 'hidden' : ''} !h-10 !min-h-10 !w-auto !min-w-0 !bg-[#1E40AF] !text-white hover:!bg-[#1E3A8A]`}
            />
          )}
        </div>
      </Tooltip>
    );
  }

  return null;
}
