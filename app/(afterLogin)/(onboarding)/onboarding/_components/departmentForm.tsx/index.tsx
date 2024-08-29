'use client';
import React, { useEffect } from 'react';
import { Form, Input, Select, Button, Space, Modal } from 'antd';
import { DepartmentFormProps } from '@/types/dashboard/organization';
import { useGetBranches } from '@/store/server/features/organizationStructure/branchs/queries';
import { showValidationErrors } from '@/utils/showValidationErrors';

const { Option } = Select;

const DepartmentForm: React.FC<DepartmentFormProps> = ({
  onClose,
  open,
  submitAction,
  departmentData,
  title,
}) => {
  const [form] = Form.useForm();
  const { data: branches } = useGetBranches();

  useEffect(() => {
    if (departmentData) {
      form.resetFields();

      form.setFieldsValue({
        ...departmentData,
      });
    } else {
      form.resetFields();
    }
  }, [departmentData, form]);

  const handleSubmit = () => {
    form
      .validateFields()
      .then((values) => {
        submitAction(values);
        onClose();
        form.resetFields();
      })
      .catch((info) => {
        showValidationErrors(info?.errorFields);
      });
  };

  return (
    <Modal
      title={title}
      width={520}
      onClose={() => form.resetFields()}
      onCancel={onClose}
      open={open}
      footer={
        <div style={{ textAlign: 'right' }}>
          <Space>
            <Button id="cancelDepartmentButton" onClick={onClose}>
              Cancel
            </Button>
            <Button
              id={
                departmentData
                  ? `updateDepartmentButton`
                  : `createDepartmentButton`
              }
              type="primary"
              onClick={handleSubmit}
            >
              {departmentData ? 'Update' : 'Create'}
            </Button>
          </Space>
        </div>
      }
    >
      <Form layout="vertical" form={form} initialValues={departmentData || {}}>
        <Form.Item
          name="name"
          label="Department/Team Name"
          rules={[
            { required: true, message: 'Please enter the department name' },
          ]}
        >
          <Input size="large" placeholder="Enter department/team name" />
        </Form.Item>
        <Form.Item
          name="branchId"
          label="Select Branch"
          rules={[{ required: true, message: 'Please select a branch' }]}
        >
          <Select size="large" placeholder="Select a branch">
            {branches?.items?.map((branch, i) => (
              <Option key={i} value={branch?.id}>
                {branch.name}
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item name="description" label="Department Description">
          <Input.TextArea
            size="large"
            rows={4}
            placeholder="Enter a brief description of the department"
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default DepartmentForm;
