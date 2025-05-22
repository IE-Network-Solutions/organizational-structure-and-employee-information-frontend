import React, { useEffect } from 'react';
import { Form, Input, Select, Button, DatePicker } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import CustomDrawerLayout from '@/components/common/customDrawer';
import { useMeetingStore } from '@/store/uistate/features/conversation/meeting';
import { MdClose } from 'react-icons/md';
import { useGetAllUsers } from '@/store/server/features/employees/employeeManagment/queries';
import {
  useCreateMeetingActionPlanBulk,
  useUpdateMeetingActionPlan,
} from '@/store/server/features/CFR/meeting/mutations';

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
    <div className="w-full flex justify-center items-center gap-4 pt-8">
      <Button loading={loading} onClick={handleClose}>
        Cancel
      </Button>
      <Button
        loading={loading}
        type="primary"
        htmlType="submit"
        onClick={() => form.submit()}
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
        <div className="text-center">
          {actionPlanData ? 'Edit Action Plan' : 'Add New Action Plan'}
        </div>
      }
      width="50%"
      footer={footer}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        name="actionPlansForm"
      >
        <Form.List name="actionPlans">
          {(fields, { add, remove }) => (
            <>
              {fields.map(({ key, name, ...restField }) => (
                <div key={key} className="mb-4 border-b  relative ">
                  {fields.length > 1 && (
                    <MdClose
                      size={18}
                      className="absolute top-1 right-2  hover:text-red-700"
                      onClick={() => remove(name)}
                    />
                  )}

                  <Form.Item
                    {...restField}
                    label="Issue"
                    name={[name, 'issue']}
                    rules={[
                      { required: true, message: 'Please input the issue!' },
                    ]}
                  >
                    <Input.TextArea placeholder="Input area" />
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
                  >
                    <Input.TextArea placeholder="Something to be done" />
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
                  >
                    <Select
                      showSearch
                      placeholder="Select person"
                      allowClear
                      mode="multiple"
                      filterOption={(input: any, option: any) =>
                        (option?.label ?? '')
                          ?.toLowerCase()
                          .includes(input.toLowerCase())
                      }
                      options={peopleOptions}
                    />
                  </Form.Item>

                  <Form.Item
                    {...restField}
                    label="Priority"
                    name={[name, 'priority']}
                    rules={[
                      { required: true, message: 'Please select a priority!' },
                    ]}
                  >
                    <Select placeholder="Select priority">
                      <Option value="High">High</Option>
                      <Option value="Medium">Medium</Option>
                      <Option value="Low">Low</Option>
                    </Select>
                  </Form.Item>

                  {/* Optional: Uncomment to enable deadline field */}
                  <Form.Item
                    {...restField}
                    label="Deadline"
                    name={[name, 'deadline']}
                    rules={[{ required: false }]}
                  >
                    <DatePicker format="YYYY-MM-DD" className="w-full" />
                  </Form.Item>
                </div>
              ))}
              {actionPlanData == null && (
                <Form.Item>
                  <Button
                    type="primary"
                    onClick={() => add()}
                    block
                    icon={<PlusOutlined />}
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
