import React, { useEffect, forwardRef, useMemo, useState } from 'react';
import {
  Form,
  Input,
  Select,
  Button,
  DatePicker,
  Modal,
  Row,
  Col,
  Avatar,
} from 'antd';
import { CloseOutlined, UserOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { useMeetingStore } from '@/store/uistate/features/conversation/meeting';
import { MdClose } from 'react-icons/md';
import { useGetAllUsers } from '@/store/server/features/employees/employeeManagment/queries';
import {
  useCreateMeetingActionPlanBulk,
  useUpdateMeetingActionPlan,
} from '@/store/server/features/CFR/meeting/action-plan/mutations';
import { meetingFormRequiredMark } from '../../_component/meetingFormRequiredMark';
import ActionPlanCard from './ActionPlanCard';

const { Option } = Select;

function FormFieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="text-[14px] font-normal text-[#030712]"
      data-cy="feedback-meeting-addactionplan-form-field-label-text"
    >
      {children}
    </span>
  );
}

/** Same UX as OKR Assign Users “Assignee”: empty trigger + selected users as tags below. */
const ResponsiblePersonAssigneeSelect = forwardRef<
  HTMLDivElement,
  {
    value?: string[];
    onChange?: (ids: string[]) => void;
    allUsers?: { items?: any[] };
    listFieldKey: string | number;
  }
>(function ResponsiblePersonAssigneeSelect(
  { value, onChange, allUsers, listFieldKey },
  ref,
) {
  const ids = Array.isArray(value) ? value : [];

  const setIds = (next: string[]) => {
    onChange?.(next);
  };

  return (
    <div
      ref={ref}
      data-cy={`feedback-meeting-components-addactionplan-responsible-root-${listFieldKey}`}
    >
      <div
        className="custom-centered-select-wrapper relative"
        data-cy={`feedback-meeting-components-addactionplan-responsible-wrapper-${listFieldKey}`}
      >
        <Select
          mode="multiple"
          showSearch
          placeholder=""
          className="always-show-placeholder custom-modal-select h-10 w-full"
          maxTagCount={0}
          maxTagPlaceholder={() => null}
          value={ids}
          onChange={(v) => setIds(Array.isArray(v) ? (v as string[]) : [])}
          optionLabelProp="label"
          filterOption={(input, option: any) =>
            (option?.label ?? '')
              ?.toString()
              .toLowerCase()
              .includes(input.toLowerCase())
          }
          popupClassName="custom-assignee-dropdown"
          dropdownClassName="custom-assignee-dropdown"
          data-cy={`feedback-meeting-components-addactionplan-responsible-select-${listFieldKey}`}
          id={`feedback-meeting-components-addactionplan-responsible-select-${listFieldKey}`}
        >
          {allUsers?.items?.map((user: any) => (
            <Option
              key={user.id}
              value={user.id}
              label={`${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim()}
            >
              <div
                className="flex items-center gap-3 py-1"
                data-cy={`feedback-meeting-addactionplan-responsible-option-${user.id}`}
              >
                <Avatar
                  size={28}
                  src={user.profileImage}
                  icon={!user.profileImage && <UserOutlined />}
                />
                <div
                  className="flex flex-col"
                  data-cy={`feedback-meeting-addactionplan-responsible-option-meta-${user.id}`}
                >
                  <span
                    className="text-[14px] font-medium text-[#262626]"
                    data-cy={`feedback-meeting-addactionplan-responsible-option-name-${user.id}`}
                  >
                    {user?.firstName} {user?.middleName} {user?.lastName}
                  </span>
                  {user?.email ? (
                    <span
                      className="text-[12px] text-[#8c8c8c]"
                      data-cy={`feedback-meeting-addactionplan-responsible-option-email-${user.id}`}
                    >
                      {user.email}
                    </span>
                  ) : null}
                </div>
              </div>
            </Option>
          ))}
        </Select>
        <span
          className="pointer-events-none absolute left-3 z-10 font-normal text-[#8c8c8c]"
          style={{ lineHeight: '40px' }}
          data-cy={`feedback-meeting-components-addactionplan-responsible-placeholder-${listFieldKey}`}
        >
          Select Employee
        </span>
      </div>
      <div
        className="mt-2 flex flex-wrap gap-2"
        data-cy={`feedback-meeting-components-addactionplan-responsible-tags-${listFieldKey}`}
      >
        {ids.map((id: string) => {
          const user = allUsers?.items?.find((u: any) => u.id === id);
          if (!user) return null;
          return (
            <div
              key={id}
              className="flex items-center gap-2 rounded-[6px] border border-[#d9d9d9] bg-[rgba(0,0,0,0.02)] px-2 py-[1px]"
              data-cy={`feedback-meeting-components-addactionplan-responsible-tag-${id}`}
            >
              <span
                className="text-[14px] text-[#595959]"
                data-cy={`feedback-meeting-addactionplan-responsible-tag-name-${id}`}
              >
                {user.firstName}
              </span>
              <CloseOutlined
                className="cursor-pointer text-[10px] text-[#8c8c8c] hover:text-red-500"
                onClick={() => setIds(ids.filter((uid) => uid !== id))}
                data-cy={`feedback-meeting-components-addactionplan-responsible-tag-close-${id}`}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
});
ResponsiblePersonAssigneeSelect.displayName = 'ResponsiblePersonAssigneeSelect';

interface AddActionPlanModalProps {
  visible: boolean;
  onClose: () => void;
  meetingId: string;
  canEdit: boolean;
  'data-cy'?: string;
}

const AddActionPlanModal: React.FC<AddActionPlanModalProps> = ({
  visible,
  onClose,
  meetingId,
  canEdit,
  'data-cy': dataCy,
}) => {
  const { actionPlanData, setActionPlanData } = useMeetingStore();
  const { mutateAsync: createMeetingActionPlanBulk, isLoading: createLoading } =
    useCreateMeetingActionPlanBulk();
  const { mutateAsync: updateMeetingActionPlan, isLoading: updateLoading } =
    useUpdateMeetingActionPlan();
  const [form] = Form.useForm();
  const { data: allUsers } = useGetAllUsers();
  const [draftAddedPlans, setDraftAddedPlans] = useState<any[]>([]);

  useEffect(() => {
    if (!visible) return;
    setDraftAddedPlans([]);
    if (actionPlanData) {
      const mapped = {
        ...actionPlanData,
        parent: 'Meeting',
        parentId: meetingId,
        responsibleUsers: actionPlanData?.responsibleUsers?.map(
          (p: any) => p?.responsibleId,
        ),
        deadline: actionPlanData?.deadline
          ? dayjs(actionPlanData?.deadline)
          : null,
      };
      form.setFieldsValue({ actionPlans: [mapped] });
    } else {
      form.setFieldsValue({ actionPlans: [{}] });
    }
  }, [visible, actionPlanData, form, meetingId]);

  const loading = updateLoading || createLoading;

  const handleClose = () => {
    onClose();
    setActionPlanData(null);
  };

  const handleSubmit = async () => {
    const values = await form.validateFields();
    const mapped = [
      ...draftAddedPlans,
      ...(values.actionPlans ?? []),
    ].map((item: any) => ({
      ...item,
      parent: 'Meeting',
      parentId: meetingId,
      responsibleUsers: item.responsibleUsers?.map((p: any) => ({
        responsibleId: p,
      })),
    }));

    const finalValue = { actionPlans: mapped };
    const finalValueEdit = {
      ...values.actionPlans[0],
      responsibleUsers: values.actionPlans[0].responsibleUsers?.map(
        (p: any) => ({ responsibleId: p }),
      ),
      id: actionPlanData?.id,
    };

    if (actionPlanData == null) {
      await createMeetingActionPlanBulk(finalValue);
    } else {
      await updateMeetingActionPlan(finalValueEdit);
    }
    form.resetFields();
    setDraftAddedPlans([]);
    setActionPlanData(null);
    onClose();
  };

  const modalTitle = actionPlanData ? 'Edit action plan' : 'Action Plan';

  const alreadyAddedCardItems = useMemo(() => {
    return (draftAddedPlans ?? []).map((item: any, index: number) => {
      const deadlineValue = item?.deadline;
      const deadline =
        typeof deadlineValue === 'string'
          ? deadlineValue
          : deadlineValue?.toISOString?.() ?? '';
      const responsibleUsers = (item?.responsibleUsers ?? []).map((id: any) => ({
        responsibleId: String(id),
      }));
      return {
        id: `draft-${index}`,
        issue: String(item?.issue ?? ''),
        description: String(item?.description ?? ''),
        deadline,
        status: 'Pending' as const,
        priority: (item?.priority ?? 'Low') as 'High' | 'Medium' | 'Low',
        responsibleUsers,
      };
    });
  }, [draftAddedPlans]);

  const handleAddAnother = async () => {
    const values = await form.validateFields();
    const current = values?.actionPlans?.[0];
    if (!current) return;
    setDraftAddedPlans((prev) => [...prev, current]);
    form.setFieldsValue({ actionPlans: [{}] });
  };

  const handleEditDraftPlan = (index: number) => {
    const target = draftAddedPlans[index];
    if (!target) return;
    setDraftAddedPlans((prev) =>
      prev.filter((draftPlan, draftIndex) => draftIndex !== index),
    );
    form.setFieldsValue({ actionPlans: [target] });
  };

  const handleDeleteDraftPlan = (index: number) => {
    setDraftAddedPlans((prev) =>
      prev.filter((draftPlan, draftIndex) => draftIndex !== index),
    );
  };

  const footer = (
    <div
      className="flex justify-end gap-2"
      data-cy="feedback-meeting-components-addactionplan-footer"
    >
      <Button
        type="default"
        disabled={loading}
        onClick={handleClose}
        className="flex h-[32px] w-[68px] items-center justify-center rounded-[8px] border border-solid border-[#D9D9D9] p-0 text-[14px] font-normal text-[#595959] hover:text-[#262626]"
        data-cy="feedback-meeting-components-addactionplan-button-cancel"
      >
        Cancel
      </Button>
      <Button
        type="primary"
        loading={loading}
        onClick={handleSubmit}
        className="flex h-[32px] w-[68px] items-center justify-center rounded-[8px] border-none bg-[#1E40AF] p-0 text-[14px] font-normal hover:bg-[#1e3a8a] focus:bg-[#1e3a8a]"
        data-cy="feedback-meeting-components-addactionplan-button-submit"
      >
        {actionPlanData ? 'Save' : 'Create'}
      </Button>
    </div>
  );

  return (
    <Modal
      title={
        <span
          className="text-[16px] font-bold text-black/70"
          data-cy="feedback-meeting-components-addactionplan-header"
        >
          {modalTitle}
        </span>
      }
      open={visible}
      onCancel={handleClose}
      width={780}
      footer={footer}
      destroyOnClose
      maskClosable={!loading}
      closable={!loading}
      centered
      closeIcon={
        <CloseOutlined
          className="text-[#8c8c8c]"
          data-cy="feedback-meeting-components-addactionplan-modal-close-icon"
        />
      }
      className="okr-settings-modal meeting-action-plan-modal"
      data-cy={dataCy ?? 'feedback-meeting-components-addactionplan-modal'}
    >
      <style
        jsx
        global
        data-cy="feedback-meeting-addactionplan-modal-global-styles"
      >
        {`
          .meeting-action-plan-modal .ant-modal-body {
            max-height: none;
            overflow-y: visible;
          }
          .meeting-action-plan-modal .ant-picker {
            height: 40px !important;
          }
          .meeting-action-plan-modal .ant-picker-input > input {
            font-size: 14px;
          }
          .meeting-action-plan-modal .ant-input-textarea {
            min-height: 52px !important;
          }
          .meeting-action-plan-modal .ant-input-textarea textarea.ant-input,
          .meeting-action-plan-modal textarea.ant-input {
            height: 52px !important;
            min-height: 52px !important;
            max-height: 52px !important;
            resize: none !important;
            padding-top: 8px !important;
            padding-bottom: 8px !important;
            line-height: 1.4 !important;
          }
          .meeting-action-plan-modal
            .custom-centered-select-wrapper
            .ant-select-selector {
            display: flex !important;
            align-items: center !important;
            height: 40px !important;
            padding-top: 0 !important;
            padding-bottom: 0 !important;
            position: relative !important;
          }
          .meeting-action-plan-modal
            .custom-centered-select-wrapper
            .always-show-placeholder
            .ant-select-selection-placeholder {
            display: none !important;
          }
          .meeting-action-plan-modal
            .custom-centered-select-wrapper
            .always-show-placeholder
            .ant-select-selection-item {
            display: none !important;
          }
          .meeting-action-plan-modal
            .custom-centered-select-wrapper
            .always-show-placeholder
            .ant-select-selection-search {
            display: none !important;
          }
          .meeting-action-plan-modal
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
          .okr-settings-modal .ant-modal-content {
            padding: 0 !important;
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
          .okr-settings-modal .ant-modal-close {
            width: 22px !important;
            height: 22px !important;
          }
          .okr-settings-modal .ant-modal-close-x {
            width: 22px !important;
            height: 22px !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
          }
          .okr-settings-modal .ant-modal-close .anticon,
          .okr-settings-modal .ant-modal-close svg {
            width: 16px !important;
            height: 16px !important;
            font-size: 16px !important;
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
          .okr-settings-modal .ant-modal-body > *:last-child {
            margin-bottom: 0 !important;
          }
        `}
      </style>
      <Form
        form={form}
        layout="vertical"
        name="actionPlansForm"
        requiredMark={meetingFormRequiredMark}
        data-cy="feedback-meeting-components-addactionplan-form"
        id="feedback-meeting-components-addactionplan-form"
      >
        <Form.List
          name="actionPlans"
          data-cy="feedback-meeting-components-addactionplan-list"
        >
          {(fields, { remove }) => (
            <>
              {actionPlanData == null && alreadyAddedCardItems.length > 0 ? (
                <div
                  className="mb-3 flex flex-col gap-3"
                  data-cy="feedback-meeting-components-addactionplan-already-added-wrap"
                >
                  {alreadyAddedCardItems.map((item, index) => (
                    <ActionPlanCard
                      key={item.id}
                      canEdit={canEdit}
                      actionMode="icons"
                      onEdit={() => handleEditDraftPlan(index)}
                      onDelete={() => handleDeleteDraftPlan(index)}
                      {...item}
                      data-cy={`feedback-meeting-components-addactionplan-already-added-item-${index}`}
                      id={`feedback-meeting-components-addactionplan-already-added-item-${index}`}
                    />
                  ))}
                </div>
              ) : null}
              {fields.map(({ key, name, ...restField }) => (
                <div
                  key={key}
                  className="relative mb-0"
                  data-cy={`feedback-meeting-components-addactionplan-group-${key}`}
                  id={`feedback-meeting-components-addactionplan-group-${key}`}
                >
                  {fields.length > 1 && (
                    <MdClose
                      size={18}
                      className="absolute top-1 right-0 z-10 cursor-pointer hover:text-red-700"
                      onClick={() => remove(name)}
                      id={`feedback-meeting-components-addactionplan-button-remove-${key}`}
                      data-cy={`feedback-meeting-components-addactionplan-button-remove-${key}`}
                    />
                  )}

                  <Form.Item
                    {...restField}
                    label={<FormFieldLabel>Issue</FormFieldLabel>}
                    name={[name, 'issue']}
                    rules={[
                      { required: true, message: 'Please input the issue!' },
                    ]}
                    data-cy={`feedback-meeting-components-addactionplan-issue-${key}`}
                    id={`feedback-meeting-components-addactionplan-issue-${key}`}
                  >
                    <Input.TextArea
                      placeholder="Textarea"
                      rows={2}
                      className="text-[14px]"
                      data-cy={`feedback-meeting-components-addactionplan-issue-textarea-${key}`}
                      id={`feedback-meeting-components-addactionplan-issue-textarea-${key}`}
                    />
                  </Form.Item>

                  <Form.Item
                    {...restField}
                    label={<FormFieldLabel>Action to be taken</FormFieldLabel>}
                    name={[name, 'description']}
                    rules={[
                      {
                        required: true,
                        message: 'Please describe the action to be taken!',
                      },
                    ]}
                    data-cy={`feedback-meeting-components-addactionplan-description-${key}`}
                    id={`feedback-meeting-components-addactionplan-description-${key}`}
                  >
                    <Input.TextArea
                      placeholder="Textarea"
                      rows={2}
                      className="text-[14px]"
                      data-cy={`feedback-meeting-components-addactionplan-description-textarea-${key}`}
                      id={`feedback-meeting-components-addactionplan-description-textarea-${key}`}
                    />
                  </Form.Item>

                  <Form.Item
                    {...restField}
                    label={<FormFieldLabel>Responsible Person</FormFieldLabel>}
                    name={[name, 'responsibleUsers']}
                    rules={[
                      {
                        required: true,
                        message:
                          'Please select at least one responsible person',
                      },
                    ]}
                    data-cy={`feedback-meeting-components-addactionplan-responsible-${key}`}
                    id={`feedback-meeting-components-addactionplan-responsible-select-${key}`}
                  >
                    <ResponsiblePersonAssigneeSelect
                      allUsers={allUsers}
                      listFieldKey={key}
                    />
                  </Form.Item>

                  <Row
                    gutter={12}
                    data-cy={`feedback-meeting-components-addactionplan-priority-deadline-row-${key}`}
                  >
                    <Col span={12}>
                      <Form.Item
                        {...restField}
                        label={<FormFieldLabel>Priority</FormFieldLabel>}
                        name={[name, 'priority']}
                        rules={[
                          {
                            required: true,
                            message: 'Please select a priority!',
                          },
                        ]}
                        className="!mb-0"
                        data-cy={`feedback-meeting-components-addactionplan-priority-${key}`}
                        id={`feedback-meeting-components-addactionplan-priority-select-${key}`}
                      >
                        <div
                          className="custom-centered-select-wrapper relative"
                          data-cy={`feedback-meeting-addactionplan-priority-wrap-${key}`}
                        >
                          <Select
                            placeholder="Select"
                            className="custom-modal-select h-10 w-full"
                            popupClassName="custom-assignee-dropdown"
                            dropdownClassName="custom-assignee-dropdown"
                            onChange={(value) => {
                              form.setFieldValue(
                                ['actionPlans', name, 'priority'],
                                value,
                              );
                              form.setFields([
                                {
                                  name: ['actionPlans', name, 'priority'],
                                  errors: [],
                                },
                              ]);
                            }}
                            data-cy={`feedback-meeting-components-addactionplan-priority-select-${key}`}
                            id={`feedback-meeting-components-addactionplan-priority-select-inner-${key}`}
                          >
                            <Option value="High">High</Option>
                            <Option value="Medium">Medium</Option>
                            <Option value="Low">Low</Option>
                          </Select>
                        </div>
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        {...restField}
                        label={<FormFieldLabel>Deadline</FormFieldLabel>}
                        name={[name, 'deadline']}
                        rules={[
                          {
                            required: true,
                            message: 'Please select a deadline!',
                          },
                        ]}
                        className="!mb-0"
                        data-cy={`feedback-meeting-components-addactionplan-deadline-${key}`}
                        id={`feedback-meeting-components-addactionplan-deadline-picker-${key}`}
                      >
                        <DatePicker
                          format="YYYY-MM-DD"
                          placeholder="Select date"
                          className="h-10 w-full"
                          data-cy={`feedback-meeting-components-addactionplan-deadline-picker-inner-${key}`}
                          id={`feedback-meeting-components-addactionplan-deadline-picker-inner-${key}`}
                        />
                      </Form.Item>
                    </Col>
                  </Row>

                  {actionPlanData && (
                    <Form.Item
                      {...restField}
                      label={<FormFieldLabel>Status</FormFieldLabel>}
                      name={[name, 'status']}
                      rules={[
                        { required: true, message: 'Please select a status!' },
                      ]}
                      data-cy={`feedback-meeting-components-addactionplan-status-${key}`}
                      id={`feedback-meeting-components-addactionplan-status-select-${key}`}
                    >
                      <div
                        className="custom-centered-select-wrapper relative"
                        data-cy={`feedback-meeting-addactionplan-status-wrap-${key}`}
                      >
                        <Select
                          placeholder="Select status"
                          className="custom-modal-select h-10 w-full"
                          popupClassName="custom-assignee-dropdown"
                          dropdownClassName="custom-assignee-dropdown"
                          data-cy={`feedback-meeting-components-addactionplan-status-select-${key}`}
                        >
                          <Option value="Pending">Pending</Option>
                          <Option value="In_Progress">In progress</Option>
                          <Option value="Completed">Completed</Option>
                        </Select>
                      </div>
                    </Form.Item>
                  )}
                </div>
              ))}
              {actionPlanData == null && (
                <div
                  className="flex justify-center pb-1"
                  data-cy="feedback-meeting-components-addactionplan-add-plan-wrap"
                >
                  <Button
                    type="primary"
                    onClick={handleAddAnother}
                    className="h-8 rounded-[8px] border-none bg-[#1E40AF] px-[15px] py-0 font-normal hover:bg-[#1e3a8a]"
                    data-cy="feedback-meeting-components-addactionplan-button-add-plan"
                    id="feedback-meeting-components-addactionplan-button-add-plan"
                  >
                    Add New Action Plan
                  </Button>
                </div>
              )}
            </>
          )}
        </Form.List>
      </Form>
    </Modal>
  );
};

export default AddActionPlanModal;
