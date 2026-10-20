'use client';
import React, { useEffect } from 'react';
import { Select, Input, Form, Modal, Tooltip, Row, Col, Button } from 'antd';
import { QuestionCircleOutlined, CloseOutlined } from '@ant-design/icons';
import useDrawerStore from '@/store/uistate/features/okrplanning/okrSetting/assignTargetDrawerStore';
import { useGetCriteriaTargets } from '@/store/server/features/okrplanning/okr/criteria/queries';
import { useGetDepartmentsWithUsers } from '@/store/server/features/employees/employeeManagment/department/queries';
import {
  useGetActiveSession,
  useGetTargetAssignmentById,
} from '@/store/server/features/okrplanning/okr/target/queries';
import { useGetActiveFiscalYearsData } from '@/store/server/features/organizationStructure/fiscalYear/queries';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import {
  useCreateAssignTarget,
  useUpdateAssignedTargets,
} from '@/store/server/features/okrplanning/okr/target/mutation';

const { Option } = Select;

type TargetPeriod = 'MONTH' | 'SESSION';

const AssignTargetModal: React.FC = () => {
  const { data: criteriaData } = useGetCriteriaTargets();
  const { data: departmentData } = useGetDepartmentsWithUsers();
  const { data: activeSessionData } = useGetActiveSession();
  const { data: activeFiscalYear } = useGetActiveFiscalYearsData();
  const {
    mutate: createAssignTarget,
    isLoading: isCreateLoading,
    isSuccess: isCreateSuccess,
  } = useCreateAssignTarget();
  const {
    mutate: updateAssignedTarget,
    isLoading: isUpdateLoading,
    isSuccess: isUpdateSuccess,
  } = useUpdateAssignedTargets();
  const [form] = Form.useForm();
  const {
    isDrawerVisible,
    closeDrawer,
    currentId,
    setSelectedMonths,
    selectedMonths,
  } = useDrawerStore();
  const { userId } = useAuthenticationStore();
  const { data: getTargetById } = useGetTargetAssignmentById(currentId || '');

  const targetPeriod = Form.useWatch('targetPeriod', form) as
    | TargetPeriod
    | undefined;
  const isQuarterly = targetPeriod === 'SESSION';

  const sessionOptions =
    activeFiscalYear?.sessions?.map((session: any) => ({
      value: session.id,
      label: session.name,
    })) ||
    (activeSessionData?.id
      ? [
          {
            value: activeSessionData.id,
            label: activeSessionData.name || 'Active session',
          },
        ]
      : []);

  const activeMonthNames =
    activeSessionData?.months?.map((month: any) => month.name) || [];

  const resetState = () => {
    form.resetFields();
    setSelectedMonths([]);
    form.setFieldsValue({
      department: undefined,
      criteria: undefined,
      targetPeriod: 'MONTH',
      month: [],
      sessionId: undefined,
      sessionTarget: undefined,
    });
  };

  useEffect(() => {
    if (!isDrawerVisible) return;

    if (currentId && getTargetById) {
      const isSessionTarget = Boolean(getTargetById.sessionId);
      if (isSessionTarget) {
        form.setFieldsValue({
          department: getTargetById.departmentId,
          criteria: getTargetById.vpCriteriaId,
          targetPeriod: 'SESSION',
          sessionId: getTargetById.sessionId,
          sessionTarget: getTargetById.target,
          month: [],
        });
        setSelectedMonths([]);
      } else {
        form.setFieldsValue({
          department: getTargetById.departmentId,
          criteria: getTargetById.vpCriteriaId,
          targetPeriod: 'MONTH',
          sessionId: undefined,
          month: [getTargetById.month],
          [getTargetById.month]: getTargetById.target,
        });
        setSelectedMonths([getTargetById.month].filter(Boolean));
      }
      return;
    }

    if (!currentId) {
      form.setFieldsValue({
        targetPeriod: 'MONTH',
        month: activeMonthNames,
        sessionId: undefined,
        sessionTarget: undefined,
      });
      setSelectedMonths(activeMonthNames);
    }
  }, [
    isDrawerVisible,
    currentId,
    getTargetById,
    activeSessionData,
    setSelectedMonths,
    form,
  ]);

  useEffect(() => {
    if (isCreateSuccess || isUpdateSuccess) {
      handleModalClose();
    }
  }, [isCreateSuccess, isUpdateSuccess]);

  const handleModalClose = () => {
    resetState();
    closeDrawer();
  };

  const handleTargetPeriodChange = (period: TargetPeriod) => {
    if (period === 'MONTH') {
      form.setFieldsValue({
        sessionId: undefined,
        sessionTarget: undefined,
        month: activeMonthNames,
      });
      setSelectedMonths(activeMonthNames);
      return;
    }

    form.setFieldsValue({
      month: [],
      sessionId:
        form.getFieldValue('sessionId') ||
        activeSessionData?.id ||
        activeSessionData?.data?.id,
    });
    setSelectedMonths([]);
    activeMonthNames.forEach((month: string) => {
      form.setFieldValue(month, undefined);
    });
  };

  const onSubmit = (values: any) => {
    const period: TargetPeriod = values.targetPeriod || 'MONTH';

    let target: Array<{
      month?: string | null;
      target: number;
      sessionId?: string;
    }> = [];

    if (period === 'SESSION') {
      target = [
        {
          month: null,
          target: Number(values.sessionTarget),
          sessionId: values.sessionId,
        },
      ];
    } else {
      target = (values.month || selectedMonths || []).map((month: string) => ({
        month,
        target: Number(values[month]),
      }));
    }

    const payload: Record<string, any> = {
      departmentId: values.department || null,
      vpCriteriaId: values.criteria,
      target,
      ...(period === 'SESSION' && values.sessionId
        ? { sessionId: values.sessionId }
        : {}),
      ...(getTargetById && currentId
        ? { updatedBy: userId }
        : { createdBy: userId }),
    };

    if (getTargetById && currentId) {
      updateAssignedTarget({ id: currentId, values: payload });
    } else {
      createAssignTarget(payload);
    }
  };

  const footer = (
    <div className="flex justify-end gap-3" data-cy="okr-target-modal-footer">
      <Button
        type="default"
        onClick={handleModalClose}
        className="h-10 px-6 rounded-lg border-[#d9d9d9] text-[#595959] hover:text-[#262626] font-medium"
        id="okr-target-modal-cancel-button"
        data-cy="okr-target-modal-cancel-button"
      >
        Cancel
      </Button>
      <Button
        type="primary"
        onClick={() => form.submit()}
        loading={isCreateLoading || isUpdateLoading}
        className="h-10 px-8 rounded-lg bg-[#2b54ad] hover:bg-[#3d66c2] focus:bg-[#3d66c2] border-none font-medium flex items-center justify-center"
        id="okr-target-modal-submit-button"
        data-cy="okr-target-modal-submit-button"
      >
        {currentId ? 'Update' : 'Create'}
      </Button>
    </div>
  );

  return (
    <Modal
      open={isDrawerVisible}
      onCancel={handleModalClose}
      title={
        <span
          className="text-[20px] font-bold text-[#262626]"
          data-cy="okr-target-modal-title"
        >
          {currentId ? 'Edit Target Configuration' : 'Add Target Configuration'}
        </span>
      }
      footer={footer}
      width={800}
      centered
      closeIcon={
        <CloseOutlined
          className="text-[#8c8c8c]"
          data-cy="okr-target-modal-close-icon"
        />
      }
      data-cy="okr-target-modal"
      className="okr-settings-modal"
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onSubmit}
        initialValues={{ targetPeriod: 'MONTH' }}
        id="okr-target-modal-form"
        data-cy="okr-target-modal-form"
      >
        <Row gutter={24} data-cy="okr-target-modal-department-row">
          <Col span={12} data-cy="okr-target-modal-department-col">
            <Form.Item
              label={
                <div
                  className="flex items-center gap-1"
                  data-cy="okr-target-modal-department-label"
                >
                  <span
                    className="text-[14px] font-medium text-[#262626]"
                    data-cy="okr-target-modal-department-label-text"
                  >
                    Department
                  </span>
                  <Tooltip title="Optionally select the department for this assignment.">
                    <QuestionCircleOutlined
                      className="text-[#bfbfbf] text-[14px] ml-1 cursor-help"
                      data-cy="okr-target-modal-department-tooltip"
                    />
                  </Tooltip>
                </div>
              }
              name="department"
              data-cy="okr-target-modal-department-field"
            >
              <Select
                allowClear
                placeholder="Select Department (optional)"
                className="w-full h-11 custom-modal-select"
                dropdownClassName="custom-assignee-dropdown"
                data-cy="okr-target-modal-department-select"
              >
                {departmentData?.map((dept: any) => (
                  <Option
                    key={dept.id}
                    value={dept.id}
                    data-cy={`okr-target-modal-department-option-${dept.id}`}
                  >
                    {dept.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={12} data-cy="okr-target-modal-criteria-col">
            <Form.Item
              label={
                <div
                  className="flex items-center gap-1"
                  data-cy="okr-target-modal-criteria-label"
                >
                  <span
                    className="text-[14px] font-medium text-[#262626]"
                    data-cy="okr-target-modal-criteria-label-text"
                  >
                    Criteria
                  </span>
                  <Tooltip title="Same criteria can be used for both monthly and quarterly PP — create separate targets for each.">
                    <QuestionCircleOutlined
                      className="text-[#bfbfbf] text-[14px] ml-1 cursor-help"
                      data-cy="okr-target-modal-criteria-tooltip"
                    />
                  </Tooltip>
                </div>
              }
              name="criteria"
              required
              rules={[{ required: true, message: 'Please select criteria' }]}
              data-cy="okr-target-modal-criteria-field"
            >
              <Select
                placeholder="Select Criteria"
                className="w-full h-11 custom-modal-select"
                dropdownClassName="custom-assignee-dropdown"
                data-cy="okr-target-modal-criteria-select"
              >
                {/* DIRECT_PERCENT criteria (OKR %, Scorecard Progress) are scored as is and need no target. */}
                {criteriaData?.items
                  ?.filter(
                    (criteria: any) =>
                      criteria.scoringMode !== 'DIRECT_PERCENT',
                  )
                  .map((criteria: any) => (
                    <Option
                      key={criteria.id}
                      value={criteria.id}
                      data-cy={`okr-target-modal-criteria-option-${criteria.id}`}
                    >
                      {criteria.name}
                    </Option>
                  ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          label={
            <div
              className="flex items-center gap-1"
              data-cy="okr-target-modal-period-label"
            >
              <span
                className="text-[14px] font-medium text-[#262626]"
                data-cy="okr-target-modal-period-label-text"
              >
                Target type
              </span>
              <Tooltip title="Monthly targets use calendar months. Quarterly targets use a session and a single target value.">
                <QuestionCircleOutlined
                  className="text-[#bfbfbf] text-[14px] ml-1 cursor-help"
                  data-cy="okr-target-modal-period-tooltip"
                />
              </Tooltip>
            </div>
          }
          name="targetPeriod"
          required
          rules={[{ required: true, message: 'Please select target type' }]}
          data-cy="okr-target-modal-period-field"
        >
          <Select
            className="w-full h-11 custom-modal-select"
            options={[
              { value: 'MONTH', label: 'Monthly (for PP Monthly)' },
              { value: 'SESSION', label: 'Quarterly (for PP Quarterly)' },
            ]}
            onChange={handleTargetPeriodChange}
            data-cy="okr-target-modal-period-select"
          />
        </Form.Item>

        {isQuarterly ? (
          <>
            <Form.Item
              label={
                <div
                  className="flex items-center gap-1"
                  data-cy="okr-target-modal-session-label"
                >
                  <span
                    className="text-[14px] font-medium text-[#262626]"
                    data-cy="okr-target-modal-session-label-text"
                  >
                    Session
                  </span>
                  <Tooltip title="Required for quarterly PP. Must match the active session used when refreshing PP.">
                    <QuestionCircleOutlined
                      className="text-[#bfbfbf] text-[14px] ml-1 cursor-help"
                      data-cy="okr-target-modal-session-tooltip"
                    />
                  </Tooltip>
                </div>
              }
              name="sessionId"
              required
              rules={[{ required: true, message: 'Please select a session' }]}
              data-cy="okr-target-modal-session-field"
            >
              <Select
                placeholder="Select session"
                className="w-full h-11 custom-modal-select"
                options={sessionOptions}
                data-cy="okr-target-modal-session-select"
              />
            </Form.Item>

            <Form.Item
              label={
                <span
                  className="text-[14px] font-medium text-[#262626]"
                  data-cy="okr-target-modal-session-target-label"
                >
                  Session target
                </span>
              }
              name="sessionTarget"
              required
              rules={[
                { required: true, message: 'Please enter the session target' },
              ]}
              data-cy="okr-target-modal-session-target-field"
            >
              <Input
                type="number"
                placeholder="Enter quarterly target"
                className="h-11"
                data-cy="okr-target-modal-session-target-input"
              />
            </Form.Item>
          </>
        ) : (
          <>
            <Row
              gutter={16}
              className="mt-2"
              data-cy="okr-target-modal-months-row"
            >
              {selectedMonths?.map((month) => (
                <Col
                  key={month}
                  span={8}
                  data-cy={`okr-target-modal-month-col-${month}`}
                >
                  <Form.Item
                    label={
                      <span
                        className="text-[14px] font-medium text-[#262626]"
                        data-cy={`okr-target-modal-month-label-text-${month}`}
                      >
                        {month} Target
                      </span>
                    }
                    name={month}
                    required
                    rules={[{ required: true, message: 'Required' }]}
                    data-cy={`okr-target-modal-month-field-${month}`}
                  >
                    <Input
                      type="number"
                      placeholder="Input"
                      className="h-11"
                      data-cy={`okr-target-modal-month-input-${month}`}
                    />
                  </Form.Item>
                </Col>
              ))}
            </Row>

            {!currentId && (
              <Form.Item
                name="month"
                noStyle
                data-cy="okr-target-modal-hidden-month-field"
              />
            )}
          </>
        )}

        <style jsx global data-cy="okr-target-modal-styles">{`
          .okr-settings-modal .custom-modal-select .ant-select-selector {
            display: flex !important;
            align-items: center !important;
            height: 44px !important;
          }
          .okr-settings-modal
            .custom-assignee-dropdown
            .ant-select-item-option-selected {
            background-color: #e6f7ff !important;
          }
          .okr-settings-modal .ant-modal-content {
            padding: 0 !important;
            border-radius: 8px !important;
          }
          .okr-settings-modal .ant-modal-title {
            margin-bottom: 24px !important;
          }
          .okr-settings-modal .ant-modal-header {
            padding: 20px 24px 16px 24px !important;
            border-bottom: none !important;
          }
          .okr-settings-modal .ant-modal-body {
            padding: 24px !important;
          }
          .okr-settings-modal .ant-modal-footer {
            padding: 8px 24px 24px 24px !important;
            border-top: none !important;
          }
          .okr-settings-modal .ant-form-item-label > label {
            height: auto !important;
            line-height: 1.5 !important;
            padding-bottom: 4px !important;
          }
        `}</style>
      </Form>
    </Modal>
  );
};

export default AssignTargetModal;
