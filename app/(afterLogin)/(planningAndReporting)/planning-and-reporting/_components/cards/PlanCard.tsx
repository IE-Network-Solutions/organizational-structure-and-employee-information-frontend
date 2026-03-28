import React from 'react';
import { Button, Dropdown, MenuProps, Tooltip } from 'antd';
import { MoreOutlined } from '@ant-design/icons';
import { FaBomb, FaRegThumbsUp } from 'react-icons/fa';
import { AiOutlineEdit } from 'react-icons/ai';
import { IoCheckmarkSharp, IoKeyOutline, IoOpen } from 'react-icons/io5';
import { PlanSummary, ViewMode, Cadence, KeyResult } from '../types';
import { formatPlanningReportDate } from '../utils';
import UserInfo from '../UserInfo';
import StatusBadge from '../StatusBadge';
import KRSummaryBar from '../KRSummaryBar';
import TaskRow from '../TaskRow';
import CommentsSection from '../comments/CommentsSection';
import {
  PR_BORDER,
  PR_PRIMARY,
  PR_TEXT,
  PR_TREE_LINE,
} from '../planningUiTokens';

/** Two concentric blue rings + center dot (objective / bullseye). */
function ObjectiveBullseyeIcon({
  dataCy = 'planning-reporting-plancard-objective-icon',
}: {
  dataCy?: string;
}) {
  return (
    <span
      className="relative mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center"
      data-cy={dataCy}
    >
      <span
        className="absolute h-[26px] w-[26px] rounded-full border-2 bg-white"
        style={{ borderColor: PR_PRIMARY }}
        data-cy="planning-reporting-plancard-objective-ring-outer"
        aria-hidden
      />
      <span
        className="absolute h-[14px] w-[14px] rounded-full border bg-white"
        style={{ borderColor: PR_PRIMARY }}
        data-cy="planning-reporting-plancard-objective-ring-inner"
        aria-hidden
      />
      <span
        className="relative z-10 h-1.5 w-1.5 rounded-full md:h-2 md:w-2"
        style={{ backgroundColor: PR_PRIMARY }}
        data-cy="planning-reporting-plancard-objective-dot"
        aria-hidden
      />
    </span>
  );
}

interface PlanCardProps {
  plan: PlanSummary;
  viewMode: ViewMode;
  activeCadence: Cadence;
  // Optional action handlers
  onApprove?: () => void;
  onOpen?: () => void;
  onEdit?: () => void;
  canApprove?: boolean;
  canEdit?: boolean;
  isApprovalLoading?: boolean;
  dateLabel?: string;
}

export default function PlanCard({
  plan,
  viewMode,
  activeCadence,
  onApprove,
  onOpen,
  onEdit,
  canApprove = false,
  canEdit = false,
  isApprovalLoading = false,
  dateLabel,
}: PlanCardProps) {
  const approvalMenuItems: MenuProps['items'] =
    plan.status?.label === 'Open'
      ? [
          {
            key: 'approve',
            id: `plan-card-approve-menu-item-${plan.id}`,
            'data-cy': `plan-card-approve-menu-item-${plan.id}`,
            icon: <IoCheckmarkSharp className="text-base text-[#15803D]" />,
            label: (
              <Tooltip
                title={
                  isApprovalLoading
                    ? 'Processing approval...'
                    : "Approve Plan! Once you approve, you can't edit"
                }
              >
                <span
                  className="text-[#161A2C]"
                  data-cy={`plan-card-approve-menu-label-${plan.id}`}
                >
                  Approve
                </span>
              </Tooltip>
            ),
            disabled: isApprovalLoading,
            onClick: () => onApprove?.(),
          },
        ]
      : [
          {
            key: 'open',
            id: `plan-card-open-menu-item-${plan.id}`,
            'data-cy': `plan-card-open-menu-item-${plan.id}`,
            icon: <IoOpen size={16} className="text-[#EF4444]" />,
            label: (
              <Tooltip title="Open approved Plan">
                <span
                  className="text-[#161A2C]"
                  data-cy={`plan-card-open-menu-label-${plan.id}`}
                >
                  Open
                </span>
              </Tooltip>
            ),
            onClick: () => onOpen?.(),
          },
        ];

  const editMenuItems: MenuProps['items'] = [
    {
      key: 'edit',
      id: `plan-card-edit-menu-item-${plan.id}`,
      'data-cy': `plan-card-edit-menu-item-${plan.id}`,
      icon: <AiOutlineEdit size={16} style={{ color: PR_TEXT }} />,
      label: (
        <Tooltip title="Edit Plan">
          <span
            className="text-[#161A2C]"
            data-cy="planning-and-reporting-components-cards-plancard-tsx-plancard-span-90"
          >
            Edit
          </span>
        </Tooltip>
      ),
      onClick: () => onEdit?.(),
    },
  ];

  const getDateLabel = (): string => {
    if (dateLabel) return dateLabel;
    return formatPlanningReportDate(plan.createdAt ?? '');
  };

  const cadenceLabel =
    activeCadence === 'daily'
      ? 'Daily'
      : activeCadence === 'monthly'
        ? 'Monthly'
        : 'Weekly';

  const objectiveTitle = (obj: any) =>
    obj?.title || obj?.name || obj?.objective || '';

  // Calculate total achieved points for the plan (sum of weights of completed tasks)
  const totalAchieved = React.useMemo(() => {
    if (viewMode !== 'reporting') return 0;

    let total = 0;

    // Helper to sum task weights
    const sumTasks = (tasks: any[]) => {
      tasks.forEach((task) => {
        const isCompleted =
          task.status === 'completed' ||
          task.status === 'Done' ||
          task.isAchieved === true;
        if (isCompleted) {
          total += Number(task.weight) || 0;
        }
      });
    };

    if (plan.keyResults && plan.keyResults.length > 0) {
      plan.keyResults.forEach((kr) => {
        // Collect all tasks for this KR
        const tasks: any[] = [];
        if (kr.tasks) tasks.push(...kr.tasks);
        kr.milestones?.forEach((m: any) => {
          if (m.tasks) tasks.push(...m.tasks);
          m.parentTask?.forEach((p: any) => {
            if (p.tasks) tasks.push(...p.tasks);
          });
        });
        kr.parentTask?.forEach((p: any) => {
          if (p.tasks) tasks.push(...p.tasks);
        });

        sumTasks(tasks);
      });
    } else if (plan.tasks && plan.tasks.length > 0) {
      // Handle flat plan structure
      sumTasks(plan.tasks);
    }

    return total;
  }, [plan, viewMode]);

  /** Dedupe by KR id, then group by objective so metrics + objective render once per OKR. */
  const keyResultDisplayGroups = React.useMemo(() => {
    const raw = plan.keyResults || [];
    const seenIds = new Set<string>();
    const deduped: KeyResult[] = [];
    for (const kr of raw) {
      if (kr.id) {
        if (seenIds.has(kr.id)) continue;
        seenIds.add(kr.id);
      }
      deduped.push(kr);
    }
    const byObjective = new Map<string, KeyResult[]>();
    deduped.forEach((kr, idx) => {
      const oid = kr.objective?.id;
      const groupKey =
        oid !== undefined && oid !== null && String(oid).length > 0
          ? `obj:${String(oid)}`
          : `kr:${kr.id ?? `noid-${idx}`}`;
      if (!byObjective.has(groupKey)) byObjective.set(groupKey, []);
      byObjective.get(groupKey)!.push(kr);
    });
    return Array.from(byObjective.values());
  }, [plan.keyResults]);

  return (
    <article
      data-cy="planning-and-reporting-components-cards-plancard-tsx-plancard-article-160"
      className="mb-4 rounded-lg border bg-white p-4 shadow-[0_2px_8px_rgba(15,23,42,0.06)] md:p-6"
      style={{ borderColor: PR_BORDER }}
      data-active-cadence={activeCadence}
    >
      <div
        data-cy="planning-and-reporting-components-cards-plancard-tsx-plancard-div-184"
        className="mb-5 flex min-w-0 flex-col gap-4 border-b pb-5 sm:flex-row sm:items-start sm:justify-between"
        style={{ borderColor: PR_BORDER }}
      >
        <div
          data-cy="planning-reporting-plancard-user-col"
          className="flex min-w-0 flex-1 flex-col gap-2"
        >
          <UserInfo
            owner={plan.owner}
            notificationCount={plan.notificationCount}
            cadenceLabel={cadenceLabel}
          />
          {(plan.reprimandCount && plan.reprimandCount > 0) ||
          (plan.appreciationCount && plan.appreciationCount > 0) ? (
            <div
              data-cy="planning-reporting-plancard-feedback-badges"
              className="flex flex-wrap gap-2"
            >
              {plan.reprimandCount && plan.reprimandCount > 0 ? (
                <div
                  data-cy="planning-reporting-plancard-reprimand"
                  className="flex items-center gap-1.5 rounded-md bg-[#FEE2E2] px-2 py-1 text-[#991B1B]"
                >
                  <span
                    data-cy="planning-reporting-plancard-reprimand-count"
                    className="text-xs font-bold"
                  >
                    {plan.reprimandCount}
                  </span>
                  <span data-cy="planning-reporting-plancard-reprimand-icon">
                    <FaBomb className="text-xs" />
                  </span>
                </div>
              ) : null}
              {plan.appreciationCount && plan.appreciationCount > 0 ? (
                <div
                  data-cy="planning-reporting-plancard-appreciation"
                  className="flex items-center gap-1.5 rounded-md bg-[#DCFCE7] px-2 py-1 text-[#166534]"
                >
                  <span
                    data-cy="planning-reporting-plancard-appreciation-count"
                    className="text-xs font-bold"
                  >
                    {plan.appreciationCount}
                  </span>
                  <span data-cy="planning-reporting-plancard-appreciation-icon">
                    <FaRegThumbsUp className="text-xs" />
                  </span>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
        <div
          data-cy="planning-and-reporting-components-cards-plancard-tsx-plancard-div-189"
          className="flex w-full flex-shrink-0 items-start justify-between gap-3 sm:w-auto sm:justify-end"
        >
          <div
            data-cy="planning-reporting-plancard-status-row"
            className="flex min-w-0 flex-1 items-start gap-3 sm:flex-initial sm:items-center"
          >
            {plan.status && (
              <StatusBadge status={plan.status} timeLabel={getDateLabel()} />
            )}
            <div
              data-cy="planning-reporting-plancard-actions"
              className="flex items-center gap-1"
            >
              {canApprove && (
                <Dropdown
                  menu={{ items: approvalMenuItems }}
                  trigger={['click']}
                  placement="bottomRight"
                  popupClassName="planning-reporting-context-dropdown"
                >
                  <Button
                    id={`plan-card-approve-dropdown-button-${plan.id}`}
                    data-cy={`plan-card-approve-dropdown-button-${plan.id}`}
                    loading={isApprovalLoading}
                    type="text"
                    icon={
                      <MoreOutlined
                        className={
                          viewMode === 'planning'
                            ? 'text-lg !rotate-90'
                            : 'text-lg'
                        }
                      />
                    }
                    className="!flex !h-9 !w-9 !items-center !justify-center !rounded-lg !p-0 text-lg text-[#6B7280] hover:!bg-[#F5F6FA]"
                    style={{ minWidth: 'auto' }}
                  />
                </Dropdown>
              )}
              {canEdit && plan.status?.label === 'Open' && (
                <Dropdown
                  menu={{ items: editMenuItems }}
                  trigger={['click']}
                  placement="bottomRight"
                  popupClassName="planning-reporting-context-dropdown"
                >
                  <Button
                    id={`plan-card-edit-dropdown-button-${plan.id}`}
                    data-cy={`plan-card-edit-dropdown-button-${plan.id}`}
                    type="text"
                    icon={
                      <MoreOutlined
                        className={
                          viewMode === 'planning'
                            ? 'text-lg !rotate-90'
                            : 'text-lg'
                        }
                      />
                    }
                    className="!flex !h-9 !w-9 !items-center !justify-center !rounded-lg !p-0 text-lg text-[#6B7280] hover:!bg-[#F5F6FA]"
                    style={{ minWidth: 'auto' }}
                  />
                </Dropdown>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Key results: one metrics + objective per objective; KR rows listed below */}
      {keyResultDisplayGroups.length > 0 ? (
        keyResultDisplayGroups.map((krGroup, gi) => (
          <div
            data-cy="planning-and-reporting-components-cards-plancard-tsx-plancard-div-222"
            key={`plancard-kr-group-${gi}-${krGroup[0]?.id ?? gi}`}
            className={gi > 0 ? 'mt-4' : ''}
          >
            <div
              data-cy="planning-and-reporting-components-cards-plancard-tsx-plancard-div-223"
              className="rounded-lg border bg-white px-4 pb-6 pt-6 md:px-6"
              style={{ borderColor: PR_BORDER }}
            >
              <div
                data-cy="planning-and-reporting-components-cards-plancard-tsx-plancard-div-224"
                className="pl-0 md:pl-2"
              >
                <div
                  data-cy="planning-and-reporting-components-cards-plancard-tsx-plancard-div-226"
                  className="mb-5 px-0 py-1 md:py-2"
                >
                  <KRSummaryBar
                    plan={plan}
                    viewMode={viewMode}
                    keyResult={krGroup[0]}
                  />
                </div>

                {objectiveTitle(krGroup[0].objective) ? (
                  <div
                    data-cy="planning-and-reporting-components-cards-plancard-objective-row"
                    className="mb-1 flex items-start gap-3"
                  >
                    <div
                      className="flex w-8 shrink-0 flex-col items-center"
                      data-cy="planning-reporting-plancard-objective-icon-col"
                    >
                      <ObjectiveBullseyeIcon />
                      <div
                        className="mt-2 h-5 w-px shrink-0 rounded-full md:h-6"
                        style={{ backgroundColor: PR_TREE_LINE }}
                        aria-hidden
                        data-cy="planning-reporting-plancard-objective-connector"
                      />
                    </div>
                    <p
                      data-cy="planning-reporting-plancard-objective-text"
                      className="text-sm font-bold leading-snug text-[#161A2C] md:text-base"
                    >
                      {objectiveTitle(krGroup[0].objective)}
                      {krGroup[0].objective?.deletedAt != null ? (
                        <span
                          data-cy="planning-reporting-plancard-deleted-okr"
                          className="ml-2 inline-block rounded bg-gray-200 px-2 py-0.5 text-xs font-medium text-gray-600"
                        >
                          Deleted OKR
                        </span>
                      ) : null}
                    </p>
                  </div>
                ) : null}

                {krGroup.map((keyResult, kri) => (
                  <React.Fragment key={keyResult.id}>
                    {kri > 0 ? (
                      <div
                        data-cy="planning-reporting-plancard-kr-separator"
                        className="mt-5 border-t pt-5"
                        style={{ borderColor: PR_BORDER }}
                      />
                    ) : null}
                    <div
                      data-cy="planning-reporting-plancard-kr-tree"
                      className="relative mb-2"
                    >
                      <div
                        data-cy="planning-and-reporting-components-cards-plancard-tsx-plancard-div-235"
                        className="relative z-[2] mb-2 flex items-start gap-3"
                      >
                        <div
                          className="relative mt-0.5 flex w-8 shrink-0 flex-col items-center justify-center"
                          data-cy="planning-reporting-plancard-kr-icon-wrap"
                        >
                          <IoKeyOutline
                            data-cy="planning-reporting-plancard-kr-icon"
                            className="relative z-10 h-6 w-6 shrink-0 -rotate-[12deg] md:h-[26px] md:w-[26px]"
                            style={{ color: PR_PRIMARY }}
                            aria-hidden
                          />
                        </div>
                        <div
                          data-cy="planning-and-reporting-components-cards-plancard-tsx-plancard-div-240"
                          className="min-w-0 flex-1"
                        >
                          <p
                            data-cy="planning-and-reporting-components-cards-plancard-tsx-plancard-p-241"
                            className="line-clamp-3 text-sm font-bold leading-snug text-[#161A2C] md:text-base"
                          >
                            {keyResult.title || keyResult.name || plan.summary}
                            {keyResult.deletedAt !== null &&
                              keyResult.deletedAt !== undefined && (
                                <span
                                  data-cy="planning-and-reporting-components-cards-plancard-tsx-plancard-span-246"
                                  className="ml-2 inline-block rounded bg-gray-200 px-2 py-0.5 text-xs font-medium text-gray-600"
                                >
                                  Deleted KR
                                </span>
                              )}
                          </p>
                        </div>
                      </div>

                      <div
                        data-cy="planning-reporting-plancard-kr-tree-trunk"
                        className="pointer-events-none absolute bottom-4 left-4 top-[34px] z-0 w-px md:top-[38px]"
                        style={{ backgroundColor: PR_TREE_LINE }}
                        aria-hidden
                      />
                      <div
                        data-cy="planning-reporting-plancard-kr-tree-content"
                        className="relative z-[1] pl-8"
                      >
                        {/* Key Result Tasks (directly under key result) - Show with grouping if metric is not Milestone */}
                        {keyResult.tasks && keyResult.tasks.length > 0 && (
                          <div
                            data-cy="planning-and-reporting-components-cards-plancard-tsx-plancard-div-261"
                            className="relative mb-4"
                          >
                            {keyResult.metricType?.name &&
                              keyResult.metricType.name !== 'Milestone' && (
                                <div
                                  data-cy="planning-and-reporting-components-cards-plancard-tsx-plancard-div-266"
                                  className="relative z-10 mb-2 flex items-center gap-3"
                                >
                                  <div
                                    data-cy="planning-and-reporting-components-cards-plancard-tsx-plancard-div-267"
                                    className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#E8EDFF]"
                                  >
                                    <div
                                      data-cy="planning-and-reporting-components-cards-plancard-tsx-plancard-div-268"
                                      className="h-1.5 w-1.5 rounded-full bg-[#2D5BFF]"
                                    />
                                  </div>
                                  <p
                                    data-cy="planning-and-reporting-components-cards-plancard-tsx-plancard-p-270"
                                    className="line-clamp-2 text-sm font-medium text-[#161A2C] md:text-base"
                                  >
                                    {keyResult.title || keyResult.name}
                                  </p>
                                </div>
                              )}

                            <div
                              className={`flex flex-col gap-0 ${keyResult.metricType?.name && keyResult.metricType.name !== 'Milestone' ? 'pt-1' : ''}`}
                              data-cy="planningandreporting-planning-and-reporting-components-cards-plancard-tsx-div-359"
                            >
                              {keyResult.tasks.map((task, index) => (
                                <TaskRow
                                  key={task.id}
                                  task={task}
                                  viewMode={viewMode}
                                  isLast={index === keyResult.tasks.length - 1}
                                  metricType={keyResult.metricType?.name}
                                />
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Parent Tasks (grouped tasks under key result) */}
                        {keyResult.parentTask &&
                          keyResult.parentTask.map((parentTask: any) => {
                            const parentTaskName =
                              parentTask.task ||
                              parentTask.title ||
                              parentTask.name;
                            const krTitle = keyResult.title || keyResult.name;
                            const isRedundant = parentTaskName === krTitle;

                            return (
                              <div
                                data-cy="planning-and-reporting-components-cards-plancard-tsx-plancard-div-304"
                                key={parentTask.id}
                                className="relative mb-4"
                              >
                                {/* Parent Task Header - skip if same as KR title */}
                                {!isRedundant && (
                                  <div
                                    data-cy="planning-and-reporting-components-cards-plancard-tsx-plancard-div-307"
                                    className="flex items-center gap-3 mb-1 relative z-10"
                                  >
                                    <div
                                      data-cy="planning-and-reporting-components-cards-plancard-tsx-plancard-div-308"
                                      className="flex items-center justify-center w-4 h-4 rounded-full bg-[#E8EDFF] flex-shrink-0"
                                    >
                                      <div
                                        data-cy="planning-and-reporting-components-cards-plancard-tsx-plancard-div-309"
                                        className="w-1.5 h-1.5 rounded-full bg-[#2D5BFF]"
                                      />
                                    </div>
                                    <p
                                      data-cy="planning-and-reporting-components-cards-plancard-tsx-plancard-p-311"
                                      className="text-sm md:text-base font-medium text-[#161A2C] line-clamp-2"
                                    >
                                      {parentTaskName}
                                    </p>
                                  </div>
                                )}

                                {/* Vertical line connecting Parent Task to Sub-tasks */}
                                {parentTask.tasks &&
                                  parentTask.tasks.length > 0 && (
                                    <div
                                      className={`absolute left-[7px] ${isRedundant ? 'top-0' : 'top-5'} bottom-4 w-[1px] bg-[#E0E0E0]`}
                                      data-cy="planningandreporting-planning-and-reporting-components-cards-plancard-tsx-div-415"
                                    />
                                  )}

                                {/* Sub-tasks under Parent Task */}
                                <div
                                  className={`flex flex-col gap-0 ${isRedundant ? 'pt-0' : 'pt-1'}`}
                                  data-cy="planningandreporting-planning-and-reporting-components-cards-plancard-tsx-div-421"
                                >
                                  {parentTask.tasks &&
                                    parentTask.tasks.map(
                                      (task: any, index: number) => (
                                        <TaskRow
                                          key={task.id}
                                          task={task}
                                          viewMode={viewMode}
                                          isLast={
                                            index ===
                                            parentTask.tasks.length - 1
                                          }
                                          metricType={
                                            keyResult.metricType?.name
                                          }
                                        />
                                      ),
                                    )}
                                </div>
                              </div>
                            );
                          })}

                        {/* Milestones */}
                        {keyResult.milestones &&
                          keyResult.milestones.map((milestone) => (
                            <div
                              data-cy="planning-and-reporting-components-cards-plancard-tsx-plancard-div-346"
                              key={milestone.id}
                              className="relative mb-4"
                            >
                              {/* Milestone Header */}
                              <div
                                data-cy="planning-and-reporting-components-cards-plancard-tsx-plancard-div-348"
                                className="flex items-center gap-3 mb-1 relative z-10"
                              >
                                <div
                                  data-cy="planning-and-reporting-components-cards-plancard-tsx-plancard-div-349"
                                  className="flex items-center justify-center w-4 h-4 rounded-full bg-[#E8EDFF] flex-shrink-0"
                                >
                                  <div
                                    data-cy="planning-and-reporting-components-cards-plancard-tsx-plancard-div-350"
                                    className="w-1.5 h-1.5 rounded-full bg-[#2D5BFF]"
                                  />
                                </div>
                                <p
                                  data-cy="planning-and-reporting-components-cards-plancard-tsx-plancard-p-352"
                                  className="text-sm md:text-base font-medium text-[#161A2C] line-clamp-2"
                                >
                                  {milestone.title || milestone.name}
                                </p>
                              </div>

                              {/* Vertical line connecting Milestone to Tasks/ParentTasks */}
                              {((milestone.tasks &&
                                milestone.tasks.length > 0) ||
                                (milestone.parentTask &&
                                  milestone.parentTask.length > 0)) && (
                                <div
                                  data-cy="planning-and-reporting-components-cards-plancard-tsx-plancard-div-361"
                                  className="absolute left-[7px] top-5 bottom-4 w-[1px] bg-[#E0E0E0]"
                                />
                              )}

                              {/* Milestone Tasks */}
                              <div
                                data-cy="planning-and-reporting-components-cards-plancard-tsx-plancard-div-365"
                                className="flex flex-col gap-0 pt-1"
                              >
                                {milestone.tasks &&
                                  milestone.tasks.map(
                                    (task: any, index: number) => (
                                      <TaskRow
                                        key={task.id}
                                        task={task}
                                        viewMode={viewMode}
                                        isLast={
                                          index === milestone.tasks.length - 1
                                        }
                                        metricType={keyResult.metricType?.name}
                                      />
                                    ),
                                  )}
                              </div>

                              {/* Parent Tasks within Milestone */}
                              {milestone.parentTask &&
                                milestone.parentTask.map((parentTask: any) => {
                                  const parentTaskName =
                                    parentTask.task ||
                                    parentTask.title ||
                                    parentTask.name;
                                  const milestoneName =
                                    milestone.title || milestone.name;
                                  const isRedundant =
                                    parentTaskName === milestoneName;

                                  return (
                                    <div
                                      key={parentTask.id}
                                      className={`relative ${isRedundant ? 'mt-0' : 'mt-4'}`}
                                      data-cy="planningandreporting-planning-and-reporting-components-cards-plancard-tsx-div-508"
                                    >
                                      {/* Parent Task Header - skip if name matches milestone title */}
                                      {!isRedundant && (
                                        <div
                                          data-cy="planning-and-reporting-components-cards-plancard-tsx-plancard-div-396"
                                          className="flex items-center gap-3 mb-1 relative z-10"
                                        >
                                          <div
                                            data-cy="planning-and-reporting-components-cards-plancard-tsx-plancard-div-397"
                                            className="flex items-center justify-center w-4 h-4 rounded-full bg-[#E8EDFF] flex-shrink-0"
                                          >
                                            <div
                                              data-cy="planning-and-reporting-components-cards-plancard-tsx-plancard-div-398"
                                              className="w-1.5 h-1.5 rounded-full bg-[#2D5BFF]"
                                            />
                                          </div>
                                          <p
                                            data-cy="planning-and-reporting-components-cards-plancard-tsx-plancard-p-400"
                                            className="text-sm md:text-base font-medium text-[#161A2C] line-clamp-2"
                                          >
                                            {parentTaskName}
                                          </p>
                                        </div>
                                      )}

                                      {/* Vertical line connecting Parent Task to Sub-tasks */}
                                      {parentTask.tasks &&
                                        parentTask.tasks.length > 0 && (
                                          <div
                                            className={`absolute left-[7px] ${isRedundant ? 'top-0' : 'top-5'} bottom-4 w-[1px] bg-[#E0E0E0]`}
                                            data-cy="planningandreporting-planning-and-reporting-components-cards-plancard-tsx-div-539"
                                          />
                                        )}

                                      {/* Sub-tasks under Parent Task */}
                                      <div
                                        className={`flex flex-col gap-0 ${isRedundant ? 'pt-0' : 'pt-1'}`}
                                        data-cy="planningandreporting-planning-and-reporting-components-cards-plancard-tsx-div-545"
                                      >
                                        {parentTask.tasks &&
                                          parentTask.tasks.map(
                                            (task: any, index: number) => (
                                              <TaskRow
                                                key={task.id}
                                                task={task}
                                                viewMode={viewMode}
                                                isLast={
                                                  index ===
                                                  parentTask.tasks.length - 1
                                                }
                                                metricType={
                                                  keyResult.metricType?.name
                                                }
                                              />
                                            ),
                                          )}
                                      </div>
                                    </div>
                                  );
                                })}
                            </div>
                          ))}
                      </div>
                    </div>
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
        ))
      ) : (
        /* Fallback to flat tasks if no key results */
        <div
          data-cy="planning-and-reporting-components-cards-plancard-tsx-plancard-div-444"
          className="rounded-lg border bg-white px-4 pb-6 pt-6 md:px-6"
          style={{ borderColor: PR_BORDER }}
        >
          <div
            data-cy="planning-and-reporting-components-cards-plancard-tsx-plancard-div-445"
            className="pl-2"
          >
            <div
              data-cy="planning-and-reporting-components-cards-plancard-tsx-plancard-div-446"
              className="mb-5 px-0 py-1 md:py-2"
            >
              <KRSummaryBar plan={plan} viewMode={viewMode} />
            </div>

            <div
              data-cy="planning-and-reporting-components-cards-plancard-tsx-plancard-div-450"
              className="relative"
            >
              <div
                data-cy="planning-and-reporting-components-cards-plancard-tsx-plancard-div-451"
                className="mb-6 flex items-start gap-3"
              >
                <div
                  className="flex w-8 shrink-0 justify-center"
                  data-cy="planning-reporting-plancard-fallback-objective-wrap"
                >
                  <ObjectiveBullseyeIcon dataCy="planning-reporting-plancard-fallback-objective-icon" />
                </div>
                <p
                  data-cy="planning-and-reporting-components-cards-plancard-tsx-plancard-p-456"
                  className="text-sm font-bold leading-snug text-[#161A2C] line-clamp-3 md:text-base"
                >
                  {plan.summary}
                </p>
              </div>

              <div
                data-cy="planning-and-reporting-components-cards-plancard-tsx-plancard-div-461"
                className="flex flex-col gap-0"
              >
                {plan.tasks.map((task, index) => (
                  <TaskRow
                    key={task.id}
                    task={task}
                    viewMode={viewMode}
                    isLast={index === plan.tasks.length - 1}
                    metricType={plan.milestoneLabel}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <div
        data-cy="planning-and-reporting-components-cards-plancard-tsx-plancard-div-477"
        className="mt-4"
      >
        <CommentsSection
          commentCount={plan.commentCount}
          commentAvatars={plan.commentAvatars}
          planId={plan.id}
          isPlanCard={viewMode === 'planning'}
          comments={plan.comments}
          achieved={totalAchieved}
        />
      </div>
    </article>
  );
}
