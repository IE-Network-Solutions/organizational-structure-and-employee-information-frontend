import React from 'react';
import { Collapse, Button, Divider, Dropdown } from 'antd';
import DefaultCardForm from '../planForms/defaultForm';
import { groupParentTasks } from '../dataTransformer/plan';
import { BsKey } from 'react-icons/bs';
import useClickStatus from '@/store/uistate/features/planningAndReporting/planingState';
import { UpOutlined, DownOutlined } from '@ant-design/icons';
import { NAME } from '@/types/enumTypes';

interface Plan {
    id: string;
    name: string;
    tasks: Task[];
}

interface Task {
    id: string;
    task: string;
    keyResult: {
        id: string;
        title: string;
        objective: {
            id: string;
            title: string;
        };
        weight?: number;
        metricType?: {
            name: string;
        };
    };
    milestone?: {
        id: string;
        title: string;
        status?: string;
    };
    targetValue?: any;
}

interface CollapseComponentProps {
    planningPeriodHierarchy: {
        parentPlan: {
            id: string;
            name: string;
            plans: Plan[];
        };
    };
    form: any;
    planningPeriodId: string;
    userId: string;
    planningUserId: string;
    mkAsATask?: boolean;
    setMKAsATask: (value: any) => void;
    handleAddBoard: (
        id: string,
        keyResultId?: string,
        milestoneId?: string | null,
        parentTaskId?: string | null,
    ) => void;
    weights: Record<string, number>;
    failedTasksByKeyResult?: Record<
        string,
        Record<string | 'noMilestone', any[]>
    >;
}

const PlanningHierarchyComponent: React.FC<CollapseComponentProps> = ({
    planningPeriodHierarchy,
    form,
    planningPeriodId,
    userId,
    planningUserId,
    mkAsATask,
    setMKAsATask,
    handleAddBoard,
    weights,
}) => {
    const formattedData = groupParentTasks(
        planningPeriodHierarchy?.parentPlan?.plans?.find(
            (i: any) => i.isReported === false,
        )?.tasks || [],
    );
    // const parentName = planningPeriodHierarchy?.parentPlan?.name;
    // const parentParentId = planningPeriodHierarchy?.parentPlan?.plans[0]?.id;
    const parentParentId = planningPeriodHierarchy?.parentPlan?.plans?.find(
        (i: any) => i.isReported === false,
    )?.id;
    const { statuses } = useClickStatus();

    const buildKey = (
        keyResultId?: string | number,
        milestoneId?: string | number | null,
        taskId?: string | number | null,
    ) =>
        `${String(keyResultId ?? '')}${String(milestoneId ?? '')}${String(taskId ?? '')}`;

    return (
        <Collapse
            expandIconPosition="end"
            bordered={false}
            className="[&_.ant-collapse-item]:mb-4 [&_.ant-collapse-item]:rounded-lg [&_.ant-collapse-item]:!border-t [&_.ant-collapse-item]:!border-b [&_.ant-collapse-item]:!border-l [&_.ant-collapse-item]:!border-r [&_.ant-collapse-item]:!border-gray-200 [&_.ant-collapse-item]:overflow-hidden [&_.ant-collapse-header]:border-b-0 [&_.ant-collapse-content]:border-t-0 [&_.ant-collapse-content]:bg-transparent"
            expandIcon={({ isActive }) => <UpOutlined rotate={isActive ? 180 : 0} />}
        >
            {formattedData.map((objective) => (
                <Collapse.Panel
                    forceRender={true}
                    header={
                        <div className="p-2">
                            <strong>OBJECTIVE:</strong> {objective.title}
                        </div>
                    }
                    key={objective.id}
                >
                    <div className="flex flex-col justify-between ">
                        {objective.keyResults.map((keyResult) => (
                            <div
                                key={keyResult.id}
                                className="border-2 border-gray-200 rounded-lg p-2 mb-4"
                            >
                                <div className="flex items-center justify-between gap-3 mt-2 mb-3 ml-4 flex-wrap">
                                    <div className="flex items-center gap-3">
                                        <BsKey
                                            size={24}
                                            className="text-[#574CFF] flex-shrink-0"
                                        />
                                        <span className="text-sm font-normal">{keyResult.title}</span>
                                    </div>

                                    {keyResult?.weight !== undefined && (
                                        <div className="flex items-center gap-2 mr-2">
                                            {keyResult?.metricType?.name === NAME.ACHIEVE && (
                                                <Dropdown.Button
                                                    type="primary"
                                                    icon={<DownOutlined />}
                                                    disabled={Number(keyResult?.progress) === 100}
                                                    menu={{
                                                        items: [
                                                            {
                                                                key: 'plan-keyresult-as-task',
                                                                label: 'Plan Key Result as a Task',
                                                                disabled:
                                                                    Number(keyResult?.progress) === 100 ||
                                                                    form
                                                                        ?.getFieldValue(`names-${keyResult.id}`)
                                                                        ?.some((i: any) => i?.achieveMK),
                                                                onClick: () => {
                                                                    setMKAsATask({
                                                                        title: keyResult?.title,
                                                                        mid: keyResult?.id,
                                                                    });
                                                                    handleAddBoard(keyResult?.id);
                                                                },
                                                            },
                                                        ],
                                                    }}
                                                    onClick={() => {
                                                        setMKAsATask(null);
                                                        handleAddBoard(keyResult?.id);
                                                    }}
                                                >
                                                    Add Task
                                                </Dropdown.Button>
                                            )}
                                            <span className="text-xs flex items-center gap-1.5 text-gray-500">
                                                <span className="w-1.5 h-1.5 rounded-full bg-[#574CFF] inline-block"></span>
                                                Weight
                                            </span>
                                            <div className="rounded-lg bg-[#E8E7FF] text-[#574CFF] font-bold px-3 py-1 text-xs flex items-center justify-center min-w-[45px]">
                                                {keyResult.weight}%
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <Divider className="my-2" />
                                {keyResult.milestones.map((milestone) => (
                                    <div key={milestone.id} className="ml-4 mt-2">
                                        <div className="flex items-center justify-between mb-2 mr-2">
                                            <div className="flex items-center">
                                                <span className="font-bold">Milestone:</span>
                                                <span className="text-xs ml-2">{milestone.title}</span>
                                            </div>
                                            <Dropdown.Button
                                                type="primary"
                                                icon={<DownOutlined />}
                                                disabled={milestone?.status === 'Completed'}
                                                menu={{
                                                    items: [
                                                        {
                                                            key: 'plan-milestone-as-task',
                                                            label: 'Plan Milestone as a Task',
                                                            disabled:
                                                                statuses[milestone?.id] ||
                                                                milestone?.status === 'Completed' ||
                                                                form
                                                                    ?.getFieldValue(`names-${keyResult.id + milestone.id}`)
                                                                    ?.some((i: any) => i?.achieveMK),
                                                            onClick: () => {
                                                                setMKAsATask({
                                                                    title: milestone?.title,
                                                                    mid: milestone?.id,
                                                                });
                                                                handleAddBoard(keyResult.id + milestone.id);
                                                            },
                                                        },
                                                    ],
                                                }}
                                                onClick={() => {
                                                    setMKAsATask(null);
                                                    handleAddBoard(keyResult.id + milestone.id);
                                                }}
                                            >
                                                Add Task
                                            </Dropdown.Button>
                                        </div>
                                        {/* <div className="flex items-center">
                    <span className="font-normal  ml-3 mt-2">{parentName} Tasks:</span>
                    
                  </div> */}
                                        {milestone.tasks.map((task) => {
                                            const compositeKey = buildKey(
                                                task?.keyResult?.id,
                                                milestone?.id,
                                                task?.id,
                                            );
                                            return (
                                                <div key={task.id} className="">
                                                    <div className="flex items-center mb-2 justify-between">
                                                        <div className="flex items-center gap-1">
                                                            <span className="text-[12px] font-normal line-clamp-2">
                                                                {task.task}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <Button
                                                                id={`plan-as-task_${keyResult?.id ?? ''}${milestone?.id ?? ''}${task?.id ?? ''}`}
                                                                type="primary"
                                                                disabled={
                                                                    statuses[milestone?.id] ||
                                                                    milestone?.status === 'Completed' ||
                                                                    Number(keyResult?.progress) === 100 ||
                                                                    form
                                                                        ?.getFieldValue(`names-${compositeKey}`)
                                                                        ?.some((i: any) => i?.achieveMK)
                                                                }
                                                                onClick={() => {
                                                                    setMKAsATask(null);
                                                                    handleAddBoard(
                                                                        compositeKey,
                                                                        String(keyResult?.id || ''),
                                                                        milestone?.id ? String(milestone.id) : null,
                                                                        task?.id ? String(task.id) : null,
                                                                    );
                                                                }}
                                                            >
                                                                Add Plan Task
                                                            </Button>
                                                        </div>
                                                    </div>

                                                    <DefaultCardForm
                                                        kId={task?.keyResult?.id}
                                                        milestoneId={milestone?.id ?? null}
                                                        name={`names-${compositeKey}`}
                                                        form={form}
                                                        planningPeriodId={planningPeriodId || ''}
                                                        userId={userId}
                                                        parentPlanId={parentParentId || ''}
                                                        planningUserId={planningUserId || ''}
                                                        planTaskId={task.id || ''}
                                                        isMKAsTask={!!mkAsATask}
                                                        keyResult={task?.keyResult}
                                                        targetValue={task?.targetValue}
                                                    />
                                                </div>
                                            );
                                        })}
                                    </div>
                                ))}

                                {/* <div className="flex items-center">
                    <span className="font-normal  ml-3 mt-2">{parentName} Tasks:</span>
                    
                  </div> */}

                                {(() => {
                                    // Get existing tasks from keyResult.tasks
                                    const existingTasks = keyResult.tasks || [];

                                    // Get AI-added tasks from form data
                                    const aiAddedTasks =
                                        form?.getFieldValue(`names-${keyResult.id}`) || [];

                                    // Combine both lists for display
                                    const allTasks = [
                                        ...existingTasks.map((task: any, index: number) => ({
                                            ...task,
                                            isAITask: false,
                                            displayIndex: index + 1,
                                        })),
                                        ...aiAddedTasks.map((task: any, index: number) => ({
                                            ...task,
                                            id: `ai-${keyResult.id}-${index}`, // Generate unique ID for AI tasks
                                            keyResult: { id: keyResult.id, title: keyResult.title },
                                            isAITask: true,
                                            displayIndex: existingTasks.length + index + 1,
                                        })),
                                    ];

                                    return allTasks.map((task, taskIndex) => {
                                        const compositeKey = task.isAITask
                                            ? `${keyResult.id}ai-${taskIndex}`
                                            : buildKey(task?.keyResult?.id, undefined, task?.id);

                                        return (
                                            <div key={task.id} className="ml-4 mt-2">
                                                <div className="flex items-center mb-2 justify-between">
                                                    <div className="flex items-center gap-1">
                                                        <span className="rounded-lg border-gray-200 border bg-gray-300 w-6 h-6 text-[12px] flex items-center justify-center">
                                                            {task.displayIndex}.
                                                        </span>
                                                        <span className="text-[12px] font-normal line-clamp-2">
                                                            {task.task}
                                                        </span>
                                                        {task.isAITask && (
                                                            <span className="text-[10px] text-blue-600 bg-blue-100 px-2 py-1 rounded">
                                                                AI
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-xs flex items-center gap-1.5 text-gray-500">
                                                                <span className="w-1.5 h-1.5 rounded-full bg-[#574CFF] inline-block"></span>
                                                                Weight
                                                            </span>
                                                            <div className="rounded-lg bg-[#E8E7FF] text-[#574CFF] font-bold px-3 py-1 text-xs flex items-center justify-center min-w-[45px]">
                                                                {task.isAITask
                                                                    ? task.weight || 0
                                                                    : weights[`names-${compositeKey}`] || 0}
                                                                %
                                                            </div>
                                                        </div>
                                                        {!task.isAITask && (
                                                            <Button
                                                                id={`plan-as-task_${keyResult?.id ?? ''}`}
                                                                onClick={() =>
                                                                    handleAddBoard(
                                                                        compositeKey,
                                                                        String(keyResult?.id || ''),
                                                                        null,
                                                                        task?.id ? String(task.id) : null,
                                                                    )
                                                                }
                                                                type="primary"
                                                                disabled={
                                                                    statuses[keyResult?.id] ||
                                                                    Number(keyResult?.progress) === 100 ||
                                                                    (form?.getFieldValue(`names-${compositeKey}`)
                                                                        ?.length ?? 0) > 0 ||
                                                                    form
                                                                        ?.getFieldValue(`names-${compositeKey}`)
                                                                        ?.some((i: any) => i?.achieveMK)
                                                                }
                                                            >
                                                                Add Plan Task
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>
                                                <Divider className="my-2" />

                                                {!task.isAITask && (
                                                    <>
                                                        <DefaultCardForm
                                                            kId={task?.keyResult?.id}
                                                            milestoneId={task?.milestone?.id ?? null}
                                                            name={`names-${compositeKey}`}
                                                            form={form}
                                                            planningPeriodId={planningPeriodId || ''}
                                                            userId={userId}
                                                            parentPlanId={parentParentId || ''}
                                                            planningUserId={planningUserId || ''}
                                                            planTaskId={task.id || ''}
                                                            isMKAsTask={!!mkAsATask}
                                                            keyResult={task?.keyResult}
                                                            targetValue={task?.targetValue}
                                                        />
                                                    </>
                                                )}
                                            </div>
                                        );
                                    });
                                })()}
                            </div>
                        ))}
                    </div>
                </Collapse.Panel>
            ))}
        </Collapse>
    );
};

export default PlanningHierarchyComponent;
