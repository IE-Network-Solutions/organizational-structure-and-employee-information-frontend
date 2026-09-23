'use client';

import React, { useMemo } from 'react';
import { Button, Progress, Skeleton, Tag } from 'antd';
import { LuArrowLeft, LuChevronRight } from 'react-icons/lu';
import dayjs from 'dayjs';
import { useParams, useRouter } from 'next/navigation';
import EmptyState from '@/components/empty';
import { DATE_FORMAT } from '@/utils/constants';
import {
  useGetGrowthPlanById,
  useGetGrowthPlanTaxonomy,
} from '@/store/server/features/tna/growthPlan/queries';
import { useSubmitGrowthPlan } from '@/store/server/features/tna/growthPlan/mutations';
import {
  goalDisplayProgress,
  GROWTH_PLAN_PROGRESS_STATUS_OPTIONS,
  GrowthPlanGoal,
  isUrlLikeOutcome,
  normalizeChecklist,
} from '@/types/tna/growthPlan';

/**
 * Plan detail — clickable skills (OKR-style progress badge).
 * Pattern found: ObjectiveCard progress pill → navigate to skill detail.
 */
const GrowthPlanDetailPage = () => {
  const router = useRouter();
  const params = useParams();
  const planId = String(params?.planId ?? '');

  const { data: plan, isLoading } = useGetGrowthPlanById(planId, !!planId);
  const { data: taxonomy } = useGetGrowthPlanTaxonomy();
  const { mutate: submitPlan, isLoading: submitting } = useSubmitGrowthPlan();

  const isApproved =
    plan?.status === 'approved' || plan?.status === 'partially_approved';

  const goals = useMemo(() => plan?.goals ?? [], [plan]);

  const overall = useMemo(() => {
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
  }, [goals]);

  const resourceCount = (goal: GrowthPlanGoal) => {
    if (!goal.skillId) return 0;
    for (const cat of taxonomy ?? []) {
      const skill = cat.skills.find((s) => s.id === goal.skillId);
      if (skill) return skill.resources?.length ?? 0;
    }
    return 0;
  };

  if (isLoading) {
    return (
      <div className="page-wrap" data-cy="pgp-plan-detail-loading">
        <Skeleton active paragraph={{ rows: 8 }} />
      </div>
    );
  }

  if (!plan) {
    return (
      <div
        data-cy="tna-planning-planid-page-div-75"
        className="page-wrap flex min-h-[280px] items-center justify-center"
      >
        <EmptyState
          title="Plan not found"
          description="This growth plan may have been deleted."
          actionText="Back to My Plans"
          onAction={() => router.push('/tna/planning')}
        />
      </div>
    );
  }

  return (
    <div
      className="page-wrap flex flex-col gap-5"
      data-cy="pgp-plan-detail-page"
    >
      <div
        data-cy="tna-planning-planid-page-div-91"
        className="flex flex-wrap items-start justify-between gap-3"
      >
        <div
          data-cy="tna-planning-planid-page-div-92"
          className="min-w-0 flex-1"
        >
          <button
            type="button"
            onClick={() => router.push('/tna/planning')}
            className="mb-3 inline-flex cursor-pointer items-center gap-1.5 border-none bg-transparent p-0 text-[13px] text-[#8c8c8c] hover:text-[#1E40AF]"
            data-cy="pgp-plan-detail-back"
          >
            <LuArrowLeft className="text-sm" />
            My Plans
          </button>
          <div
            data-cy="tna-planning-planid-page-div-102"
            className="flex flex-wrap items-center gap-2"
          >
            <h1
              data-cy="tna-planning-planid-page-h1-103"
              className="m-0 text-2xl font-bold text-gray-900"
            >
              {plan.categoryName || 'Growth plan'}
            </h1>
            {plan.status === 'draft' ? (
              <span
                data-cy="tna-planning-planid-page-span-107"
                className="rounded border border-[#D9D9D9] bg-[#FAFAFA] px-2 py-0.5 text-xs text-gray-600"
              >
                Draft
              </span>
            ) : null}
          </div>
          <p
            data-cy="tna-planning-planid-page-p-112"
            className="mb-0 mt-2 text-sm text-[#595959]"
          >
            {plan.fiscalYearName ? `${plan.fiscalYearName} · ` : ''}
            {goals.length} skill{goals.length === 1 ? '' : 's'}
            {isApproved
              ? ` · ${overall.completed}/${overall.total} complete`
              : ''}
            {plan.submittedAt
              ? ` · Submitted ${dayjs(plan.submittedAt).format(DATE_FORMAT)}`
              : plan.createdAt
                ? ` · Created ${dayjs(plan.createdAt).format(DATE_FORMAT)}`
                : ''}
          </p>
          {isApproved && overall.total > 0 ? (
            <div className="mt-3 max-w-md" data-cy="pgp-plan-detail-overall">
              <div
                data-cy="tna-planning-planid-page-div-126"
                className="mb-1 flex items-center justify-between"
              >
                <span
                  data-cy="tna-planning-planid-page-span-127"
                  className="text-[11px] text-gray-500"
                >
                  Plan progress
                </span>
                <span
                  data-cy="tna-planning-planid-page-span-128"
                  className="text-[11px] font-medium text-gray-700"
                >
                  {overall.avg}%
                </span>
              </div>
              <Progress
                percent={overall.avg}
                size="small"
                strokeColor="#1E40AF"
                showInfo={false}
              />
            </div>
          ) : null}
        </div>
        <div
          data-cy="tna-planning-planid-page-div-141"
          className="flex flex-wrap gap-2"
        >
          {plan.status === 'draft' ? (
            <Button
              type="primary"
              className="bg-primary"
              loading={submitting}
              onClick={() => submitPlan(plan.id)}
              data-cy="pgp-plan-detail-submit"
            >
              Activate plan
            </Button>
          ) : null}
        </div>
      </div>

      {!goals.length ? (
        <EmptyState
          title="No skills in this plan"
          description="This plan has no scheduled skills yet."
        />
      ) : (
        <div
          className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3"
          data-cy="pgp-plan-detail-skills-list"
        >
          {goals.map((goal) => {
            const checklist = normalizeChecklist(goal.checklist as any);
            const pct = goalDisplayProgress({ ...goal, checklist });
            const statusOpt = GROWTH_PLAN_PROGRESS_STATUS_OPTIONS.find(
              (o) => o.value === (goal.progressStatus ?? 'not_started'),
            );
            const recCount = resourceCount(goal);
            const matCount = goal.materials?.length ?? 0;

            return (
              <button
                key={goal.id}
                type="button"
                onClick={() =>
                  router.push(`/tna/planning/${plan.id}/skill/${goal.id}`)
                }
                className="group cursor-pointer rounded-lg border border-[#E5E7EB] bg-white p-4 text-left shadow-none transition-colors hover:border-[#1E40AF]/40 hover:bg-[#F8FAFC]"
                data-cy={`pgp-plan-detail-skill-${goal.id}`}
              >
                <div
                  data-cy="tna-planning-planid-page-div-185"
                  className="flex items-start justify-between gap-2"
                >
                  <div
                    data-cy="tna-planning-planid-page-div-186"
                    className="min-w-0 flex-1"
                  >
                    <div
                      data-cy="tna-planning-planid-page-div-187"
                      className="flex flex-wrap items-center gap-2"
                    >
                      <h2
                        data-cy="tna-planning-planid-page-h2-188"
                        className="m-0 text-[15px] font-semibold text-[#262626] group-hover:text-[#1E40AF]"
                      >
                        {goal.skillName}
                      </h2>
                      {goal.isCustom ? <Tag>Custom</Tag> : null}
                      {goal.quarterLabel ? (
                        <Tag>{goal.quarterLabel}</Tag>
                      ) : null}
                    </div>
                    {goal.measurableOutcome &&
                    !isUrlLikeOutcome(goal.measurableOutcome) ? (
                      <p
                        data-cy="tna-planning-planid-page-p-198"
                        className="mb-0 mt-2 line-clamp-2 text-sm text-[#595959]"
                      >
                        {goal.measurableOutcome}
                      </p>
                    ) : null}
                    {goal.targetDeadline ? (
                      <p
                        data-cy="tna-planning-planid-page-p-203"
                        className="mb-0 mt-1 text-xs text-[#8c8c8c]"
                      >
                        Deadline{' '}
                        {dayjs(goal.targetDeadline).format(DATE_FORMAT)}
                      </p>
                    ) : null}
                  </div>
                  <LuChevronRight className="mt-1 shrink-0 text-[#8c8c8c] group-hover:text-[#1E40AF]" />
                </div>

                <div
                  data-cy="tna-planning-planid-page-div-212"
                  className="mt-3 flex flex-wrap items-center gap-2"
                >
                  <span
                    data-cy="tna-planning-planid-page-span-213"
                    className="inline-flex items-center rounded border border-[#BFDBFE] bg-[#DBEAFE] px-2.5 py-1 text-xs font-medium text-blue-700"
                  >
                    {pct}%
                  </span>
                  {statusOpt ? (
                    <span
                      data-cy="tna-planning-planid-page-span-217"
                      className="text-xs text-[#595959]"
                    >
                      {statusOpt.label}
                    </span>
                  ) : null}
                </div>
                <Progress
                  percent={pct}
                  size="small"
                  strokeColor="#1E40AF"
                  showInfo={false}
                  className="mt-2"
                />
                <p
                  data-cy="tna-planning-planid-page-p-229"
                  className="mb-0 mt-2 text-[11px] text-[#8c8c8c]"
                >
                  {recCount} recommended · {matCount} material
                  {matCount === 1 ? '' : 's'}
                  {(goal.activities?.length ?? 0) > 0
                    ? ` · ${goal.activities!.length} update${goal.activities!.length === 1 ? '' : 's'}`
                    : ''}
                </p>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default GrowthPlanDetailPage;
