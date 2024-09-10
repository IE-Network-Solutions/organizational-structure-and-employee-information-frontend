import React from 'react';
import { Modal, Form, Input, DatePicker, Select, Switch, Button } from 'antd';
import { CalendarOutlined } from '@ant-design/icons';
import { useFetchUsers } from '@/store/server/features/feedback/category/queries';
import { useUpdateForm } from '@/store/server/features/feedback/form/mutation';
import { CategoriesManagementStore } from '@/store/uistate/features/feedback/categories';
import dayjs from 'dayjs';

const { TextArea } = Input;
const { Option } = Select;

interface EditFormsModalProps {
  form: any;
}

const EditFormsModal: React.FC<EditFormsModalProps> = ({ form }) => {
  const [formInstance] = Form.useForm();
  const { data: employees } = useFetchUsers();
  const { mutate: updateForm } = useUpdateForm();
  const { isEditModalVisible, setIsEditModalVisible } =
    CategoriesManagementStore();

  const handleSubmit = async () => {
    const values = await formInstance.validateFields();

    const updatedData = {
      ...values,
      startDate: values.surveyStartDate.toISOString(),
      endDate: values.surveyEndDate.toISOString(),
      formPermissions: values.users.map((userId: string) => ({ userId })),
    };
    updateForm({ data: updatedData, id: form?.items[0]?.id });
    setIsEditModalVisible(false);
  };

  return (
    <Modal
      title="Edit Form"
      open={isEditModalVisible}
      onCancel={() => setIsEditModalVisible(false)}
      footer={null}
      width={800}
    >
      <Form
        form={formInstance}
        layout="vertical"
        initialValues={{
          ...form?.items,
          surveyStartDate: dayjs(form?.startDate),
          surveyEndDate: dayjs(form?.endDate),
          users: form?.formPermissions?.map((p: any) => p.userId) || [],
        }}
      >
        <Form.Item name="name" label="Form Name">
          <Input />
        </Form.Item>
        <Form.Item
          name="description"
          label="Description"
          rules={[{ required: true, message: 'Please input the description!' }]}
        >
          <TextArea rows={4} />
        </Form.Item>
        <Form.Item
          name="surveyStartDate"
          label="Start Date"
          rules={[{ required: true, message: 'Please select start date!' }]}
        >
          <DatePicker
            style={{ width: '100%' }}
            format="YYYY-MM-DD"
            suffixIcon={<CalendarOutlined />}
          />
        </Form.Item>
        <Form.Item
          name="surveyEndDate"
          label="End Date"
          rules={[{ required: true, message: 'Please select end date!' }]}
        >
          <DatePicker
            style={{ width: '100%' }}
            format="YYYY-MM-DD"
            suffixIcon={<CalendarOutlined />}
          />
        </Form.Item>
        <Form.Item
          name="users"
          label="Users"
          rules={[{ required: true, message: 'Please select users!' }]}
        >
          <Select mode="multiple" placeholder="Select users">
            {employees?.items.map((employee: any) => (
              <Option key={employee.id} value={employee.id}>
                {`${employee.firstName} ${employee.lastName}`}
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item
          name="isAnonymous"
          label="Allow Anonymous"
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>
        <Form.Item>
          <Button type="primary" onClick={handleSubmit}>
            Update Form
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditFormsModal;
