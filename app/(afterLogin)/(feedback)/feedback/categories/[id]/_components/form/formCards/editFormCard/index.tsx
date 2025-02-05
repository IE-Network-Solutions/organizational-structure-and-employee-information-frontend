import React, { useEffect } from 'react';
import { Modal, Form, Input, DatePicker, Select, Switch, Button } from 'antd';
import { CalendarOutlined } from '@ant-design/icons';
import { useFetchUsers } from '@/store/server/features/feedback/category/queries';
import { useUpdateForm } from '@/store/server/features/feedback/form/mutation';
import { CategoriesManagementStore } from '@/store/uistate/features/feedback/categories';
import dayjs from 'dayjs';
import { useGetFormsByID } from '@/store/server/features/feedback/form/queries';

const { TextArea } = Input;
const { Option } = Select;
interface EditFormModalProps {
  id: string;
}
const EditFormsModal: React.FC<EditFormModalProps> = ({ id }) => {
  const [formInstance] = Form.useForm();
  const {
    isEditModalVisible,
    setIsEditModalVisible,
    selectedFormId,
    searchUserParams,
  } = CategoriesManagementStore();

  const { data: employees } = useFetchUsers(searchUserParams?.user_name);
  const { mutate: updateForm } = useUpdateForm();

  const { data: formDataByID } = useGetFormsByID(selectedFormId);
  const handleSubmit = async () => {
    const values = await formInstance.validateFields();

    const updatedData = {
      ...values,
      formCategoryId: id,
      startDate: values.surveyStartDate.toISOString(),
      endDate: values.surveyEndDate.toISOString(),
      isAnonymous: values.isAnonymous,
      formPermissions: values.users.map((userId: string) => ({ userId })),
    };
    delete updatedData.surveyStartDate;
    delete updatedData.surveyEndDate;
    delete updatedData.users;
    updateForm({ data: updatedData, id: selectedFormId });
    setIsEditModalVisible(false);
  };

  useEffect(() => {
    const formValues = {
      name: formDataByID?.name,
      description: formDataByID?.description,
      surveyStartDate: dayjs(formDataByID?.startDate),
      surveyEndDate: dayjs(formDataByID?.endDate),
      isAnonymous: formDataByID?.isAnonymous,
      formPermissions:
        formDataByID?.formPermissions?.map((p: any) => p.userId) || [],
    };

    formInstance.setFieldsValue(formValues);
  }, [isEditModalVisible, formDataByID]);

  return (
    <Modal
      title="Edit Form"
      open={isEditModalVisible}
      onCancel={() => setIsEditModalVisible(false)}
      footer={null}
      width={800}
    >
      <Form form={formInstance} layout="vertical" onFinish={handleSubmit}>
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
                {`${employee.firstName} ${employee.middleName} ${employee.lastName}`}
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
          <Button type="primary" htmlType="submit">
            Update Form
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditFormsModal;
