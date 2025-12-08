import CustomDrawerLayout from '@/components/common/customDrawer';
import { PlanningAndReportingStore } from '@/store/uistate/features/planningAndReporting/useStore';
import {
    Button,
    Collapse,
    Form,
    Input,
    InputNumber,
    Spin,
    Typography,
} from 'antd';

import { CustomizeRenderEmpty } from '@/components/emptyIndicator';
import { useCreateReportForUnReportedtasks } from '@/store/server/features/okrPlanningAndReporting/mutations';
import {
    useDefaultPlanningPeriods,
    useGetPlannedTaskForReport,
} from '@/store/server/features/okrPlanningAndReporting/queries';
import { NAME } from '@/types/enumTypes';
import { useEffect } from 'react';
import { FaCheckSquare, FaRegSquare, FaWindowClose } from 'react-icons/fa';
import { groupUnReportedTasksByKeyResultAndMilestone } from '../dataTransformer/report';
const { Text } = Typography;

const { TextArea } = Input;
function CreateReport() {
    const {
        openReportModal,
        setOpenReportModal,
        activePlanPeriod,
        isEditing,
        resetWeights,
        setStatus,
        resetStatuses,
        activePlanPeriodId,
        selectedStatuses,
    } = PlanningAndReportingStore();
    const [form] = Form.useForm();

    // Set initial form values based on selectedStatuses

    const onClose = () => {
        setOpenReportModal(false);
        form.resetFields();
        resetStatuses();
        resetWeights();
    };
    // const { data: planningPeriods } = AllPlanningPeriods();
    const { data: planningPeriods } = useDefaultPlanningPeriods();

    const { mutate: createReport, isLoading: createReportLoading } =
        useCreateReportForUnReportedtasks();

    const getPlanningPeriodDetail = (id: string) => {
        const planningPeriodDetail = planningPeriods?.items?.find(
            (period: any) => period?.id === id,
        );
        return planningPeriodDetail || {}; // Return an empty object if planningPeriodDetail is undefined
    };
    const planningPeriodId =
        activePlanPeriodId ?? planningPeriods?.[activePlanPeriod - 1]?.id;
    const {
        data: allPlannedTaskForReport,
        isLoading: plannedTaskForReportLoading,
        refetch: refetchPlannedTasks,
    } = useGetPlannedTaskForReport(planningPeriodId);

    const planningPeriodName = getPlanningPeriodDetail(activePlanPeriodId)?.name;

    // const { data: allUnReportedPlanningTask } =
    //   useGetUnReportedPlanning(planningPeriodId,activeTab);

    const modalHeader = (
        <div className="text-center text-xl font-bold text-[#161A2C]">
            Create {planningPeriodName} Report
        </div>
    );

    const handleOnFinish = (values: Record<string, any>) => {
        Object.entries(values).length > 0 &&
            planningPeriodId &&
            createReport(
                {
                    values: values,
                    planningPeriodId: planningPeriodId,
                    planId: allPlannedTaskForReport?.[0]?.plan?.id,
                },

                {
                    onSuccess: () => {
                        onClose();
                    },
                },
            );
    };
    const formattedData =
        allPlannedTaskForReport &&
        groupUnReportedTasksByKeyResultAndMilestone(allPlannedTaskForReport);

    // Refetch data when modal opens to ensure we have latest status
    useEffect(() => {
        if (openReportModal) {
            refetchPlannedTasks();
        }
    }, [openReportModal, refetchPlannedTasks]);

    // Auto-set status for pre-achieved tasks - only run once when data is loaded
    useEffect(() => {
        if (formattedData) {
            const newStatuses: Record<string, string> = {};
            let hasChanges = false;

            // Only set initial statuses for pre-achieved tasks that haven't been manually set
            formattedData.forEach((objective: any) => {
                objective?.keyResults?.forEach((keyresult: any) => {
                    // Handle milestone tasks
                    keyresult?.milestones?.forEach((milestone: any) => {
                        milestone?.tasks?.forEach((task: any) => {
                            // Only auto-set if task is pre-achieved and user hasn't manually set a status
                            if (
                                task?.status === 'pre-achieved' &&
                                selectedStatuses[task.taskId] === undefined
                            ) {
                                newStatuses[task.taskId] = 'Done';
                                hasChanges = true;
                            }
                        });
                    });

                    // Handle regular tasks
                    keyresult?.tasks?.forEach((task: any) => {
                        // Only auto-set if task is pre-achieved and user hasn't manually set a status
                        if (
                            task?.status === 'pre-achieved' &&
                            selectedStatuses[task.taskId] === undefined
                        ) {
                            newStatuses[task.taskId] = 'Done';
                            hasChanges = true;
                        }
                    });
                });
            });

            // Update statuses only if there are new pre-achieved tasks to set
            if (hasChanges) {
                Object.entries(newStatuses).forEach(([taskId, status]) => {
                    setStatus(taskId, status);
                });
            }
        }
    }, [formattedData, setStatus]); // Removed selectedStatuses and other dependencies to prevent interference

    useEffect(() => {
        if (formattedData && Object.keys(selectedStatuses).length > 0) {
            const initialValues: Record<string, any> = {};

            formattedData.forEach((objective: any) => {
                objective?.keyResults?.forEach((keyresult: any) => {
                    // Handle milestone tasks
                    keyresult?.milestones?.forEach((milestone: any) => {
                        milestone?.tasks?.forEach((task: any) => {
                            if (selectedStatuses[task.taskId]) {
                                if (selectedStatuses[task.taskId] === 'Done') {
                                    initialValues[task.taskId] = {
                                        status: selectedStatuses[task.taskId],
                                        actualValue: Number(
                                            task?.targetValue ?? 0,
                                        )?.toLocaleString(),
                                    };
                                } else if (selectedStatuses[task.taskId] === 'Not') {
                                    initialValues[task.taskId] = {
                                        status: selectedStatuses[task.taskId],
                                        actualValue: Number(
                                            task?.actualValue ?? 0,
                                        )?.toLocaleString(),
                                    };
                                }
                            }
                        });
                    });

                    // Handle regular tasks
                    keyresult?.tasks?.forEach((task: any) => {
                        if (selectedStatuses[task.taskId]) {
                            if (selectedStatuses[task.taskId] === 'Done') {
                                initialValues[task.taskId] = {
                                    status: selectedStatuses[task.taskId],
                                    actualValue: Number(task?.targetValue ?? 0)?.toLocaleString(),
                                };
                            } else if (selectedStatuses[task.taskId] === 'Not') {
                                initialValues[task.taskId] = {
                                    status: selectedStatuses[task.taskId],
                                    actualValue: 0,
                                };
                            }
                        }
                    });
                });
            });

            if (Object.keys(initialValues).length > 0) {
                form.setFieldsValue(initialValues);
            }
        }
    }, [formattedData, selectedStatuses, form]);

    const totalWeight = formattedData?.reduce((sum: number, objective: any) => {
        return (
            sum +
            objective?.keyResults?.reduce((keyResultSum: number, keyResult: any) => {
                // Calculate the weight for keyResult.tasks array
                const taskWeight = keyResult?.tasks?.reduce(
                    (taskSum: number, task: any) => {
                        if (selectedStatuses[task.taskId] === 'Done') {
                            return taskSum + Number(task.weight || 0);
                        }
                        return taskSum;
                    },
                    0,
                );

                // Calculate the weight for milestones.tasks array
                const milestoneWeight = keyResult?.milestones?.reduce(
                    (milestoneSum: number, milestone: any) => {
                        return (
                            milestoneSum +
                            milestone?.tasks?.reduce((taskSum: number, task: any) => {
                                if (selectedStatuses[task.taskId] === 'Done') {
                                    return taskSum + Number(task.weight || 0);
                                }
                                return taskSum;
                            }, 0)
                        );
                    },
                    0,
                );

                // Sum up task weights and milestone weights
                return keyResultSum + taskWeight + milestoneWeight;
            }, 0)
        );
    }, 0);

    const footer = (
        <div className="relative flex items-center justify-center px-4 py-2">
            <div className="flex items-center gap-4">
                <Button
                    size="large"
                    className="rounded-xl border-[#E5E7EB] font-semibold text-[#161A2C] w-32"
                    onClick={onClose}
                >
                    Cancel
                </Button>
                <Button
                    type="primary"
                    size="large"
                    className="rounded-xl bg-[#574CFF] font-semibold w-32 hover:bg-[#4F46EF]"
                    loading={createReportLoading}
                    onClick={() => form.submit()}
                >
                    Create Report
                </Button>
            </div>

            <div className="absolute right-4">
                <span className="text-sm font-medium text-[#161A2C]">
                    Total Point:{' '}
                    <span
                        className={
                            totalWeight > 84
                                ? 'text-[#52C41A]'
                                : totalWeight >= 64
                                    ? 'text-orange-500'
                                    : 'text-red-500'
                        }
                    >
                        {totalWeight}%
                    </span>
                </span>
            </div>
        </div>
    );

    const renderTaskRow = (task: any, keyresult: any) => {
        const isDone = selectedStatuses[task.taskId] === 'Done';
        const isNot = selectedStatuses[task.taskId] === 'Not';
        const metricSymbol = keyresult?.metricType?.name === NAME.CURRENCY ? '$' : '#';

        return (
            <div key={task.taskId} className="mb-6 last:mb-0">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 pt-1">
                        <p className="text-gray-800 text-sm font-medium leading-relaxed">
                            {task.taskName}
                        </p>
                    </div>

                    <div className="flex items-start gap-4">
                        {/* Actual Value Input */}
                        {(isDone || isNot) &&
                            keyresult?.metricType?.name !== NAME.ACHIEVE &&
                            keyresult?.metricType?.name !== NAME.MILESTONE && (
                                <Form.Item
                                    name={[task.taskId, 'actualValue']}
                                    className="mb-0"
                                    initialValue={Number(task?.actualValue)?.toLocaleString() || 0}
                                    rules={[
                                        {
                                            validator(_, value) {
                                                if (!keyresult || !keyresult.targetValue) {
                                                    return Promise.reject(new Error('Key result data is incomplete.'));
                                                }
                                                if (value === null || value === undefined) {
                                                    return Promise.reject(new Error('Please enter a value.'));
                                                }
                                                const numericValue = Number(value);
                                                if (isNaN(numericValue)) {
                                                    return Promise.reject(new Error('Please enter a valid number.'));
                                                }

                                                if (isDone && numericValue < task?.targetValue) {
                                                    return Promise.reject(new Error(`Value should be at least ${Number(task?.targetValue)?.toLocaleString()}`));
                                                }
                                                if (isNot && numericValue > task?.targetValue) {
                                                    return Promise.reject(new Error(`Value shouldn't exceed ${Number(task?.targetValue)?.toLocaleString()}`));
                                                }
                                                return Promise.resolve();
                                            },
                                        },
                                    ]}
                                >
                                    <InputNumber
                                        className="w-32 rounded-md border-gray-300"
                                        min={0}
                                        formatter={(value) => {
                                            if (!value) return '';
                                            const parts = `${value}`.split('.');
                                            parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
                                            return `${parts.join('.')}`;
                                        }}
                                        addonAfter={metricSymbol}
                                        controls={false}
                                        onChange={(value) => {
                                            const statusValue = form.getFieldValue([task.taskId, 'status']);
                                            if (statusValue === 'Done') {
                                                form.setFieldsValue({
                                                    [task.taskId]: {
                                                        actualValue: value ? Number(value) : task?.targetValue,
                                                    },
                                                });
                                            } else if (statusValue === 'Not') {
                                                form.setFieldsValue({
                                                    [task.taskId]: {
                                                        actualValue: value ? Number(value) : 0,
                                                    },
                                                });
                                            }
                                        }}
                                    />
                                </Form.Item>
                            )}

                        {/* Status Toggle */}
                        <Form.Item
                            name={[task.taskId, 'status']}
                            className="mb-0"
                            rules={[{ required: true, message: '' }]}
                        >
                            <div className="flex items-center gap-3">
                                {/* Done Option */}
                                <div
                                    className="cursor-pointer flex items-center gap-1.5"
                                    onClick={() => {
                                        setStatus(task.taskId, 'Done');
                                        form.setFieldsValue({
                                            [task.taskId]: {
                                                status: 'Done',
                                                actualValue: Number(task?.targetValue ?? 0)?.toLocaleString(),
                                            },
                                        });
                                    }}
                                >
                                    {isDone ? (
                                        <FaCheckSquare className="text-[#52C41A] text-xl" />
                                    ) : (
                                        <FaRegSquare className="text-gray-300 text-xl" />
                                    )}
                                    <span className={`text-sm ${isDone ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                                        Done
                                    </span>
                                </div>

                                {/* Not Option */}
                                <div
                                    className="cursor-pointer flex items-center gap-1.5"
                                    onClick={() => {
                                        setStatus(task.taskId, 'Not');
                                        form.setFieldsValue({
                                            [task.taskId]: {
                                                status: 'Not',
                                                actualValue: 0,
                                            },
                                        });
                                    }}
                                >
                                    {isNot ? (
                                        <FaWindowClose className="text-[#FF4D4F] text-xl" />
                                    ) : (
                                        <FaRegSquare className="text-gray-300 text-xl" />
                                    )}
                                    <span className={`text-sm ${isNot ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                                        Not
                                    </span>
                                </div>
                            </div>
                        </Form.Item>
                    </div>
                </div>

                {/* Reason Box */}
                {isNot && (
                    <div className="mt-4">
                        <Form.Item
                            name={[task.taskId, 'customReason']}
                            className="mb-0"
                            rules={[{ required: true, message: 'Please provide a reason!' }]}
                        >
                            <TextArea
                                rows={4}
                                placeholder="Please describe why this task was not completed..."
                                className="w-full rounded-lg border-[#574CFF] border bg-white p-3 text-sm"
                                style={{ resize: 'none' }}
                            />
                        </Form.Item>
                    </div>
                )}
            </div>
        );
    };

    return (
        openReportModal && (
            <CustomDrawerLayout
                open={openReportModal === true && isEditing === false ? true : false}
                onClose={onClose}
                modalHeader={modalHeader}
                width="65%"
                footer={footer}
            >
                {formattedData?.length > 0 ? (
                    <Spin spinning={plannedTaskForReportLoading} tip="Loading...">
                        <Form
                            layout="vertical"
                            form={form}
                            name="dynamic_form_item"
                            onFinish={handleOnFinish}
                            className="px-2"
                        >
                            <Collapse
                                defaultActiveKey={formattedData?.map((_: any, index: number) => String(index))}
                                expandIconPosition="end"
                                bordered={false}
                                className="bg-transparent [&_.ant-collapse-item]:mb-4 [&_.ant-collapse-item]:rounded-lg [&_.ant-collapse-item]:border [&_.ant-collapse-item]:border-gray-200 [&_.ant-collapse-item]:!border-b [&_.ant-collapse-item]:overflow-hidden [&_.ant-collapse-header]:border-b-0 [&_.ant-collapse-content]:border-t-0 [&_.ant-collapse-content]:bg-transparent"
                            >
                                {formattedData?.map((objective: any, resultIndex: number) => (
                                    <Collapse.Panel
                                        header={
                                            <span className="text-lg font-bold text-gray-900">
                                                {objective?.title}
                                            </span>
                                        }
                                        key={String(resultIndex)}
                                        className="!p-0"
                                    >
                                        <div className="space-y-6 mt-2">
                                            {objective?.keyResults?.map((keyresult: any, index: number) => (
                                                <div
                                                    key={index}
                                                    className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm"
                                                >
                                                    {/* Key Result Header */}
                                                    <div className="bg-[#F9FAFB] px-6 py-4 border-b border-gray-200 flex items-start gap-2">
                                                        <span className="font-bold text-gray-900 whitespace-nowrap">
                                                            Key-Result :
                                                        </span>
                                                        <span className="text-gray-700 font-medium">
                                                            {keyresult?.title}
                                                        </span>
                                                    </div>

                                                    {/* Tasks Body */}
                                                    <div className="p-6">
                                                        {/* Milestone Tasks */}
                                                        {keyresult?.milestones?.map((milestone: any) =>
                                                            milestone?.tasks?.map((task: any) =>
                                                                renderTaskRow(task, keyresult)
                                                            )
                                                        )}

                                                        {/* Direct Tasks */}
                                                        {keyresult?.tasks?.map((task: any) =>
                                                            renderTaskRow(task, keyresult)
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </Collapse.Panel>
                                ))}
                            </Collapse>
                        </Form>
                    </Spin>
                ) : (
                    <div className="flex justify-center items-center h-64">
                        <CustomizeRenderEmpty />
                    </div>
                )}
            </CustomDrawerLayout>
        )
    );
}

export default CreateReport;
