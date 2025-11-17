'use client';
import React, { useEffect } from 'react';
import { Form, Input, Select, Button, Space, Modal } from 'antd';
import { DepartmentFormProps } from '@/types/dashboard/organization';
import { useGetBranches } from '@/store/server/features/organizationStructure/branchs/queries';
import NotificationMessage from '@/components/common/notification/notificationMessage';

const { Option } = Select;

const DepartmentForm: React.FC<DepartmentFormProps> = ({
  onClose,
  open,
  submitAction,
  departmentData,
  title,
  loading,
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
      })
      .catch((info) => {
        NotificationMessage.warning({
          message: 'Validation Error',
          description: `Error : ${info}`,
        });
      });
  };

  return (
    <Modal
      title={title}
      data-cy="org-chart-department-form"
      width={520}
      onCancel={onClose}
      open={open}
      footer={
        <div style={{ textAlign: 'right' }} data-cy="org-chart-department-form-footer" id="org-chart-department-form-footer">
          <Space>
            <Button data-cy="org-chart-department-form-cancel-btn" id="org-chart-department-form-cancel-btn" onClick={onClose}>
              Cancel
            </Button>
            <Button
              data-cy="org-chart-department-form-submit-btn"
              id={
                departmentData
                  ? `updateDepartmentButton`
                  : `createDepartmentButton`
              }
              type="primary"
              onClick={handleSubmit}
              loading={loading}
            >
              {departmentData ? 'Update' : 'Create'}
            </Button>
          </Space>
        </div>
      }
    >
      <Form layout="vertical" form={form} initialValues={departmentData || {}} data-cy="org-chart-department-form-container" id="org-chart-department-form-container">
        <Form.Item
          name="name"
          label="Department/Team Name"
          rules={[
            { required: true, message: 'Please enter the department name' },
          ]}
          data-cy="org-chart-department-form-item-name"
          id="org-chart-department-form-item-name"
        >
          <Input size="large" placeholder="Enter department/team name" />
        </Form.Item>
        <Form.Item
          name="branchId"
          label="Select Branch"
          rules={[{ required: true, message: 'Please select a branch' }]}
          data-cy="org-chart-department-form-item-branch-id"
          id="org-chart-department-form-item-branch-id"
        >
          <Select size="large" placeholder="Select a branch" data-cy="org-chart-department-form-item-branch-id-select" id="org-chart-department-form-item-branch-id-select">
            {branches?.items?.map((branch, i) => (
              <Option key={i} value={branch?.id} data-cy={`org-chart-department-form-item-branch-id-option-${branch?.id}`} id={`org-chart-department-form-item-branch-id-option-${branch?.id}`}>
                {branch.name}
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item name="description" label="Department Description" data-cy="org-chart-department-form-item-description" id="org-chart-department-form-item-description">
          <Input.TextArea
            size="large"
            rows={4}
            placeholder="Enter a brief description of the department"
            data-cy="org-chart-department-form-item-description-input"
            id="org-chart-department-form-item-description-input"
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default DepartmentForm;
