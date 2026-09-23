'use client';

import React, { useMemo, useState } from 'react';
import { Button, Popover, Progress, Select, Tag } from 'antd';
import { LuChevronRight, LuPlus } from 'react-icons/lu';
import { MdOutlineFilterAlt } from 'react-icons/md';
import dayjs from 'dayjs';
import { useRouter } from 'next/navigation';
import CustomBreadcrumb from '@/components/common/breadCramp';
import AccessGuard, { useHasPermission } from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import { DATE_FORMAT } from '@/utils/constants';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { useGrowthPlanStore } from '@/store/uistate/features/tna/growthPlan';
import { useGetGrowthPlans } from '@/store/server/features/tna/growthPlan/queries';
import { useSubmitGrowthPlan } from '@/store/server/features/tna/growthPlan/mutations';
import {
  useGetActiveFiscalYears,
  useGetAllFiscalYears,
} from '@/store/server/features/organizationStructure/fiscalYear/queries';
import {
  goalDisplayProgress,
  GrowthPlan,
  normalizeChecklist,
} from '@/types/tna/growthPlan';
import PlanWizardDrawer from './_components/planWizardDrawer';
import TeamProgressPanel from './_components/teamProgress';
import EmptyState from '@/components/empty';

const planProgress = (plan: GrowthPlan) => {
  const goals = plan.goals ?? [];
  const total = goals.length;
  const completed = goals.filter((g) => g.status === 'complete').length;
  const avg =
    total > 0
      ? Math.round(
          goals.reduce((sum, g) => {
            const checklist = normalizeChecklist(g.checklist as any);
            return sum + goalDisplayProgress({ ...g, checklist });
          }, 0) / total,
        )
      : 0;
  return { total, completed, avg };
};

/**
 * Pattern found: MyCommitmentsPanel card grid + EmployeeAttendance filter Popover.
 */
const PersonalGrowthPlanPage = () => {
  const { userId } = useAuthenticationStore();
  const { setIsWizardOpen, resetWizard } = useGrowthPlanStore();
  const [filterOpen, setFilterOpen] = useState(false);
  const [fiscalYearId, setFiscalYearId] = useState<string | undefined>();
  const [quarterId, setQuarterId] = useState<string | undefined>();

  const canViewTeam = useHasPermission(Permissions.ApproveGrowthPlan);
  const { data: myPlans, isLoading: plansLoading } = useGetGrowthPlans(
    { userId: userId ?? undefined },
    !!userId,
  );
  const { data: fiscalYearsData } = useGetAllFiscalYears(50, 1);
  const { data: activeFy } = useGetActiveFiscalYears();

  const plans = useMemo(() => myPlans ?? [], [myPlans]);

  const fiscalYearOptions = useMemo(() => {
    const map = new Map<string, string>();
    for (const fy of fiscalYearsData?.items ?? []) {
      if (fy.id) map.set(fy.id, fy.name);
    }
    if (activeFy?.id) map.set(activeFy.id, activeFy.name);
    for (const plan of plans) {
      if (plan.fiscalYearId) {
        map.set(plan.fiscalYearId, plan.fiscalYearName || plan.fiscalYearId);
      }
    }
    return Array.from(map.entries()).map(([value, label]) => ({
      value,
      label,
    }));
  }, [fiscalYearsData, activeFy, plans]);

  const quarterOptions = useMemo(() => {
    const map = new Map<string, string>();
    const selectedFy =
      (fiscalYearsData?.items ?? []).find((fy) => fy.id === fiscalYearId) ??
      (activeFy?.id === fiscalYearId ? activeFy : null);

    const sessions = selectedFy?.sessions ?? activeFy?.sessions ?? [];
    sessions.forEach((s, idx) => {
      map.set(s.id, s.name || `Q${idx + 1}`);
    });

    for (const plan of plans) {
      if (fiscalYearId && plan.fiscalYearId !== fiscalYearId) continue;
      for (const goal of plan.goals ?? []) {
        if (goal.quarterId) {
          map.set(goal.quarterId, goal.quarterLabel || goal.quarterId);
        }
      }
    }

    if (!map.size) {
      [1, 2, 3, 4].forEach((n) => map.set(`q${n}`, `Q${n}`));
    }

    return Array.from(map.entries()).map(([value, label]) => ({
      value,
      label,
    }));
  }, [fiscalYearsData, activeFy, fiscalYearId, plans]);

  const filteredPlans = useMemo(() => {
    return plans.filter((plan) => {
      if (fiscalYearId && plan.fiscalYearId !== fiscalYearId) return false;
      if (quarterId) {
        const hasQuarter = (plan.goals ?? []).some(
          (g) => g.quarterId === quarterId,
        );
        if (!hasQuarter) return false;
      }
      return true;
    });
  }, [plans, fiscalYearId, quarterId]);

  const activeFilterCount = (fiscalYearId ? 1 : 0) + (quarterId ? 1 : 0);

  const openWizard = () => {
    resetWizard();
    setIsWizardOpen(true);
  };

  const clearFilters = () => {
    setFiscalYearId(undefined);
    setQuarterId(undefined);
  };

  const filterContent = (
    <div
      className="flex w-[260px] flex-col gap-3"
      data-cy="pgp-plans-filter-panel"
    >
      <div data-cy="tna-planning-page-div-143">
        <div
          data-cy="tna-planning-page-div-144"
          className="mb-1 text-xs font-medium text-gray-700"
        >
          Fiscal year
        </div>
        <Select
          allowClear
          placeholder="All fiscal years"
          className="w-full"
          value={fiscalYearId}
          options={fiscalYearOptions}
          onChange={(value) => {
            setFiscalYearId(value);
            setQuarterId(undefined);
          }}
          data-cy="pgp-plans-filter-fiscal-year"
        />
      </div>
      <div data-cy="tna-planning-page-div-160">
        <div
          data-cy="tna-planning-page-div-161"
          className="mb-1 text-xs font-medium text-gray-700"
        >
          Quarter
        </div>
        <Select
          allowClear
          placeholder="All quarters"
          className="w-full"
          value={quarterId}
          options={quarterOptions}
          onChange={setQuarterId}
          data-cy="pgp-plans-filter-quarter"
        />
      </div>
      <Button
        size="small"
        onClick={clearFilters}
        disabled={!activeFilterCount}
        data-cy="pgp-plans-filter-clear"
      >
        Clear filters
      </Button>
    </div>
  );

  return (
    <div className="page-wrap flex flex-col gap-6" data-cy="pgp-planning-page">
      <div data-cy="pgp-planning-header">
        <CustomBreadcrumb
          title={<span data-cy="pgp-planning-title">Personal Growth Plan</span>}
          subtitle={
            <nav
              className="flex flex-row flex-wrap items-center text-sm leading-[22px]"
              aria-label="Breadcrumb"
              data-cy="pgp-planning-breadcrumb"
            >
              <span
                data-cy="tna-planning-page-span-194"
                className="text-black/45"
              >
                Learning and Growth
              </span>
              <span
                data-cy="tna-planning-page-span-195"
                className="px-2 text-black/45"
              >
                /
              </span>
              <span
                data-cy="tna-planning-page-span-196"
                className="text-black/70"
              >
                Personal Growth Plan
              </span>
            </nav>
          }
        />
      </div>

      <section data-cy="pgp-my-plans-section">
        <div
          data-cy="tna-planning-page-div-203"
          className="mb-4 flex flex-wrap items-center justify-between gap-3"
        >
          <h1
            className="m-0 text-2xl font-bold text-gray-900"
            data-cy="pgp-my-plans-heading"
          >
            My Plans
          </h1>
          <div
            data-cy="tna-planning-page-div-210"
            className="flex flex-wrap items-center gap-2"
          >
            <Popover
              content={filterContent}
              trigger="click"
              open={filterOpen}
              onOpenChange={setFilterOpen}
              placement="bottomRight"
              data-cy="pgp-plans-filter-popover"
            >
              <Button
                icon={<MdOutlineFilterAlt size={16} />}
                data-cy="pgp-plans-filter"
              >
                Filter
                {activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
              </Button>
            </Popover>
            <AccessGuard permissions={[Permissions.ManageGrowthPlan]}>
              <Button
                type="primary"
                icon={<LuPlus />}
                onClick={openWizard}
                className="bg-primary"
                data-cy="pgp-planning-create"
              >
                New growth plan
              </Button>
            </AccessGuard>
          </div>
        </div>
        <MyPlansList
          plans={filteredPlans}
          loading={plansLoading}
          onCreate={openWizard}
          hasActiveFilters={activeFilterCount > 0}
          onClearFilters={clearFilters}
        />
      </section>

      {canViewTeam ? (
        <section data-cy="pgp-team-section">
          <h2
            className="mb-4 text-sm font-semibold text-gray-900"
            data-cy="pgp-team-heading"
          >
            Team progress
          </h2>
          <TeamProgressPanel />
        </section>
      ) : null}

      <PlanWizardDrawer />
    </div>
  );
};

const MyPlansList = ({
  plans,
  loading,
  onCreate,
  hasActiveFilters,
  onClearFilters,
}: {
  plans: GrowthPlan[];
  loading: boolean;
  onCreate: () => void;
  hasActiveFilters?: boolean;
  onClearFilters?: () => void;
}) => {
  const router = useRouter();
  const { mutate: submitPlan, isLoading: submitting } = useSubmitGrowthPlan();

  if (!loading && !plans.length) {
    return (
      <EmptyState
        title={
          hasActiveFilters ? 'No plans match filters' : 'No growth plans yet'
        }
        description={
          hasActiveFilters
            ? 'Try another fiscal year or quarter, or clear filters.'
            : 'Build your yearly personal growth plan from the skill taxonomy.'
        }
        actionText={
          hasActiveFilters ? 'Clear filters' : 'Create your yearly growth plan'
        }
        onAction={hasActiveFilters ? onClearFilters : onCreate}
        data-cy="pgp-plans-empty"
      />
    );
  }

  return (
    <div
      className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3"
      data-cy="pgp-plans-list"
    >
      {plans.map((plan) => {
        const { total, completed, avg } = planProgress(plan);
        const showProgress =
          plan.status === 'approved' || plan.status === 'partially_approved';

        return (
          <div
            key={plan.id}
            className="flex h-full flex-col rounded-lg border border-[#E5E7EB] bg-white p-3 shadow-none"
            data-cy={`pgp-plan-card-${plan.id}`}
          >
            <button
              type="button"
              className="min-w-0 flex-1 cursor-pointer border-none bg-transparent p-0 text-left"
              onClick={() => router.push(`/tna/planning/${plan.id}`)}
              data-cy={`pgp-plan-card-open-${plan.id}`}
            >
              <div
                data-cy="tna-planning-page-div-324"
                className="flex items-start justify-between gap-2"
              >
                <div
                  data-cy="tna-planning-page-div-325"
                  className="min-w-0 flex-1"
                >
                  <div
                    data-cy="tna-planning-page-div-326"
                    className="flex flex-wrap items-center gap-2"
                  >
                    <span
                      data-cy="tna-planning-page-span-327"
                      className="line-clamp-2 text-sm font-semibold text-gray-900"
                    >
                      {plan.categoryName || 'Growth plan'}
                    </span>
                    {plan.status === 'draft' ? (
                      <Tag className="m-0">Draft</Tag>
                    ) : null}
                  </div>
                  <p
                    data-cy="tna-planning-page-p-334"
                    className="mb-0 mt-1 text-xs text-gray-500"
                  >
                    {plan.fiscalYearName ? `${plan.fiscalYearName} · ` : ''}
                    {`${total} skill${total === 1 ? '' : 's'}`}
                    {showProgress ? ` · ${completed}/${total} complete` : ''}
                  </p>
                  <p
                    data-cy="tna-planning-page-p-339"
                    className="mb-0 mt-0.5 text-[11px] text-[#8c8c8c]"
                  >
                    {plan.submittedAt
                      ? `Started ${dayjs(plan.submittedAt).format(DATE_FORMAT)}`
                      : plan.createdAt
                        ? `Created ${dayjs(plan.createdAt).format(DATE_FORMAT)}`
                        : ''}
                    {plan.completedAt
                      ? ` · Completed ${dayjs(plan.completedAt).format(DATE_FORMAT)}`
                      : ''}
                  </p>
                </div>
                <LuChevronRight className="mt-0.5 shrink-0 text-[#8c8c8c]" />
              </div>

              {showProgress ? (
                <div className="mt-3" data-cy={`pgp-plan-progress-${plan.id}`}>
                  <div
                    data-cy="tna-planning-page-div-355"
                    className="mb-1 flex items-center justify-between"
                  >
                    <span
                      data-cy="tna-planning-page-span-356"
                      className="text-[11px] text-gray-500"
                    >
                      Progress
                    </span>
                    <span
                      data-cy="tna-planning-page-span-357"
                      className="text-[11px] font-medium text-gray-700"
                    >
                      {avg}%
                    </span>
                  </div>
                  <Progress
                    percent={avg}
                    size="small"
                    strokeColor="#1E40AF"
                    showInfo={false}
                  />
                </div>
              ) : null}
            </button>

            {plan.status === 'draft' ? (
              <Button
                type="primary"
                size="small"
                className="bg-primary mt-3 w-full"
                loading={submitting}
                onClick={() => submitPlan(plan.id)}
                data-cy={`pgp-plan-submit-${plan.id}`}
              >
                Activate plan
              </Button>
            ) : null}
          </div>
        );
      })}
    </div>
  );
};

export default PersonalGrowthPlanPage;
