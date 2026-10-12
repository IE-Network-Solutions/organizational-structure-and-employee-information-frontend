'use client';
import React, { useCallback, useEffect, useMemo } from 'react';
import dayjs from 'dayjs';
import CustomBreadcrumb from '@/components/common/breadCramp';
import { DeadlineTaskSearchFilter } from '@/store/server/features/deadlinePlan/interface';
import { useDeadlinePlanStore } from '@/store/uistate/features/deadlinePlan/useStore';
import GroupedView from './_components/GroupedView';
import KeyResultPanel from './_components/KeyResultPanel';
import ListView from './_components/ListView';
import ReportTaskModal from './_components/ReportTaskModal';
import TaskFormModal from './_components/TaskFormModal';
import Toolbar from './_components/Toolbar';
import { useDeadlinePeople } from './_components/useDeadlinePeople';
import { pinFirst, resolveDurationRange } from './_components/utils';

function DeadlinePlanPage() {
  const {
    userId,
    isLoading: isPeopleLoading,
    viewer,
    subordinateIds,
    selectablePeople,
    departmentOptions,
    getPerson,
    getDepartmentMemberIds,
  } = useDeadlinePeople();

  const {
    viewMode,
    duration,
    historyRange,
    department,
    status,
    assigneeIds,
    setDepartment,
    setAssigneeIds,
  } = useDeadlinePlanStore();

  // Default scope: the user and their direct reports.
  useEffect(() => {
    if (assigneeIds === null && userId && !isPeopleLoading) {
      setAssigneeIds([userId, ...subordinateIds]);
    }
  }, [assigneeIds, userId, isPeopleLoading, subordinateIds, setAssigneeIds]);

  /** People the picker offers: everyone in scope, narrowed by department. */
  const peopleInScope = useMemo(() => {
    if (department === 'all') return selectablePeople;
    const memberIds = new Set(getDepartmentMemberIds(department));
    return selectablePeople.filter((person) => memberIds.has(person.id));
  }, [department, selectablePeople, getDepartmentMemberIds]);

  const selectedAssigneeIds = useMemo(() => {
    const scopeIds = new Set(peopleInScope.map((person) => person.id));
    const selected = (assigneeIds ?? (userId ? [userId] : [])).filter((id) =>
      scopeIds.has(id),
    );
    return pinFirst(selected, userId);
  }, [assigneeIds, peopleInScope, userId]);

  const handleDepartmentChange = useCallback(
    (nextDepartment: string) => {
      setDepartment(nextDepartment);
      if (nextDepartment === 'all') {
        setAssigneeIds([userId, ...subordinateIds]);
        return;
      }
      const memberIds = new Set(getDepartmentMemberIds(nextDepartment));
      setAssigneeIds(
        selectablePeople
          .filter((person) => memberIds.has(person.id))
          .map((person) => person.id),
      );
    },
    [
      setDepartment,
      setAssigneeIds,
      userId,
      subordinateIds,
      selectablePeople,
      getDepartmentMemberIds,
    ],
  );

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

      {/* Two columns on desktop. The Key Results panel owns the left one, so
          the filters sit above the task list only, never above the panel. */}
      <div
        data-cy="deadline-plan-main"
        className="grid w-full min-w-0 max-w-full grid-cols-1 gap-x-4 gap-y-3 p-0 sm:p-4 lg:grid-cols-[auto_minmax(0,1fr)]"
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
          people={peopleInScope}
          departmentOptions={departmentOptions}
          selectedAssigneeIds={selectedAssigneeIds}
          onDepartmentChange={handleDepartmentChange}
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
    </div>
  );
}

export default DeadlinePlanPage;
