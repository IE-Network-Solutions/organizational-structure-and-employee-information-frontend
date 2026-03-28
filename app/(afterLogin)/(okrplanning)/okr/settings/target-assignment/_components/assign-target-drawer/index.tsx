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
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import {
  useCreateAssignTarget,
  useUpdateAssignedTargets,
} from '@/store/server/features/okrplanning/okr/target/mutation';

const { Option } = Select;

const AssignTargetModal: React.FC = () => {
  const { data: criteriaData } = useGetCriteriaTargets();
  const { data: departmentData } = useGetDepartmentsWithUsers();
  const { data: activeSessionData } = useGetActiveSession();
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

  const resetState = () => {
    form.resetFields();
    setSelectedMonths([]);
    form.setFieldsValue({
      department: '',
      criteria: '',
      month: [],
    });
  };

  useEffect(() => {
    if (currentId && getTargetById) {
      form.setFieldsValue({
        department: getTargetById.departmentId,
        criteria: getTargetById.vpCriteriaId,
        month: [getTargetById.month],
        [getTargetById.month]: getTargetById.target,
      });
      setSelectedMonths([getTargetById.month]);
    } else if (!currentId && activeSessionData) {
      const allActiveMonths =
        activeSessionData?.months?.map((month: any) => month.name) || [];
      form.setFieldsValue({
        month: allActiveMonths,
      });
      setSelectedMonths(allActiveMonths);
    }
  }, [currentId, getTargetById, activeSessionData, setSelectedMonths, form]);

  useEffect(() => {
    if (isCreateSuccess || isUpdateSuccess) {
      handleModalClose();
    }
  }, [isCreateSuccess, isUpdateSuccess]);

  const handleModalClose = () => {
    resetState();
    closeDrawer();
  };

  const onSubmit = (values: any) => {
    const target = (values.month || []).map((month: string) => ({
      month,
      target: values[month],
    }));

    const payload: Record<string, any> = {
      departmentId: values.department || null,
      vpCriteriaId: values.criteria,
      target,
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
    <div className="flex justify-end gap-2" data-cy="okr-target-modal-footer">
      <Button
        type="default"
        onClick={handleModalClose}
        className="h-[32px] w-[68px] rounded-[8px] border-[#d9d9d9] text-[#595959] hover:text-[#262626] font-normal text-[14px] p-0 flex items-center justify-center"
        id="okr-target-modal-cancel-button"
        data-cy="okr-target-modal-cancel-button"
      >
        Cancel
      </Button>
      <Button
        type="primary"
        onClick={() => form.submit()}
        loading={isCreateLoading || isUpdateLoading}
        className="h-[32px] w-[68px] rounded-[8px] bg-[#2b54ad] hover:bg-[#3d66c2] focus:bg-[#3d66c2] border-none font-normal text-[14px] p-0 flex items-center justify-center"
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
        requiredMark={false}
        onFinish={onSubmit}
        className=""
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
                    className="text-[14px] font-normal text-[#030712]"
                    data-cy="okr-target-modal-department-label-text"
                  >
                    Department
                  </span>
                  <span
                    className="text-[#ff4d4f] text-[14px] leading-none"
                    aria-hidden
                    data-cy="okr-target-modal-department-required-indicator"
                  >
                    *
                  </span>
                  <Tooltip title="Select the department for this assignment.">
                    <QuestionCircleOutlined
                      className="text-[#bfbfbf] text-[14px] ml-1 cursor-help"
                      data-cy="okr-target-modal-department-tooltip"
                    />
                  </Tooltip>
                </div>
              }
              name="department"
              required
              rules={[{ required: true, message: 'Please select department' }]}
              data-cy="okr-target-modal-department-field"
            >
              <Select
                placeholder="Select Department"
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
                    className="text-[14px] font-normal text-[#030712]"
                    data-cy="okr-target-modal-criteria-label-text"
                  >
                    Criteria
                  </span>
                  <span
                    className="text-[#ff4d4f] text-[14px] leading-none"
                    aria-hidden
                    data-cy="okr-target-modal-criteria-required-indicator"
                  >
                    *
                  </span>
                  <Tooltip title="Select the criteria for this assignment.">
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
                {criteriaData?.items?.map((criteria: any) => (
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

        {/* Dynamic Month Targets Grid */}
        <Row gutter={16} className="" data-cy="okr-target-modal-months-row">
          {selectedMonths?.map((month) => (
            <Col
              key={month}
              span={8}
              data-cy={`okr-target-modal-month-col-${month}`}
            >
              <Form.Item
                label={
                  <div
                    className="flex items-center gap-1"
                    data-cy={`okr-target-modal-month-label-${month}`}
                  >
                    <span
                      className="text-[14px] font-normal text-[#030712]"
                      data-cy={`okr-target-modal-month-label-text-${month}`}
                    >
                      {month} Target
                    </span>
                    <span
                      className="text-[#ff4d4f] text-[14px] leading-none"
                      aria-hidden
                      data-cy={`okr-target-modal-month-required-indicator-${month}`}
                    >
                      *
                    </span>
                  </div>
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

        {/* Hidden Month Multi-select for logic consistency */}
        {!currentId && (
          <Form.Item
            name="month"
            noStyle
            data-cy="okr-target-modal-hidden-month-field"
          />
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
          }
          .okr-settings-modal .ant-modal-title {
          }
          .okr-settings-modal .ant-modal-header {
            padding: 20px 24px 8px 24px !important;
            border-bottom: none !important;
            margin-bottom: 0 !important;
          }
          .okr-settings-modal .ant-modal-body {
            padding: 12px 24px !important;
          }
          .okr-settings-modal .ant-modal-footer {
            padding: 1px 24px 20px 24px !important;
            border-top: none !important;
            margin-top: 0 !important;
          }
          .okr-settings-modal .ant-form-item-label > label {
            height: auto !important;
            line-height: 1.5 !important;
            padding-bottom: 4px !important;
          }
          .okr-settings-modal .ant-modal-body .ant-form-item,
          .okr-settings-modal .ant-modal-body .ant-row {
            margin-bottom: 12px !important;
          }
          .okr-settings-modal .ant-modal-body .ant-form-item + .flex-wrap {
            margin-top: -8px !important;
          }
          .okr-settings-modal .ant-modal-body > *:last-child {
            margin-bottom: 0 !important;
          }
        `}</style>
      </Form>
    </Modal>
  );
};

export default AssignTargetModal;
