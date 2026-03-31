'use client';
import React, { useEffect, useMemo } from 'react';
import { Button } from 'antd';
import FilterAltOutlinedIcon from '@mui/icons-material/FilterAltOutlined';
import { PlanningAndReportingStore } from '@/store/uistate/features/planningAndReporting/useStore';
import Planning from './_components/planning';
import PlanningReportingFilterModal from './_components/filters/PlanningReportingFilterModal';
import {
  AllPlanningPeriods,
  useDefaultPlanningPeriods,
} from '@/store/server/features/okrPlanningAndReporting/queries';
import { useGetAssignedPlanningPeriodForUserId } from '@/store/server/features/employees/planning/planningPeriod/queries';
import CreatePlan from './_components/createPlan';
import EditPlan from './_components/editPlan';
import Reporting from './_components/reporting';
import CreateReport from './_components/createReport';
import EditReport from './_components/editReport';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import {
  PR_BORDER,
  PR_METRIC_TAG_BORDER,
  PR_PAGE_BG,
  PR_PRIMARY,
  PR_TEXT,
  PR_TEXT_MUTED,
} from './_components/planningUiTokens';
import './_components/planningAntTagScope.css';

interface PlanningPeriod {
  id: string;
  userId: string;
  planningPeriod: {
    id: string;
    name: string;
    intervalLength: any;
  };
}

/** Product scope: Planning & Reporting uses Daily + Weekly only (no Monthly tab). */
function isMonthlyPlanningPeriodItem(item: PlanningPeriod): boolean {
  const name = (item.planningPeriod?.name || '').toLowerCase().trim();
  return name.includes('month');
}

function PlanningReportingPageInner() {
  const {
    setActiveTab,
    activeTab,
    setActivePlanPeriod,
    setActivePlanPeriodId,
    setFilterModalOpenFromPage,
    filterModalOpenFromPage,
    activePlanPeriodId,
  } = PlanningAndReportingStore();
  const { data: planningPeriods } = AllPlanningPeriods();
  const { data: defaultPlanningPeriods } = useDefaultPlanningPeriods();

  const { data: planningPeriodForUserId } =
    useGetAssignedPlanningPeriodForUserId();

  const hasPermission = AccessGuard.checkAccess({
    permissions: [
      Permissions.ViewDailyPlan,
      Permissions.ViewWeeklyPlan,
      Permissions.ViewMonthlyPlan,
    ],
  });

  const processedPlanningPeriods = useMemo(() => {
    const safePlanningPeriods = Array.isArray(planningPeriods)
      ? planningPeriods
      : [];
    const safeDefaultPlanningPeriods = Array.isArray(
      defaultPlanningPeriods?.items,
    )
      ? defaultPlanningPeriods.items
      : [];

    if (safePlanningPeriods.length === 0) return [];

    const existingUserId = safePlanningPeriods[0]?.userId || 'N/A';
    const existingPlanningPeriodIds = new Set(
      safePlanningPeriods.map(
        (item: PlanningPeriod) => item?.planningPeriod?.id,
      ),
    );

    const missingPlanningPeriods = safeDefaultPlanningPeriods
      .filter((item: any) => !existingPlanningPeriodIds.has(item.id))
      .map((item: any) => ({
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deletedAt: null,
        createdBy: 'system',
        updatedBy: 'system',
        userId: existingUserId,
        tenantId: item.tenantId,
        planningPeriodId: item.id,
        planningPeriod: item,
      }));

    const mergedPlanningPeriods = [
      ...safePlanningPeriods,
      ...missingPlanningPeriods,
    ];

    mergedPlanningPeriods.sort(
      (a, b) =>
        a.planningPeriod.intervalLength - b.planningPeriod.intervalLength,
    );

    const merged = hasPermission ? mergedPlanningPeriods : safePlanningPeriods;
    return merged.filter((p) => !isMonthlyPlanningPeriodItem(p));
  }, [planningPeriods, defaultPlanningPeriods, hasPermission]);

  const cadenceFilterOptions = useMemo(
    () =>
      processedPlanningPeriods.map((p, i) => ({
        periodId: p.planningPeriod.id,
        label: p.planningPeriod.name || 'Plan period',
        tabIndex: i + 1,
      })),
    [processedPlanningPeriods],
  );

  /** Default to Weekly only until the user picks a plan period in the Filter modal (or one is already set). */
  useEffect(() => {
    if (processedPlanningPeriods.length === 0 || activePlanPeriodId) {
      return;
    }
    const weeklyIdx = processedPlanningPeriods.findIndex((p) =>
      (p.planningPeriod?.name || '').toLowerCase().includes('week'),
    );
    const idx = weeklyIdx >= 0 ? weeklyIdx : 0;
    const period = processedPlanningPeriods[idx];
    setActivePlanPeriodId(period.planningPeriod.id);
    setActivePlanPeriod(idx + 1);
  }, [
    processedPlanningPeriods,
    activePlanPeriodId,
    setActivePlanPeriodId,
    setActivePlanPeriod,
  ]);

  useEffect(() => {
    setFilterModalOpenFromPage(false);
  }, [activeTab, setFilterModalOpenFromPage]);

  const handleFilterClick = () => {
    setFilterModalOpenFromPage(true);
  };

  return (
    <div
      data-cy="-afterlogin-planningandreporting-planning-and-reporting-page-tsx-page-div-130"
      className="pr-ant-tag-scope min-h-screen w-full bg-white px-4 pb-10 md:px-8"
      style={{ backgroundColor: PR_PAGE_BG }}
    >
      <div
        data-cy="-afterlogin-planningandreporting-planning-and-reporting-page-tsx-page-div-131"
        className="mx-auto h-full w-full max-w-[1130px]"
      >
        <div
          data-cy="-afterlogin-planningandreporting-planning-and-reporting-page-tsx-page-div-132"
          className="flex flex-col gap-4 pt-6"
        >
          <div
            data-cy="planning-reporting-title-row"
            className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
          >
            <header
              data-cy="-afterlogin-planningandreporting-planning-and-reporting-page-tsx-page-header"
              className="flex min-w-0 flex-1 flex-col gap-0.5"
            >
              <h1
                className="text-2xl font-bold leading-tight tracking-tight md:text-[36px]"
                style={{ color: PR_TEXT }}
                data-cy="breadcrumb-title"
              >
                Planning and Reporting
              </h1>
              <p
                className="text-xs font-normal md:text-sm"
                style={{ color: PR_TEXT_MUTED }}
                data-cy="planning-reporting-breadcrumb"
              >
                OKR / Planning and Reporting
              </p>
            </header>
            <div
              id="pr-primary-action-slot"
              data-cy="planning-reporting-primary-action-slot"
              className="flex w-full shrink-0 justify-stretch pt-1 md:w-auto md:justify-end md:pt-0"
            />
          </div>

          <div
            data-cy="planning-reporting-tabs-filter-row"
            className="flex flex-col gap-3 border-b sm:flex-row sm:items-end sm:justify-between"
            style={{ borderColor: PR_BORDER }}
          >
            <nav
              className="flex min-w-0 gap-0"
              aria-label="Planning and reporting views"
              data-cy="planning-reporting-mode-tabs"
            >
              <button
                type="button"
                onClick={() => setActiveTab(1)}
                className={`relative -mb-px px-0.5 pb-3 text-sm font-semibold transition-colors md:text-base ${
                  activeTab === 1
                    ? 'after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[3px] after:rounded-t after:bg-[#2D5BFF]'
                    : 'hover:text-[#161A2C]'
                }`}
                style={
                  activeTab === 1
                    ? { color: PR_PRIMARY }
                    : { color: PR_TEXT_MUTED }
                }
                data-cy="planning-reporting-tab-planning"
              >
                Planning
              </button>
              <button
                type="button"
                onClick={() => setActiveTab(2)}
                className={`relative -mb-px ml-6 px-0.5 pb-3 text-sm font-normal transition-colors md:ml-8 md:text-base ${
                  activeTab === 2
                    ? 'after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[3px] after:rounded-t after:bg-[#2D5BFF]'
                    : 'hover:text-[#161A2C]'
                }`}
                style={
                  activeTab === 2
                    ? { color: PR_PRIMARY }
                    : { color: PR_TEXT_MUTED }
                }
                data-cy="planning-reporting-tab-reporting"
              >
                Reporting
              </button>
            </nav>
            <div
              data-cy="planning-reporting-filter-wrap"
              className="flex pb-2 sm:ml-auto sm:pb-3"
            >
              <Button
                type="default"
                icon={
                  <FilterAltOutlinedIcon
                    sx={{
                      fontSize: 16,
                      width: 16,
                      height: 16,
                      color: '#374151',
                    }}
                    aria-hidden
                  />
                }
                onClick={handleFilterClick}
                className="planning-reporting-filter-button !m-0 !inline-flex !h-8 !min-h-[32px] !w-[84px] !min-w-[84px] !flex-row !items-center !justify-center !gap-2 !rounded-[6px] !border !border-solid !bg-white !px-[15px] !py-0 !text-sm !font-normal !leading-[22px] !shadow-none hover:!bg-white hover:!text-[rgba(0,0,0,0.85)]"
                style={{
                  borderColor: PR_METRIC_TAG_BORDER,
                  color: 'rgba(0, 0, 0, 0.7)',
                  boxShadow: '0px 2px 0px rgba(0, 0, 0, 0.02)',
                  borderRadius: 6,
                }}
                data-cy="planning-reporting-filter-button"
              >
                Filter
              </Button>
            </div>
          </div>
        </div>

        <div
          data-cy="-afterlogin-planningandreporting-planning-and-reporting-page-tsx-page-div-153"
          className="w-full pt-4"
        >
          {activeTab === 1 ? <Planning /> : null}
          {activeTab === 2 ? <Reporting /> : null}
          <CreatePlan />
          <EditPlan />
          <CreateReport />
          <EditReport />

          <PlanningReportingFilterModal
            open={filterModalOpenFromPage}
            onClose={() => setFilterModalOpenFromPage(false)}
            cadenceOptions={cadenceFilterOptions}
            showEmployeeAndDepartment={hasPermission}
            showReportingPlanType={activeTab === 2 && hasPermission}
          />

          {planningPeriodForUserId?.length === 0 && (
            <div
              data-cy="-afterlogin-planningandreporting-planning-and-reporting-page-tsx-page-div-167"
              className="flex h-auto w-full justify-center space-y-4 font-semibold"
            >
              There is no Assigned Plan, please assign a Plan for a User first
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Page() {
  return <PlanningReportingPageInner />;
}
