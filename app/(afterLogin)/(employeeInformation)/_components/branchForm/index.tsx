'use client';
import React, { useEffect } from 'react';
import {
  Form,
  Input,
  Button,
  Space,
  Modal,
  FormInstance,
  Row,
  Col,
} from 'antd';
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
        name: editingBranch.name || '',
        description: editingBranch.description || '',
        location: editingBranch.location || '',
        contactNumber: editingBranch.contactNumber || '',
        contactEmail: editingBranch.contactEmail || '',
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
      title={<span className="text-gray-700">{title}</span>}
      width={520}
      className="[&_.ant-modal-close]:text-gray-600 [&_.ant-modal-close]:hover:text-gray-800"
      styles={{
        header: { color: 'rgb(55 65 81)' },
        body: { paddingTop: '24px' },
      }}
      onCancel={() => {
        setEditingBranch(null);
        setSelectedBranch(null);
        form?.resetFields();
        onClose();
      }}
      open={formOpen}
      footer={
        <div
          style={{ textAlign: 'right' }}
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
              className="font-normal border-gray-300"
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
              className="font-normal"
              id={editingBranch ? 'updateBranchButton' : 'createBranchButton'}
              data-cy={
                editingBranch ? 'updateBranchButton' : 'createBranchButton'
              }
              onClick={handleSubmit}
            >
              {editingBranch ? 'Edit' : 'Create'}
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
        requiredMark={false}
        className="[&_.ant-form-item]:mb-4 [&_.ant-form-item-control-input]:mt-1.5"
      >
        <Form.Item
          name="name"
          label={
            <span data-cy={`branch-form-name-label-${modalSlug}`}>
              Branch Name{' '}
              <span
                style={{ color: 'red' }}
                data-cy={`branch-form-name-required-${modalSlug}`}
              >
                *
              </span>
            </span>
          }
          rules={[{ required: true, message: 'Please enter the branch name' }]}
          id={`branch-form-name-item-${modalSlug}`}
          data-cy={`branch-form-name-item-${modalSlug}`}
        >
          <Input
            size="large"
            className="h-10"
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
            className="min-h-[40px]"
            placeholder="Enter a brief description of the branch"
            id={`branch-form-description-textarea-${modalSlug}`}
            data-cy={`branch-form-description-textarea-${modalSlug}`}
          />
        </Form.Item>
        <Form.Item
          name="location"
          label={
            <span data-cy={`branch-form-location-label-${modalSlug}`}>
              Location{' '}
              <span
                style={{ color: 'red' }}
                data-cy={`branch-form-location-required-${modalSlug}`}
              >
                *
              </span>
            </span>
          }
          rules={[{ required: true, message: 'Please enter the location' }]}
          id={`branch-form-location-item-${modalSlug}`}
          data-cy={`branch-form-location-item-${modalSlug}`}
        >
          <Input
            size="large"
            className="h-10"
            placeholder="Enter location"
            id={`branch-form-location-input-${modalSlug}`}
            data-cy={`branch-form-location-input-${modalSlug}`}
          />
        </Form.Item>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="contactEmail"
              label={
                <span data-cy={`branch-form-contact-email-label-${modalSlug}`}>
                  Contact Email{' '}
                  <span
                    style={{ color: 'red' }}
                    data-cy={`branch-form-contact-email-required-${modalSlug}`}
                  >
                    *
                  </span>
                </span>
              }
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
                className="h-10"
                placeholder="Enter contact email"
                id={`branch-form-contact-email-input-${modalSlug}`}
                data-cy={`branch-form-contact-email-input-${modalSlug}`}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="contactNumber"
              label={
                <span data-cy={`branch-form-contact-number-label-${modalSlug}`}>
                  Contact Number{' '}
                  <span
                    style={{ color: 'red' }}
                    data-cy={`branch-form-contact-number-required-${modalSlug}`}
                  >
                    *
                  </span>
                </span>
              }
              rules={[
                {
                  required: true,
                  message: 'Please enter the contact number',
                },
              ]}
              id={`branch-form-contact-number-item-${modalSlug}`}
              data-cy={`branch-form-contact-number-item-${modalSlug}`}
            >
              <div
                className="branch-form-phone-input-wrapper w-full"
                style={
                  {
                    '--react-international-phone-height': '40px',
                  } as React.CSSProperties
                }
              >
                <PhoneInput
                  defaultCountry="et"
                  inputClassName="ant-input"
                  className="w-full [&_.react-international-phone-input-container]:!w-full [&_.react-international-phone-country-selector-button__flag-emoji]:!hidden [&_.react-international-phone-country-selector-dropdown__list-item-flag-emoji]:!hidden [&_.react-international-phone-country-selector-button]:!h-[40px] [&_.react-international-phone-input]:!h-[40px] [&_.react-international-phone-input]:!flex-1"
                  data-cy={`branch-form-contact-number-input-${modalSlug}`}
                />
              </div>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default BranchForm;
