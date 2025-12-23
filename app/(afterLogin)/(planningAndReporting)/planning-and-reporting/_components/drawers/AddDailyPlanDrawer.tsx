import React, { useState, useMemo, useEffect } from 'react';
import { Drawer, Button, Input, Select, Form, Spin, Tooltip, InputNumber } from 'antd';
import { CloseCircleFilled, CheckOutlined, CloseOutlined, DownOutlined, UpOutlined } from '@ant-design/icons';
import { ViewMode, Cadence } from '../types';
import { useGetPlanningPeriodsHierarchy } from '@/store/server/features/okrPlanningAndReporting/queries';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { useCreatePlanTasks } from '@/store/server/features/employees/planning/mutation';
import { AllPlanningPeriods } from '@/store/server/features/okrPlanningAndReporting/queries';
import { groupParentTasks } from '../dataTransformer/plan';

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

export default function AddDailyPlanDrawer({ open, onClose, viewMode, planningPeriodId, activeCadence }: AddDailyPlanDrawerProps) {
    const { userId } = useAuthenticationStore();
    const [form] = Form.useForm();
    const { data: planningPeriods } = AllPlanningPeriods();
    const { mutate: createTask, isLoading: isCreating } = useCreatePlanTasks();

    // Get planningUserId
    const planningUserId = useMemo(() => {
        const safePlanningPeriods = Array.isArray(planningPeriods) ? planningPeriods : [];
        return safePlanningPeriods.find(
            (item: any) => item.planningPeriod?.id === planningPeriodId,
        )?.id;
    }, [planningPeriods, planningPeriodId]);

    // Fetch planning hierarchy for daily plans
    const { data: planningPeriodHierarchy, isLoading: isLoadingHierarchy } = useGetPlanningPeriodsHierarchy(
        userId,
        planningPeriodId || '',
    );

    // Get weekly plan tasks for daily planning
    const weeklyPlanTasks = useMemo(() => {
        if (activeCadence !== 'daily' || viewMode !== 'planning' || !planningPeriodHierarchy?.parentPlan) {
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
    ) => `${String(keyResultId ?? '')}${String(milestoneId ?? '')}${String(taskId ?? '')}`;

    // Get parent plan ID for daily plans
    const parentPlanId = useMemo(() => {
        if (activeCadence !== 'daily' || !planningPeriodHierarchy?.parentPlan) return '';
        return planningPeriodHierarchy.parentPlan.plans?.find(
            (i: any) => i.isReported === false,
        )?.id || '';
    }, [activeCadence, planningPeriodHierarchy]);

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
                            tasks: [
                                {
                                    id: task.id,
                                    description: task.task || '',
                                    priority: task.priority || 'Medium',
                                    weight: task.weight || 0,
                                    target: task.targetValue || 0,
                                }
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
                        tasks: [
                            {
                                id: task.id,
                                description: task.task || '',
                                priority: task.priority || 'Medium',
                                weight: task.weight || 0,
                                target: task.targetValue || 0,
                            }
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
                    description: 'Learning Product design course curriculum, Learning Product design .',
                    value: 100000,
                    status: 'done',
                    showValueInput: true
                },
                {
                    id: 'rt2',
                    description: 'Learning Product design course curriculum',
                    value: 100000,
                    status: 'not',
                    showValueInput: true
                },
                {
                    id: 'rt3',
                    description: 'I just tried this recipe and it was amazing!',
                    status: null,
                    showValueInput: false
                }
            ]
        },
        {
            id: 'r2',
            title: 'Learning Product design course curiculum',
            collapsed: true,
            tasks: [
                {
                    id: 'rt4',
                    description: 'Learning Product design course curriculum, Learning Product design .',
                    status: 'done',
                    showValueInput: false
                },
                {
                    id: 'rt5',
                    description: 'Learning Product design course curriculum, Learning Product design .',
                    status: 'done',
                    showValueInput: false
                }
            ]
        }
    ]);

    // Update planningTasks when weekly tasks are loaded
    useEffect(() => {
        if (activeCadence === 'daily' && viewMode === 'planning' && transformedWeeklyTasks.length > 0) {
            setPlanningTasks(transformedWeeklyTasks);
        }
    }, [transformedWeeklyTasks, activeCadence, viewMode]);

    const priorityOptions = [
        { value: 'High', label: <span className="text-[#FF4D4F]">High</span> },
        { value: 'Medium', label: <span className="text-[#FAAD14]">Medium</span> },
        { value: 'Low', label: <span className="text-[#52C41A]">Low</span> },
    ];

    // --- Planning Handlers ---
    const togglePlanningGroupCollapse = (groupId: string) => {
        setPlanningTasks(prev => prev.map(group => {
            if (group.id !== groupId) return group;
            return { ...group, collapsed: !group.collapsed };
        }));
    };


    // Calculate total weight - watch form values
    const formValues = Form.useWatch([], form);
    const totalWeight = useMemo(() => {
        if (activeCadence !== 'daily' || viewMode !== 'planning') return 0;

        let total = 0;
        planningTasks.forEach(group => {
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
        form.validateFields().then((values) => {
            // Merge all tasks from names-* fields
            const allTasks: any[] = [];
            Object.keys(values).forEach(key => {
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
                }
            );
        }).catch(() => {
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
    const handleStatusChange = (groupId: string, taskId: string, newStatus: 'done' | 'not') => {
        setReportingTasks(prev => prev.map(group => {
            if (group.id !== groupId) return group;
            return {
                ...group,
                tasks: group.tasks.map(task => {
                    if (task.id !== taskId) return task;
                    return {
                        ...task,
                        status: newStatus
                    };
                })
            };
        }));
    };

    const toggleReportingGroupCollapse = (groupId: string) => {
        setReportingTasks(prev => prev.map(group => {
            if (group.id !== groupId) return group;
            return { ...group, collapsed: !group.collapsed };
        }));
    };

    const renderPlanningContent = () => {
        if (isLoadingHierarchy) {
            return (
                <div className="flex items-center justify-center min-h-[400px]">
                    <Spin size="large" tip="Loading weekly plans..." />
                </div>
            );
        }

        if (activeCadence === 'daily' && planningTasks.length === 0) {
            return (
                <div className="flex items-center justify-center min-h-[400px] text-[#8F94A3]">
                    <div className="text-center">
                        <p className="text-lg font-semibold mb-2">No Weekly Plans Available</p>
                        <p className="text-sm">Please create a weekly plan first before creating daily plans.</p>
                    </div>
                </div>
            );
        }

        return (
            <div className="flex flex-col gap-6 p-2">
                {planningTasks.map((group) => {
                    const formFieldName = `names-${group.id}`;
                    const weeklyTask = group.tasks[0]; // The weekly task

                    return (
                        <div key={group.id} className="rounded-2xl border border-[#F1F2F6] bg-white p-6 shadow-sm">
                            <div
                                className="mb-4 flex items-center justify-between cursor-pointer"
                                onClick={() => togglePlanningGroupCollapse(group.id)}
                            >
                                <div>
                                    <span className="font-bold text-[#161A2C]">Weekly-task : </span>
                                    <span className="text-[#5A5C80]">{group.title}</span>
                                </div>
                                {group.collapsed ? <DownOutlined /> : <UpOutlined />}
                            </div>

                            {!group.collapsed && (
                                <div className="flex flex-col gap-4">
                                    {/* Show the weekly task info */}
                                    <div className="p-3 bg-[#F5F5F7] rounded-lg mb-2">
                                        <p className="text-sm font-medium text-[#161A2C] mb-1">Weekly Task:</p>
                                        <p className="text-sm text-[#5A5C80]">{weeklyTask.description}</p>
                                        <div className="flex items-center gap-4 mt-2 text-xs text-[#8F94A3]">
                                            <span>Priority: {weeklyTask.priority}</span>
                                            <span>Weight: {weeklyTask.weight}%</span>
                                            {weeklyTask.target > 0 && <span>Target: {weeklyTask.target.toLocaleString()}</span>}
                                        </div>
                                    </div>

                                    {/* Form.List for daily tasks */}
                                    <Form.List name={formFieldName}>
                                        {(fields, { add, remove }) => (
                                            <>
                                                {fields.map((field) => {
                                                    return (
                                                        <div key={field.key} className="flex items-start gap-3 [&_.ant-form-item-explain-error]:text-[11px]">
                                                            {/* Hidden fields for metadata */}
                                                            <Form.Item name={[field.name, 'keyResultId']} hidden initialValue={group.keyResultId}>
                                                                <Input type="hidden" />
                                                            </Form.Item>
                                                            <Form.Item name={[field.name, 'milestoneId']} hidden initialValue={group.milestoneId}>
                                                                <Input type="hidden" />
                                                            </Form.Item>
                                                            <Form.Item name={[field.name, 'parentTaskId']} hidden initialValue={group.parentTaskId}>
                                                                <Input type="hidden" />
                                                            </Form.Item>
                                                            <Form.Item name={[field.name, 'planningPeriodId']} hidden initialValue={planningPeriodId}>
                                                                <Input type="hidden" />
                                                            </Form.Item>
                                                            <Form.Item name={[field.name, 'planningUserId']} hidden initialValue={planningUserId}>
                                                                <Input type="hidden" />
                                                            </Form.Item>
                                                            <Form.Item name={[field.name, 'userId']} hidden initialValue={userId}>
                                                                <Input type="hidden" />
                                                            </Form.Item>
                                                            <Form.Item name={[field.name, 'parentPlanId']} hidden initialValue={parentPlanId}>
                                                                <Input type="hidden" />
                                                            </Form.Item>

                                                            {/* Task description */}
                                                            <Form.Item
                                                                name={[field.name, 'task']}
                                                                rules={[{ required: true, message: 'Task description is required' }]}
                                                                className="flex-1 mb-0"
                                                            >
                                                                <Input
                                                                    placeholder="Enter task description"
                                                                    className="rounded-lg border-[#E5E7EB] py-2"
                                                                />
                                                            </Form.Item>

                                                            {/* Priority */}
                                                            <Form.Item
                                                                name={[field.name, 'priority']}
                                                                initialValue="High"
                                                                className="mb-0"
                                                                rules={[{ required: true, message: 'Required' }]}
                                                            >
                                                                <Select
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
                                                                            if (value !== undefined && value !== null && value <= 0) {
                                                                                return Promise.reject(new Error('> 0'));
                                                                            }
                                                                            return Promise.resolve();
                                                                        },
                                                                    },
                                                                ]}
                                                            >
                                                                <InputNumber<number>
                                                                    min={0}
                                                                    max={100}
                                                                    className="w-[80px] rounded-lg border-[#E5E7EB]"
                                                                    controls={false}
                                                                    formatter={(value) => `${value}%`}
                                                                    parser={(value) => Number(value?.replace('%', '') || '0')}
                                                                />
                                                            </Form.Item>

                                                            {/* Target - only show if not Milestone */}
                                                            {group.targetValue !== null && group.targetValue !== undefined && (
                                                                <Form.Item
                                                                    name={[field.name, 'targetValue']}
                                                                    initialValue={0}
                                                                    className="mb-0"
                                                                >
                                                                    <InputNumber<number>
                                                                        min={0}
                                                                        className="w-[140px] rounded-lg border-[#E5E7EB] text-right"
                                                                        controls={false}
                                                                        formatter={(value) => value?.toLocaleString() || '0'}
                                                                        parser={(value) => Number(value?.replace(/,/g, '') || '0')}
                                                                    />
                                                                </Form.Item>
                                                            )}

                                                            {/* Remove button */}
                                                            <Button
                                                                type="text"
                                                                icon={<CloseCircleFilled className="text-[#574CFF] text-xl" />}
                                                                className="flex items-center justify-center mt-1 hover:bg-transparent"
                                                                onClick={() => remove(field.name)}
                                                            />
                                                        </div>
                                                    );
                                                })}

                                                {/* Add Task button */}
                                                <div className="flex justify-end mt-2 sm:mt-0">
                                                    <Button
                                                        type="primary"
                                                        className="bg-[#574CFF] hover:bg-[#4F46EF] rounded-lg font-medium px-6"
                                                        onClick={() => {
                                                            const currentGroupFields = fields.flatMap((field) => {
                                                                const base = [formFieldName, field.name];
                                                                const groupFields = [
                                                                    [...base, 'task'],
                                                                    [...base, 'priority'],
                                                                    [...base, 'weight'],
                                                                ];
                                                                if (group.targetValue !== null && group.targetValue !== undefined) {
                                                                    groupFields.push([...base, 'targetValue']);
                                                                }
                                                                return groupFields;
                                                            });

                                                            form.validateFields(currentGroupFields).then(() => {
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
        <div className="flex flex-col gap-6 p-2">
            {reportingTasks.map((group) => (
                <div key={group.id} className="rounded-2xl border border-[#F1F2F6] bg-white p-6 shadow-sm">
                    <div
                        className="mb-4 flex items-center justify-between cursor-pointer"
                        onClick={() => toggleReportingGroupCollapse(group.id)}
                    >
                        <div>
                            <span className="font-bold text-[#161A2C]">Weekly-task : </span>
                            <span className="text-[#5A5C80]">{group.title}</span>
                        </div>
                        {group.collapsed ? <DownOutlined /> : <UpOutlined />}
                    </div>

                    {!group.collapsed && (
                        <div className="flex flex-col gap-6">
                            {group.tasks.map((task) => (
                                <div key={task.id} className="flex flex-col gap-3">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1 text-[#5A5C80] text-sm pt-2 min-w-0 truncate" title={task.description}>
                                            {task.description}
                                        </div>
                                        <div className="flex items-center gap-2 sm:gap-4">
                                            {task.showValueInput && (
                                                <div className="relative w-[140px]">
                                                    <Input
                                                        defaultValue={task.value?.toLocaleString()}
                                                        className="rounded-lg border-[#E5E7EB] py-1.5 pr-8 text-right"
                                                    />
                                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8F94A3]">$</span>
                                                </div>
                                            )}

                                            <div className="flex items-center gap-3">
                                                <div
                                                    className={`flex items-center gap-1.5 cursor-pointer ${task.status === 'done' ? 'opacity-100' : 'opacity-60 hover:opacity-100'}`}
                                                    onClick={() => handleStatusChange(group.id, task.id, 'done')}
                                                >
                                                    <div className={`w-5 h-5 rounded-[4px] flex items-center justify-center border transition-all ${task.status === 'done' ? 'bg-[#00C48C] border-[#00C48C]' : 'bg-white border-[#E5E7EB]'}`}>
                                                        {task.status === 'done' && <CheckOutlined className="text-white text-[10px]" />}
                                                    </div>
                                                    <span className="text-sm text-[#161A2C]">Done</span>
                                                </div>

                                                <div
                                                    className={`flex items-center gap-1.5 cursor-pointer ${task.status === 'not' ? 'opacity-100' : 'opacity-60 hover:opacity-100'}`}
                                                    onClick={() => handleStatusChange(group.id, task.id, 'not')}
                                                >
                                                    <div className={`w-5 h-5 rounded-[4px] flex items-center justify-center border transition-all ${task.status === 'not' ? 'bg-[#FF4D4F] border-[#FF4D4F]' : 'bg-white border-[#E5E7EB]'}`}>
                                                        {task.status === 'not' && <CloseOutlined className="text-white text-[10px]" />}
                                                    </div>
                                                    <span className="text-sm text-[#161A2C]">Not</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {task.status === 'not' && (
                                        <div className="mt-2">
                                            <Input.TextArea
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
                <div className="text-center text-xl font-bold text-[#161A2C]">
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
                <div className="relative flex items-center justify-center px-4 py-2">
                    <div className="flex items-center gap-4">
                        <Button size="large" className="rounded-xl border-[#E5E7EB] font-semibold text-[#161A2C] w-32" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button
                            type="primary"
                            size="large"
                            className="rounded-xl bg-[#574CFF] font-semibold w-32 hover:bg-[#4F46EF]"
                            onClick={viewMode === 'planning' ? handleSubmit : onClose}
                            loading={isCreating}
                            disabled={viewMode === 'planning' && totalWeight !== 100}
                        >
                            {viewMode === 'planning' ? 'Plan' : 'Report'}
                        </Button>
                    </div>

                    <div className="absolute right-4">
                        {viewMode === 'planning' ? (
                            <Tooltip title={totalWeight !== 100 ? "Summation of all task's weights must be equal to 100!" : ''}>
                                <span className="text-sm font-medium text-[#8F94A3]">
                                    <span className="md:hidden">WP:</span> <span className="hidden md:inline">Weight Point:</span> <span className={totalWeight === 100 ? 'text-[#52C41A]' : 'text-[#161A2C]'}>{totalWeight}%</span>
                                </span>
                            </Tooltip>
                        ) : (
                            <span className="text-sm font-medium text-[#161A2C]"><span className="md:hidden">TP:</span> <span className="hidden md:inline">Total Point:</span> <span className="text-[#00C48C]">85%</span></span>
                        )}
                    </div>
                </div>
            }
        >
            <Form form={form} layout="vertical">
                {viewMode === 'planning' ? renderPlanningContent() : renderReportingContent()}
            </Form>
        </Drawer>
    );
}
