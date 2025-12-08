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
  const { mutate: updateForm, isLoading } = useUpdateForm();

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
    updateForm(
      { data: updatedData, id: selectedFormId },
      {
        onSuccess: () => {
          setIsEditModalVisible(false);
        },
        onError: () => {
          setIsEditModalVisible(false);
        },
      },
    );
  };

  useEffect(() => {
    const formValues = {
      name: formDataByID?.name,
      description: formDataByID?.description,
      surveyStartDate: dayjs(formDataByID?.startDate),
      surveyEndDate: dayjs(formDataByID?.endDate),
      isAnonymous: formDataByID?.isAnonymous,
      users: formDataByID?.formPermissions?.map((p: any) => p.userId) || [],
    };

    formInstance.setFieldsValue(formValues);
  }, [isEditModalVisible, formDataByID]);

  return (
    <Modal
      data-cy="edit-form-modal"
      title="Edit Form"
      open={isEditModalVisible}
      onCancel={() => setIsEditModalVisible(false)}
      footer={null}
      width={800}
    >
      <Form
        id="edit-form-form"
        data-cy="edit-form-form"
        form={formInstance}
        layout="vertical"
        onFinish={handleSubmit}
      >
        <Form.Item
          id="edit-form-name-item"
          data-cy="edit-form-name-item"
          name="name"
          label="Form Name"
        >
          <Input id="edit-form-name-input" data-cy="edit-form-name-input" />
        </Form.Item>
        <Form.Item
          id="edit-form-description-item"
          data-cy="edit-form-description-item"
          name="description"
          label="Description"
          rules={[{ required: true, message: 'Please input the description!' }]}
        >
          <TextArea
            id="edit-form-description-textarea"
            data-cy="edit-form-description-textarea"
            rows={4}
          />
        </Form.Item>
        <Form.Item
          id="edit-form-start-date-item"
          data-cy="edit-form-start-date-item"
          name="surveyStartDate"
          label="Start Date"
          rules={[{ required: true, message: 'Please select start date!' }]}
        >
          <DatePicker
            id="edit-form-start-date-picker"
            data-cy="edit-form-start-date-picker"
            style={{ width: '100%' }}
            format="YYYY-MM-DD"
            suffixIcon={
              <CalendarOutlined
                id="edit-form-start-date-icon"
                data-cy="edit-form-start-date-icon"
              />
            }
          />
        </Form.Item>
        <Form.Item
          id="edit-form-end-date-item"
          data-cy="edit-form-end-date-item"
          name="surveyEndDate"
          label="End Date"
          rules={[{ required: true, message: 'Please select end date!' }]}
        >
          <DatePicker
            id="edit-form-end-date-picker"
            data-cy="edit-form-end-date-picker"
            style={{ width: '100%' }}
            format="YYYY-MM-DD"
            suffixIcon={
              <CalendarOutlined
                id="edit-form-end-date-icon"
                data-cy="edit-form-end-date-icon"
              />
            }
          />
        </Form.Item>
        <Form.Item
          id="edit-form-users-item"
          data-cy="edit-form-users-item"
          name="users"
          label="Users"
        >
          <Select
            id="edit-form-users-select"
            data-cy="edit-form-users-select"
            mode="multiple"
            placeholder="Select users"
            value={
              formDataByID?.formPermissions?.map((p: any) => p.userId) || []
            }
            showSearch
            optionFilterProp="children"
            filterOption={(input, option) => {
              return (option?.children ?? '')
                .toString()
                .toLowerCase()
                .includes(input.toLowerCase());
            }}
          >
            {employees?.items.map((employee: any) => (
              <Option
                id={`edit-form-user-option-${employee.id}`}
                data-cy={`edit-form-user-option-${employee.id}`}
                key={employee.id}
                value={employee.id}
              >
                {`${employee?.firstName} ${employee?.middleName} ${employee?.lastName}`}
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item
          id="edit-form-anonymous-item"
          data-cy="edit-form-anonymous-item"
          name="isAnonymous"
          label="Allow Anonymous"
          valuePropName="checked"
        >
          <Switch
            id="edit-form-anonymous-switch"
            data-cy="edit-form-anonymous-switch"
          />
        </Form.Item>
        <Form.Item id="edit-form-submit-item" data-cy="edit-form-submit-item">
          <Button
            id="edit-form-submit-button"
            data-cy="edit-form-submit-button"
            type="primary"
            htmlType="submit"
            loading={isLoading}
          >
            Update Form
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditFormsModal;
