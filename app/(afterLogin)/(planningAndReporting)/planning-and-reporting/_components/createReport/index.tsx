import CustomDrawerLayout from '@/components/common/customDrawer';
import { PlanningAndReportingStore } from '@/store/uistate/features/planningAndReporting/useStore';
import {
    Button,
    Col,
    Collapse,
    Form,
    Input,
    InputNumber,
    Row,
    Spin,
} from 'antd';

import { CustomizeRenderEmpty } from '@/components/emptyIndicator';
import { useCreateReportForUnReportedtasks } from '@/store/server/features/okrPlanningAndReporting/mutations';
import {
    useDefaultPlanningPeriods,
    useGetPlannedTaskForReport,
} from '@/store/server/features/okrPlanningAndReporting/queries';
import { NAME } from '@/types/enumTypes';
import { useEffect } from 'react';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { groupUnReportedTasksByKeyResultAndMilestone } from '../dataTransformer/report';

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
        <div className="flex items-center justify-between w-full">
            <div className="flex-1"></div>
            <div className="flex justify-center gap-4 flex-1">
                <Button
                    id="submit-report-button-for-planning-and-reporting"
                    data-cy="submit-report-button-for-planning-and-reporting"
                    type="primary"
                    className="py-3 px-6 sm:py-6 sm:px-10 rounded-xl bg-[#574CFF] hover:bg-[#4F46EF]"
                    loading={createReportLoading}
                    onClick={() => form.submit()}
                >
                    <span className="md:hidden">Report</span>
                    <span className="hidden md:inline">Create Report</span>
                </Button>
                <Button
                    id="cancel-report-button-for-planning-and-reporting"
                    data-cy="cancel-report-button-for-planning-and-reporting"
                    className="py-3 px-6 sm:py-6 sm:px-10 rounded-xl"
                    onClick={onClose}
                    disabled={createReportLoading}
                >
                    Cancel
                </Button>
            </div>

            <div className="flex-1 flex justify-end">
                <div className="my-2 font-bold mx-6">
                    <span className="text-sm font-medium text-[#161A2C] whitespace-nowrap">
                        <span className="md:hidden">WP:</span> <span className="hidden md:inline">Weight Point:</span>{' '}
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
        </div>
    );

    const renderTaskRow = (task: any, keyresult: any) => {
        const isDone = selectedStatuses[task.taskId] === 'Done';
        const isNot = selectedStatuses[task.taskId] === 'Not';
        const metricSymbol = keyresult?.metricType?.name === NAME.CURRENCY ? '$' : '#';
        const showActualValue = (isDone || isNot) &&
            keyresult?.metricType?.name !== NAME.ACHIEVE &&
            keyresult?.metricType?.name !== NAME.MILESTONE;

        return (
            <div key={task.taskId} className="mb-5 last:mb-0">
                <Row gutter={[16, 16]} align="middle">
                    <Col xs={showActualValue ? 7 : 11} sm={showActualValue ? 8 : 14} md={showActualValue ? 10 : 16}>
                        <p className="text-gray-800 text-sm font-medium leading-relaxed m-0 truncate" title={task.taskName}>
                            {task.taskName}
                        </p>
                    </Col>

                    <Col xs={showActualValue ? 17 : 13} sm={showActualValue ? 16 : 10} md={showActualValue ? 14 : 8}>
                        <div className="flex items-center justify-end gap-2 sm:gap-4 overflow-x-auto no-scrollbar">
                            {/* Actual Value Input */}
                            {showActualValue && (
                                <Form.Item
                                    name={[task.taskId, 'actualValue']}
                                    className="mb-0"
                                    initialValue={Number(task?.actualValue)?.toLocaleString() || 0}
                                    rules={[
                                        {
                                            validator(unusedRule, value) {
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
                                                    return Promise.reject(new Error(`Min ${Number(task?.targetValue)?.toLocaleString()}`));
                                                }
                                                if (isNot && numericValue > task?.targetValue) {
                                                    return Promise.reject(new Error(`Max ${Number(task?.targetValue)?.toLocaleString()}`));
                                                }
                                                return Promise.resolve();
                                            },
                                        },
                                    ]}
                                >
                                    <InputNumber
                                        id={`create-report-actual-value-input-${task.taskId}`}
                                        data-cy={`create-report-actual-value-input-${task.taskId}`}
                                        className="w-16 sm:w-28 rounded-md border-gray-300 h-9"
                                        min={0}
                                        placeholder="Value"
                                        formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                        addonAfter={<span className="text-[10px]">{metricSymbol}</span>}
                                        controls={false}
                                    />
                                </Form.Item>
                            )}

                            {/* Status Toggle */}
                            <Form.Item
                                name={[task.taskId, 'status']}
                                className="mb-0"
                                rules={[{ required: true, message: '' }]}
                            >
                                <div className="flex items-center gap-2 sm:gap-4 bg-transparent p-0 border-none">
                                    {/* Done Option */}
                                    <div
                                        id={`create-report-status-done-${task.taskId}`}
                                        data-cy={`create-report-status-done-${task.taskId}`}
                                        className="cursor-pointer flex items-center gap-1.5 px-0 py-0 transition opacity-100 hover:opacity-80"
                                        onClick={() => {
                                            setStatus(task.taskId, 'Done');
                                            form.setFieldsValue({
                                                [task.taskId]: {
                                                    status: 'Done',
                                                    actualValue: Number(task?.targetValue ?? 0),
                                                },
                                            });
                                        }}
                                    >
                                        <div className={`w-5 h-5 rounded-[4px] flex items-center justify-center border transition-all ${isDone ? 'bg-[#00C48C] border-[#00C48C]' : 'bg-white border-[#E5E7EB]'}`}>
                                            {isDone && <CheckOutlined className="text-white text-[10px]" />}
                                        </div>
                                        <span className={`text-[13px] text-[#161A2C]`}>
                                            Done
                                        </span>
                                    </div>

                                    {/* Not Option */}
                                    <div
                                        id={`create-report-status-not-${task.taskId}`}
                                        data-cy={`create-report-status-not-${task.taskId}`}
                                        className="cursor-pointer flex items-center gap-1.5 px-0 py-0 transition opacity-100 hover:opacity-80"
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
                                        <div className={`w-5 h-5 rounded-[4px] flex items-center justify-center border transition-all ${isNot ? 'bg-[#FF4D4F] border-[#FF4D4F]' : 'bg-white border-[#E5E7EB]'}`}>
                                            {isNot && <CloseOutlined className="text-white text-[10px]" />}
                                        </div>
                                        <span className={`text-[13px] text-[#161A2C]`}>
                                            Not
                                        </span>
                                    </div>
                                </div>
                            </Form.Item>
                        </div>
                    </Col>
                </Row>

                {/* Reason Box */}
                {isNot && (
                    <div className="mt-4 animate-in fade-in slide-in-from-top-2 duration-200">
                        <Form.Item
                            name={[task.taskId, 'customReason']}
                            className="mb-0"
                            rules={[{ required: true, message: 'Please provide a reason!' }]}
                        >
                            <TextArea
                                id={`create-report-comment-textarea-${task.taskId}`}
                                data-cy={`create-report-comment-textarea-${task.taskId}`}
                                rows={3}
                                placeholder="Please describe why this task was not completed..."
                                className="w-full rounded-lg border-gray-200 bg-white p-3 text-sm focus:bg-white transition"
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
                            <div id="create-report-collapse" data-cy="create-report-collapse">
                            <Collapse
                                defaultActiveKey={formattedData?.flatMap((obj: any) => obj.keyResults?.map((nonused: any, i: number) => `kr-${obj.id || ''}-${i}`))}
                                expandIconPosition="end"
                                bordered={false}
                                className="bg-transparent"
                            >
                                {formattedData?.map((objective: any) =>
                                    objective?.keyResults?.map((keyresult: any, index: number) => (
                                        <Collapse.Panel
                                            id={`create-report-panel-${objective.id || ''}-${index}`}
                                            data-cy={`create-report-panel-${objective.id || ''}-${index}`}
                                            header={
                                                <div className="flex items-center gap-2 min-w-0 w-full">
                                                    <span className="font-bold text-gray-900 whitespace-nowrap flex-shrink-0">
                                                        {planningPeriodName}-task :
                                                    </span>
                                                    <span className="text-gray-700 font-normal truncate flex-1 min-w-0" title={keyresult?.title}>
                                                        {keyresult?.title}
                                                    </span>
                                                </div>
                                            }
                                            key={`kr-${objective.id || ''}-${index}`}
                                            className="mb-4 rounded-xl overflow-hidden [&_.ant-collapse-header]:!bg-[#F9FAFB] [&_.ant-collapse-header]:px-6 [&_.ant-collapse-header]:py-4 [&_.ant-collapse-content]:bg-white"
                                            style={{
                                                border: '1px solid #e5e7eb',
                                            }}
                                        >
                                            <div className="py-2">
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
                                        </Collapse.Panel>
                                    ))
                                )}
                            </Collapse>
                            </div>
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
