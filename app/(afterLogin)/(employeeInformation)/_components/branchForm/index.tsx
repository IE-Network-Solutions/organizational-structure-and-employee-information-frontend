'use client';
import React, { useEffect } from 'react';
import { Form, Input, Button, Space, Modal } from 'antd';
import { Branch } from '@/store/server/features/organizationStructure/branchs/interface';
import { showValidationErrors } from '@/utils/showValidationErrors';

const BranchForm: React.FC<{
  onClose: () => void;
  open: boolean;
  submitAction: (values: Branch) => void;
  branchData?: Branch;
  title: string;
  loading: boolean;
}> = ({ onClose, open, submitAction, branchData, title, loading }) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (branchData) {
      form.setFieldsValue({
        ...branchData,
      });
    } else {
      form.resetFields();
    }
  }, [branchData, form]);

  const handleSubmit = () => {
    form
      .validateFields()
      .then((values) => {
        submitAction(values);
        onClose();
        form.resetFields();
      })
      .catch((info: any) => {
        showValidationErrors(info?.errorFields);
      });
  };

  return (
    <Modal
      title={title}
      width={520}
      onCancel={onClose}
      open={open}
      footer={
        <div style={{ textAlign: 'right' }}>
          <Space>
            <Button
              id={
                branchData
                  ? 'cancelUpdateBranchButton'
                  : 'cancelCreateBranchButton'
              }
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              loading={loading}
              type="primary"
              id={branchData ? 'updateBranchButton' : 'createBranchButton'}
              onClick={handleSubmit}
            >
              {branchData ? 'Update' : 'Create'}
            </Button>
          </Space>
        </div>
      }
    >
      <Form layout="vertical" form={form} initialValues={branchData || {}}>
        <Form.Item
          name="name"
          label="Branch Name"
          rules={[{ required: true, message: 'Please enter the branch name' }]}
        >
          <Input size="large" placeholder="Enter branch name" />
        </Form.Item>
        <Form.Item name="description" label="Branch Description">
          <Input.TextArea
            size="large"
            rows={4}
            placeholder="Enter a brief description of the branch"
          />
        </Form.Item>
        <Form.Item
          name="location"
          label="Location"
          rules={[{ required: true, message: 'Please enter the location' }]}
        >
          <Input size="large" placeholder="Enter location" />
        </Form.Item>
        <Form.Item
          name="contactNumber"
          label="Contact Number"
          rules={[
            {
              required: true,
              message: 'Please enter the contact number',
            },
            {
              pattern: /^[0-9]{9,10}$/,
              message: 'Please enter a valid phone number with 9-10 digits',
            },
          ]}
        >
          <Input
            type="number"
            size="large"
            placeholder="Enter contact number"
            addonBefore="+251"
          />
        </Form.Item>

        <Form.Item
          name="contactEmail"
          label="Contact Email"
          rules={[
            {
              required: true,
              message: 'Please enter the contact email',
            },
            {
              type: 'email',
              message: 'Please enter a valid email address',
            },
          ]}
        >
          <Input size="large" placeholder="Enter contact email" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default BranchForm;
