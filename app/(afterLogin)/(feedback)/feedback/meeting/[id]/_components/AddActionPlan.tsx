import React, { useEffect } from 'react';
import { Form, Input, Select, Button, DatePicker } from 'antd';
import dayjs from 'dayjs';
import CustomDrawerLayout from '@/components/common/customDrawer';
import { useMeetingStore } from '@/store/uistate/features/conversation/meeting';
import { MdClose } from 'react-icons/md';
import { useGetAllUsers } from '@/store/server/features/employees/employeeManagment/queries';
import {
  useCreateMeetingActionPlanBulk,
  useUpdateMeetingActionPlan,
} from '@/store/server/features/CFR/meeting/action-plan/mutations';

const { Option } = Select;

interface AddActionPlanDrawerProps {
  visible: boolean;
  onClose: () => void;
  meetingId: string;
}

const AddActionPlanDrawer: React.FC<AddActionPlanDrawerProps> = ({
  visible,
  onClose,
  meetingId,
}) => {
  const { actionPlanData, setActionPlanData } = useMeetingStore();
  const { mutate: createMeetingActionPlan, isLoading: createLoading } =
    useCreateMeetingActionPlanBulk();
  const { mutate: updateMeetingActionPlan, isLoading: updateLoading } =
    useUpdateMeetingActionPlan();
  const [form] = Form.useForm();
  const { data: allUsers } = useGetAllUsers();

  const peopleOptions = allUsers?.items?.map((i: any) => ({
    value: i.id,
    label: `${i?.firstName} ${i?.middleName} ${i?.lastName}`,
  }));

  useEffect(() => {
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
      form.setFieldsValue({ actionPlans: [{}] }); // initialize with one
    }
  }, [actionPlanData, form]);

  const onFinish = (values: any) => {
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
    {
      actionPlanData == null
        ? createMeetingActionPlan(finalValue, {
            onSuccess() {
              form.resetFields();
              onClose();
            },
          })
        : updateMeetingActionPlan(finalValueEdit, {
            onSuccess() {
              form.resetFields();
              onClose();
            },
          });
    }
    // Submit logic
  };

  const handleClose = () => {
    onClose();
    setActionPlanData(null);
  };
  const loading = updateLoading || createLoading;

  const footer = (
    <div
      className="w-full flex justify-center items-center gap-4 pt-8"
      data-cy="feedback-meeting-components-addactionplan-footer"
    >
      <Button
        loading={loading}
        onClick={handleClose}
        className="h-10"
        data-cy="feedback-meeting-components-addactionplan-button-cancel"
      >
        Cancel
      </Button>
      <Button
        loading={loading}
        type="primary"
        htmlType="submit"
        onClick={() => form.submit()}
        className="h-10"
        data-cy="feedback-meeting-components-addactionplan-button-submit"
      >
        Submit
      </Button>
    </div>
  );
  return (
    <CustomDrawerLayout
      open={visible}
      onClose={handleClose}
      modalHeader={
        <div
          className="text-center"
          data-cy="feedback-meeting-components-addactionplan-header"
        >
          {actionPlanData ? 'Edit Action Plan' : 'Add New Action Plan'}
        </div>
      }
      width="50%"
      footer={footer}
      data-cy="feedback-meeting-components-addactionplan-drawer"
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        name="actionPlansForm"
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
                  className="mb-4 relative "
                  data-cy={`feedback-meeting-components-addactionplan-group-${key}`}
                  id={`feedback-meeting-components-addactionplan-group-${key}`}
                >
                  {fields.length > 1 && (
                    <MdClose
                      size={18}
                      className="absolute top-1 right-2  hover:text-red-700 z-50"
                      onClick={() => remove(name)}
                      id={`feedback-meeting-components-addactionplan-button-remove-${key}`}
                      data-cy={`feedback-meeting-components-addactionplan-button-remove-${key}`}
                    />
                  )}

                  <Form.Item
                    {...restField}
                    label="Issue"
                    name={[name, 'issue']}
                    rules={[
                      { required: true, message: 'Please input the issue!' },
                    ]}
                    data-cy={`feedback-meeting-components-addactionplan-issue-${key}`}
                    id={`feedback-meeting-components-addactionplan-issue-${key}`}
                  >
                    <Input.TextArea
                      placeholder="Input area"
                      className="min-h-[54px]"
                      data-cy={`feedback-meeting-components-addactionplan-issue-textarea-${key}`}
                      id={`feedback-meeting-components-addactionplan-issue-textarea-${key}`}
                    />
                  </Form.Item>

                  <Form.Item
                    {...restField}
                    label="What needs to be done"
                    name={[name, 'description']}
                    rules={[
                      {
                        required: true,
                        message: 'Please describe what needs to be done!',
                      },
                    ]}
                    data-cy={`feedback-meeting-components-addactionplan-description-${key}`}
                    id={`feedback-meeting-components-addactionplan-description-${key}`}
                  >
                    <Input.TextArea
                      placeholder="Something to be done"
                      className="min-h-[54px]"
                      data-cy={`feedback-meeting-components-addactionplan-description-textarea-${key}`}
                      id={`feedback-meeting-components-addactionplan-description-textarea-${key}`}
                    />
                  </Form.Item>

                  <Form.Item
                    {...restField}
                    label="Responsible Person"
                    name={[name, 'responsibleUsers']}
                    rules={[
                      {
                        required: true,
                        message: 'Please select a responsible person!',
                      },
                    ]}
                    data-cy={`feedback-meeting-components-addactionplan-responsible-${key}`}
                    id={`feedback-meeting-components-addactionplan-responsible-select-${key}`}
                  >
                    <Select
                      showSearch
                      placeholder="Select person"
                      allowClear
                      mode="multiple"
                      className="h-[54px]"
                      filterOption={(input: any, option: any) =>
                        (option?.label ?? '')
                          ?.toLowerCase()
                          .includes(input.toLowerCase())
                      }
                      options={peopleOptions}
                      maxTagCount={3}
                      data-cy={`feedback-meeting-components-addactionplan-responsible-select-${key}`}
                      id={`feedback-meeting-components-addactionplan-responsible-select-${key}`}
                    />
                  </Form.Item>

                  <Form.Item
                    {...restField}
                    label="Priority"
                    name={[name, 'priority']}
                    rules={[
                      { required: true, message: 'Please select a priority!' },
                    ]}
                    data-cy={`feedback-meeting-components-addactionplan-priority-${key}`}
                    id={`feedback-meeting-components-addactionplan-priority-select-${key}`}
                  >
                    <Select
                      placeholder="Select priority"
                      className="h-[54px]"
                      data-cy={`feedback-meeting-components-addactionplan-priority-select-${key}`}
                      id={`feedback-meeting-components-addactionplan-priority-select-${key}`}
                    >
                      <Option
                        value="High"
                        data-cy={`feedback-meeting-components-addactionplan-priority-option-high-${key}`}
                        id={`feedback-meeting-components-addactionplan-priority-option-high-${key}`}
                      >
                        High
                      </Option>
                      <Option
                        value="Medium"
                        data-cy={`feedback-meeting-components-addactionplan-priority-option-medium-${key}`}
                        id={`feedback-meeting-components-addactionplan-priority-option-medium-${key}`}
                      >
                        Medium
                      </Option>
                      <Option
                        value="Low"
                        data-cy={`feedback-meeting-components-addactionplan-priority-option-low-${key}`}
                        id={`feedback-meeting-components-addactionplan-priority-option-low-${key}`}
                      >
                        Low
                      </Option>
                    </Select>
                  </Form.Item>
                  {actionPlanData && (
                    <Form.Item
                      {...restField}
                      label="Status"
                      name={[name, 'status']}
                      rules={[
                        { required: true, message: 'Please select a status!' },
                      ]}
                      data-cy={`feedback-meeting-components-addactionplan-status-${key}`}
                      id={`feedback-meeting-components-addactionplan-status-select-${key}`}
                    >
                      <Select
                        placeholder="Select status"
                        className="h-[54px]"
                        data-cy={`feedback-meeting-components-addactionplan-status-select-${key}`}
                      >
                        <Option
                          value="Pending"
                          data-cy={`feedback-meeting-components-addactionplan-status-option-pending-${key}`}
                          id={`feedback-meeting-components-addactionplan-status-option-pending-${key}`}
                        >
                          Pending
                        </Option>
                        <Option
                          value="In_Progress"
                          data-cy={`feedback-meeting-components-addactionplan-status-option-in-progress-${key}`}
                          id={`feedback-meeting-components-addactionplan-status-option-in-progress-${key}`}
                        >
                          In progress{' '}
                        </Option>
                        <Option
                          value="Completed"
                          data-cy={`feedback-meeting-components-addactionplan-status-option-completed-${key}`}
                          id={`feedback-meeting-components-addactionplan-status-option-completed-${key}`}
                        >
                          Completed{' '}
                        </Option>
                      </Select>
                    </Form.Item>
                  )}

                  {/* Optional: Uncomment to enable deadline field */}
                  <Form.Item
                    {...restField}
                    label="Deadline"
                    name={[name, 'deadline']}
                    rules={[{ required: true }]}
                    data-cy={`feedback-meeting-components-addactionplan-deadline-${key}`}
                    id={`feedback-meeting-components-addactionplan-deadline-picker-${key}`}
                  >
                    <DatePicker
                      format="YYYY-MM-DD"
                      className="w-full h-[54px]"
                      data-cy={`feedback-meeting-components-addactionplan-deadline-picker-${key}`}
                      id={`feedback-meeting-components-addactionplan-deadline-picker-${key}`}
                    />
                  </Form.Item>
                </div>
              ))}
              {actionPlanData == null && (
                <Form.Item
                  data-cy="feedback-meeting-components-addactionplan-button-add-plan"
                  id="feedback-meeting-components-addactionplan-button-add-plan"
                >
                  <Button
                    type="primary"
                    onClick={() => add()}
                    block
                    className="h-10"
                    data-cy="feedback-meeting-components-addactionplan-button-add-plan"
                    id="feedback-meeting-components-addactionplan-button-add-plan"
                  >
                    Add New Action Plan
                  </Button>
                </Form.Item>
              )}
            </>
          )}
        </Form.List>
      </Form>
    </CustomDrawerLayout>
  );
};

export default AddActionPlanDrawer;
