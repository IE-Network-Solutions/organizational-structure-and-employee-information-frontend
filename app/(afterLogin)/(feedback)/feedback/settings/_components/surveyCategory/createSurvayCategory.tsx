'use client';

import { useAddCategory } from '@/store/server/features/conversation/mutation';
import { useFetchUsers } from '@/store/server/features/feedback/category/queries';
import { EmployeeSurveyStore } from '@/store/uistate/features/conversation/survey';
import { useIsMobile } from '@/hooks/useIsMobile';
import { Button, Form, Input, Modal, Select } from 'antd';
import SettingsTextArea from '@/app/(afterLogin)/(feedback)/feedback/settings/_components/SettingsTextArea';
import React, { useEffect } from 'react';

interface CategoryFormValues {
  name: string;
  description: string;
  employeeAllowedToView: string[];
}

const CreateSurvayCategory = () => {
  const [form] = Form.useForm();
  const { isMobile } = useIsMobile();
  const isMobileViewport =
    isMobile ||
    (typeof window !== 'undefined' ? window.innerWidth <= 768 : false);

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
    <div
      className="flex justify-end gap-3 pt-1"
      data-cy="create-survey-category-footer"
    >
      <Button
        size="large"
        className="min-w-[100px] h-11 border-[#D9D9D9] text-gray-800 font-medium"
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
        loading={isCreatingCategory}
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
        <span
          className="text-lg font-semibold text-gray-900"
          data-cy="create-survey-category-modal-title"
        >
          Survey Category
        </span>
      }
      open={openSurveyCategoryModal}
      onCancel={handleCloseDrawer}
      footer={footer}
      width={isMobileViewport ? '100%' : 520}
      centered={!isMobileViewport}
      style={
        isMobileViewport
          ? {
              position: 'fixed',
              top: 'auto',
              bottom: 0,
              left: 0,
              right: 0,
              margin: 0,
              padding: 0,
              transform: 'none',
              maxWidth: '100%',
            }
          : undefined
      }
      destroyOnClose
      maskClosable={false}
      styles={{
        body: {
          maxHeight: isMobileViewport ? 'calc(100vh - 220px)' : undefined,
          overflowY: isMobileViewport ? 'auto' : undefined,
        },
        content: {
          ...(isMobileViewport
            ? { borderRadius: 12, width: '100%', maxWidth: '100%' }
            : {}),
        },
      }}
      classNames={{
        content: 'rounded-xl overflow-hidden',
        header: 'pb-2 border-b border-[#D9D9D9]',
        body: 'pt-4 pb-2',
      }}
      data-cy="create-survey-category-modal"
    >
      <Form
        form={form}
        layout="vertical"
        requiredMark={false}
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
            <span
              className="text-sm font-medium text-gray-800"
              data-cy="create-survey-category-name-label"
            >
              Category Name{' '}
              <span
                style={{ color: 'red' }}
                data-cy="create-survey-category-name-required"
              >
                *
              </span>
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
            <span
              className="text-sm font-medium text-gray-800"
              data-cy="create-survey-category-description-label"
            >
              Description{' '}
              <span
                style={{ color: 'red' }}
                data-cy="create-survey-category-description-required"
              >
                *
              </span>
            </span>
          }
          name="description"
          rules={[{ required: true, message: 'Please enter a description.' }]}
          data-cy="create-survey-category-form-item-description"
        >
          <SettingsTextArea
            allowClear
            placeholder="Textarea"
            className="rounded-md"
          />
        </Form.Item>

        <Form.Item
          label={
            <span
              className="text-sm font-medium text-gray-800"
              data-cy="create-survey-category-employees-label"
            >
              Employee allowed to view
            </span>
          }
          name="employeeAllowedToView"
          rules={[
            {
              validator: (ruleObject, value) => {
                void ruleObject;
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

export default CreateSurvayCategory;
