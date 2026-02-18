'use client';
import React, { useEffect } from 'react';
import { Button, Form, Input, Modal } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import { EmployeTypeManagementStore } from '@/store/uistate/features/employees/settings/emplyeTypeDrawer';
import TextArea from 'antd/es/input/TextArea';
import {
  useAddEmployeeType,
  useUpdateEmployeeType,
} from '@/store/server/features/employees/employeeManagment/employmentType/mutations';
import { EmploymentTypeInfo } from '@/store/server/features/employees/employeeManagment/employmentType/interface';

const toSlug = (value: string | number | null | undefined) =>
  String(value ?? 'na')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

interface EmployementTypeDrawer {
  name: string;
  description: string;
}

interface EmployementTypeSideDrawerProps {
  onClose: () => void;
  editingEmploymentType?: EmploymentTypeInfo | null;
  isEditMode?: boolean;
}

const EmployementTypeSideDrawer: React.FC<EmployementTypeSideDrawerProps> = ({
  onClose,
  editingEmploymentType,
  isEditMode = false,
}) => {
  const { isOpen, setOpen } = EmployeTypeManagementStore();
  const createEmployeType = useAddEmployeeType();
  const updateEmployeType = useUpdateEmployeeType();

  const [form] = Form.useForm();

  // Set form values when editing
  useEffect(() => {
    if (isEditMode && editingEmploymentType) {
      form.setFieldsValue({
        name: editingEmploymentType.name,
        description: editingEmploymentType.description,
      });
    } else if (!isEditMode) {
      // Reset form when switching to create mode
      form.resetFields();
    }
  }, [isEditMode, editingEmploymentType, form]);

  const handleCloseDrawer = () => {
    setOpen(false);
    form.resetFields();
    onClose();
  };

  const handleSubmit = async () => {
    const values = await form.validateFields();
    const { name, description } = values as EmployementTypeDrawer;

    if (isEditMode && editingEmploymentType) {
      await updateEmployeType.mutateAsync({
        id: editingEmploymentType.id,
        name,
        description,
      });
    } else {
      await createEmployeType.mutateAsync({
        name,
        description,
      });
    }
    handleCloseDrawer();
  };

  const drawerSlug = isEditMode
    ? `employment-type-edit-${toSlug(editingEmploymentType?.id ?? editingEmploymentType?.name)}`
    : 'employment-type-create';

  return (
    <Modal
      open={isOpen}
      onCancel={handleCloseDrawer}
      title={
        <div
          className="flex justify-between items-center w-full"
          id={`employment-type-modal-header-${drawerSlug}`}
          data-cy={`employment-type-modal-header-${drawerSlug}`}
        >
          <span className="text-base font-bold text-gray-800">
            {isEditMode ? 'Edit Employment Type' : 'Create Employment Type'}
          </span>
        </div>
      }
      closable={true}
      closeIcon={<CloseOutlined className="text-gray-800" />}
      footer={
        <div
          className="w-full flex justify-end gap-4"
          id={`employment-type-modal-footer-${drawerSlug}`}
          data-cy={`employment-type-modal-footer-${drawerSlug}`}
        >
          <Button
            className="h-8 text-base px-10"
            type="default"
            onClick={handleCloseDrawer}
            id={`employment-type-modal-cancel-${drawerSlug}`}
            data-cy={`employment-type-modal-cancel-${drawerSlug}`}
          >
            Cancel
          </Button>
          <Button
            className="h-8 text-base px-10"
            type="primary"
            onClick={handleSubmit}
            id={`employment-type-modal-submit-${drawerSlug}`}
            data-cy={`employment-type-modal-submit-${drawerSlug}`}
          >
            {isEditMode ? 'Update' : 'Create'}
          </Button>
        </div>
      }
      width={500}
      
      data-cy={`employment-type-modal-${drawerSlug}`}
    >
      <Form
        form={form}
        layout="vertical"
        id={`employment-type-modal-form-${drawerSlug}`}
        data-cy={`employment-type-modal-form-${drawerSlug}`}
      >
        <Form.Item
          id="name"
          label={
            <span
              className="text-md font-semibold text-gray-700"
              id={`employment-type-name-label-${drawerSlug}`}
              data-cy={`employment-type-name-label-${drawerSlug}`}
            >
              Name
            </span>
          }
          name="name"
          rules={[
            {
              required: true,
              message: 'Please input the employment type name!',
            },
          ]}
          data-cy={`employment-type-name-item-${drawerSlug}`}
        >
          <Input
            allowClear
            size="large"
            placeholder="Input"
            className="text-sm w-full"
            id={`employment-type-name-input-${drawerSlug}`}
            data-cy={`employment-type-name-input-${drawerSlug}`}
          />
        </Form.Item>
        <Form.Item
          id="description"
          label={
            <span
              className="text-md font-semibold text-gray-700"
              id={`employment-type-description-label-${drawerSlug}`}
              data-cy={`employment-type-description-label-${drawerSlug}`}
            >
              Description <span className="font-normal text-gray-500">(optional)</span>
            </span>
          }
          name="description"
          data-cy={`employment-type-description-item-${drawerSlug}`}
        >
          <TextArea
            allowClear
            rows={4}
            placeholder="Textarea"
            id={`employment-type-description-input-${drawerSlug}`}
            data-cy={`employment-type-description-input-${drawerSlug}`}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EmployementTypeSideDrawer;
