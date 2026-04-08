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

import {
  AllPlanningPeriods,
  useGetReportedPlanning,
  useGetReportingById,
} from '@/store/server/features/okrPlanningAndReporting/queries';
import { groupUnReportedTasksByKeyResultAndMilestone } from '../dataTransformer/report';
import { useEditReportByReportId } from '@/store/server/features/okrPlanningAndReporting/mutations';
import { CustomizeRenderEmpty } from '@/components/emptyIndicator';
import { NAME } from '@/types/enumTypes';
import { useEffect } from 'react';
import { FaCheckSquare, FaRegSquare, FaWindowClose } from 'react-icons/fa';
import { useQueryClient } from 'react-query';

const { TextArea } = Input;

function EditReport() {
  const queryClient = useQueryClient();
  const {
    setOpenReportModal,

    activePlanPeriod,
    selectedReportId,
    setSelectedReportId,
    setSelectedPlanId,
    selectedPlanId,
    resetWeights,
    setStatus,
    selectedStatuses,
    resetStatuses,
  } = PlanningAndReportingStore();
  const [form] = Form.useForm();

  const onClose = () => {
    setOpenReportModal(false);
    setSelectedReportId('');
    setSelectedPlanId('');
    form.resetFields();
    resetWeights();
    resetStatuses();
  };

  const { data: planningPeriods } = AllPlanningPeriods();

  const { data: reportedData, isLoading: reportedDataLoading } =
    useGetReportingById(selectedReportId);
  const { mutate: editReport, isLoading: editReportLoading } =
    useEditReportByReportId();

  const planningPeriodName =
    planningPeriods?.[activePlanPeriod - 1]?.planningPeriod?.name;

  const { data: allReportedPlanning } = useGetReportedPlanning(selectedPlanId);

  const modalHeader = (
    <div
      data-cy="planning-and-reporting-components-editreport-index-tsx-index-div-68"
      className="text-center text-xl font-bold text-[#161A2C]"
    >
      Update {planningPeriodName} Report
    </div>
  );

  const handleOnFinish = (values: Record<string, any>) => {
    Object.entries(values).length > 0 &&
      editReport(
        { values: values, selectedReportId },
        {
          onSuccess: () => {
            queryClient.invalidateQueries('okrReports');
            queryClient.invalidateQueries('okrPlans');
            queryClient.invalidateQueries('okrUserPlans');
            queryClient.invalidateQueries('okrPlannedData');
            queryClient.invalidateQueries('planningPeriodsHierarchy');
            onClose();
          },
        },
      );
  };

  const formattedData =
    allReportedPlanning &&
    groupUnReportedTasksByKeyResultAndMilestone(
      allReportedPlanning?.length == 0 ? [] : allReportedPlanning,
    );

  useEffect(() => {
    // Ensure there is reportedData and valid reportTask array
    if (reportedData?.reportTask?.length > 0) {
      // Map reportedData to a formatted structure
      const formattedData = reportedData.reportTask.reduce(
        (acc: any, task: any) => {
          acc[task.planTaskId] = {
            status: task?.status ?? '', // Use existing status or empty string
            actualValue: Number(task?.actualValue ?? 0), // Default to 0 if null/undefined
            customReason: task?.customReason ?? '', // Default to empty string
          };
          return acc;
        },
        {},
      );

      form.setFieldsValue(formattedData);

      reportedData.reportTask.forEach((task: any) => {
        setStatus(task.planTaskId, task?.status ?? '');
      });
    }
  }, [reportedData, selectedReportId, form, setStatus]);

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
    <div
      data-cy="planning-and-reporting-components-editreport-index-tsx-index-div-158"
      className="flex items-center justify-between w-full"
    >
      <div
        data-cy="planning-and-reporting-components-editreport-index-tsx-index-div-159"
        className="flex-1"
      ></div>
      <div
        data-cy="planning-and-reporting-components-editreport-index-tsx-index-div-160"
        className="flex justify-center gap-4 flex-1"
      >
        <Button
          id="update-report-button-for-planning-and-reporting"
          type="primary"
          className="rounded-xl bg-[#1E40AF] px-10 py-6 text-white hover:bg-[#1E3A8A]"
          loading={editReportLoading}
          onClick={() => form.submit()}
        >
          Update Report
        </Button>
        <Button
          className="py-6 px-10 rounded-xl"
          onClick={onClose}
          disabled={editReportLoading}
        >
          Cancel
        </Button>
      </div>

      <div
        data-cy="planning-and-reporting-components-editreport-index-tsx-index-div-179"
        className="flex-1 flex justify-end pr-5"
      >
        <div
          data-cy="planning-and-reporting-components-editreport-index-tsx-index-div-180"
          className="my-2 font-bold"
        >
          <span
            data-cy="planning-and-reporting-components-editreport-index-tsx-index-span-181"
            className="text-sm font-medium text-[#161A2C]"
          >
            Total Point:{' '}
            <span
              className={
                totalWeight > 84
                  ? 'text-[#52C41A]'
                  : totalWeight >= 64
                    ? 'text-orange-500'
                    : 'text-red-500'
              }
              data-cy="planningandreporting-planning-and-reporting-components-editreport-index-tsx-span-204"
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
    const metricSymbol =
      keyresult?.metricType?.name === NAME.CURRENCY ? '$' : '#';
    const showActualValue =
      (isDone || isNot) &&
      keyresult?.metricType?.name !== NAME.ACHIEVE &&
      keyresult?.metricType?.name !== NAME.MILESTONE;

    return (
      <div
        data-cy="planning-and-reporting-components-editreport-index-tsx-index-div-211"
        key={task.taskId}
        className="mb-5 last:mb-0"
      >
        <Row gutter={[16, 16]} align="middle">
          <Col
            xs={24}
            sm={showActualValue ? 8 : 14}
            md={showActualValue ? 10 : 16}
          >
            <p
              className="text-gray-800 text-sm font-medium leading-relaxed m-0 truncate"
              title={task.taskName}
              data-cy="planningandreporting-planning-and-reporting-components-editreport-index-tsx-p-243"
            >
              {task.taskName}
            </p>
          </Col>

          <Col
            xs={24}
            sm={showActualValue ? 16 : 10}
            md={showActualValue ? 14 : 8}
          >
            <div
              data-cy="planning-and-reporting-components-editreport-index-tsx-index-div-231"
              className="flex items-center justify-between sm:justify-end gap-4 overflow-x-auto no-scrollbar"
            >
              {/* Actual Value Input */}
              {showActualValue && (
                <Form.Item
                  name={[task.taskId, 'actualValue']}
                  className="mb-0"
                  initialValue={Number(task?.actualValue) || 0}
                  rules={[
                    {
                      validator(nonused, value) {
                        if (!keyresult || !keyresult.targetValue) {
                          return Promise.reject(
                            new Error('Key result data is incomplete.'),
                          );
                        }
                        if (value === null || value === undefined) {
                          return Promise.reject(
                            new Error('Please enter a value.'),
                          );
                        }
                        const numericValue = Number(value);
                        if (isNaN(numericValue)) {
                          return Promise.reject(
                            new Error('Please enter a valid number.'),
                          );
                        }

                        if (isDone && numericValue < task?.targetValue) {
                          return Promise.reject(
                            new Error(
                              `Min ${Number(task?.targetValue)?.toLocaleString()}`,
                            ),
                          );
                        }
                        if (isNot && numericValue > task?.targetValue) {
                          return Promise.reject(
                            new Error(
                              `Max ${Number(task?.targetValue)?.toLocaleString()}`,
                            ),
                          );
                        }
                        return Promise.resolve();
                      },
                    },
                  ]}
                >
                  <InputNumber
                    id={`edit-report-actual-value-input-${task.taskId}`}
                    data-cy={`edit-report-actual-value-input-${task.taskId}`}
                    className="w-24 sm:w-28 rounded-md border-gray-300 h-9"
                    min={0}
                    placeholder="Value"
                    formatter={(value) =>
                      `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                    }
                    addonAfter={
                      <span
                        data-cy="planning-and-reporting-components-editreport-index-tsx-index-span-287"
                        className="text-[10px]"
                      >
                        {metricSymbol}
                      </span>
                    }
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
                <div
                  data-cy="planning-and-reporting-components-editreport-index-tsx-index-div-300"
                  className="flex items-center gap-4 bg-white p-1.5 rounded-lg border border-gray-100"
                >
                  {/* Done Option */}
                  <div
                    id={`edit-report-status-done-${task.taskId}`}
                    data-cy={`edit-report-status-done-${task.taskId}`}
                    className="cursor-pointer flex items-center gap-1.5 px-2 py-0.5 rounded transition hover:bg-white"
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
                    {isDone ? (
                      <FaCheckSquare className="text-[#52C41A] text-lg" />
                    ) : (
                      <FaRegSquare className="text-gray-300 text-lg" />
                    )}
                    <span
                      className={`text-[13px] ${isDone ? 'text-[#52C41A] font-semibold' : 'text-gray-500'}`}
                      data-cy="planningandreporting-planning-and-reporting-components-editreport-index-tsx-span-357"
                    >
                      Done
                    </span>
                  </div>

                  {/* Not Option */}
                  <div
                    id={`edit-report-status-not-${task.taskId}`}
                    data-cy={`edit-report-status-not-${task.taskId}`}
                    className="cursor-pointer flex items-center gap-1.5 px-2 py-0.5 rounded transition hover:bg-white"
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
                      <FaWindowClose className="text-[#FF4D4F] text-lg" />
                    ) : (
                      <FaRegSquare className="text-gray-300 text-lg" />
                    )}
                    <span
                      className={`text-[13px] ${isNot ? 'text-[#FF4D4F] font-semibold' : 'text-gray-500'}`}
                      data-cy="planningandreporting-planning-and-reporting-components-editreport-index-tsx-span-384"
                    >
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
          <div
            data-cy="planning-and-reporting-components-editreport-index-tsx-index-div-362"
            className="mt-4 animate-in fade-in slide-in-from-top-2 duration-200"
          >
            <Form.Item
              name={[task.taskId, 'customReason']}
              className="mb-0"
              rules={[{ required: true, message: 'Please provide a reason!' }]}
            >
              <TextArea
                id={`edit-report-comment-textarea-${task.taskId}`}
                data-cy={`edit-report-comment-textarea-${task.taskId}`}
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
    selectedReportId !== '' && (
      <CustomDrawerLayout
        open={selectedReportId !== ''}
        onClose={onClose}
        modalHeader={modalHeader}
        width="65%"
        footer={footer}
      >
        <Spin
          spinning={editReportLoading || reportedDataLoading}
          tip="Reporting..."
        >
          {formattedData?.length > 0 ? (
            <Form
              layout="vertical"
              form={form}
              name="dynamic_form_item"
              onFinish={handleOnFinish}
              className="px-2"
            >
              <div id="edit-report-collapse" data-cy="edit-report-collapse">
                <Collapse
                  defaultActiveKey={formattedData?.flatMap((obj: any) =>
                    obj.keyResults?.map(
                      (nonused: any, i: number) => `kr-${obj.id || ''}-${i}`,
                    ),
                  )}
                  expandIconPosition="end"
                  bordered={false}
                  className="bg-transparent [&_.ant-collapse-item]:mb-4 [&_.ant-collapse-item]:rounded-xl [&_.ant-collapse-item]:!border-t [&_.ant-collapse-item]:!border-b [&_.ant-collapse-item]:!border-l [&_.ant-collapse-item]:!border-r [&_.ant-collapse-item]:!border-gray-200 [&_.ant-collapse-item]:overflow-hidden [&_.ant-collapse-header]:!bg-[#F9FAFB] [&_.ant-collapse-header]:px-6 [&_.ant-collapse-header]:py-4 [&_.ant-collapse-content]:bg-white"
                >
                  {formattedData?.map((objective: any) =>
                    objective?.keyResults?.map(
                      (keyresult: any, index: number) => (
                        <Collapse.Panel
                          id={`edit-report-panel-${objective.id || ''}-${index}`}
                          data-cy={`edit-report-panel-${objective.id || ''}-${index}`}
                          header={
                            <div
                              data-cy="planning-and-reporting-components-editreport-index-tsx-index-div-422"
                              className="flex items-center gap-2"
                            >
                              <span
                                data-cy="planning-and-reporting-components-editreport-index-tsx-index-span-423"
                                className="font-bold text-gray-900 whitespace-nowrap"
                              >
                                {planningPeriodName}-task :
                              </span>
                              <span
                                data-cy="planning-and-reporting-components-editreport-index-tsx-index-span-426"
                                className="text-gray-700 font-normal"
                              >
                                {keyresult?.title}
                              </span>
                            </div>
                          }
                          key={`kr-${objective.id || ''}-${index}`}
                        >
                          <div
                            data-cy="planning-and-reporting-components-editreport-index-tsx-index-div-433"
                            className="py-2"
                          >
                            {/* Milestone Tasks */}
                            {keyresult?.milestones?.map((milestone: any) =>
                              milestone?.tasks?.map((task: any) =>
                                renderTaskRow(task, keyresult),
                              ),
                            )}

                            {/* Direct Tasks */}
                            {keyresult?.tasks?.map((task: any) =>
                              renderTaskRow(task, keyresult),
                            )}
                          </div>
                        </Collapse.Panel>
                      ),
                    ),
                  )}
                </Collapse>
              </div>
            </Form>
          ) : (
            <div
              data-cy="planning-and-reporting-components-editreport-index-tsx-index-div-454"
              className="flex justify-center items-center h-64"
            >
              <CustomizeRenderEmpty />
            </div>
          )}
        </Spin>
      </CustomDrawerLayout>
    )
  );
}

export default EditReport;
