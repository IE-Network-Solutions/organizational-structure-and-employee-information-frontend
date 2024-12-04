import React, { useState, useEffect } from 'react';
import { Form, Input, Select } from 'antd';
import useDrawerStore from '@/store/uistate/features/okrplanning/okrSetting/assignTargetDrawerStore';
import CustomDrawerLayout from '@/components/common/customDrawer';
import CustomButton from '@/components/common/buttons/customButton';

const { Option } = Select;

const ScoringDrawer: React.FC = () => {
  const { isDrawerVisible, closeDrawer } = useDrawerStore();
  const [selectedCriteria, setSelectedCriteria] = useState<string[]>([]);
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
  const [availableUsers, setAvailableUsers] = useState<string[]>([]);
  const [form] = Form.useForm();

  const usersByDepartment: Record<string, string[]> = {
    'Sales Manager': ['Alice Brown', 'John Doe', 'Emily Stone'],
    'Marketing Manager': ['Sophia Green', 'David Smith', 'Olivia White'],
  };

  useEffect(() => {
    const users = selectedDepartments
      .flatMap((dept) => usersByDepartment[dept] || [])
      .filter((user, index, self) => self.indexOf(user) === index);
    setAvailableUsers(users);
  }, [selectedDepartments]);

  const handleCriteriaChange = (values: string[]) => {
    setSelectedCriteria(values);
  };

  const criteriaFields: Record<
    string,
    { label: string; placeholder: string; disabled?: boolean }[]
  > = {
    'Quality Score': [
      { label: 'Quality Score', placeholder: 'Quality Score', disabled: true },
      { label: 'Weight', placeholder: 'Enter Weight' },
    ],
    'Customer Feedback': [
      {
        label: 'Feedback Score',
        placeholder: 'Feedback Score',
        disabled: true,
      },
      { label: 'Weight', placeholder: 'Enter Weight' },
    ],
    'Performance Metrics': [
      {
        label: 'Performance Metric',
        placeholder: 'Performance Metric',
        disabled: true,
      },
      { label: 'Weight', placeholder: 'Enter Weight' },
    ],
  };

  const onFinish = (values: any) => {
    console.log('Form Submitted:', values);
  };

  return (
    <CustomDrawerLayout
      open={isDrawerVisible}
      onClose={closeDrawer}
      modalHeader={
        <span className="text-xl font-semibold">
          Add New Scoring Configuration
        </span>
      }
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
            <CustomButton title="Add" onClick={() => form.submit()} />
          </div>
        </div>
      }
    >
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item
          label="Name of the Scoring Configuration"
          name="name"
          rules={[{ required: true, message: 'Please enter the name' }]}
        >
          <Input placeholder="Enter the name here" className="h-12" />
        </Form.Item>

        <Form.Item
          label="Total Percentage"
          name="totalPercentage"
          rules={[
            { required: true, message: 'Please enter the total percentage' },
          ]}
        >
          <Input placeholder="Enter the total percentage" className="h-12" />
        </Form.Item>

        <Form.Item
          label="Department"
          name="department"
          rules={[{ required: true, message: 'Please select a department' }]}
        >
          <Select
            mode="multiple"
            placeholder="Select Department"
            className="w-full h-12"
            onChange={setSelectedDepartments}
          >
            <Option value="Sales Manager">Sales Manager</Option>
            <Option value="Marketing Manager">Marketing Manager</Option>
          </Select>
        </Form.Item>

        {/* Dynamically Filtered Users */}
        <Form.Item
          label="Users"
          name="users"
          rules={[{ required: true, message: 'Please select users' }]}
        >
          <Select
            mode="multiple"
            placeholder="Add Users"
            className="w-full h-12"
            disabled={availableUsers.length === 0}
          >
            {availableUsers.map((user, index) => (
              <Option key={index} value={user}>
                {user}
              </Option>
            ))}
          </Select>
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
            onChange={handleCriteriaChange}
            className="w-full h-12"
          >
            <Option value="Quality Score">Quality Score</Option>
            <Option value="Customer Feedback">Customer Feedback</Option>
            <Option value="Performance Metrics">Performance Metrics</Option>
          </Select>
        </Form.Item>

        {/* Dynamic Criteria Fields */}
        {selectedCriteria.length > 0 && (
          <div className="space-y-5">
            <label className="block text-sm font-medium mb-1">
              Chosen Criteria
            </label>
            <div className="space-y-5">
              {selectedCriteria.map((criteria, index) => (
                <div key={index}>
                  <div className="grid grid-cols-2 gap-4">
                    {criteriaFields[criteria].map((field, idx) => (
                      <Form.Item
                        key={idx}
                        name={`${criteria}_${field.label}`}
                        rules={[
                          {
                            required: !field.disabled,
                            message: `Please enter ${field.label.toLowerCase()}`,
                          },
                        ]}
                      >
                        <Input
                          placeholder={field.placeholder}
                          disabled={field.disabled || false}
                          className="h-12"
                        />
                      </Form.Item>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Form>
    </CustomDrawerLayout>
  );
};

export default ScoringDrawer;
