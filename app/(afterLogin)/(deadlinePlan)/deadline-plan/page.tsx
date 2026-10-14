'use client';
import React, { useMemo } from 'react';
import dayjs from 'dayjs';
import CustomBreadcrumb from '@/components/common/breadCramp';
import { DeadlineTaskSearchFilter } from '@/store/server/features/deadlinePlan/interface';
import { useDeadlinePlanStore } from '@/store/uistate/features/deadlinePlan/useStore';
import GroupedView from './_components/GroupedView';
import KeyResultPanel from './_components/KeyResultPanel';
import ListView from './_components/ListView';
import ReportTaskModal from './_components/ReportTaskModal';
import ApproveTaskModal from './_components/ApproveTaskModal';
import TaskFormModal from './_components/TaskFormModal';
import Toolbar from './_components/Toolbar';
import { useDeadlinePeople } from './_components/useDeadlinePeople';
import { pinFirst, resolveDurationRange } from './_components/utils';

function DeadlinePlanPage() {
  const {
    userId,
    viewer,
    subordinateIds,
    selectablePeople,
    departmentOptions,
    getPerson,
    getDepartmentMemberIds,
  } = useDeadlinePeople();

  const { viewMode, duration, historyRange, department, status, assigneeIds } =
    useDeadlinePlanStore();

  /** People the picker offers: everyone in scope, narrowed by department. */
  const peopleInScope = useMemo(() => {
    if (department === 'all') return selectablePeople;
    const memberIds = new Set(getDepartmentMemberIds(department));
    return selectablePeople.filter((person) => memberIds.has(person.id));
  }, [department, selectablePeople, getDepartmentMemberIds]);

  const selectedAssigneeIds = useMemo(() => {
    const scopeIds = new Set(peopleInScope.map((person) => person.id));
    const selected = (
      assigneeIds ?? (userId ? [userId, ...subordinateIds] : [])
    ).filter((id) => scopeIds.has(id));
    return pinFirst(selected, userId);
  }, [assigneeIds, peopleInScope, userId, subordinateIds]);

  const today = dayjs().format('YYYY-MM-DD');
  const baseFilter = useMemo<
    Omit<DeadlineTaskSearchFilter, 'assigneeIds'>
  >(() => {
    const range = resolveDurationRange(duration, dayjs(today), historyRange);
    return {
      from: range.from,
      to: range.to,
      includeOverdue: range.includeOverdue,
      // History is the archive of reported and manager-closed tasks.
      status: duration === 'history' ? 'reported' : status,
    };
  }, [duration, historyRange, status, today]);

  const listFilter = useMemo<DeadlineTaskSearchFilter>(
    () => ({ ...baseFilter, assigneeIds: selectedAssigneeIds }),
    [baseFilter, selectedAssigneeIds],
  );

  return (
    <div
      data-cy="deadline-plan-page"
      className="h-auto w-full min-w-0 max-w-full rounded-md bg-white"
    >
      <CustomBreadcrumb
        title="Deadline Plan"
        subtitle="Plan work against flexible deadlines and report on it."
        isRecognition
      />

      {/* Keep the key-result panel beside the date-grouped task workspace. */}
      <div
        data-cy="deadline-plan-main"
        className="grid w-full min-w-0 max-w-full grid-cols-1 gap-x-6 gap-y-4 p-0 sm:p-4 lg:grid-cols-[auto_minmax(0,1fr)]"
      >
        <KeyResultPanel
          userId={userId}
          ownerIds={selectedAssigneeIds}
          filter={listFilter}
          getPerson={getPerson}
        />

        <Toolbar
          className="order-first lg:order-none lg:col-start-2 lg:row-start-1"
          userId={userId}
          people={selectablePeople}
          departmentOptions={departmentOptions}
          selectedAssigneeIds={selectedAssigneeIds}
          directReportIds={subordinateIds}
          getDepartmentMemberIds={getDepartmentMemberIds}
          filter={listFilter}
        />

        <div
          data-cy="deadline-plan-content"
          className="min-w-0 lg:col-start-2 lg:row-start-2"
        >
          {viewMode === 'list' ? (
            <ListView
              filter={listFilter}
              viewer={viewer}
              getPerson={getPerson}
            />
          ) : (
            <GroupedView
              assigneeIds={selectedAssigneeIds}
              filter={baseFilter}
              viewer={viewer}
              getPerson={getPerson}
            />
          )}
        </div>
      </div>
      <TaskFormModal userId={userId} people={selectablePeople} />
      <ReportTaskModal />
      <ApproveTaskModal />
    </div>
  );
}

export default DeadlinePlanPage;
