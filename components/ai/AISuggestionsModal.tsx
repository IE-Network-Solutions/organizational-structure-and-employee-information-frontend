import React, { useMemo, useState } from 'react';
import { Button, Modal, Select, Typography, Tag, Empty } from 'antd';
import {
  fetchWeeklyPlanSuggestions,
  fetchDailyPlanSuggestions,
} from '@/utils/aiService';

import { fetchAllPlanningPeriods, fetchPlanningPeriodsHierarchy, getReportingData } from '@/store/server/features/okrPlanningAndReporting/queries';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { PlanningAndReportingStore } from '@/store/uistate/features/planningAndReporting/useStore';

type KeyResultOption = { id: string; title: string; progress?: number; metricType?: { name: string } };
type WeeklyPlanTask = { id: string; task: string };

interface AISuggestionsModalProps {
  getKeyResults: () => KeyResultOption[];
  getWeeklyPlanTasks?: () => WeeklyPlanTask[]; // Function to get weekly plan tasks for daily planning
  form: any;
  handleAddBoard: (key: string) => void;
  handleAddName?: (values: Record<string, any>, key: string) => void; // Function to save the task
  planTypeName?: string; // 'Weekly' | 'Daily' | others
  resolveListNameForKR?: (krId: string) => string; // returns form list name e.g., names-<id or composite>
  resolveBoardKeyForKR?: (krId: string) => string; // what to pass to handleAddBoard
  hasParentPlan?: boolean; // Explicitly indicates if this is a child plan (e.g., Daily under Weekly)
}

const AISuggestionsModal: React.FC<AISuggestionsModalProps> = ({
  getKeyResults,
  getWeeklyPlanTasks,
  form,
  handleAddBoard,
  handleAddName,
  planTypeName,
  resolveListNameForKR,
  resolveBoardKeyForKR,
  hasParentPlan,
}) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [keyResultId, setKeyResultId] = useState<string | undefined>();
  const [weeklyPlanTaskId, setWeeklyPlanTaskId] = useState<
    string | undefined
  >();
  const [items, setItems] = useState<
    { title: string; weight: number; priority: string; target?: number }[]
  >([]);

  const keyResults = useMemo(() => getKeyResults(), [getKeyResults]);
  const weeklyPlanTasks = useMemo(
    () => getWeeklyPlanTasks?.() || [],
    [getWeeklyPlanTasks],
  );

  // Determine plan type: use hasParentPlan if provided, otherwise fall back to name matching
  const isDaily =
    hasParentPlan !== undefined
      ? hasParentPlan
      : (planTypeName || '').toLowerCase().includes('day');
  const isWeekly =
    hasParentPlan !== undefined
      ? !hasParentPlan
      : (planTypeName || '').toLowerCase().includes('week');

  // Helper to robustly extract tasks from a report item
  const extractReportTasks = (report: any): any[] => {
    const pools: any[][] = [];
    if (Array.isArray(report?.tasks)) pools.push(report.tasks);
    if (Array.isArray(report?.reportTasks)) pools.push(report.reportTasks);
    if (Array.isArray(report?.okrReportTasks)) pools.push(report.okrReportTasks);
    if (Array.isArray(report?.okrReport?.tasks)) pools.push(report.okrReport.tasks);
    if (Array.isArray(report?.reportTask)) pools.push(report.reportTask);
    // Flatten and filter truthy entries
    return pools.flat().filter(Boolean);
  };

  // Utility: normalize text for fuzzy comparisons
  const normalizeText = (s: any) =>
    (s ?? '')
      .toString()
      .toLowerCase()
      .replace(/\s+/g, ' ')
      .trim();

  const normalizeId = (v: any) => (v === null || v === undefined ? '' : String(v));

  const isCompletedStatus = (status: any) => {
    const s = normalizeText(status);
    return s === 'done' || s === 'completed' || s === 'achieved';
  };

  const handleGenerate = async () => {
    setLoading(true);
    try {
      if (isWeekly) {
        const selected = keyResults.find((k) => k.id === keyResultId);
        if (!selected) return;
        
        const progress = selected.progress || 0;
        const userId = useAuthenticationStore.getState().userId;
        const planPeriodId = PlanningAndReportingStore.getState().activePlanPeriodId;
        
        let weeklyReportsResult: any = { items: [] };
        try {
          weeklyReportsResult = await getReportingData({
            userId: [userId],
            planPeriodId,
            pageReporting: 1,
            pageSizeReporting: 1000,
            // align with Reporting page behavior if available in store
            sessionId:
              PlanningAndReportingStore.getState().selectedSessionIds?.length
                ? PlanningAndReportingStore.getState().selectedSessionIds
                : PlanningAndReportingStore.getState().allSessionsOfYear || [],
          });
        } catch (_) {}
        const allWeeklyReports = weeklyReportsResult?.items || [];
        
        // Fetch only the daily child period of the current weekly period
        let allDailyReports: any[] = [];
        try {
          const hierarchy = await fetchPlanningPeriodsHierarchy(userId, planPeriodId);
          const dailyChildId = hierarchy?.child?.planningPeriodId || hierarchy?.child?.id;
          if (dailyChildId) {
            const dailyRes = await getReportingData({
              userId: [userId],
              planPeriodId: dailyChildId,
              pageReporting: 1,
              pageSizeReporting: 1000,
              sessionId:
                PlanningAndReportingStore.getState().selectedSessionIds?.length
                  ? PlanningAndReportingStore.getState().selectedSessionIds
                  : PlanningAndReportingStore.getState().allSessionsOfYear || [],
            });
            allDailyReports = dailyRes?.items || [];
          }
        } catch (_) {}
        
        // Now build krReport using allWeeklyReports
        const krReport = {
          tasks: [] as any[],
          keyResultProgress: progress + '%',
          metricType: selected.metricType?.name || 'Unknown'
        };
        
        const doneTasks: string[] = [];
        
        allWeeklyReports.forEach((report: any) => {
          const reportTasks = extractReportTasks(report);
          reportTasks.forEach((task: any) => {
            if (task.planTask?.keyResultId === keyResultId) {
              const weeklyTask = {
                title: task.planTask?.task ?? task?.task,
                status: task.status,
                reason: task.customReason || 'No reason provided',
                dailyTasks: [] as any[],
              };
              
              // Add nested daily
              allDailyReports.forEach((dailyReport: any) => {
                const dailyReportTasks = extractReportTasks(dailyReport);
                dailyReportTasks.forEach((dailyTask: any) => {
                  const weeklyIdCandidates = [
                    task.planTask?.id,
                    task.planTaskId,
                    task?.id,
                  ]
                    .filter(Boolean)
                    .map(normalizeId);
                  const dailyParentCandidates = [
                    dailyTask.planTask?.parentTask?.id,
                    dailyTask.planTask?.parentTaskId,
                    dailyTask?.parentTaskId,
                    dailyTask?.parentTask?.id,
                    dailyTask?.parentPlanTaskId,
                  ]
                    .filter(Boolean)
                    .map(normalizeId);

                  // Fallback title-based match
                  const weeklyTitle = normalizeText(
                    task.planTask?.task || task?.task,
                  );
                  const parentTitle = normalizeText(
                    dailyTask.planTask?.parentTask?.task ||
                      dailyTask?.parentTask?.task,
                  );

                  const titlesMatch =
                    weeklyTitle && parentTitle &&
                    (weeklyTitle === parentTitle ||
                      weeklyTitle.includes(parentTitle) ||
                      parentTitle.includes(weeklyTitle));

                  const idsMatch = weeklyIdCandidates.some((wid: string) =>
                    dailyParentCandidates.includes(wid),
                  );

                  const isChildOfWeekly = idsMatch || titlesMatch;

                  if (isChildOfWeekly && isCompletedStatus(dailyTask.status)) {
                    weeklyTask.dailyTasks.push({
                      title: dailyTask.planTask?.task ?? dailyTask?.task,
                      status: dailyTask.status,
                      reason: dailyTask.customReason || 'No reason provided',
                    });
                  }
                });
              });
              
              krReport.tasks.push(weeklyTask);
              
              if (isCompletedStatus(task.status)) {
                doneTasks.push(task.planTask?.task ?? task?.task);
              }
            }
          });
        });
        
        // Build clean weekly payload per API ({ keyResultReport })
        const weeklyTasksClean = (krReport.tasks || []).map((t: any) => ({
          title: t?.title,
          status: t?.status ?? null,
          reason: t?.reason || 'No reason provided',
        }));
        const keyResultReportNestedWeekly = [
          {
            keyResultTitle: selected.title,
            metricType: selected.metricType?.name || 'Unknown',
            keyResultProgress: `${Number(progress).toFixed(0)}%`,
            weeklyTasks: weeklyTasksClean,
          },
        ];

        const res = await fetchWeeklyPlanSuggestions({
          keyResultReport: keyResultReportNestedWeekly,
        });
        setItems(
          res.map((r) => ({
            title: r.title,
            weight: r.weight,
            priority: r.priority,
          })),
        );
      } else if (isDaily) {
        const selectedKeyResult = keyResults.find((k) => k.id === keyResultId);
        if (!selectedKeyResult) return;

        const selectedWeeklyTask = weeklyPlanTasks.find(
          (t) => t.id === weeklyPlanTaskId,
        );
        if (!selectedWeeklyTask) return;

        const progress = selectedKeyResult.progress || 0;
        const userId = useAuthenticationStore.getState().userId;
        const planPeriodId = PlanningAndReportingStore.getState().activePlanPeriodId;
        
        // Get all daily periods, fetch all daily reports
        
        const allAssignedResponse = await fetchAllPlanningPeriods();
        const allAssigned = allAssignedResponse?.items || [];
        
        const dailyPeriods = allAssigned.filter((p: any) => p.planningPeriod?.name?.toLowerCase().includes('day'));
        
        const allDailyReportsPromises = dailyPeriods.map(async (period: any) => {
          try {
            const res = await getReportingData({
              userId: [userId],
              planPeriodId: period.planningPeriodId,
              pageReporting: 1,
              pageSizeReporting: 1000,
              sessionId:
                PlanningAndReportingStore.getState().selectedSessionIds?.length
                  ? PlanningAndReportingStore.getState().selectedSessionIds
                  : PlanningAndReportingStore.getState().allSessionsOfYear || [],
            });
            return res.items || [];
          } catch (e) {
            return [];
          }
        });
        
        const allDailyReports = (await Promise.all(allDailyReportsPromises)).flat();
        
        const krReport = {
          tasks: [] as any[],
          keyResultProgress: progress + '%',
          metricType: selectedKeyResult.metricType?.name || 'Unknown'
        };
        
        const doneTasks: string[] = [];
        
        // Since for specific weekly task, create one entry
        const weeklyTaskEntry = {
          title: selectedWeeklyTask.task,
          dailyTasks: [] as any[],
        };
        
        allDailyReports.forEach((report: any) => {
          const reportTasks = extractReportTasks(report);
          reportTasks.forEach((task: any) => {
            const weeklyIdCandidates = [weeklyPlanTaskId]
              .filter(Boolean)
              .map(normalizeId);
            const dailyParentCandidates = [
              task.planTask?.parentTask?.id,
              task.planTask?.parentTaskId,
              task?.parentTaskId,
              task?.parentTask?.id,
              task?.parentPlanTaskId,
            ]
              .filter(Boolean)
              .map(normalizeId);

            const weeklyTitle = normalizeText(selectedWeeklyTask.task);
            const parentTitle = normalizeText(
              task.planTask?.parentTask?.task || task?.parentTask?.task,
            );

            const titlesMatch =
              weeklyTitle && parentTitle &&
              (weeklyTitle === parentTitle ||
                weeklyTitle.includes(parentTitle) ||
                parentTitle.includes(weeklyTitle));

            const idsMatch = weeklyIdCandidates.some((wid: string) =>
              dailyParentCandidates.includes(wid),
            );

            const isChildOfWeekly = idsMatch || titlesMatch;

            if (isChildOfWeekly) {
              weeklyTaskEntry.dailyTasks.push({
                title: task.planTask?.task ?? task?.task,
                status: task.status,
                reason: task.customReason || 'No reason provided',
              });

              if (isCompletedStatus(task.status)) {
                doneTasks.push(task.planTask?.task ?? task?.task);
              }
            }
          });
        });
        
        krReport.tasks.push(weeklyTaskEntry);
        
        const keyResultReport = [krReport];
        
        // Build daily_plan_request from child Daily period reports
        let previousDaily: { title: string; status: string }[] = [];
        try {
          const hierarchy = await fetchPlanningPeriodsHierarchy(userId, planPeriodId);
          const dailyChildId = hierarchy?.child?.planningPeriodId || hierarchy?.child?.id;
          if (dailyChildId) {
            const dailyRes = await getReportingData({
              userId: [userId],
              planPeriodId: dailyChildId,
              pageReporting: 1,
              pageSizeReporting: 1000,
              sessionId:
                PlanningAndReportingStore.getState().selectedSessionIds?.length
                  ? PlanningAndReportingStore.getState().selectedSessionIds
                  : PlanningAndReportingStore.getState().allSessionsOfYear || [],
            });
            const dailyReports = dailyRes?.items || [];
            const allDailyTasks = dailyReports.flatMap((dr: any) => extractReportTasks(dr));
            const matched = allDailyTasks.filter((t: any) => {
              const idMatch = normalizeId(t?.planTask?.parentTaskId) === normalizeId(selectedWeeklyTask?.id);
              const titleMatch = normalizeText(t?.planTask?.parentTask?.task || t?.parentTask?.task) === normalizeText(selectedWeeklyTask.task);
              return idMatch || titleMatch;
            });
            const normalizeDailyStatus = (s: any) => {
              const v = normalizeText(s);
              if (v === 'done' || v === 'completed' || v === 'achieved') return 'completed';
              return v || 'pending';
            };
            previousDaily = matched
              .map((t: any) => ({
                title: t?.planTask?.task || t?.task || '',
                status: normalizeDailyStatus(t?.status),
              }))
              .filter((d: any) => d.title);
          }
        } catch (_) {}

        const res = await fetchDailyPlanSuggestions({
          daily_plan_request: {
            selected_key_result: selectedKeyResult.title,
            selected_weekly_task: selectedWeeklyTask.task,
            previous_daily_tasks: previousDaily,
          },
        });
        setItems(
          res.map((r) => ({
            title: r.title,
            weight: r.weight,
            priority: r.priority,
          })),
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const addToForm = async (
    item: { title: string; weight: number; priority: string; target?: number },
    index: number,
  ) => {
    const targetKeyResultId = keyResultId || keyResults[0]?.id;
    if (!targetKeyResultId) return;

    // For daily plans, we need to include the parentTaskId in the form field name
    let boardKey, listName;

    if (isDaily && weeklyPlanTaskId) {
      // Daily plan: use composite key with both keyResultId and parentTaskId
      const compositeKey = `${targetKeyResultId}${weeklyPlanTaskId}`;
      boardKey = resolveBoardKeyForKR
        ? resolveBoardKeyForKR(compositeKey)
        : compositeKey;
      listName = resolveListNameForKR
        ? resolveListNameForKR(compositeKey)
        : `names-${compositeKey}`;
    } else {
      // Weekly plan: use only keyResultId
      boardKey = resolveBoardKeyForKR
        ? resolveBoardKeyForKR(targetKeyResultId)
        : targetKeyResultId;
      listName = resolveListNameForKR
        ? resolveListNameForKR(targetKeyResultId)
        : `names-${targetKeyResultId}`;
    }

    // Create the board form if it doesn't exist
    const currentList = form.getFieldValue(listName) || [];
    if (currentList.length === 0) {
      handleAddBoard(boardKey);
    }

    // Prepare the task data with proper structure
    const taskData = {
      task: item.title,
      weight: item.weight,
      priority: (item.priority || 'medium').toLowerCase(),
      targetValue: typeof item.target === 'number' ? item.target : 0,
      achieveMK: false, // Set to false for regular tasks
      // For daily plans, include parentTaskId
      ...(isDaily && weeklyPlanTaskId && { parentTaskId: weeklyPlanTaskId }),
    };

    // Check if task already exists to prevent duplicates
    const existingList = form.getFieldValue(listName) || [];
    const taskExists = existingList.some(
      (existingTask: any) =>
        existingTask.task === taskData.task &&
        existingTask.weight === taskData.weight,
    );

    if (taskExists) {
      // Task already exists, just remove from suggestions
      setItems((prev) => prev.filter((item, i) => i !== index));
      return;
    }

    // Use the same logic for both weekly and daily plans
    const boardFormKey = `board-${boardKey}`;
    const boardFormValues = form.getFieldValue(boardFormKey) || [];

    // Add the task data to the first position (index 0) in the board form
    boardFormValues[0] = taskData;
    form.setFieldsValue({ [boardFormKey]: boardFormValues });

    // Give the form a moment to update
    setTimeout(async () => {
      try {
        // Validate the board form fields
        await form.validateFields([
          [boardFormKey, 0, 'task'],
          [boardFormKey, 0, 'weight'],
          [boardFormKey, 0, 'priority'],
        ]);

        // Call handleAddName to save the task (this handles the names list and weight calculation)
        if (handleAddName) {
          handleAddName(taskData, boardKey);
        }

        // Clear the board form after adding
        form.setFieldsValue({ [boardFormKey]: [] });
      } catch (error) {
        // Validation failed - error is expected during form validation
      }
    }, 100);

    // Remove the suggestion from the list after successfully adding.
    // If the list becomes empty, close the modal to match OKR UX.
    setItems((prev) => {
      const next = prev.filter((item, i) => i !== index);
      if (next.length === 0) {
        setOpen(false);
      }
      return next;
    });
  };

  return (
    <>
      <Button type="primary" ghost onClick={() => setOpen(true)}>
        AI Suggestion
      </Button>
      <Modal
        title={
          <div className="text-base font-semibold">AI Planning Suggestion</div>
        }
        open={open}
        onCancel={() => setOpen(false)}
        footer={null}
        width={720}
      >
        {keyResults.length === 0 ? (
          <Empty
            description={
              <div className="text-sm">
                {isDaily
                  ? 'No key results found. Please create a weekly plan with tasks first.'
                  : 'No key results found. Please create objectives with key results first.'}
              </div>
            }
          />
        ) : (
          <>
            <div className="mb-4">
              {isWeekly && (
                <div className="flex items-center gap-3">
                  <span className="text-sm">Key Result</span>
                  <Select
                    className="w-full"
                    placeholder="Choose a key result"
                    options={keyResults.map((k) => ({
                      label: k.title,
                      value: k.id,
                    }))}
                    value={keyResultId}
                    onChange={setKeyResultId}
                  />
                  <Button
                    loading={loading}
                    type="primary"
                    onClick={handleGenerate}
                  >
                    {items.length ? 'Regenerate' : 'Generate'}
                  </Button>
                </div>
              )}
              {isDaily && (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <span className="text-sm w-24">Key Result</span>
                    <Select
                      className="flex-1"
                      placeholder="Choose a key result to attach tasks"
                      options={keyResults.map((k) => ({
                        label: k.title,
                        value: k.id,
                      }))}
                      value={keyResultId}
                      onChange={setKeyResultId}
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm w-24">Weekly Plan</span>
                    <Select
                      className="flex-1"
                      placeholder="Select a weekly plan task"
                      options={weeklyPlanTasks.map((t) => ({
                        label: t.task,
                        value: t.id,
                      }))}
                      value={weeklyPlanTaskId}
                      onChange={setWeeklyPlanTaskId}
                      showSearch
                      filterOption={(input, option) =>
                        (option?.label ?? '')
                          .toLowerCase()
                          .includes(input.toLowerCase())
                      }
                    />
                  </div>
                  <div className="flex justify-end">
                    <Button
                      loading={loading}
                      type="primary"
                      onClick={handleGenerate}
                      disabled={!keyResultId || !weeklyPlanTaskId}
                    >
                      {items.length ? 'Regenerate' : 'Generate'}
                    </Button>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-3">
              {items.length === 0 && (
                <Empty
                  description={
                    <span className="text-xs">No suggestions yet</span>
                  }
                />
              )}
              {items.map((s, idx) => (
                <div
                  key={idx}
                  className="border rounded-lg p-3 flex justify-between items-start"
                >
                  <div>
                    <Typography.Text className="text-sm">
                      {s.title}
                    </Typography.Text>
                    <div className="mt-2 flex gap-2">
                      {typeof s.weight === 'number' && (
                        <Tag>Weight: {s.weight}</Tag>
                      )}
                      {s.priority && <Tag>Priority: {s.priority}</Tag>}
                      {typeof s.target === 'number' && (
                        <Tag>Target: {s.target}</Tag>
                      )}
                    </div>
                  </div>
                  <Button type="primary" onClick={() => addToForm(s, idx)}>
                    Add
                  </Button>
                </div>
              ))}
            </div>
          </>
        )}
      </Modal>
    </>
  );
};

export default AISuggestionsModal;
