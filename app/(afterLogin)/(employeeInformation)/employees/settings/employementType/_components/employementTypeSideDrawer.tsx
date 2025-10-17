'use client';
import React, { useEffect } from 'react';
import CustomDrawerLayout from '@/components/common/customDrawer';
import { Button, Form, Input } from 'antd';
import { EmployeTypeManagementStore } from '@/store/uistate/features/employees/settings/emplyeTypeDrawer';
import TextArea from 'antd/es/input/TextArea';
import {
  useAddEmployeeType,
  useUpdateEmployeeType,
} from '@/store/server/features/employees/employeeManagment/employmentType/mutations';
import { EmploymentTypeInfo } from '@/store/server/features/employees/employeeManagment/employmentType/interface';

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

  return (
    isOpen && (
      <CustomDrawerLayout
        open={isOpen}
        onClose={onClose}
        modalHeader={
          <div className="flex justify-start text-base font-extrabold text-gray-800">
            {isEditMode ? 'Edit Employee Type' : 'Add Employee Type'}
          </div>
        }
        width="40%"
        footer={
          <div className=" w-full bg-[#fff]  flex justify-center space-x-5  p-4">
            <Button
              className="h-[40px] sm:h-[56px] text-base px-10"
              type="default"
              onClick={handleCloseDrawer}
            >
              Cancel
            </Button>
            <Button
              className="h-[40px] sm:h-[56px] text-base px-10"
              type="primary"
              onClick={handleSubmit}
            >
              {isEditMode ? 'Update' : 'Submit'}
            </Button>
          </div>
        }
      >
        <Form form={form} layout="vertical">
          <Form.Item
            id="name"
            label={
              <span className="text-md my-2 font-semibold text-gray-700">
                EmployeType Name
              </span>
            }
            name="name"
            rules={[
              {
                required: true,
                message: 'Please input the EmployeType name!',
              },
            ]}
          >
            <Input
              allowClear
              size="large"
              placeholder="Enter EmployeType name"
              className="text-sm w-full h-10"
            />
          </Form.Item>
          <Form.Item
            id="description"
            label={
              <span className="text-md my-2 font-semibold text-gray-700">
                EmployeType Description
              </span>
            }
            name="description"
            rules={[
              {
                required: true,
                message: 'Please input the employetype description!',
              },
            ]}
          >
            <TextArea
              className="h-36"
              allowClear
              rows={4}
              placeholder="Enter employetype description"
            />
          </Form.Item>
        </Form>
      </CustomDrawerLayout>
    )
  );
};

export default EmployementTypeSideDrawer;
