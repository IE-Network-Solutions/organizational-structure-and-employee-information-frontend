import React, { useState, useMemo, useEffect } from 'react';
import {
  Drawer,
  Button,
  Input,
  Select,
  Form,
  Spin,
  Tooltip,
  InputNumber,
} from 'antd';
import {
  CloseCircleFilled,
  CheckOutlined,
  CloseOutlined,
  DownOutlined,
  UpOutlined,
} from '@ant-design/icons';
import { ViewMode, Cadence } from '../types';
import { useGetPlanningPeriodsHierarchy } from '@/store/server/features/okrPlanningAndReporting/queries';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { useCreatePlanTasks } from '@/store/server/features/employees/planning/mutation';
import { AllPlanningPeriods } from '@/store/server/features/okrPlanningAndReporting/queries';
import { groupParentTasks } from '../dataTransformer/plan';
import {
  getMetricValueInputMax,
  getMetricValueInputMin,
  validateMetricValueAgainstInitial,
} from '@/utils/okrMetricValueBounds';

interface AddDailyPlanDrawerProps {
  open: boolean;
  onClose: () => void;
  viewMode: ViewMode;
  planningPeriodId?: string;
  activeCadence: Cadence;
}

// --- Planning Types ---
interface TaskItem {
  id: string;
  description: string;
  priority: string;
  weight: number;
  target: number;
}

interface WeeklyTaskGroup {
  id: string;
  title: string;
  tasks: TaskItem[];
  collapsed?: boolean;
  // Metadata for form submission
  keyResultId?: string;
  milestoneId?: string | null;
  parentTaskId?: string;
  targetValue?: number;
  /** KR payload fields for absolute target bounds */
  keyResultInitialValue?: number | null;
  keyResultTargetValue?: number | null;
  metricTypeName?: string | null;
}

// --- Reporting Types ---
interface ReportingTask {
  id: string;
  description: string;
  value?: number;
  status: 'done' | 'not' | null;
  comment?: string;
  showValueInput?: boolean;
}

interface ReportingGroup {
  id: string;
  title: string;
  tasks: ReportingTask[];
  collapsed?: boolean;
}

export default function AddDailyPlanDrawer({
  open,
  onClose,
  viewMode,
  planningPeriodId,
  activeCadence,
}: AddDailyPlanDrawerProps) {
  const { userId } = useAuthenticationStore();
  const [form] = Form.useForm();
  const { data: planningPeriods } = AllPlanningPeriods();
  const { mutate: createTask, isLoading: isCreating } = useCreatePlanTasks();

  // Get planningUserId
  const planningUserId = useMemo(() => {
    const safePlanningPeriods = Array.isArray(planningPeriods)
      ? planningPeriods
      : [];
    return safePlanningPeriods.find(
      (item: any) => item.planningPeriod?.id === planningPeriodId,
    )?.id;
  }, [planningPeriods, planningPeriodId]);

  // Fetch planning hierarchy for daily plans
  const { data: planningPeriodHierarchy, isLoading: isLoadingHierarchy } =
    useGetPlanningPeriodsHierarchy(userId, planningPeriodId || '');

  // Get weekly plan tasks for daily planning
  const weeklyPlanTasks = useMemo(() => {
    if (
      activeCadence !== 'daily' ||
      viewMode !== 'planning' ||
      !planningPeriodHierarchy?.parentPlan
    ) {
      return [];
    }

    const unreportedWeeklyPlan = planningPeriodHierarchy.parentPlan.plans?.find(
      (i: any) => i.isReported === false,
    );

    if (!unreportedWeeklyPlan?.tasks) return [];

    // Group tasks by keyResult using groupParentTasks
    return groupParentTasks(unreportedWeeklyPlan.tasks);
  }, [activeCadence, viewMode, planningPeriodHierarchy]);

  // Build composite key for form field names (same as original)
  const buildKey = (
    keyResultId?: string | number,
    milestoneId?: string | number | null,
    taskId?: string | number | null,
  ) =>
    `${String(keyResultId ?? '')}${String(milestoneId ?? '')}${String(taskId ?? '')}`;

  // Get parent plan ID for daily plans
  const parentPlanId = useMemo(() => {
    if (activeCadence !== 'daily' || !planningPeriodHierarchy?.parentPlan)
      return '';
    return (
      planningPeriodHierarchy.parentPlan.plans?.find(
        (i: any) => i.isReported === false,
      )?.id || ''
    );
  }, [activeCadence, planningPeriodHierarchy]);

  /** Daily tasks under a weekly parent — backend validates weights; no 100% sum gate in UI */
  const isChildDailyPlanning =
    viewMode === 'planning' &&
    activeCadence === 'daily' &&
    Boolean(planningPeriodHierarchy?.parentPlan);

  // Transform weekly tasks into the format needed for the UI
  const transformedWeeklyTasks = useMemo(() => {
    if (!weeklyPlanTasks || weeklyPlanTasks.length === 0) return [];

    const groups: WeeklyTaskGroup[] = [];

    weeklyPlanTasks.forEach((objective: any) => {
      objective.keyResults?.forEach((keyResult: any) => {
        // Handle tasks with milestones
        keyResult.milestones?.forEach((milestone: any) => {
          milestone.tasks?.forEach((task: any) => {
            const groupId = buildKey(keyResult.id, milestone.id, task.id);
            groups.push({
              id: groupId,
              title: `${keyResult.title} - ${milestone.title || 'Milestone'}`,
              collapsed: true,
              keyResultId: keyResult.id,
              milestoneId: milestone.id,
              parentTaskId: task.id,
              targetValue: task.targetValue,
              keyResultInitialValue: keyResult.initialValue ?? null,
              keyResultTargetValue: keyResult.targetValue ?? null,
              metricTypeName: keyResult.metricType?.name ?? null,
              tasks: [
                {
                  id: task.id,
                  description: task.task || '',
                  priority: task.priority || 'Medium',
                  weight: task.weight || 0,
                  target: task.targetValue || 0,
                },
              ],
            });
          });
        });

        // Handle tasks without milestones
        keyResult.tasks?.forEach((task: any) => {
          const groupId = buildKey(keyResult.id, undefined, task.id);
          groups.push({
            id: groupId,
            title: keyResult.title || 'Key Result',
            collapsed: true,
            keyResultId: keyResult.id,
            milestoneId: null,
            parentTaskId: task.id,
            targetValue: task.targetValue,
            keyResultInitialValue: keyResult.initialValue ?? null,
            keyResultTargetValue: keyResult.targetValue ?? null,
            metricTypeName: keyResult.metricType?.name ?? null,
            tasks: [
              {
                id: task.id,
                description: task.task || '',
                priority: task.priority || 'Medium',
                weight: task.weight || 0,
                target: task.targetValue || 0,
              },
            ],
          });
        });
      });
    });

    return groups;
  }, [weeklyPlanTasks]);

  // --- Planning State ---
  const [planningTasks, setPlanningTasks] = useState<WeeklyTaskGroup[]>([]);

  // --- Reporting State ---
  const [reportingTasks, setReportingTasks] = useState<ReportingGroup[]>([
    {
      id: 'r1',
      title: 'Learning Product design course curiculum',
      collapsed: true,
      tasks: [
        {
          id: 'rt1',
          description:
            'Learning Product design course curriculum, Learning Product design .',
          value: 100000,
          status: 'done',
          showValueInput: true,
        },
        {
          id: 'rt2',
          description: 'Learning Product design course curriculum',
          value: 100000,
          status: 'not',
          showValueInput: true,
        },
        {
          id: 'rt3',
          description: 'I just tried this recipe and it was amazing!',
          status: null,
          showValueInput: false,
        },
      ],
    },
    {
      id: 'r2',
      title: 'Learning Product design course curiculum',
      collapsed: true,
      tasks: [
        {
          id: 'rt4',
          description:
            'Learning Product design course curriculum, Learning Product design .',
          status: 'done',
          showValueInput: false,
        },
        {
          id: 'rt5',
          description:
            'Learning Product design course curriculum, Learning Product design .',
          status: 'done',
          showValueInput: false,
        },
      ],
    },
  ]);

  // Update planningTasks when weekly tasks are loaded
  useEffect(() => {
    if (
      activeCadence === 'daily' &&
      viewMode === 'planning' &&
      transformedWeeklyTasks.length > 0
    ) {
      setPlanningTasks(transformedWeeklyTasks);
    }
  }, [transformedWeeklyTasks, activeCadence, viewMode]);

  const priorityOptions = [
    {
      value: 'High',
      label: (
        <span
          data-cy="planning-and-reporting-components-drawers-adddailyplandrawer-tsx-adddailyplandrawer-span-266"
          className="text-[#FF4D4F]"
        >
          High
        </span>
      ),
    },
    {
      value: 'Medium',
      label: (
        <span
          data-cy="planning-and-reporting-components-drawers-adddailyplandrawer-tsx-adddailyplandrawer-span-267"
          className="text-[#FAAD14]"
        >
          Medium
        </span>
      ),
    },
    {
      value: 'Low',
      label: (
        <span
          data-cy="planning-and-reporting-components-drawers-adddailyplandrawer-tsx-adddailyplandrawer-span-268"
          className="text-[#52C41A]"
        >
          Low
        </span>
      ),
    },
  ];

  // --- Planning Handlers ---
  const togglePlanningGroupCollapse = (groupId: string) => {
    setPlanningTasks((prev) =>
      prev.map((group) => {
        if (group.id !== groupId) return group;
        return { ...group, collapsed: !group.collapsed };
      }),
    );
  };

  // Calculate total weight - watch form values
  const formValues = Form.useWatch([], form);
  const totalWeight = useMemo(() => {
    if (activeCadence !== 'daily' || viewMode !== 'planning') return 0;

    let total = 0;
    planningTasks.forEach((group) => {
      const formFieldName = `names-${group.id}`;
      const tasks = formValues?.[formFieldName] || [];
      tasks.forEach((task: any) => {
        total += Number(task?.weight || 0);
      });
    });
    return total;
  }, [formValues, planningTasks, activeCadence, viewMode]);

  // Handle form submission
  const handleSubmit = () => {
    form
      .validateFields()
      .then((values) => {
        // Merge all tasks from names-* fields
        const allTasks: any[] = [];
        Object.keys(values).forEach((key) => {
          if (key.startsWith('names-') && Array.isArray(values[key])) {
            allTasks.push(...values[key]);
          }
        });

        if (allTasks.length === 0) {
          // No tasks to submit
          onClose();
          return;
        }

        createTask(
          { tasks: allTasks },
          {
            onSuccess: () => {
              form.resetFields();
              setPlanningTasks([]);
              onClose();
            },
          },
        );
      })
      .catch(() => {
        // Form validation failed
      });
  };

  // Reset form when drawer closes
  useEffect(() => {
    if (!open) {
      form.resetFields();
      setPlanningTasks([]);
    }
  }, [open, form]);

  // --- Reporting Handlers ---
  const handleStatusChange = (
    groupId: string,
    taskId: string,
    newStatus: 'done' | 'not',
  ) => {
    setReportingTasks((prev) =>
      prev.map((group) => {
        if (group.id !== groupId) return group;
        return {
          ...group,
          tasks: group.tasks.map((task) => {
            if (task.id !== taskId) return task;
            return {
              ...task,
              status: newStatus,
            };
          }),
        };
      }),
    );
  };

  const toggleReportingGroupCollapse = (groupId: string) => {
    setReportingTasks((prev) =>
      prev.map((group) => {
        if (group.id !== groupId) return group;
        return { ...group, collapsed: !group.collapsed };
      }),
    );
  };

  const renderPlanningContent = () => {
    if (isLoadingHierarchy) {
      return (
        <div
          data-cy="planning-and-reporting-components-drawers-adddailyplandrawer-tsx-adddailyplandrawer-div-375"
          className="flex items-center justify-center min-h-[400px]"
        >
          <Spin size="large" tip="Loading weekly plans..." />
        </div>
      );
    }

    if (activeCadence === 'daily' && planningTasks.length === 0) {
      return (
        <div
          data-cy="planning-and-reporting-components-drawers-adddailyplandrawer-tsx-adddailyplandrawer-div-383"
          className="flex items-center justify-center min-h-[400px] text-[#8F94A3]"
        >
          <div
            data-cy="planning-and-reporting-components-drawers-adddailyplandrawer-tsx-adddailyplandrawer-div-384"
            className="text-center"
          >
            <p
              data-cy="planning-and-reporting-components-drawers-adddailyplandrawer-tsx-adddailyplandrawer-p-385"
              className="text-lg font-semibold mb-2"
            >
              No Weekly Plans Available
            </p>
            <p
              data-cy="planning-and-reporting-components-drawers-adddailyplandrawer-tsx-adddailyplandrawer-p-388"
              className="text-sm"
            >
              Please create a weekly plan first before creating daily plans.
            </p>
          </div>
        </div>
      );
    }

    return (
      <div
        data-cy="planning-and-reporting-components-drawers-adddailyplandrawer-tsx-adddailyplandrawer-div-397"
        className="flex flex-col gap-6 p-2"
      >
        {planningTasks.map((group) => {
          const formFieldName = `names-${group.id}`;
          const weeklyTask = group.tasks[0]; // The weekly task

          return (
            <div
              key={group.id}
              className="rounded-2xl border border-[#F1F2F6] bg-white p-6"
              data-cy="planningandreporting-planning-and-reporting-components-drawers-adddailyplandrawer-tsx-div-451"
            >
              <div
                id={`daily-plan-collapse-header-${group.id}`}
                data-cy={`daily-plan-collapse-header-${group.id}`}
                className={`${group.collapsed ? 'mb-0' : 'mb-4'} flex items-center justify-between cursor-pointer`}
                onClick={() => togglePlanningGroupCollapse(group.id)}
              >
                <div data-cy="planning-and-reporting-components-drawers-adddailyplandrawer-tsx-adddailyplandrawer-div-413">
                  <span
                    data-cy="planning-and-reporting-components-drawers-adddailyplandrawer-tsx-adddailyplandrawer-span-414"
                    className="font-bold text-[#161A2C]"
                  >
                    Weekly-task :{' '}
                  </span>
                  <span
                    data-cy="planning-and-reporting-components-drawers-adddailyplandrawer-tsx-adddailyplandrawer-span-417"
                    className="text-[#5A5C80]"
                  >
                    {group.title}
                  </span>
                </div>
                {group.collapsed ? <DownOutlined /> : <UpOutlined />}
              </div>

              {!group.collapsed && (
                <div
                  data-cy="planning-and-reporting-components-drawers-adddailyplandrawer-tsx-adddailyplandrawer-div-423"
                  className="flex flex-col gap-4"
                >
                  {/* Show the weekly task info */}
                  <div
                    data-cy="planning-and-reporting-components-drawers-adddailyplandrawer-tsx-adddailyplandrawer-div-425"
                    className="p-3 bg-white rounded-lg mb-2 border border-[#E5E7EB]"
                  >
                    <p
                      data-cy="planning-and-reporting-components-drawers-adddailyplandrawer-tsx-adddailyplandrawer-p-426"
                      className="text-sm font-medium text-[#161A2C] mb-1"
                    >
                      Weekly Task:
                    </p>
                    <p
                      data-cy="planning-and-reporting-components-drawers-adddailyplandrawer-tsx-adddailyplandrawer-p-429"
                      className="text-sm text-[#5A5C80]"
                    >
                      {weeklyTask.description}
                    </p>
                    <div
                      data-cy="planning-and-reporting-components-drawers-adddailyplandrawer-tsx-adddailyplandrawer-div-432"
                      className="flex items-center gap-4 mt-2 text-xs text-[#8F94A3]"
                    >
                      <span data-cy="planning-and-reporting-components-drawers-adddailyplandrawer-tsx-adddailyplandrawer-span-433">
                        Priority: {weeklyTask.priority}
                      </span>
                      <span data-cy="planning-and-reporting-components-drawers-adddailyplandrawer-tsx-adddailyplandrawer-span-434">
                        Weight: {weeklyTask.weight}%
                      </span>
                      {weeklyTask.target > 0 && (
                        <span data-cy="planning-and-reporting-components-drawers-adddailyplandrawer-tsx-adddailyplandrawer-span-436">
                          Target: {weeklyTask.target.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Form.List for daily tasks */}
                  <Form.List name={formFieldName}>
                    {(fields, { add, remove }) => (
                      <>
                        {fields.map((field) => {
                          return (
                            <div
                              key={field.key}
                              className="flex items-start gap-3 [&_.ant-form-item-explain-error]:text-[11px]"
                              data-cy="planningandreporting-planning-and-reporting-components-drawers-adddailyplandrawer-tsx-div-524"
                            >
                              {/* Hidden fields for metadata */}
                              <Form.Item
                                name={[field.name, 'keyResultId']}
                                hidden
                                initialValue={group.keyResultId}
                              >
                                <Input type="hidden" />
                              </Form.Item>
                              <Form.Item
                                name={[field.name, 'milestoneId']}
                                hidden
                                initialValue={group.milestoneId}
                              >
                                <Input type="hidden" />
                              </Form.Item>
                              <Form.Item
                                name={[field.name, 'parentTaskId']}
                                hidden
                                initialValue={group.parentTaskId}
                              >
                                <Input type="hidden" />
                              </Form.Item>
                              <Form.Item
                                name={[field.name, 'planningPeriodId']}
                                hidden
                                initialValue={planningPeriodId}
                              >
                                <Input type="hidden" />
                              </Form.Item>
                              <Form.Item
                                name={[field.name, 'planningUserId']}
                                hidden
                                initialValue={planningUserId}
                              >
                                <Input type="hidden" />
                              </Form.Item>
                              <Form.Item
                                name={[field.name, 'userId']}
                                hidden
                                initialValue={userId}
                              >
                                <Input type="hidden" />
                              </Form.Item>
                              <Form.Item
                                name={[field.name, 'parentPlanId']}
                                hidden
                                initialValue={parentPlanId}
                              >
                                <Input type="hidden" />
                              </Form.Item>

                              {/* Task description */}
                              <Form.Item
                                name={[field.name, 'task']}
                                rules={[
                                  {
                                    required: true,
                                    message: 'Task description is required',
                                  },
                                ]}
                                className="flex-1 mb-0"
                              >
                                <Input
                                  id={`daily-plan-task-input-${group.id}-${field.name}`}
                                  data-cy={`daily-plan-task-input-${group.id}-${field.name}`}
                                  placeholder="Enter task description"
                                  className="rounded-lg border-[#E5E7EB] py-2"
                                />
                              </Form.Item>

                              {/* Priority */}
                              <Form.Item
                                name={[field.name, 'priority']}
                                initialValue="High"
                                className="mb-0"
                                rules={[
                                  { required: true, message: 'Required' },
                                ]}
                              >
                                <Select
                                  id={`daily-plan-priority-select-${group.id}-${field.name}`}
                                  data-cy={`daily-plan-priority-select-${group.id}-${field.name}`}
                                  options={priorityOptions}
                                  className="w-[100px] [&_.ant-select-selector]:!rounded-lg [&_.ant-select-selector]:!border-[#E5E7EB] [&_.ant-select-selector]:!h-[42px] [&_.ant-select-selector]:!items-center"
                                  popupClassName="rounded-lg"
                                />
                              </Form.Item>

                              {/* Weight */}
                              <Form.Item
                                name={[field.name, 'weight']}
                                initialValue={0}
                                className="mb-0"
                                rules={[
                                  { required: true, message: 'Required' },
                                  {
                                    validator: (nonused, value) => {
                                      if (
                                        value !== undefined &&
                                        value !== null &&
                                        value <= 0
                                      ) {
                                        return Promise.reject(new Error('> 0'));
                                      }
                                      return Promise.resolve();
                                    },
                                  },
                                ]}
                              >
                                <InputNumber<number>
                                  id={`daily-plan-weight-input-${group.id}-${field.name}`}
                                  data-cy={`daily-plan-weight-input-${group.id}-${field.name}`}
                                  min={0}
                                  max={100}
                                  className="w-[80px] rounded-lg border-[#E5E7EB]"
                                  controls={false}
                                  formatter={(value) => `${value}%`}
                                  parser={(value) =>
                                    Number(value?.replace('%', '') || '0')
                                  }
                                />
                              </Form.Item>

                              {/* Target - only show if not Milestone */}
                              {group.targetValue !== null &&
                                group.targetValue !== undefined && (
                                  <Form.Item
                                    name={[field.name, 'targetValue']}
                                    initialValue={0}
                                    className="mb-0"
                                    rules={[
                                      {
                                        validator: (_rule, value) => {
                                          const err =
                                            validateMetricValueAgainstInitial(
                                              value,
                                              {
                                                metricType: {
                                                  name:
                                                    group.metricTypeName ??
                                                    undefined,
                                                },
                                                initialValue:
                                                  group.keyResultInitialValue,
                                                targetValue:
                                                  group.keyResultTargetValue,
                                              },
                                            );
                                          if (err) {
                                            return Promise.reject(
                                              new Error(err),
                                            );
                                          }
                                          return Promise.resolve();
                                        },
                                      },
                                    ]}
                                  >
                                    <InputNumber<number>
                                      id={`daily-plan-target-input-${group.id}-${field.name}`}
                                      data-cy={`daily-plan-target-input-${group.id}-${field.name}`}
                                      min={getMetricValueInputMin({
                                        metricType: {
                                          name: group.metricTypeName ?? undefined,
                                        },
                                        initialValue:
                                          group.keyResultInitialValue,
                                        targetValue:
                                          group.keyResultTargetValue,
                                      })}
                                      max={getMetricValueInputMax({
                                        metricType: {
                                          name: group.metricTypeName ?? undefined,
                                        },
                                        initialValue:
                                          group.keyResultInitialValue,
                                        targetValue:
                                          group.keyResultTargetValue,
                                      })}
                                      className="w-[140px] rounded-lg border-[#E5E7EB] text-right"
                                      controls={false}
                                      formatter={(value) =>
                                        value?.toLocaleString() || '0'
                                      }
                                      parser={(value) =>
                                        Number(value?.replace(/,/g, '') || '0')
                                      }
                                    />
                                  </Form.Item>
                                )}

                              {/* Remove button */}
                              <Button
                                id={`daily-plan-remove-button-${group.id}-${field.name}`}
                                data-cy={`daily-plan-remove-button-${group.id}-${field.name}`}
                                type="text"
                                icon={
                                  <CloseCircleFilled className="text-[#574CFF] text-xl" />
                                }
                                className="flex items-center justify-center mt-1 hover:bg-transparent"
                                onClick={() => remove(field.name)}
                              />
                            </div>
                          );
                        })}

                        {/* Add Task button */}
                        <div
                          data-cy="planning-and-reporting-components-drawers-adddailyplandrawer-tsx-adddailyplandrawer-div-616"
                          className="flex justify-end mt-2 sm:mt-0"
                        >
                          <Button
                            id={`daily-plan-add-task-button-${group.id}`}
                            data-cy={`daily-plan-add-task-button-${group.id}`}
                            type="primary"
                            className="rounded-lg bg-[#1E40AF] px-6 font-medium text-white hover:bg-[#1E3A8A]"
                            onClick={() => {
                              const currentGroupFields = fields.flatMap(
                                (field) => {
                                  const base = [formFieldName, field.name];
                                  const groupFields = [
                                    [...base, 'task'],
                                    [...base, 'priority'],
                                    [...base, 'weight'],
                                  ];
                                  // targetValue is excluded from validation - only min={0} prevents negative values
                                  return groupFields;
                                },
                              );

                              form
                                .validateFields(currentGroupFields)
                                .then(() => {
                                  add({
                                    task: '',
                                    priority: 'High',
                                    weight: 0,
                                    targetValue: group.targetValue || 0,
                                    keyResultId: group.keyResultId,
                                    milestoneId: group.milestoneId || null,
                                    parentTaskId: group.parentTaskId || null,
                                    planningPeriodId: planningPeriodId || '',
                                    planningUserId: planningUserId || '',
                                    userId: userId,
                                    parentPlanId: parentPlanId || '',
                                  });
                                });
                            }}
                          >
                            Add Task
                          </Button>
                        </div>
                      </>
                    )}
                  </Form.List>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const renderReportingContent = () => (
    <div
      data-cy="planning-and-reporting-components-drawers-adddailyplandrawer-tsx-adddailyplandrawer-div-671"
      className="flex flex-col gap-6 p-2"
    >
      {reportingTasks.map((group) => (
        <div
          key={group.id}
          className="rounded-2xl border border-[#F1F2F6] bg-white p-6"
          data-cy="planning-and-reporting-components-drawers-adddailyplandrawer-tsx-adddailyplandrawer-div-756"
        >
          <div
            id={`daily-report-collapse-header-${group.id}`}
            data-cy={`daily-report-collapse-header-${group.id}`}
            className={`${group.collapsed ? 'mb-0' : 'mb-4'} flex items-center justify-between cursor-pointer`}
            onClick={() => toggleReportingGroupCollapse(group.id)}
          >
            <div data-cy="planning-and-reporting-components-drawers-adddailyplandrawer-tsx-adddailyplandrawer-div-683">
              <span
                data-cy="planning-and-reporting-components-drawers-adddailyplandrawer-tsx-adddailyplandrawer-span-684"
                className="font-bold text-[#161A2C]"
              >
                Weekly-task :{' '}
              </span>
              <span
                data-cy="planning-and-reporting-components-drawers-adddailyplandrawer-tsx-adddailyplandrawer-span-685"
                className="text-[#5A5C80]"
              >
                {group.title}
              </span>
            </div>
            {group.collapsed ? <DownOutlined /> : <UpOutlined />}
          </div>

          {!group.collapsed && (
            <div
              data-cy="planning-and-reporting-components-drawers-adddailyplandrawer-tsx-adddailyplandrawer-div-691"
              className="flex flex-col gap-6"
            >
              {group.tasks.map((task) => (
                <div
                  data-cy="planning-and-reporting-components-drawers-adddailyplandrawer-tsx-adddailyplandrawer-div-693"
                  key={task.id}
                  className="flex flex-col gap-3"
                >
                  <div
                    data-cy="planning-and-reporting-components-drawers-adddailyplandrawer-tsx-adddailyplandrawer-div-694"
                    className="flex items-start justify-between gap-4"
                  >
                    <div
                      className="flex-1 text-[#5A5C80] text-sm pt-2 min-w-0 truncate"
                      title={task.description}
                      data-cy="planningandreporting-planning-and-reporting-components-drawers-adddailyplandrawer-tsx-div-796"
                    >
                      {task.description}
                    </div>
                    <div
                      data-cy="planning-and-reporting-components-drawers-adddailyplandrawer-tsx-adddailyplandrawer-div-701"
                      className="flex items-center gap-2 sm:gap-4"
                    >
                      {task.showValueInput && (
                        <div
                          data-cy="planning-and-reporting-components-drawers-adddailyplandrawer-tsx-adddailyplandrawer-div-703"
                          className="relative w-[140px]"
                        >
                          <Input
                            id={`daily-report-value-input-${group.id}-${task.id}`}
                            data-cy={`daily-report-value-input-${group.id}-${task.id}`}
                            defaultValue={task.value?.toLocaleString()}
                            className="rounded-lg border-[#E5E7EB] py-1.5 pr-8 text-right"
                          />
                          <span
                            data-cy="planning-and-reporting-components-drawers-adddailyplandrawer-tsx-adddailyplandrawer-span-710"
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8F94A3]"
                          >
                            $
                          </span>
                        </div>
                      )}

                      <div
                        data-cy="planning-and-reporting-components-drawers-adddailyplandrawer-tsx-adddailyplandrawer-div-716"
                        className="flex items-center gap-3"
                      >
                        <div
                          id={`daily-report-status-done-${group.id}-${task.id}`}
                          data-cy={`daily-report-status-done-${group.id}-${task.id}`}
                          className={`flex items-center gap-1.5 cursor-pointer ${task.status === 'done' ? 'opacity-100' : 'opacity-60 hover:opacity-100'}`}
                          onClick={() =>
                            handleStatusChange(group.id, task.id, 'done')
                          }
                        >
                          <div
                            data-cy="planning-and-reporting-components-drawers-adddailyplandrawer-tsx-adddailyplandrawer-div-841"
                            className={`w-5 h-5 rounded-[4px] flex items-center justify-center border transition-all ${task.status === 'done' ? 'bg-[#00C48C] border-[#00C48C]' : 'bg-white border-[#E5E7EB]'}`}
                          >
                            {task.status === 'done' && (
                              <CheckOutlined className="text-white text-[10px]" />
                            )}
                          </div>
                          <span
                            data-cy="planning-and-reporting-components-drawers-adddailyplandrawer-tsx-adddailyplandrawer-span-732"
                            className="text-sm text-[#161A2C]"
                          >
                            Done
                          </span>
                        </div>

                        <div
                          id={`daily-report-status-not-${group.id}-${task.id}`}
                          data-cy={`daily-report-status-not-${group.id}-${task.id}`}
                          className={`flex items-center gap-1.5 cursor-pointer ${task.status === 'not' ? 'opacity-100' : 'opacity-60 hover:opacity-100'}`}
                          onClick={() =>
                            handleStatusChange(group.id, task.id, 'not')
                          }
                        >
                          <div
                            className={`w-5 h-5 rounded-[4px] flex items-center justify-center border transition-all ${task.status === 'not' ? 'bg-[#FF4D4F] border-[#FF4D4F]' : 'bg-white border-[#E5E7EB]'}`}
                            data-cy="planningandreporting-planning-and-reporting-components-drawers-adddailyplandrawer-tsx-div-861"
                          >
                            {task.status === 'not' && (
                              <CloseOutlined className="text-white text-[10px]" />
                            )}
                          </div>
                          <span
                            data-cy="planning-and-reporting-components-drawers-adddailyplandrawer-tsx-adddailyplandrawer-span-750"
                            className="text-sm text-[#161A2C]"
                          >
                            Not
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {task.status === 'not' && (
                    <div
                      data-cy="planning-and-reporting-components-drawers-adddailyplandrawer-tsx-adddailyplandrawer-div-757"
                      className="mt-2"
                    >
                      <Input.TextArea
                        id={`daily-report-comment-textarea-${group.id}-${task.id}`}
                        data-cy={`daily-report-comment-textarea-${group.id}-${task.id}`}
                        placeholder="Why was this not completed?"
                        defaultValue={task.comment}
                        rows={3}
                        className="rounded-lg border-[#574CFF] text-sm text-[#161A2C]"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );

  return (
    <Drawer
      title={
        <div
          data-cy="planning-and-reporting-components-drawers-adddailyplandrawer-tsx-adddailyplandrawer-div-780"
          className="text-center text-xl font-bold text-[#161A2C]"
        >
          {viewMode === 'planning' ? 'Daily Plan' : 'Daily Reporting'}
        </div>
      }
      placement="right"
      width={800}
      onClose={onClose}
      open={open}
      closable={false}
      className="[&_.ant-drawer-header]:border-b-0 [&_.ant-drawer-header]:pt-6 [&_.ant-drawer-header]:pb-2"
      footer={
        <div
          data-cy="planning-and-reporting-components-drawers-adddailyplandrawer-tsx-adddailyplandrawer-div-791"
          className="relative flex items-center justify-center px-4 my-3 sm:my-0 sm:py-2"
        >
          <div
            data-cy="planning-and-reporting-components-drawers-adddailyplandrawer-tsx-adddailyplandrawer-div-792"
            className="flex items-center gap-4"
          >
            <Button
              id="daily-plan-drawer-cancel-button"
              data-cy="daily-plan-drawer-cancel-button"
              size="large"
              className="rounded-xl border-[#E5E7EB] font-semibold text-[#161A2C] w-32 !py-2 sm:!py-6"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              id={`daily-plan-drawer-${viewMode === 'planning' ? 'plan' : 'report'}-button`}
              data-cy={`daily-plan-drawer-${viewMode === 'planning' ? 'plan' : 'report'}-button`}
              type="primary"
              size="large"
              className="w-32 rounded-xl bg-[#1E40AF] font-semibold text-white hover:bg-[#1E3A8A] !py-2 sm:!py-6"
              onClick={viewMode === 'planning' ? handleSubmit : onClose}
              loading={isCreating}
              disabled={
                viewMode === 'planning' &&
                !isChildDailyPlanning &&
                totalWeight !== 100
              }
            >
              {viewMode === 'planning' ? 'Plan' : 'Report'}
            </Button>
          </div>

          <div
            data-cy="planning-and-reporting-components-drawers-adddailyplandrawer-tsx-adddailyplandrawer-div-816"
            className="absolute right-4"
          >
            {viewMode === 'planning' ? (
              <Tooltip
                title={
                  !isChildDailyPlanning && totalWeight !== 100
                    ? "Summation of all task's weights must be equal to 100!"
                    : ''
                }
              >
                <span
                  data-cy="planning-and-reporting-components-drawers-adddailyplandrawer-tsx-adddailyplandrawer-span-825"
                  className="text-sm font-medium text-[#8F94A3]"
                >
                  <span
                    data-cy="planning-and-reporting-components-drawers-adddailyplandrawer-tsx-adddailyplandrawer-span-826"
                    className="md:hidden"
                  >
                    WP:
                  </span>{' '}
                  <span
                    data-cy="planning-and-reporting-components-drawers-adddailyplandrawer-tsx-adddailyplandrawer-span-827"
                    className="hidden md:inline"
                  >
                    Weight Point:
                  </span>{' '}
                  <span
                    className={
                      !isChildDailyPlanning && totalWeight === 100
                        ? 'text-[#52C41A]'
                        : 'text-[#161A2C]'
                    }
                    data-cy="planningandreporting-planning-and-reporting-components-drawers-adddailyplandrawer-tsx-span-979"
                  >
                    {totalWeight}%
                  </span>
                </span>
              </Tooltip>
            ) : (
              <span
                data-cy="planning-and-reporting-components-drawers-adddailyplandrawer-tsx-adddailyplandrawer-span-838"
                className="text-sm font-medium text-[#161A2C]"
              >
                <span
                  data-cy="planning-and-reporting-components-drawers-adddailyplandrawer-tsx-adddailyplandrawer-span-839"
                  className="md:hidden"
                >
                  TP:
                </span>{' '}
                <span
                  data-cy="planning-and-reporting-components-drawers-adddailyplandrawer-tsx-adddailyplandrawer-span-840"
                  className="hidden md:inline"
                >
                  Total Point:
                </span>{' '}
                <span
                  data-cy="planning-and-reporting-components-drawers-adddailyplandrawer-tsx-adddailyplandrawer-span-841"
                  className="text-[#00C48C]"
                >
                  85%
                </span>
              </span>
            )}
          </div>
        </div>
      }
    >
      <Form form={form} layout="vertical">
        {viewMode === 'planning'
          ? renderPlanningContent()
          : renderReportingContent()}
      </Form>
    </Drawer>
  );
}
