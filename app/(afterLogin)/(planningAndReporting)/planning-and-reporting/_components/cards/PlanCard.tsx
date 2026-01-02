import React from 'react';
import { Button, Dropdown, Menu, Tooltip } from 'antd';
import { MoreOutlined } from '@ant-design/icons';
import { BsKey } from 'react-icons/bs';
import { FaBomb, FaRegThumbsUp } from 'react-icons/fa';
import { AiOutlineEdit } from 'react-icons/ai';
import { IoCheckmarkSharp, IoOpen } from 'react-icons/io5';
import dayjs from 'dayjs';
import { PlanSummary, ViewMode, Cadence } from '../types';
import UserInfo from '../UserInfo';
import StatusBadge from '../StatusBadge';
import KRSummaryBar from '../KRSummaryBar';
import TaskRow from '../TaskRow';
import CommentsSection from '../comments/CommentsSection';

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
  // Approval menu (for managers)
  const approvalMenu = (
    <Menu>
      {plan.status?.label === 'Open' ? (
        <Menu.Item
          key="approve"
          id={`plan-card-approve-menu-item-${plan.id}`}
          data-cy={`plan-card-approve-menu-item-${plan.id}`}
          icon={<IoCheckmarkSharp />}
          onClick={onApprove}
          className="text-green-500"
        >
          <Tooltip title={isApprovalLoading ? 'Processing approval...' : "Approve Plan! Once you approve, you can't edit"}>
            Approve
          </Tooltip>
        </Menu.Item>
      ) : (
        <Menu.Item
          key="open"
          id={`plan-card-open-menu-item-${plan.id}`}
          data-cy={`plan-card-open-menu-item-${plan.id}`}
          icon={<IoOpen size={16} />}
          onClick={onOpen}
          className="text-red-400"
        >
          <Tooltip title="Open approved Plan">Open</Tooltip>
        </Menu.Item>
      )}
    </Menu>
  );

  // Edit menu (for plan owner)
  const editMenu = (
    <Menu>
      <Menu.Item 
        key="edit" 
        id={`plan-card-edit-menu-item-${plan.id}`}
        data-cy={`plan-card-edit-menu-item-${plan.id}`}
        icon={<AiOutlineEdit size={16} />} 
        onClick={onEdit}
      >
        <Tooltip title="Edit Plan">
          <span>Edit</span>
        </Tooltip>
      </Menu.Item>
    </Menu>
  );

  const getDateLabel = () => {
    if (dateLabel) return dateLabel;

    const planDate = dayjs(plan.createdAt);
    const today = dayjs();
    const yesterday = dayjs().subtract(1, 'day');
    const cadenceType = activeCadence.charAt(0).toUpperCase() + activeCadence.slice(1);
    const type = viewMode === 'planning' ? 'Plan' : 'Report';

    if (planDate.isSame(today, 'day')) {
      return `Today's ${cadenceType} ${type}`;
    }
    if (planDate.isSame(yesterday, 'day')) {
      return `Yesterday's ${cadenceType} ${type}`;
    }
    return `${planDate.format('MMM D')} ${cadenceType} ${type}`;
  };

  // Calculate total achieved points for the plan (sum of weights of completed tasks)
  const totalAchieved = React.useMemo(() => {
    if (viewMode !== 'reporting') return 0;

    let total = 0;

    // Helper to sum task weights
    const sumTasks = (tasks: any[]) => {
      tasks.forEach(task => {
        const isCompleted = task.status === 'completed' || task.status === 'Done' || task.isAchieved === true;
        if (isCompleted) {
          total += Number(task.weight) || 0;
        }
      });
    };

    if (plan.keyResults && plan.keyResults.length > 0) {
      plan.keyResults.forEach(kr => {
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

  return (
    <article className="rounded-3xl border border-gray-300 bg-white p-3 md:p-6 mb-4">
      {/* Header with Title and Reprimand/Appreciation Badges */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs md:text-base font-bold text-[#8F94A3]">{getDateLabel()}</h3>
        <div className="flex items-center gap-2">
          {plan.reprimandCount && plan.reprimandCount > 0 ? (
            <div className="flex items-center gap-1.5 rounded-lg bg-[#EF4444] px-3 py-1 text-white shadow-sm">
              <span className="font-bold text-sm">{plan.reprimandCount}</span>
              <FaBomb className="text-sm" />
            </div>
          ) : null}
          {plan.appreciationCount && plan.appreciationCount > 0 ? (
            <div className="flex items-center gap-1.5 rounded-lg bg-[#10B981] px-3 py-1 text-white shadow-sm">
              <span className="font-bold text-sm">{plan.appreciationCount}</span>
              <FaRegThumbsUp className="text-sm" />
            </div>
          ) : null}
        </div>
      </div>

      <div className="flex flex-nowrap items-center justify-between gap-2 md:gap-4 mb-4 px-1 min-w-0">
        <UserInfo owner={plan.owner} notificationCount={plan.notificationCount} />
        <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
          {plan.status && <StatusBadge status={plan.status} />}
          {canApprove && (
            <Dropdown overlay={approvalMenu} trigger={['click']}>
              <Button
                id={`plan-card-approve-dropdown-button-${plan.id}`}
                data-cy={`plan-card-approve-dropdown-button-${plan.id}`}
                loading={isApprovalLoading}
                type="text"
                icon={<MoreOutlined />}
                className="text-green-600 hover:bg-transparent !p-0 !h-auto !w-auto text-base md:text-xl"
                style={{ minWidth: 'auto' }}
              />
            </Dropdown>
          )}
          {canEdit && plan.status?.label === 'Open' && (
            <Dropdown overlay={editMenu} trigger={['click']}>
              <Button
                id={`plan-card-edit-dropdown-button-${plan.id}`}
                data-cy={`plan-card-edit-dropdown-button-${plan.id}`}
                type="text"
                icon={<MoreOutlined />}
                className="text-[#8F94A3] hover:bg-transparent !p-0 !h-auto !w-auto text-base md:text-xl"
                style={{ minWidth: 'auto' }}
              />
            </Dropdown>
          )}
        </div>
      </div>

      {/* Display Key Results - each in its own separate container */}
      {plan.keyResults && plan.keyResults.length > 0 ? (
        plan.keyResults.map((keyResult, krIndex) => (
          <div key={keyResult.id} className={krIndex > 0 ? "mt-4" : ""}>
            <div className="rounded-xl border border-[#F1F2F6] bg-white pt-6 pb-6 px-4 md:px-6">
              <div className="pl-0 md:pl-2">
                {/* Key Result Summary Bar */}
                <div className="mb-4 hidden md:block">
                  <KRSummaryBar plan={plan} viewMode={viewMode} keyResult={keyResult} />
                </div>

                {/* Key Result Header */}
                <div className="flex items-start gap-3 mb-4 ">
                  <BsKey size={24} className="text-[#574CFF] flex-shrink-0 mt-0.5" />
                  <p className="text-sm md:text-lg font-bold leading-tight text-[#161A2C] line-clamp-2">
                    {keyResult.title || keyResult.name || plan.summary}
                  </p>
                </div>

                {/* Key Result Tasks (directly under key result) - Show with grouping if metric is not Milestone */}
                {keyResult.tasks && keyResult.tasks.length > 0 && (
                  <div className="relative mb-4">
                    {/* Show grouping header for non-milestone metrics */}
                    {keyResult.metricType?.name && keyResult.metricType.name !== 'Milestone' && (
                      <>
                        <div className="flex items-center gap-3 mb-1 relative z-10">
                          <div className="flex items-center justify-center w-4 h-4 rounded-full bg-[#E0E7FF] flex-shrink-0">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#574CFF]" />
                          </div>
                          <p className="text-sm md:text-base font-medium text-[#161A2C] line-clamp-2">
                            {keyResult.title || keyResult.name}
                          </p>
                        </div>
                        {/* Vertical line */}
                        <div className="absolute left-[7px] top-5 bottom-4 w-[1px] bg-[#E5E7EB]" />
                      </>
                    )}

                    <div className={`flex flex-col gap-0 ${keyResult.metricType?.name && keyResult.metricType.name !== 'Milestone' ? 'pt-1' : ''}`}>
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
                {keyResult.parentTask && keyResult.parentTask.map((parentTask: any) => {
                  const parentTaskName = parentTask.task || parentTask.title || parentTask.name;
                  const krTitle = keyResult.title || keyResult.name;
                  const isRedundant = parentTaskName === krTitle;

                  return (
                    <div key={parentTask.id} className="relative mb-4">
                      {/* Parent Task Header - skip if same as KR title */}
                      {!isRedundant && (
                        <div className="flex items-center gap-3 mb-1 relative z-10">
                          <div className="flex items-center justify-center w-4 h-4 rounded-full bg-[#E0E7FF] flex-shrink-0">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#574CFF]" />
                          </div>
                          <p className="text-sm md:text-base font-medium text-[#161A2C] line-clamp-2">
                            {parentTaskName}
                          </p>
                        </div>
                      )}

                      {/* Vertical line connecting Parent Task to Sub-tasks */}
                      {parentTask.tasks && parentTask.tasks.length > 0 && (
                        <div className={`absolute left-[7px] ${isRedundant ? 'top-0' : 'top-5'} bottom-4 w-[1px] bg-[#E5E7EB]`} />
                      )}

                      {/* Sub-tasks under Parent Task */}
                      <div className={`flex flex-col gap-0 ${isRedundant ? 'pt-0' : 'pt-1'}`}>
                        {parentTask.tasks && parentTask.tasks.map((task: any, index: number) => (
                          <TaskRow
                            key={task.id}
                            task={task}
                            viewMode={viewMode}
                            isLast={index === parentTask.tasks.length - 1}
                            metricType={keyResult.metricType?.name}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}

                {/* Milestones */}
                {keyResult.milestones && keyResult.milestones.map((milestone) => (
                  <div key={milestone.id} className="relative mb-4">
                    {/* Milestone Header */}
                    <div className="flex items-center gap-3 mb-1 relative z-10">
                      <div className="flex items-center justify-center w-4 h-4 rounded-full bg-[#E0E7FF] flex-shrink-0">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#574CFF]" />
                      </div>
                      <p className="text-sm md:text-base font-medium text-[#161A2C] line-clamp-2">
                        {milestone.title || milestone.name}
                      </p>
                    </div>

                    {/* Vertical line connecting Milestone to Tasks/ParentTasks */}
                    {((milestone.tasks && milestone.tasks.length > 0) || (milestone.parentTask && milestone.parentTask.length > 0)) && (
                      <div className="absolute left-[7px] top-5 bottom-4 w-[1px] bg-[#E5E7EB]" />
                    )}

                    {/* Milestone Tasks */}
                    <div className="flex flex-col gap-0 pt-1">
                      {milestone.tasks && milestone.tasks.map((task: any, index: number) => (
                        <TaskRow
                          key={task.id}
                          task={task}
                          viewMode={viewMode}
                          isLast={index === milestone.tasks.length - 1}
                          metricType={keyResult.metricType?.name}
                        />
                      ))}
                    </div>

                    {/* Parent Tasks within Milestone */}
                    {milestone.parentTask && milestone.parentTask.map((parentTask: any) => {
                      const parentTaskName = parentTask.task || parentTask.title || parentTask.name;
                      const milestoneName = milestone.title || milestone.name;
                      const isRedundant = parentTaskName === milestoneName;

                      return (
                        <div key={parentTask.id} className={`relative ${isRedundant ? 'mt-0' : 'mt-4'}`}>
                          {/* Parent Task Header - skip if name matches milestone title */}
                          {!isRedundant && (
                            <div className="flex items-center gap-3 mb-1 relative z-10">
                              <div className="flex items-center justify-center w-4 h-4 rounded-full bg-[#E0E7FF] flex-shrink-0">
                                <div className="w-1.5 h-1.5 rounded-full bg-[#574CFF]" />
                              </div>
                              <p className="text-sm md:text-base font-medium text-[#161A2C] line-clamp-2">
                                {parentTaskName}
                              </p>
                            </div>
                          )}

                          {/* Vertical line connecting Parent Task to Sub-tasks */}
                          {parentTask.tasks && parentTask.tasks.length > 0 && (
                            <div className={`absolute left-[7px] ${isRedundant ? 'top-0' : 'top-5'} bottom-4 w-[1px] bg-[#E5E7EB]`} />
                          )}

                          {/* Sub-tasks under Parent Task */}
                          <div className={`flex flex-col gap-0 ${isRedundant ? 'pt-0' : 'pt-1'}`}>
                            {parentTask.tasks && parentTask.tasks.map((task: any, index: number) => (
                              <TaskRow
                                key={task.id}
                                task={task}
                                viewMode={viewMode}
                                isLast={index === parentTask.tasks.length - 1}
                                metricType={keyResult.metricType?.name}
                              />
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))
      ) : (
        /* Fallback to flat tasks if no key results */
        <div className="rounded-xl border border-[#F1F2F6] bg-white pt-6 pb-6 px-4 md:px-6">
          <div className="pl-2">
            <div className="mb-4 hidden md:block">
              <KRSummaryBar plan={plan} viewMode={viewMode} />
            </div>

            <div className="relative">
              <div className="flex items-start gap-3 mb-6">
                <BsKey size={24} className="text-[#574CFF] flex-shrink-0 mt-0.5" />
                <p className="text-sm md:text-lg font-bold leading-tight text-[#161A2C] line-clamp-2">
                  {plan.summary}
                </p>
              </div>

              <div className="flex flex-col gap-0">
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

      <div className="mt-4">
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
