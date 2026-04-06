import React, { useEffect, forwardRef } from 'react';
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

const { Option } = Select;

function FormFieldLabel({
  children,
  required,
}: {
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <div
      className="flex items-center gap-1"
      data-cy="feedback-meeting-addactionplan-form-field-label-wrap"
    >
      <span
        className="text-[14px] font-normal text-[#030712]"
        data-cy="feedback-meeting-addactionplan-form-field-label-text"
      >
        {children}
      </span>
      {required ? (
        <span
          className="text-[14px] leading-none text-[#ff4d4f]"
          aria-hidden
          data-cy="feedback-meeting-addactionplan-form-field-label-required"
        >
          *
        </span>
      ) : null}
    </div>
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
  'data-cy'?: string;
}

const AddActionPlanModal: React.FC<AddActionPlanModalProps> = ({
  visible,
  onClose,
  meetingId,
  'data-cy': dataCy,
}) => {
  const { actionPlanData, setActionPlanData } = useMeetingStore();
  const { mutateAsync: createMeetingActionPlanBulk, isLoading: createLoading } =
    useCreateMeetingActionPlanBulk();
  const { mutateAsync: updateMeetingActionPlan, isLoading: updateLoading } =
    useUpdateMeetingActionPlan();
  const [form] = Form.useForm();
  const { data: allUsers } = useGetAllUsers();

  useEffect(() => {
    if (!visible) return;
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
    const mapped = values.actionPlans.map((item: any) => ({
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
    setActionPlanData(null);
    onClose();
  };

  const modalTitle = actionPlanData ? 'Edit action plan' : 'Action Plan';

  const footer = (
    <div
      className="flex justify-end gap-2"
      data-cy="feedback-meeting-components-addactionplan-footer"
    >
      <Button
        type="default"
        disabled={loading}
        onClick={handleClose}
        className="flex h-[32px] w-[68px] items-center justify-center rounded-[8px] border-[#d9d9d9] p-0 text-[14px] font-normal text-[#595959] hover:text-[#262626]"
        data-cy="feedback-meeting-components-addactionplan-button-cancel"
      >
        Cancel
      </Button>
      <Button
        type="primary"
        loading={loading}
        onClick={handleSubmit}
        className="flex h-[32px] w-[68px] items-center justify-center rounded-[8px] border-none bg-[#2b54ad] p-0 text-[14px] font-normal hover:bg-[#3d66c2] focus:bg-[#3d66c2]"
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
          className="text-[20px] font-bold text-[#262626]"
          data-cy="feedback-meeting-components-addactionplan-header"
        >
          {modalTitle}
        </span>
      }
      open={visible}
      onCancel={handleClose}
      width={640}
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
          max-height: min(70vh, 640px);
          overflow-y: auto;
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
      `}</style>
      <Form
        form={form}
        layout="vertical"
        name="actionPlansForm"
        requiredMark={false}
        data-cy="feedback-meeting-components-addactionplan-form"
        id="feedback-meeting-components-addactionplan-form"
      >
        <Form.List
          name="actionPlans"
          data-cy="feedback-meeting-components-addactionplan-list"
        >
          {(fields, { add, remove }) => (
            <>
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
                    label={<FormFieldLabel required>Issue</FormFieldLabel>}
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
                    label={
                      <FormFieldLabel required>
                        Action to be taken
                      </FormFieldLabel>
                    }
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
                    label={
                      <FormFieldLabel required>
                        Responsible Person
                      </FormFieldLabel>
                    }
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
                    gutter={24}
                    data-cy={`feedback-meeting-components-addactionplan-priority-deadline-row-${key}`}
                  >
                    <Col span={12}>
                      <Form.Item
                        {...restField}
                        label={
                          <FormFieldLabel required>Priority</FormFieldLabel>
                        }
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
                        label={
                          <FormFieldLabel required>Deadline</FormFieldLabel>
                        }
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
                      label={<FormFieldLabel required>Status</FormFieldLabel>}
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
                  className="flex justify-center pb-1 pt-2"
                  data-cy="feedback-meeting-components-addactionplan-add-plan-wrap"
                >
                  <Button
                    type="primary"
                    onClick={() => add()}
                    className="h-8 min-w-[200px] rounded-[8px] border-none bg-[#2b54ad] font-normal hover:bg-[#3d66c2]"
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
