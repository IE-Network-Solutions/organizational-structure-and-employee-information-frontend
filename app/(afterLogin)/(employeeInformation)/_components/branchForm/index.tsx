'use client';
import React, { useEffect } from 'react';
import { Form, Input, Button, Space, Modal } from 'antd';
import { Branch } from '@/store/server/features/organizationStructure/branchs/interface';
import { showValidationErrors } from '@/utils/showValidationErrors';
import { useBranchStore } from '@/store/uistate/features/organizationStructure/branchStore';

const BranchForm: React.FC<{
  onClose: () => void;
  submitAction: (values: Branch) => void;
  title: string;
  loading: boolean;
  form?: any;
}> = ({ onClose, submitAction, title, loading, form }) => {
  const { formOpen, editingBranch, setEditingBranch, setSelectedBranch } =
    useBranchStore();
  useEffect(() => {
    if (editingBranch?.id) {
      form.setFieldsValue({
        ...editingBranch,
      });
    } else {
      form.resetFields();
    }
  }, [editingBranch, form]);

  const handleSubmit = () => {
    form
      .validateFields()
      .then((values: any) => {
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
      onCancel={() => {
        setEditingBranch(null);
        setSelectedBranch(null);
        form.resetFields();
        onClose();
      }}
      open={formOpen}
      footer={
        <div style={{ textAlign: 'right' }}>
          <Space>
            <Button
              id={
                editingBranch
                  ? 'cancelUpdateBranchButton'
                  : 'cancelCreateBranchButton'
              }
              onClick={() => {
                setEditingBranch(null);
                setSelectedBranch(null); // <- Clear the selected branch data
                form.resetFields();
                onClose();
              }}
            >
              Cancel
            </Button>
            <Button
              loading={loading}
              type="primary"
              id={editingBranch ? 'updateBranchButton' : 'createBranchButton'}
              onClick={handleSubmit}
            >
              {editingBranch ? 'Update' : 'Create'}
            </Button>
          </Space>
        </div>
      }
    >
      <Form layout="vertical" form={form}>
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
