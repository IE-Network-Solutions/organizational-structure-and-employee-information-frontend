'use client';
import React, { useEffect } from 'react';
import { Form, Input, Button, Space, Modal, FormInstance } from 'antd';
import { Branch } from '@/store/server/features/organizationStructure/branchs/interface';
import { showValidationErrors } from '@/utils/showValidationErrors';
import { useBranchStore } from '@/store/uistate/features/organizationStructure/branchStore';
import { PhoneInput } from 'react-international-phone';
import 'react-international-phone/style.css';

const toSlug = (value: string | number | null | undefined) =>
  String(value ?? 'na')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

const BranchForm: React.FC<{
  onClose: () => void;
  submitAction: (values: Branch) => void;
  title: string;
  loading: boolean;
  form?: FormInstance<Branch>;
}> = ({ onClose, submitAction, title, loading, form }) => {
  const { formOpen, editingBranch, setEditingBranch, setSelectedBranch } =
    useBranchStore();
  useEffect(() => {
    if (editingBranch?.id) {
      form?.setFieldsValue({
        ...editingBranch,
      });
    } else {
      form?.resetFields();
    }
  }, [editingBranch, form]);

  const handleSubmit = () => {
    form
      ?.validateFields()
      .then((values: Branch) => {
        submitAction(values);
      })
      .catch((info: any) => {
        showValidationErrors(info?.errorFields);
      });
  };

  const modalSlug = toSlug(title);

  return (
    <Modal
      title={title}
      width={520}
      onCancel={() => {
        setEditingBranch(null);
        setSelectedBranch(null);
        form?.resetFields();
        onClose();
      }}
      open={formOpen}
      footer={
        <div
          style={{ textAlign: 'center' }}
          id={`branch-form-footer-${modalSlug}`}
          data-cy={`branch-form-footer-${modalSlug}`}
        >
          <Space
            id={`branch-form-footer-actions-${modalSlug}`}
            data-cy={`branch-form-footer-actions-${modalSlug}`}
          >
            <Button
              id={
                editingBranch
                  ? 'cancelUpdateBranchButton'
                  : 'cancelCreateBranchButton'
              }
              data-cy={
                editingBranch
                  ? 'cancelUpdateBranchButton'
                  : 'cancelCreateBranchButton'
              }
              onClick={() => {
                setEditingBranch(null);
                setSelectedBranch(null); // <- Clear the selected branch data
                form?.resetFields();
                onClose();
              }}
            >
              Cancel
            </Button>
            <Button
              loading={loading}
              type="primary"
              id={editingBranch ? 'updateBranchButton' : 'createBranchButton'}
              data-cy={
                editingBranch ? 'updateBranchButton' : 'createBranchButton'
              }
              onClick={handleSubmit}
            >
              {editingBranch ? 'Update' : 'Create'}
            </Button>
          </Space>
        </div>
      }
      data-cy={`branch-form-modal-${modalSlug}`}
    >
      <Form
        layout="vertical"
        form={form}
        id={`branch-form-${modalSlug}`}
        data-cy={`branch-form-${modalSlug}`}
      >
        <Form.Item
          name="name"
          label="Branch Name"
          rules={[{ required: true, message: 'Please enter the branch name' }]}
          id={`branch-form-name-item-${modalSlug}`}
          data-cy={`branch-form-name-item-${modalSlug}`}
        >
          <Input
            size="large"
            placeholder="Enter branch name"
            id={`branch-form-name-input-${modalSlug}`}
            data-cy={`branch-form-name-input-${modalSlug}`}
          />
        </Form.Item>
        <Form.Item
          name="description"
          label="Branch Description"
          id={`branch-form-description-item-${modalSlug}`}
          data-cy={`branch-form-description-item-${modalSlug}`}
        >
          <Input.TextArea
            size="large"
            rows={4}
            placeholder="Enter a brief description of the branch"
            id={`branch-form-description-textarea-${modalSlug}`}
            data-cy={`branch-form-description-textarea-${modalSlug}`}
          />
        </Form.Item>
        <Form.Item
          name="location"
          label="Location"
          rules={[{ required: true, message: 'Please enter the location' }]}
          id={`branch-form-location-item-${modalSlug}`}
          data-cy={`branch-form-location-item-${modalSlug}`}
        >
          <Input
            size="large"
            placeholder="Enter location"
            id={`branch-form-location-input-${modalSlug}`}
            data-cy={`branch-form-location-input-${modalSlug}`}
          />
        </Form.Item>
        <Form.Item
          name="contactNumber"
          label="Contact Number"
          rules={[
            {
              required: true,
              message: 'Please enter the contact number',
            },
          ]}
          id={`branch-form-contact-number-item-${modalSlug}`}
          data-cy={`branch-form-contact-number-item-${modalSlug}`}
        >
          <PhoneInput
            defaultCountry="et"
            inputClassName="ant-input"
            id={`branch-form-contact-number-input-${modalSlug}`}
            data-cy={`branch-form-contact-number-input-${modalSlug}`}
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
          id={`branch-form-contact-email-item-${modalSlug}`}
          data-cy={`branch-form-contact-email-item-${modalSlug}`}
        >
          <Input
            size="large"
            placeholder="Enter contact email"
            id={`branch-form-contact-email-input-${modalSlug}`}
            data-cy={`branch-form-contact-email-input-${modalSlug}`}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default BranchForm;
