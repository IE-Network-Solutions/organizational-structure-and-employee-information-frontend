import React from 'react';
import { Button } from 'antd';
import DefaultCardForm from '../planForms/defaultForm';
import { groupParentTasks } from '../dataTransformer/plan';
import useClickStatus from '@/store/uistate/features/planningAndReporting/planingState';

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
    progress?: string | number;
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
    handleAddBoard: (id: string) => void;
    handleAddName: (values: Record<string, any>, key: string) => void;
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
}) => {
    const formattedData = groupParentTasks(
        planningPeriodHierarchy?.parentPlan?.plans?.find(
            (i: any) => i.isReported === false,
        )?.tasks || [],
    );

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
        <div className="flex flex-col gap-6 p-2">
            {formattedData.map((objective) => (
                <div key={objective.id} className="flex flex-col gap-6">
                    {objective.keyResults.map((keyResult) => (
                        <React.Fragment key={keyResult.id}>
                            {/* Render tasks within milestones as cards */}
                            {keyResult.milestones.map((milestone) => (
                                <React.Fragment key={milestone.id}>
                                    {milestone.tasks.map((task) => {
                                        const compositeKey = buildKey(
                                            keyResult.id,
                                            milestone.id,
                                            task.id,
                                        );
                                        return (
                                            <div key={task.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                                                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/20">
                                                    <div className="text-sm">
                                                        <strong className="text-gray-950">
                                                            {planningPeriodHierarchy?.parentPlan?.name || 'Parent'}-task :
                                                        </strong>
                                                        <span className="ml-2 text-gray-700">{task.task}</span>
                                                    </div>
                                                </div>

                                                <div className="px-4 py-2">
                                                    <DefaultCardForm
                                                        kId={keyResult.id}
                                                        milestoneId={milestone.id}
                                                        name={`names-${compositeKey}`}
                                                        form={form}
                                                        planningPeriodId={planningPeriodId || ''}
                                                        userId={userId}
                                                        parentPlanId={parentParentId || ''}
                                                        planningUserId={planningUserId || ''}
                                                        planTaskId={task.id || ''}
                                                        isMKAsTask={!!mkAsATask}
                                                        keyResult={keyResult}
                                                        targetValue={task.targetValue}
                                                    />
                                                </div>

                                                <div className="px-4 pb-4 flex justify-end">
                                                    <Button
                                                        type="primary"
                                                        className="bg-[#3D41FF] hover:bg-[#3236e6] border-none rounded-md px-8 font-bold"
                                                        onClick={() => {
                                                            setMKAsATask(null);
                                                            handleAddBoard(compositeKey);
                                                        }}
                                                        disabled={
                                                            statuses[milestone.id] ||
                                                            milestone.status === 'Completed' ||
                                                            Number(keyResult.progress) === 100
                                                        }
                                                    >
                                                        Add Task
                                                    </Button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </React.Fragment>
                            ))}

                            {/* Render tasks without milestones as cards */}
                            {keyResult.tasks.map((task) => {
                                const compositeKey = buildKey(keyResult.id, null, task.id);
                                return (
                                    <div key={task.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                                        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/20">
                                            <div className="text-sm">
                                                <strong className="text-gray-950">
                                                    {planningPeriodHierarchy?.parentPlan?.name || 'Parent'}-task :
                                                </strong>
                                                <span className="ml-2 text-gray-700">{task.task}</span>
                                            </div>
                                        </div>

                                        <div className="px-4 py-2">
                                            <DefaultCardForm
                                                kId={keyResult.id}
                                                milestoneId={null}
                                                name={`names-${compositeKey}`}
                                                form={form}
                                                planningPeriodId={planningPeriodId || ''}
                                                userId={userId}
                                                parentPlanId={parentParentId || ''}
                                                planningUserId={planningUserId || ''}
                                                planTaskId={task.id || ''}
                                                isMKAsTask={!!mkAsATask}
                                                keyResult={keyResult}
                                                targetValue={task.targetValue}
                                            />
                                        </div>

                                        <div className="px-4 pb-4 flex justify-end">
                                            <Button
                                                type="primary"
                                                className="bg-[#3D41FF] hover:bg-[#3236e6] border-none rounded-md px-8 font-bold"
                                                onClick={() => {
                                                    setMKAsATask(null);
                                                    handleAddBoard(compositeKey);
                                                }}
                                                disabled={
                                                    statuses[keyResult.id] ||
                                                    Number(keyResult.progress) === 100
                                                }
                                            >
                                                Add Task
                                            </Button>
                                        </div>
                                    </div>
                                );
                            })}
                        </React.Fragment>
                    ))}
                </div>
            ))}
        </div>
    );
};

export default PlanningHierarchyComponent;
