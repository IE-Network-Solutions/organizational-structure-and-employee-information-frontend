import React, { useMemo, useState } from 'react';
import { Button, Modal, Select, Typography, Tag, Empty } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import {
  fetchWeeklyPlanSuggestions,
  fetchDailyPlanSuggestions,
} from '@/utils/aiService';
import { NAME } from '@/types/enumTypes';

import {
  fetchPlanningPeriodsHierarchy,
  getReportingData,
  fetchDailyTasksByWeeklyTask,
} from '@/store/server/features/okrPlanningAndReporting/queries';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { PlanningAndReportingStore } from '@/store/uistate/features/planningAndReporting/useStore';

type KeyResultOption = {
  id: string;
  title: string;
  progress?: number;
  metricType?: { name: string };
  milestones?: Array<{ id: string | number; title: string; status?: string }>;
};
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
  const [milestoneId, setMilestoneId] = useState<string | undefined>();
  const askAnother = () => {
    // Weekly: ask for another key result (or milestone)
    const isWeeklyLocal =
      hasParentPlan !== undefined
        ? !hasParentPlan
        : (planTypeName || '').toLowerCase().includes('week');
    const isDailyLocal =
      hasParentPlan !== undefined
        ? hasParentPlan
        : (planTypeName || '').toLowerCase().includes('day');

    if (isWeeklyLocal) {
      Modal.confirm({
        title: 'Need suggestions for another key result?',
        content:
          'Would you like to select a different key result to generate more weekly suggestions?',
        okText: 'Yes',
        cancelText: 'No',
        onOk: () => {
          setItems([]);
          setKeyResultId(undefined);
          setMilestoneId(undefined);
        },
        onCancel: () => setOpen(false),
      });
      return;
    }

    if (isDailyLocal) {
      Modal.confirm({
        title: 'Need suggestions for another weekly plan task?',
        content:
          'Would you like to select a different key result or weekly plan task to generate more daily suggestions?',
        okText: 'Yes',
        cancelText: 'No',
        onOk: () => {
          setItems([]);
          setWeeklyPlanTaskId(undefined);
          setKeyResultId(undefined);
        },
        onCancel: () => setOpen(false),
      });
    }
  };
  const onConfirmRegenerate = () => {
    // Ask before regenerating when items already exist
    Modal.confirm({
      title: 'Need more suggestions?',
      content: 'Regenerate suggestions for the current selection?',
      onOk: () => {
        // Reset existing suggestions before regenerating (not additive)
        setItems([]);
        handleGenerate();
      },
    });
  };

  const keyResults = useMemo(() => getKeyResults(), [getKeyResults]);
  const weeklyPlanTasks = useMemo(
    () => getWeeklyPlanTasks?.() || [],
    [getWeeklyPlanTasks],
  );
  const ongoingKeyResults = useMemo(
    () =>
      (keyResults || []).filter((k) => {
        const progress = Number(k?.progress ?? 0);
        return isFinite(progress) && progress < 100;
      }),
    [keyResults],
  );
  React.useEffect(() => {
    if (!keyResultId) return;
    if (!ongoingKeyResults.some((k) => k.id === keyResultId)) {
      setKeyResultId(undefined);
    }
  }, [keyResultId, ongoingKeyResults]);
  React.useEffect(() => {
    // Reset milestone when KR changes
    setMilestoneId(undefined);
    // Reset suggestions when KR changes
    setItems([]);
  }, [keyResultId]);
  React.useEffect(() => {
    // If milestone changes under a milestone KR in weekly planning, reset suggestions
    const isWeeklyLocal =
      hasParentPlan !== undefined
        ? !hasParentPlan
        : (planTypeName || '').toLowerCase().includes('week');
    if (isWeeklyLocal) {
      setItems([]);
    }
  }, [milestoneId, hasParentPlan, planTypeName]);
  React.useEffect(() => {
    // Reset suggestions when the selected weekly plan task changes (daily flow)
    const isDailyLocal =
      hasParentPlan !== undefined
        ? hasParentPlan
        : (planTypeName || '').toLowerCase().includes('day');
    if (isDailyLocal) {
      setItems([]);
    }
  }, [weeklyPlanTaskId, hasParentPlan, planTypeName]);

  // Only show weekly tasks under the selected key result (expects krId in task objects)
  const filteredWeeklyTasks = useMemo(() => {
    if (!keyResultId) return [] as any[];
    return (weeklyPlanTasks || []).filter(
      (t: any) => String(t?.krId || '') === String(keyResultId),
    );
  }, [weeklyPlanTasks, keyResultId]);

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
    if (Array.isArray(report?.okrReportTasks))
      pools.push(report.okrReportTasks);
    if (Array.isArray(report?.okrReport?.tasks))
      pools.push(report.okrReport.tasks);
    if (Array.isArray(report?.reportTask)) pools.push(report.reportTask);
    // Flatten and filter truthy entries
    return pools.flat().filter(Boolean);
  };

  // Utility: normalize text for fuzzy comparisons
  const normalizeText = (s: any) =>
    (s ?? '').toString().toLowerCase().replace(/\s+/g, ' ').trim();

  const normalizeId = (v: any) =>
    v === null || v === undefined ? '' : String(v);

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
        // Guard against generating for completed key results
        if (Number(selected.progress ?? 0) >= 100) return;

        const progress = selected.progress || 0;
        const userId = useAuthenticationStore.getState().userId;
        const planPeriodId =
          PlanningAndReportingStore.getState().activePlanPeriodId;

        let weeklyReportsResult: any = { items: [] };
        try {
          weeklyReportsResult = await getReportingData({
            userId: [userId],
            planPeriodId,
            pageReporting: 1,
            pageSizeReporting: 1000,
            // align with Reporting page behavior if available in store
            sessionId: PlanningAndReportingStore.getState().selectedSessionIds
              ?.length
              ? PlanningAndReportingStore.getState().selectedSessionIds
              : PlanningAndReportingStore.getState().allSessionsOfYear || [],
          });
        } catch (_) {}
        const allWeeklyReports = weeklyReportsResult?.items || [];

        // Fetch only the daily child period of the current weekly period
        let allDailyReports: any[] = [];
        try {
          const hierarchy = await fetchPlanningPeriodsHierarchy(
            userId,
            planPeriodId,
          );
          const dailyChildId =
            hierarchy?.child?.planningPeriodId || hierarchy?.child?.id;
          if (dailyChildId) {
            const dailyRes = await getReportingData({
              userId: [userId],
              planPeriodId: dailyChildId,
              pageReporting: 1,
              pageSizeReporting: 1000,
              sessionId: PlanningAndReportingStore.getState().selectedSessionIds
                ?.length
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
          metricType: selected.metricType?.name || 'Unknown',
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
                    weeklyTitle &&
                    parentTitle &&
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
        // For Milestone metric type, use milestone name as keyResultTitle when a milestone is selected
        const selectedMilestoneTitle =
          (selected?.metricType?.name === NAME.MILESTONE ||
            String(selected?.metricType?.name || '').toLowerCase() ===
              String(NAME.MILESTONE).toLowerCase()) &&
          milestoneId
            ? String(
                (selected?.milestones || []).find(
                  (m: any) => String(m?.id) === String(milestoneId),
                )?.title || selected.title,
              )
            : selected.title;

        const keyResultReportNestedWeekly = [
          {
            keyResultTitle: selectedMilestoneTitle,
            metricType: selected.metricType?.name || 'Unknown',
            keyResultProgress: `${Number(progress).toFixed(0)}%`,
            weeklyTasks: weeklyTasksClean,
          },
        ];

        const res = await fetchWeeklyPlanSuggestions({
          keyResultReport: keyResultReportNestedWeekly,
        });
        setItems(
          res.map((r) => {
            // Normalize target from backend (number or numeric string)
            const rawTarget: any =
              r?.target !== undefined
                ? r.target
                : (r as any)?.targetValue !== undefined
                  ? (r as any).targetValue
                  : undefined;
            const parsedTarget =
              typeof rawTarget === 'number'
                ? rawTarget
                : typeof rawTarget === 'string' &&
                    rawTarget.trim() !== '' &&
                    !isNaN(Number(rawTarget))
                  ? Number(rawTarget)
                  : undefined;
            return {
              title: r.title,
              weight: r.weight,
              priority: r.priority,
              ...(parsedTarget !== undefined ? { target: parsedTarget } : {}),
            };
          }),
        );
      } else if (isDaily) {
        const selectedKeyResult = keyResults.find((k) => k.id === keyResultId);
        if (!selectedKeyResult) return;

        const selectedWeeklyTask = weeklyPlanTasks.find(
          (t) => t.id === weeklyPlanTaskId,
        );
        if (!selectedWeeklyTask) return;

        // Fetch previously reported daily tasks for this weekly task
        let previousDaily: { title: string; status: string }[] = [];

        try {
          const dailyTasksResponse = await fetchDailyTasksByWeeklyTask(
            String(weeklyPlanTaskId),
          );

          // Backend returns array directly: [{ title, status, reason }, ...]
          // Handle both array format and object format
          const dailyTasks = Array.isArray(dailyTasksResponse)
            ? dailyTasksResponse
            : dailyTasksResponse?.dailyTasks || [];

          // Transform to AI format
          previousDaily = dailyTasks
            .map((task: any) => {
              const statusText = normalizeText(task?.status);
              let normalizedStatus = 'pending';

              // Map various status values to 'completed' or 'pending'
              if (
                statusText === 'done' ||
                statusText === 'completed' ||
                statusText === 'achieved'
              ) {
                normalizedStatus = 'completed';
              } else if (
                statusText === 'not done' ||
                statusText === 'notdone' ||
                statusText === 'pending' ||
                statusText === 'in progress' ||
                statusText === 'inprogress'
              ) {
                normalizedStatus = 'pending';
              }

              return {
                title: String(task?.title || '').trim(),
                status: normalizedStatus,
              };
            })
            .filter((task: any) => task.title.length > 0);
        } catch (error: any) {
          // Silently handle errors - empty context is acceptable for first day
        }

        // Send to AI engine
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
    const selectedKR = keyResults.find((k) => k.id === targetKeyResultId);

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
      // Weekly plan:
      // If KR is milestone metric and a milestone selected, use composite key of KR + milestone
      if (selectedKR?.metricType?.name === NAME.MILESTONE && milestoneId) {
        const compositeKey = `${targetKeyResultId}${milestoneId}`;
        boardKey = resolveBoardKeyForKR
          ? resolveBoardKeyForKR(compositeKey)
          : compositeKey;
        listName = resolveListNameForKR
          ? resolveListNameForKR(compositeKey)
          : `names-${compositeKey}`;
      } else {
        boardKey = resolveBoardKeyForKR
          ? resolveBoardKeyForKR(targetKeyResultId)
          : targetKeyResultId;
        listName = resolveListNameForKR
          ? resolveListNameForKR(targetKeyResultId)
          : `names-${targetKeyResultId}`;
      }
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
      // Always false for generated tasks; only true when planning milestone itself elsewhere
      achieveMK: false,
      // If adding under a milestone, include milestoneId
      ...(isWeekly &&
        selectedKR?.metricType?.name === NAME.MILESTONE &&
        milestoneId && { milestoneId }),
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
    // If the list becomes empty, ask to switch to another key result (weekly only).
    if (items.length === 1) {
      askAnother();
    }
    setItems((prev) => prev.filter((item, i) => i !== index));
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
        style={{ maxWidth: 720, width: 'calc(100vw - 32px)' }}
        bodyStyle={{ padding: 12 }}
      >
        {ongoingKeyResults.length === 0 ? (
          <Empty
            description={
              <div className="text-sm">
                {isDaily
                  ? 'No in-progress key results found. Please ensure weekly plan has in-progress KRs.'
                  : 'No in-progress key results found. Please create objectives with in-progress key results.'}
              </div>
            }
          />
        ) : (
          <>
            <div className="mb-4">
              {isWeekly && (
                <>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <span className="text-sm w-24">Key Result</span>
                    <Select
                      className="flex-1 max-w-full"
                      placeholder="Choose a key result"
                      optionLabelProp="shortLabel"
                      dropdownStyle={{
                        maxWidth: '100%',
                        whiteSpace: 'normal',
                        wordBreak: 'break-word',
                      }}
                      dropdownMatchSelectWidth
                      getPopupContainer={(trigger) =>
                        trigger?.parentElement || document.body
                      }
                      style={{ width: '100%', maxWidth: '100%' }}
                      options={ongoingKeyResults.map((k) => ({
                        // Full text in dropdown
                        label: (
                          <div className="whitespace-normal break-words">
                            {k.title}
                          </div>
                        ),
                        // Truncated in selector
                        shortLabel: <div className="truncate">{k.title}</div>,
                        value: k.id,
                      }))}
                      value={keyResultId}
                      onChange={setKeyResultId}
                    />
                  </div>
                  {(() => {
                    const selectedKR = ongoingKeyResults.find(
                      (k) => k.id === keyResultId,
                    );
                    const isMilestoneKR =
                      selectedKR?.metricType?.name === NAME.MILESTONE ||
                      String(
                        selectedKR?.metricType?.name || '',
                      ).toLowerCase() === String(NAME.MILESTONE).toLowerCase();
                    if (!isMilestoneKR) {
                      return (
                        <div className="flex justify-end mt-3">
                          <Button
                            loading={loading}
                            type="primary"
                            onClick={() =>
                              items.length > 0
                                ? onConfirmRegenerate()
                                : handleGenerate()
                            }
                            disabled={!keyResultId}
                          >
                            {items.length ? 'Regenerate' : 'Generate'}
                          </Button>
                        </div>
                      );
                    }
                    const milestoneOptions =
                      (selectedKR?.milestones || [])
                        .filter(
                          (m: any) =>
                            String(m?.status || '').toLowerCase() !==
                            'completed',
                        )
                        .map((m: any) => ({
                          label: m?.title,
                          value: String(m?.id),
                        })) || [];
                    return (
                      <>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mt-3">
                          <span className="text-sm w-24">Milestone</span>
                          <Select
                            className="flex-1 max-w-full"
                            placeholder="Choose a milestone under the selected key result"
                            optionLabelProp="shortLabel"
                            dropdownStyle={{
                              maxWidth: '100%',
                              whiteSpace: 'normal',
                              wordBreak: 'break-word',
                            }}
                            dropdownMatchSelectWidth
                            getPopupContainer={(trigger) =>
                              trigger?.parentElement || document.body
                            }
                            style={{ width: '100%', maxWidth: '100%' }}
                            options={milestoneOptions.map((m) => ({
                              ...m,
                              // Full text in dropdown
                              label: (
                                <div className="whitespace-normal break-words">
                                  {m.label}
                                </div>
                              ),
                              // Truncated in selector
                              shortLabel: (
                                <div className="truncate">{m.label}</div>
                              ),
                            }))}
                            value={milestoneId}
                            onChange={setMilestoneId}
                            disabled={!keyResultId}
                            showSearch
                            filterOption={(input, option) => {
                              const labelNode: any = (option as any)?.label;
                              const labelText = String(
                                labelNode?.props?.children ?? labelNode ?? '',
                              );
                              return labelText
                                .toLowerCase()
                                .includes(input.toLowerCase());
                            }}
                          />
                        </div>
                        <div className="flex justify-end mt-3">
                          <Button
                            loading={loading}
                            type="primary"
                            onClick={() =>
                              items.length > 0
                                ? onConfirmRegenerate()
                                : handleGenerate()
                            }
                            disabled={!keyResultId || !milestoneId}
                          >
                            {items.length ? 'Regenerate' : 'Generate'}
                          </Button>
                        </div>
                      </>
                    );
                  })()}
                </>
              )}
              {isDaily && (
                <div className="flex flex-col gap-3">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <span className="text-sm w-24">Key Result</span>
                    <Select
                      className="flex-1 max-w-full"
                      placeholder="Choose a key result to attach tasks"
                      optionLabelProp="shortLabel"
                      dropdownStyle={{
                        maxWidth: '100%',
                        whiteSpace: 'normal',
                        wordBreak: 'break-word',
                      }}
                      dropdownMatchSelectWidth
                      getPopupContainer={(trigger) =>
                        trigger?.parentElement || document.body
                      }
                      style={{ width: '100%', maxWidth: '100%' }}
                      options={ongoingKeyResults.map((k) => ({
                        // Full text in dropdown
                        label: (
                          <div className="whitespace-normal break-words">
                            {k.title}
                          </div>
                        ),
                        // Truncated in selector
                        shortLabel: <div className="truncate">{k.title}</div>,
                        value: k.id,
                      }))}
                      value={keyResultId}
                      onChange={setKeyResultId}
                    />
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <span className="text-sm w-24">Weekly Plan</span>
                    <Select
                      className="flex-1 max-w-full"
                      placeholder="Select a weekly plan task"
                      optionLabelProp="shortLabel"
                      dropdownStyle={{
                        maxWidth: '100%',
                        whiteSpace: 'normal',
                        wordBreak: 'break-word',
                      }}
                      dropdownMatchSelectWidth
                      getPopupContainer={(trigger) =>
                        trigger?.parentElement || document.body
                      }
                      style={{ width: '100%', maxWidth: '100%' }}
                      options={filteredWeeklyTasks.map((t) => ({
                        // Full text in dropdown
                        label: (
                          <div className="whitespace-normal break-words">
                            {t.task}
                          </div>
                        ),
                        // Truncated in selector
                        shortLabel: <div className="truncate">{t.task}</div>,
                        value: t.id,
                      }))}
                      value={weeklyPlanTaskId}
                      onChange={setWeeklyPlanTaskId}
                      showSearch
                      filterOption={(input, option) => {
                        const labelNode: any = (option as any)?.label;
                        const labelText = String(
                          labelNode?.props?.children ?? labelNode ?? '',
                        );
                        return labelText
                          .toLowerCase()
                          .includes(input.toLowerCase());
                      }}
                    />
                  </div>
                  <div className="flex justify-end">
                    <Button
                      loading={loading}
                      type="primary"
                      onClick={() =>
                        items.length > 0
                          ? onConfirmRegenerate()
                          : handleGenerate()
                      }
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
                  className="border rounded-lg p-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3"
                >
                  <div className="flex-1 pr-3">
                    <Typography.Text className="text-sm whitespace-normal break-words">
                      {s.title}
                    </Typography.Text>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {typeof s.weight === 'number' && (
                        <Tag>Weight: {s.weight}</Tag>
                      )}
                      {s.priority && <Tag>Priority: {s.priority}</Tag>}
                      {typeof s.target === 'number' && (
                        <Tag>Target: {s.target}</Tag>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <Button type="primary" onClick={() => addToForm(s, idx)}>
                      Add
                    </Button>
                    <Button
                      icon={<CloseOutlined />}
                      onClick={() => {
                        if (items.length === 1) {
                          askAnother();
                        }
                        setItems((prev) =>
                          prev.filter((unusedItem, i) => i !== idx),
                        );
                      }}
                      shape="circle"
                    />
                  </div>
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
