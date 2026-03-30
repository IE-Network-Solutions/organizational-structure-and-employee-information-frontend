import React from 'react';
import { Button, Dropdown, MenuProps, Modal, Tooltip } from 'antd';
import { DeleteOutlined, MoreOutlined } from '@ant-design/icons';
import { FaBomb, FaRegThumbsUp } from 'react-icons/fa';
import { AiOutlineEdit } from 'react-icons/ai';
import { IoCheckmarkSharp, IoOpen } from 'react-icons/io5';
import { PlanSummary, ViewMode, Cadence, KeyResult, PlanTask } from '../types';
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
import { PlanningVpnKeyIcon } from '../PlanningVpnKeyIcon';

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

/** Task display string for matching API `task` vs transformed `title`. */
function planTaskTitleNorm(task: PlanTask | Record<string, unknown>): string {
  const t = task as Record<string, unknown>;
  return String(t.title ?? t.task ?? t.taskName ?? t.name ?? '').trim();
}

/** Flatten plan tasks under a key result; drop rows that duplicate KR / parent / milestone titles. */
function collectTasksUnderKeyResult(keyResult: KeyResult): PlanTask[] {
  const krTitleNorm = (keyResult.title || keyResult.name || '').trim();
  const out: PlanTask[] = [];

  (keyResult.parentTask || []).forEach((pt: Record<string, unknown>) => {
    const pNorm = String(pt.task ?? pt.title ?? pt.name ?? '').trim();
    const kids = (pt.tasks as PlanTask[] | undefined) || [];
    kids.forEach((task) => {
      const t = planTaskTitleNorm(task);
      if (!t || t === krTitleNorm) return;
      if (pNorm && t === pNorm) return;
      out.push(task);
    });
  });

  (keyResult.tasks || []).forEach((task) => {
    const t = planTaskTitleNorm(task);
    if (t && t !== krTitleNorm) out.push(task);
  });

  (keyResult.milestones || []).forEach((milestone) => {
    const mTitleNorm = (milestone.title || milestone.name || '').trim();
    (milestone.tasks || []).forEach((task) => {
      const t = planTaskTitleNorm(task);
      if (!t || t === krTitleNorm) return;
      if (mTitleNorm && t === mTitleNorm) return;
      out.push(task);
    });
    (milestone.parentTask || []).forEach((pt: Record<string, unknown>) => {
      const pNorm = String(pt.task ?? pt.title ?? pt.name ?? '').trim();
      const kids = (pt.tasks as PlanTask[] | undefined) || [];
      kids.forEach((task) => {
        const t = planTaskTitleNorm(task);
        if (!t || t === krTitleNorm) return;
        if (mTitleNorm && t === mTitleNorm) return;
        if (pNorm && t === pNorm) return;
        out.push(task);
      });
    });
  });

  const seen = new Set<string>();
  return out.filter((task) => {
    const id = String(task.id ?? '');
    if (!id) return true;
    if (seen.has(id)) return false;
    seen.add(id);
    return true;
  });
}

interface PlanCardProps {
  plan: PlanSummary;
  viewMode: ViewMode;
  activeCadence: Cadence;
  // Optional action handlers
  onApprove?: () => void;
  onOpen?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  canApprove?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
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
  onDelete,
  canApprove = false,
  canEdit = false,
  canDelete = false,
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

  const deleteMenuItems: MenuProps['items'] = [
    {
      key: 'delete',
      id: `plan-card-delete-menu-item-${plan.id}`,
      'data-cy': `plan-card-delete-menu-item-${plan.id}`,
      icon: <DeleteOutlined className="text-[14px] text-[#DC2626]" />,
      label: <span className="text-[#161A2C]">Delete</span>,
      onClick: () => {
        Modal.confirm({
          title: 'Delete plan?',
          content: 'Are you sure you want to delete this plan?',
          okText: 'Yes',
          cancelText: 'No',
          onOk: () => onDelete?.(),
        });
      },
    },
  ];

  // For Approved/Closed plans, keep the dropdown options consistent with what handlers
  // the parent provides (prevents missing Edit/Delete due to canEdit/canDelete mismatch).
  const approvedMenuItems: MenuProps['items'] = [
    ...(onEdit ? editMenuItems : []),
    ...(onDelete ? deleteMenuItems : []),
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

  /** Dedupe key results (by id, or objective + title if id missing), then group by objective. */
  const keyResultDisplayGroups = React.useMemo(() => {
    const raw = plan.keyResults || [];
    const seenKeys = new Set<string>();
    const deduped: KeyResult[] = [];
    for (const kr of raw) {
      const titleNorm = (kr.title || kr.name || '').trim().toLowerCase();
      const objId =
        kr.objective?.id != null && String(kr.objective.id).length > 0
          ? String(kr.objective.id)
          : '';
      const dedupeKey = kr.id
        ? `id:${kr.id}`
        : `syn:${objId}:${titleNorm.slice(0, 240)}`;
      if (seenKeys.has(dedupeKey)) continue;
      seenKeys.add(dedupeKey);
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
      className="mb-4 rounded-lg border bg-white p-4 shadow-none md:p-6"
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
              className="flex flex-row flex-nowrap items-center gap-1"
            >
              {canApprove && plan.status?.label === 'Open' && (
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
              {plan.status?.label === 'Closed' && (onEdit || onDelete) && (
                <Dropdown
                  menu={{ items: approvedMenuItems }}
                  trigger={['click']}
                  placement="bottomRight"
                  popupClassName="planning-reporting-context-dropdown"
                >
                  <Button
                    id={`plan-card-edit-delete-dropdown-button-${plan.id}`}
                    data-cy={`plan-card-edit-delete-dropdown-button-${plan.id}`}
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
            className={gi > 0 ? 'mt-6 pt-6' : ''}
          >
            <div
              data-cy="planning-and-reporting-components-cards-plancard-tsx-plancard-div-224"
              className="pl-0 md:pl-2"
            >
              {krGroup.length === 1 ? (
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
              ) : null}

              {objectiveTitle(krGroup[0].objective) ? (
                <div
                  data-cy="planning-reporting-plancard-objective-row"
                  className="relative z-[2] mb-4 flex items-start gap-3"
                >
                  <div
                    className="flex w-8 shrink-0 flex-col items-center"
                    data-cy="planning-reporting-plancard-objective-icon-col"
                  >
                    <ObjectiveBullseyeIcon dataCy="planning-reporting-plancard-objective-icon" />
                    <div
                      className="mt-2 h-4 w-px shrink-0 rounded-full md:h-5"
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

              <div
                data-cy="planning-reporting-plancard-kr-group-body"
                className={objectiveTitle(krGroup[0].objective) ? 'pl-11' : ''}
              >
                {krGroup.map((keyResult, kri) => {
                  const tasksUnderKr = collectTasksUnderKeyResult(keyResult);
                  const hasTasks = tasksUnderKr.length > 0;
                  const krStableKey = keyResult.id
                    ? String(keyResult.id)
                    : `kr-${gi}-${kri}-${(keyResult.title || keyResult.name || '').slice(0, 24)}`;

                  return (
                    <React.Fragment key={krStableKey}>
                      {kri > 0 ? (
                        <div
                          data-cy="planning-reporting-plancard-kr-separator"
                          className="mt-5 pt-5"
                        />
                      ) : null}
                      {krGroup.length > 1 ? (
                        <div
                          data-cy="planning-reporting-plancard-kr-metrics"
                          className="mb-5 px-0 py-1 md:py-2"
                        >
                          <KRSummaryBar
                            plan={plan}
                            viewMode={viewMode}
                            keyResult={keyResult}
                          />
                        </div>
                      ) : null}
                      <div
                        data-cy="planning-reporting-plancard-kr-tree"
                        className="relative mb-2"
                      >
                        {/* Key result — VPN key row */}
                        <div
                          data-cy="planning-reporting-plancard-kr-vpn-row"
                          className="relative z-[2] mb-2 flex items-start gap-3"
                        >
                          <div
                            className="relative mt-0.5 flex w-8 shrink-0 items-center justify-center"
                            data-cy="planning-reporting-plancard-kr-icon-wrap"
                          >
                            <PlanningVpnKeyIcon
                              data-cy="planning-reporting-plancard-kr-icon"
                              className="relative z-10 shrink-0"
                              size={18}
                              color={PR_PRIMARY}
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
                              {keyResult.title ||
                                keyResult.name ||
                                plan.summary}
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

                        {hasTasks ? (
                          <div
                            data-cy="planning-reporting-plancard-kr-tree-content"
                            className="relative z-[1] pl-11"
                          >
                            <div
                              className="pointer-events-none absolute bottom-0 left-[7px] top-[-8px] z-0 w-px bg-[#D1D5DB]"
                              aria-hidden
                              data-cy="planning-reporting-plancard-kr-task-trunk"
                            />
                            <div
                              data-cy="planning-reporting-plancard-kr-task-list"
                              className="relative flex flex-col gap-0 pt-0"
                            >
                              {tasksUnderKr.map((task, index) => (
                                <TaskRow
                                  key={task.id}
                                  task={task}
                                  viewMode={viewMode}
                                  isLast={index === tasksUnderKr.length - 1}
                                  metricType={keyResult.metricType?.name}
                                />
                              ))}
                            </div>
                          </div>
                        ) : null}
                      </div>
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          </div>
        ))
      ) : (
        /* Fallback to flat tasks if no key results */
        <div
          data-cy="planning-and-reporting-components-cards-plancard-tsx-plancard-div-444"
          className="px-0 pb-2 pt-0 md:px-2"
        >
          <div
            data-cy="planning-and-reporting-components-cards-plancard-tsx-plancard-div-445"
            className="pl-0 md:pl-2"
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
