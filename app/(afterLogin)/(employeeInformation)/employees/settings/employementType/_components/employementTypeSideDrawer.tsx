'use client';
import React from 'react';
import CustomDrawerLayout from '@/components/common/customDrawer';
import { Button, Form, Input } from 'antd';
import { EmployeTypeManagementStore } from '@/store/uistate/features/employees/settings/emplyeTypeDrawer';
import TextArea from 'antd/es/input/TextArea';
import { useAddEmployeeType } from '@/store/server/features/employees/employeeManagment/employmentType/mutations';

interface EmployementTypeDrawer {
  name: string;
  description: string;
}

const EmployementTypeSideDrawer: React.FC<any> = (props) => {
  const { isOpen, setOpen } = EmployeTypeManagementStore();
  const createEmployeType = useAddEmployeeType();

  const [form] = Form.useForm();

  const handleCloseDrawer = () => {
    setOpen(false);
    form.resetFields();
  };

  const handleSubmit = async () => {
    const values = await form.validateFields();
    const { name, description } = values as EmployementTypeDrawer;

    await createEmployeType.mutateAsync({
      name,
      description,
    });
    handleCloseDrawer();
    form.resetFields();
  };

  return (
    isOpen && (
      <CustomDrawerLayout
        open={isOpen}
        onClose={props?.onClose}
        modalHeader={
          <div className="flex justify-center text-xl font-extrabold text-gray-800 py-6">
            Add Employee Type
          </div>
        }
        width="30%"
        footer={
          <div className=" w-full bg-[#fff]  flex justify-center space-x-5  p-6 sm:p-0">
            <Button
              className="h-[40px] sm:h-[56px] text-base"
              type="default"
              onClick={handleCloseDrawer}
            >
              Cancel
            </Button>
            <Button
              className="h-[40px] sm:h-[56px] text-base"
              type="primary"
              onClick={handleSubmit}
            >
              Submit
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
              className="text-sm w-full h-14"
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
