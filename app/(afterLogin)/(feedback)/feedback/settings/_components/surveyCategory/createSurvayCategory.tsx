'use client';

import { useAddCategory } from '@/store/server/features/conversation/mutation';
import { useFetchUsers } from '@/store/server/features/feedback/category/queries';
import { EmployeeSurveyStore } from '@/store/uistate/features/conversation/survey';
import { Button, Form, Input, Modal, Select } from 'antd';
import React, { useEffect } from 'react';

interface CategoryFormValues {
  name: string;
  description: string;
  employeeAllowedToView: string[];
}

const createSurvayCategory = () => {
  const [form] = Form.useForm();

  const {
    openSurveyCategoryModal,
    setOpenSurveyCategoryModal,
    surveyCategoryEditId,
    setSurveyCategoryEditId,
    searchUserParams,
    setSearchUserParams,
    setSelectedUsers,
  } = EmployeeSurveyStore();
  const userSearch = searchUserParams?.user_name ?? '';
  const { mutateAsync: createCategory, isLoading: isCreatingCategory } =
    useAddCategory();
  const { data: employees, isLoading: isEmployeesLoading } =
    useFetchUsers(userSearch);

  useEffect(() => {
    if (!openSurveyCategoryModal) return;
    form.resetFields();
    setSelectedUsers([]);
    setSearchUserParams('user_name', '');
  }, [openSurveyCategoryModal, form, setSelectedUsers, setSearchUserParams]);

  const handleCloseDrawer = () => {
    setOpenSurveyCategoryModal(false);
    setSurveyCategoryEditId(null);
    form.resetFields();
    setSelectedUsers([]);
    setSearchUserParams('user_name', '');
  };

  const handleSubmit = async () => {
    try {
      const values = (await form.validateFields()) as CategoryFormValues;
      const users = values.employeeAllowedToView.map((id) => ({ userId: id }));
      const payload = {
        name: values.name,
        description: values.description,
        users,
      };
      await createCategory(payload, {
        onSuccess: () => {
          handleCloseDrawer();
          form.resetFields();
        },
      });
    } catch {}
  };

  const isEdit = Boolean(surveyCategoryEditId);

  const footer = (
    <div className="flex justify-end gap-3 pt-1">
      <Button
        size="large"
        className="min-w-[100px] h-11 border-gray-300 text-gray-800 font-medium"
        onClick={handleCloseDrawer}
        data-cy="create-survey-category-button-cancel"
        id="create-survey-category-button-cancel"
      >
        Cancel
      </Button>
      <Button
        type="primary"
        size="large"
        className="min-w-[100px] h-11 font-medium"
        onClick={handleSubmit}
        data-cy="create-survey-category-button-submit"
        id="create-survey-category-button-submit"
      >
        {isEdit ? 'Save' : 'Create'}
      </Button>
    </div>
  );

  return (
    <Modal
      title={
        <span className="text-lg font-semibold text-gray-900">
          Survey Category
        </span>
      }
      open={openSurveyCategoryModal}
      onCancel={handleCloseDrawer}
      footer={footer}
      width={520}
      centered
      destroyOnClose
      maskClosable={false}
      classNames={{
        content: 'rounded-xl overflow-hidden',
        header: 'pb-2 border-b border-gray-100',
        body: 'pt-4 pb-2',
      }}
      data-cy="create-survey-category-modal"
    >
      <Form
        form={form}
        layout="vertical"
        requiredMark
        initialValues={{
          name: undefined,
          description: undefined,
          employeeAllowedToView: [],
        }}
        className="survey-category-form"
        data-cy="create-survey-category-form"
      >
        <Form.Item
          label={
            <span className="text-sm font-medium text-gray-800">
              Category Name
            </span>
          }
          name="name"
          rules={[{ required: true, message: 'Please enter a category name.' }]}
          data-cy="create-survey-category-form-item-name"
        >
          <Input
            allowClear
            size="large"
            placeholder="Input"
            className="rounded-md"
          />
        </Form.Item>

        <Form.Item
          label={
            <span className="text-sm font-medium text-gray-800">
              Description
            </span>
          }
          name="description"
          rules={[{ required: true, message: 'Please enter a description.' }]}
          data-cy="create-survey-category-form-item-description"
        >
          <Input.TextArea
            allowClear
            rows={4}
            placeholder="Textarea"
            className="rounded-md"
          />
        </Form.Item>

        <Form.Item
          label={
            <span className="text-sm font-medium text-gray-800">
              Employee allowed to view
            </span>
          }
          name="employeeAllowedToView"
          rules={[
            {
              validator: (_, value) => {
                if (!value?.length) {
                  return Promise.reject(
                    new Error('Please select at least one employee.'),
                  );
                }
                return Promise.resolve();
              },
            },
          ]}
          data-cy="create-survey-category-form-item-employee-allowed-to-view"
        >
          <Select
            mode="multiple"
            size="large"
            className="rounded-md"
            style={{ width: '100%' }}
            placeholder="Select"
            showSearch
            optionFilterProp="children"
            filterOption={(input, option) =>
              String(option?.children ?? '')
                .toLowerCase()
                .includes(input.toLowerCase())
            }
            onSearch={(value) => setSearchUserParams('user_name', value)}
            onChange={(ids: string[]) =>
              setSelectedUsers(ids.map((id) => ({ userId: id })))
            }
            loading={isEmployeesLoading}
            data-cy="create-survey-category-select-employees"
          >
            {employees?.items?.map((employee: any) => (
              <Select.Option key={employee.id} value={employee.id}>
                {`${employee.firstName} ${employee?.middleName || ''} ${employee.lastName}`.replace(
                  /\s+/g,
                  ' ',
                )}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default createSurvayCategory;
