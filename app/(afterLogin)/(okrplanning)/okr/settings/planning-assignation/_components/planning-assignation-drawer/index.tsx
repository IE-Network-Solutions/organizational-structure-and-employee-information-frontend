'use client';
import { useGetAllUsers } from '@/store/server/features/okrplanning/okr/users/queries';
import { Form, Select, Avatar, Modal, Tooltip, Button } from 'antd';
import {
  UserOutlined,
  QuestionCircleOutlined,
  CloseOutlined,
} from '@ant-design/icons';
import React, { useEffect } from 'react';
import { useGetAllPlanningPeriods } from '@/store/server/features/employees/planning/planningPeriod/queries';
import {
  useAssignPlanningPeriodToUsers,
  useUpdateAssignPlanningPeriodToUsers,
} from '@/store/server/features/employees/planning/planningPeriod/mutation';
import { useOKRSettingStore } from '@/store/uistate/features/okrplanning/okrSetting';
import { PlanningPeriodItem } from '@/store/uistate/features/okrplanning/okrSetting/interface';

interface PlanningAssignationModalProps {
  open: boolean;
  onClose: () => void;
}

const PlanningAssignationModal: React.FC<PlanningAssignationModalProps> = ({
  open,
  onClose,
}) => {
  const { data: allUsers } = useGetAllUsers();
  const { data: allPlanningperiod } = useGetAllPlanningPeriods();
  const { mutate: planAssign, isLoading } = useAssignPlanningPeriodToUsers();
  const { mutate: editAssign, isLoading: editLoading } =
    useUpdateAssignPlanningPeriodToUsers();

  const { selectedPlanningUser } = useOKRSettingStore();

  const { Option } = Select;
  const [form] = Form.useForm();

  const userIds = Form.useWatch('userIds', form);
  const planningPeriods = Form.useWatch('planningPeriods', form);

  const handleModalClose = () => {
    form.resetFields();
    onClose();
  };

  useEffect(() => {
    if (selectedPlanningUser) {
      form.setFieldsValue({
        userIds: [selectedPlanningUser.userId],
        planningPeriods: selectedPlanningUser.planningPeriod.map(
          (item: PlanningPeriodItem) => item.planningPeriodId,
        ),
      });
    } else {
      form.resetFields();
    }
  }, [selectedPlanningUser, form, open]);

  const onFinish = (values: any) => {
    if (selectedPlanningUser) {
      editAssign(values, {
        onSuccess: () => {
          handleModalClose();
        },
      });
    } else {
      planAssign(values, {
        onSuccess: () => {
          handleModalClose();
        },
      });
    }
  };

  const footer = (
    <div
      className="flex justify-end gap-3"
      data-cy="okr-planning-assignation-modal-footer"
    >
      <Button
        type="default"
        onClick={handleModalClose}
        className="h-10 px-6 rounded-lg border-[#d9d9d9] text-[#595959] hover:text-[#262626] font-medium"
        id="okr-planning-assignation-modal-cancel-button"
        data-cy="okr-planning-assignation-modal-cancel-button"
      >
        Cancel
      </Button>
      <Button
        type="primary"
        onClick={() => form.submit()}
        loading={isLoading || editLoading}
        className="h-10 px-8 rounded-lg bg-[#2b54ad] hover:bg-[#3d66c2] focus:bg-[#3d66c2] border-none font-medium flex items-center justify-center"
        id="okr-planning-assignation-modal-submit-button"
        data-cy="okr-planning-assignation-modal-submit-button"
      >
        {selectedPlanningUser ? 'Update' : 'Create'}
      </Button>
    </div>
  );

  return (
    <Modal
      open={open}
      onCancel={handleModalClose}
      title={
        <span
          className="text-[20px] font-bold text-[#262626]"
          data-cy="okr-planning-assignation-modal-title"
        >
          {selectedPlanningUser ? 'Edit Assignment' : 'Assign Users'}
        </span>
      }
      footer={footer}
      width={640}
      centered
      closeIcon={
        <CloseOutlined
          className="text-[#8c8c8c]"
          data-cy="okr-planning-assignation-modal-close-icon"
        />
      }
      data-cy="okr-planning-assignation-modal"
      className="okr-settings-modal"
    >
      <Form
        form={form}
        layout="vertical"
        requiredMark={false}
        onFinish={onFinish}
        className=""
        id="okr-planning-assignation-modal-form"
        data-cy="okr-planning-assignation-modal-form"
      >
        {/* Assignee Selection - Hidden field for real value */}
        <Form.Item
          name="userIds"
          noStyle
          data-cy="okr-planning-assignation-hidden-userids-field"
        />

        <Form.Item
          label={
            <div
              className="flex items-center gap-1"
              data-cy="okr-planning-assignation-assignee-label"
            >
              <span
                className="text-[14px] font-medium text-[#262626]"
                data-cy="okr-planning-assignation-assignee-label-text"
              >
                Assignee
              </span>
              <span
                className="text-[#ff4d4f] text-[14px] leading-none"
                aria-hidden
                data-cy="okr-planning-assignation-assignee-required-indicator"
              >
                *
              </span>
              <Tooltip title="Choose the employees you want to assign OKR plans to.">
                <QuestionCircleOutlined
                  className="text-[#bfbfbf] text-[14px] ml-1 cursor-help"
                  data-cy="okr-planning-assignation-assignee-tooltip"
                />
              </Tooltip>
            </div>
          }
          required
          rules={[
            { required: true, message: 'Please select at least one assignee' },
          ]}
          data-cy="okr-planning-assignation-assignee-field"
          id="okr-planning-assignation-assignee-field"
          className="mb-2"
        >
          <div
            className="custom-centered-select-wrapper relative"
            data-cy="okr-planning-assignation-assignee-select-wrapper"
          >
            <Select
              mode="multiple"
              placeholder=""
              className="w-full h-11 custom-modal-select always-show-placeholder"
              maxTagCount={0}
              maxTagPlaceholder={() => null}
              value={userIds} // Correctly pass selected IDs to show selection in dropdown
              onSelect={(id: string) => {
                const currentIds = form.getFieldValue('userIds') || [];
                if (!currentIds.includes(id)) {
                  form.setFieldsValue({ userIds: [...currentIds, id] });
                }
              }}
              onDeselect={(id: string) => {
                const currentIds = form.getFieldValue('userIds') || [];
                form.setFieldsValue({
                  userIds: currentIds.filter((uid: string) => uid !== id),
                });
              }}
              optionLabelProp="label"
              id="okr-planning-assignation-assignee-select"
              data-cy="okr-planning-assignation-assignee-select"
              dropdownClassName="custom-assignee-dropdown"
              popupClassName="custom-assignee-dropdown"
            >
              {allUsers?.items.map((user: any) => (
                <Option
                  key={user.id}
                  value={user.id}
                  label={`${user.firstName} ${user.lastName}`}
                  data-cy={`okr-planning-assignation-assignee-option-${user.id}`}
                >
                  <div
                    className="flex items-center gap-3 py-1"
                    data-cy={`okr-planning-assignation-assignee-option-content-${user.id}`}
                  >
                    <Avatar
                      size={28}
                      src={user.profileImage}
                      icon={!user.profileImage && <UserOutlined />}
                      data-cy={`okr-planning-assignation-assignee-option-avatar-${user.id}`}
                    />
                    <div
                      className="flex flex-col"
                      data-cy={`okr-planning-assignation-assignee-option-info-${user.id}`}
                      id={`okr-planning-assignation-assignee-option-info-${user.id}`}
                    >
                      <span
                        className="text-[14px] font-medium text-[#262626]"
                        data-cy={`okr-planning-assignation-assignee-option-name-${user.id}`}
                      >
                        {user.firstName} {user.lastName}
                      </span>
                      <span
                        className="text-[12px] text-[#8c8c8c]"
                        data-cy={`okr-planning-assignation-assignee-option-email-${user.id}`}
                      >
                        {user.email}
                      </span>
                    </div>
                  </div>
                </Option>
              ))}
            </Select>
            {/* Always visible placeholder overlay */}
            <span
              className="absolute left-3 text-[#8c8c8c] font-normal pointer-events-none z-10"
              style={{ lineHeight: '44px' }}
              data-cy="okr-planning-assignation-assignee-placeholder"
            >
              Select Employee
            </span>
            <style
              jsx
              global
              data-cy="okr-planning-assignation-drawer-styles"
            >{`
              .custom-centered-select-wrapper .ant-select-selector {
                display: flex !important;
                align-items: center !important;
                height: 44px !important;
                padding-top: 0 !important;
                padding-bottom: 0 !important;
                position: relative !important;
              }
              .custom-centered-select-wrapper
                .always-show-placeholder
                .ant-select-selection-placeholder {
                display: none !important;
              }
              .custom-centered-select-wrapper
                .always-show-placeholder
                .ant-select-selection-item {
                display: none !important;
              }
              .custom-centered-select-wrapper
                .always-show-placeholder
                .ant-select-selection-search {
                display: none !important;
              }
              .custom-centered-select-wrapper
                .always-show-placeholder
                .ant-select-selection-overflow {
                display: none !important;
              }
              .custom-assignee-dropdown .ant-select-item-option-selected {
                background-color: #e6f7ff !important;
                font-weight: 500;
              }
              .custom-assignee-dropdown
                .ant-select-item-option-selected
                .ant-select-item-option-state {
                color: #1890ff;
              }
              .okr-settings-modal .ant-modal-header {
                padding: 20px 24px 16px 24px !important;
                border-bottom: none !important;
              }
              .okr-settings-modal .ant-modal-body {
                padding: 0px 24px 24px 24px !important;
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
          </div>
        </Form.Item>

        {/* Manual Tag Display */}
        <div
          className="flex flex-wrap gap-2 mb-6"
          data-cy="okr-planning-assignation-user-tags-container"
        >
          {userIds?.map((id: string) => {
            const user = allUsers?.items?.find((u: any) => u.id === id);
            if (!user) return null;
            return (
              <div
                key={id}
                className="flex items-center gap-2 bg-white border border-[#d9d9d9] px-3 py-1 rounded-[6px]"
                id={`okr-manual-user-tag-${id}`}
                data-cy={`okr-manual-user-tag-${id}`}
              >
                <span
                  className="text-[14px] text-[#595959]"
                  data-cy={`okr-manual-user-tag-name-${id}`}
                >
                  {user.firstName}
                </span>
                <CloseOutlined
                  className="text-[10px] text-[#8c8c8c] cursor-pointer hover:text-red-500"
                  onClick={() => {
                    const newIds = userIds.filter((uid: string) => uid !== id);
                    form.setFieldsValue({ userIds: newIds });
                  }}
                  data-cy={`okr-manual-user-tag-close-${id}`}
                />
              </div>
            );
          })}
        </div>

        {/* Plan Selection */}
        <Form.Item
          label={
            <div
              className="flex items-center gap-1"
              data-cy="okr-planning-assignation-plan-label"
            >
              <span
                className="text-[14px] font-medium text-[#262626]"
                data-cy="okr-planning-assignation-plan-label-text"
              >
                Plan
              </span>
              <span
                className="text-[#ff4d4f] text-[14px] leading-none"
                aria-hidden
                data-cy="okr-planning-assignation-plan-required-indicator"
              >
                *
              </span>
              <Tooltip title="Choose the OKR planning periods for these employees.">
                <QuestionCircleOutlined
                  className="text-[#bfbfbf] text-[14px] ml-1 cursor-help"
                  data-cy="okr-planning-assignation-plan-tooltip"
                />
              </Tooltip>
            </div>
          }
          name="planningPeriods"
          required
          rules={[
            { required: true, message: 'Please select at least one plan' },
          ]}
          id="okr-planning-assignation-plan-field"
          data-cy="okr-planning-assignation-plan-field"
        >
          <div
            className="custom-centered-select-wrapper relative"
            data-cy="okr-planning-assignation-plan-select-wrapper"
          >
            <Select
              mode="multiple"
              placeholder=""
              className="w-full h-11 custom-modal-select always-show-placeholder"
              maxTagCount={0}
              maxTagPlaceholder={() => null}
              id="okr-planning-assignation-plan-select"
              data-cy="okr-planning-assignation-plan-select"
              dropdownClassName="custom-assignee-dropdown"
              popupClassName="custom-assignee-dropdown"
              value={planningPeriods}
              onSelect={(id: string) => {
                const current = form.getFieldValue('planningPeriods') || [];
                if (!current.includes(id)) {
                  form.setFieldsValue({ planningPeriods: [...current, id] });
                }
              }}
              onDeselect={(id: string) => {
                const current = form.getFieldValue('planningPeriods') || [];
                form.setFieldsValue({
                  planningPeriods: current.filter((pid: string) => pid !== id),
                });
              }}
            >
              {allPlanningperiod?.items
                ?.filter((p) => p.isActive)
                .map((period) => (
                  <Option
                    key={period.id}
                    value={period.id}
                    data-cy={`okr-planning-assignation-plan-option-${period.id}`}
                  >
                    {period.name}
                  </Option>
                ))}
            </Select>
            <span
              className="absolute left-3 text-[#8c8c8c] font-normal pointer-events-none z-10"
              style={{ lineHeight: '44px' }}
              data-cy="okr-planning-assignation-plan-placeholder"
            >
              Select Plan
            </span>
          </div>
        </Form.Item>

        {/* Manual Plan Tag Display */}
        <div
          className="flex flex-wrap gap-2 mt-2"
          data-cy="okr-planning-assignation-plan-tags-container"
        >
          {planningPeriods?.map((id: string) => {
            const period = allPlanningperiod?.items?.find((p) => p.id === id);
            if (!period) return null;
            return (
              <div
                key={id}
                className="flex items-center gap-2 bg-white border border-[#d9d9d9] px-3 py-1 rounded-[6px]"
                id={`okr-manual-plan-tag-${id}`}
                data-cy={`okr-manual-plan-tag-${id}`}
              >
                <span
                  className="text-[14px] text-[#595959]"
                  data-cy={`okr-manual-plan-tag-name-${id}`}
                >
                  {period.name}
                </span>
                <CloseOutlined
                  className="text-[10px] text-[#8c8c8c] cursor-pointer hover:text-red-500"
                  onClick={() => {
                    const newPeriods = planningPeriods.filter(
                      (pid: string) => pid !== id,
                    );
                    form.setFieldsValue({ planningPeriods: newPeriods });
                  }}
                  data-cy={`okr-manual-plan-tag-close-${id}`}
                />
              </div>
            );
          })}
        </div>
      </Form>
    </Modal>
  );
};

export default PlanningAssignationModal;
