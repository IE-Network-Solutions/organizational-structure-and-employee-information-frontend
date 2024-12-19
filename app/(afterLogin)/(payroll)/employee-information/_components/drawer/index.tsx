import React, { useEffect } from 'react';
import { Form, Input, Select } from 'antd';
import CustomDrawerLayout from '@/components/common/customDrawer';
import CustomButton from '@/components/common/buttons/customButton';
import useDrawerStore from '@/store/uistate/features/okrplanning/okrSetting/assignTargetDrawerStore';

const { Option } = Select;

const Drawer: React.FC = () => {
  const { isDrawerVisible, closeDrawer } = useDrawerStore();

  const onFinish = async (values: any) => {};

  return (
    <CustomDrawerLayout
      open={isDrawerVisible}
      onClose={closeDrawer}
      modalHeader={
        <span className="text-xl font-semibold">Payroll Information </span>
      }
      width="700px"
      footer={
        <div className="flex justify-center items-center w-full h-full">
          <div className="flex justify-between items-center gap-4">
            <CustomButton
              type="default"
              title="Cancel"
              onClick={() => {
                closeDrawer();
              }}
            />
            <CustomButton
              title="Update"
              onClick={() => {
                // form.submit()
              }}
            />
          </div>
        </div>
      }
    >
      <Form
        //   form={form}
        layout="vertical"
        onFinish={onFinish}
      >
        <Form.Item label="Full Name" name="name">
          <Input placeholder="Abraham Dulla" disabled className="h-12" />
        </Form.Item>

        <Form.Item label="Job Information" name="job-information">
          <Input disabled placeholder="Product Design Lead" className="h-12" />
        </Form.Item>

        <Form.Item label="Basic Salary" name="basic-salary">
          <Input disabled placeholder="10,000" className="w-full h-12"></Input>
        </Form.Item>
        <Form.Item
          label="Entitled Allowance"
          name="entitled-allowance"
          rules={[{ required: true, message: 'Please select Allowance' }]}
        >
          <Select
            mode="multiple"
            placeholder="Add Users"
            className="w-full h-12"
          >
            <Option value="1">Allowance 1</Option>
            <Option value="2">Allowance 2</Option>
            <Option value="3">Allowance 3</Option>
            <Option value="4">Allowance 4</Option>
          </Select>
        </Form.Item>
        <Form.Item label="Bank Information" name="bank-information">
          <Input
            disabled
            placeholder="Enat Bank"
            className="w-full h-12"
          ></Input>
        </Form.Item>
        <Form.Item label="Branch" name="branch">
          <Input
            disabled
            placeholder="22 branch"
            className="w-full h-12"
          ></Input>
        </Form.Item>

        <Form.Item label="Account Number" name="account-number">
          <Input
            placeholder="10000000000000000"
            className="w-full h-12"
          ></Input>
        </Form.Item>

        <Form.Item
          label="Choose Criteria"
          name="criteria"
          rules={[
            { required: true, message: 'Please select at least one criteria' },
          ]}
        >
          <Select
            mode="multiple"
            placeholder="Select criteria"
            className="flex-1 h-12"
          ></Select>
        </Form.Item>
      </Form>
    </CustomDrawerLayout>
  );
};

export default Drawer;
