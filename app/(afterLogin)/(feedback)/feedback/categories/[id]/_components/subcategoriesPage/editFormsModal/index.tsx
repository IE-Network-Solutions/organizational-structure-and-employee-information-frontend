import React from 'react';
import { Modal, Form, Input, DatePicker, Select, Switch, Button } from 'antd';
import { CalendarOutlined } from '@ant-design/icons';
import { useFetchUsers } from '@/store/server/features/feedback/category/queries';
import { useUpdateForm } from '@/store/server/features/feedback/subcategory/mutation';
import { CategoriesManagementStore } from '@/store/uistate/features/feedback/categories';
import moment from 'moment';

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
    try {
      const values = await formInstance.validateFields();
      const updatedData = {
        ...values,
        startDate: values.surveyStartDate.toISOString(),
        endDate: values.surveyEndDate.toISOString(),
        formPermissions: values.users.map((userId: string) => ({ userId })),
      };

      updateForm({ data: updatedData, id: form.id });
      setIsEditModalVisible(false);
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  return (
    <Modal
      title="Edit Form"
      visible={isEditModalVisible}
      onCancel={() => setIsEditModalVisible(false)}
      footer={null}
      width={800}
    >
      <Form
        form={formInstance}
        layout="vertical"
        initialValues={{
          ...form,
          surveyStartDate: moment(form?.startDate),
          surveyEndDate: moment(form?.endDate),
          users: form?.formPermissions?.map((p: any) => p.userId) || [],
        }}
      >
        <Form.Item
          name="name"
          label="Form Name"
          rules={[{ required: true, message: 'Please input the form name!' }]}
        >
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
