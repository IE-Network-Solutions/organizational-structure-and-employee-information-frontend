import React, { useState } from 'react';
import { Select, Input, Switch, Button, Form } from 'antd';
import CustomDrawerLayout from '@/components/common/customDrawer';
import useDrawerStore from '@/store/uistate/features/okrplanning/okrSetting/assignTargetDrawerStore';
import CustomButton from '@/components/common/buttons/customButton';

const { Option } = Select;

const AssignTargetDrawer: React.FC = () => {
  const [form] = Form.useForm();
  const { isDrawerVisible, closeDrawer } = useDrawerStore();
  const [selectedMonths, setSelectedMonths] = useState<string[]>([]);

  // Generate months dynamically
  const months = Array.from({ length: 12 }, (_, i) => ({
    value: `Month${i + 1}`,
    label: `Month ${i + 1}`,
  }));

  const onSubmit = (values: any) => {
    console.log('Form Submitted:', values);
  };

  return (
    <CustomDrawerLayout
      open={isDrawerVisible}
      onClose={closeDrawer}
      modalHeader={<span className="text-xl font-semibold">Assign Target</span>}
      width="700px"
      footer={
        <div className="flex justify-center items-center w-full h-full">
          <div className="flex justify-between items-center gap-4">
            <CustomButton
              type="default"
              title="Cancel"
              onClick={() => {
                form.resetFields();
                closeDrawer();
              }}
            />
            <CustomButton title={'Assign'} onClick={() => form.submit()} />
          </div>
        </div>
      }
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onSubmit}
        className="space-y-4"
      >
        {/* Department Select */}
        <Form.Item
          name="department"
          label="Choose Department"
          rules={[{ required: true, message: 'Please select a department!' }]}
        >
          <Select placeholder="Select" className="h-12">
            <Option value="HR">HR</Option>
            <Option value="Operations">Operations</Option>
            <Option value="Marketing">Marketing</Option>
          </Select>
        </Form.Item>

        {/* Criteria Select */}
        <Form.Item
          name="criteria"
          label="Choose Criteria"
          rules={[{ required: true, message: 'Please select a criteria!' }]}
        >
          <Select placeholder="Select" className="h-12">
            <Option value="Criteria1">Criteria 1</Option>
            <Option value="Criteria2">Criteria 2</Option>
          </Select>
        </Form.Item>

        {/* Dynamic Month Selection */}
        <Form.Item
          name="month"
          label="Month"
          rules={[
            { required: true, message: 'Please select at least one month!' },
          ]}
        >
          <Select
            className="h-12"
            mode="multiple"
            placeholder="Select months"
            options={months}
            onChange={setSelectedMonths}
          />
        </Form.Item>
        <div className="mt-10">Chosen Month</div>

        {selectedMonths.map((month) => (
          <div key={month} className="flex items-center gap-4">
            <Input value={month} disabled className="flex-1 h-12" />
            <Form.Item
              name={`${month.toLowerCase().replace(' ', '_')}_weight`}
              className="flex-1"
              rules={[{ required: true, message: 'Enter the weight here!' }]}
            >
              <Input placeholder="Enter Weight" className="h-12" />
            </Form.Item>
          </div>
        ))}

        <Form.Item name="deductible" label="Is it a deductible Criteria?">
          <Switch />
        </Form.Item>
      </Form>
    </CustomDrawerLayout>
  );
};

export default AssignTargetDrawer;
