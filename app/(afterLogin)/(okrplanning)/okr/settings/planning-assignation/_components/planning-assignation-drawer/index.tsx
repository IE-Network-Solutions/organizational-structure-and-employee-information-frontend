'use client';
import CustomButton from '@/components/common/buttons/customButton';
import CustomDrawerLayout from '@/components/common/customDrawer';
import { useGetAllUsers } from '@/store/server/features/okrplanning/okr/users/queries';
import { Form, Select, Avatar } from 'antd';
import { UserOutlined } from '@ant-design/icons';

import React from 'react';
interface RepDrawerProps {
  open: boolean;
  onClose: () => void;
}

const PlanningAssignationDrawer: React.FC<RepDrawerProps> = ({
  open,
  onClose,
}) => {
  const { data: allUsers } = useGetAllUsers();
  const { Option } = Select;

  const renderEmployeeOption = (option: any) => (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <Avatar
        size={20}
        src={
          'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3'
        }
      />
      {option.firstName}
    </div>
  );

  const customTagRender = (props: any) => {
    const { label, closable, onClose } = props;
    return (
      <div className="flex gap-1 items-center bg-gray-100 p-2 rounded-lg mx-1 my-1">
        <Avatar size={20} icon={<UserOutlined />} />
        <span>{label}</span>
        {closable && (
          <span onClick={onClose} className="text-black text-xs">
            ✖
          </span>
        )}
      </div>
    );
  };

  const [form] = Form.useForm();
  // const { userId } = useAuthenticationStore();

  // const onFinish = (values: any) => {
  //   // const value = { ...values, issuerId: userId };
  // };

  const handleDrawerClose = () => {
    form.resetFields(); // Reset all form fields
    onClose();
  };
  const modalHeader = (
    <div className="flex justify-center text-xl font-extrabold text-gray-800 p-4">
      Assign
    </div>
  );
  const footer = (
    <div className="w-full flex justify-center items-center gap-4 pt-8">
      <CustomButton
        type="default"
        title="Cancel"
        onClick={handleDrawerClose}
        style={{ marginRight: 8 }}
      />
      <CustomButton
        onClick={() => form.submit()}
        title={'Add'}
        type="primary"
      />
    </div>
  );
  return (
    <CustomDrawerLayout
      open={open}
      onClose={handleDrawerClose}
      modalHeader={modalHeader}
      footer={footer}
    >
      <Form
        form={form}
        name="reprimandForm"
        layout="vertical"
        // onFinish={onFinish}
        autoComplete="off"
      >
        {/* Select Employee */}
        <Form.Item
          name="recipientIds"
          label="Select Employee"
          rules={[{ required: true, message: 'Please select employees' }]}
        >
          <Select
            mode="multiple"
            allowClear
            placeholder="Select Employees"
            optionLabelProp="label"
            tagRender={customTagRender}
            className="h-12"
          >
            {allUsers?.items.map((option: any) => (
              <Select.Option
                key={option.id}
                value={option.id}
                label={option.firstName}
              >
                {renderEmployeeOption(option)}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="assignedPlan"
          label="Assigned Plan"
          rules={[{ required: true, message: 'Please Assigned Plan' }]}
        >
          <Select
            mode="multiple"
            placeholder="Select Plans"
            className="h-12"
            dropdownClassName="bg-white shadow-lg rounded-md"
          >
            <Option value="Daily">Daily</Option>
            <Option value="Weekly">Weekly</Option>
            <Option value="Quarterly">Quarterly</Option>
          </Select>
        </Form.Item>
      </Form>
    </CustomDrawerLayout>
  );
};
export default PlanningAssignationDrawer;
