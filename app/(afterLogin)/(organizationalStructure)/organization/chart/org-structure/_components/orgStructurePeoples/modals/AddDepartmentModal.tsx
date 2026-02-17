'use client';

import React, { useEffect, useState } from 'react';
import { Form, Input, Select, Button, Space, Modal, Popover } from 'antd';
import { useQuery } from 'react-query';
import { useGetBranches } from '@/store/server/features/organizationStructure/branchs/queries';
import {
  useCreateDepartment,
  useUpdateOrgChart,
} from '@/store/server/features/organizationStructure/organizationalChart/mutation';
import { getOrgChart } from '@/store/server/features/organizationStructure/organizationalChart/query';
import NotificationMessage from '@/components/common/notification/notificationMessage';
import useDepartmentStore from '@/store/uistate/features/organizationStructure/orgState/departmentStates';

const { Option } = Select;

/** Preset colours for department (grid palette like design) */
const PRESET_COLOURS = [
  '#1E40AF',
  '#4A3728',
  '#0F766E',
  '#166534',
  '#9D174D',
  '#C2410C',
  '#4D7C0F',
  '#5B21B6',
  '#1E3A8A',
  '#2563EB',
  '#B45309',
  '#CA8A04',
  '#7C3AED',
  '#B91C1C',
  '#65A30D',
  '#4D7C0F',
  '#475569',
  '#D97706',
  '#0D9488',
  '#6366F1',
];

function ColorPalettePicker({
  value,
  onChange,
}: {
  value?: string;
  onChange?: (hex: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const current = value || '#4B0082';

  const content = (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(6, 1fr)',
        gap: 8,
        width: 200,
      }}
      data-cy="org-structure-colour-palette-grid"
    >
      {PRESET_COLOURS.map((hex) => (
        <button
          key={hex}
          type="button"
          onClick={() => {
            onChange?.(hex);
            setOpen(false);
          }}
          data-cy="org-structure-colour-swatch"
          style={{
            width: 28,
            height: 28,
            padding: 0,
            border: current === hex ? '2px solid #60A5FA' : '1px solid #E5E7EB',
            borderRadius: 6,
            backgroundColor: hex,
            cursor: 'pointer',
          }}
          aria-label={`Color ${hex}`}
        />
      ))}
    </div>
  );

  return (
    <Popover
      content={content}
      trigger="click"
      open={open}
      onOpenChange={setOpen}
      placement="bottomRight"
    >
      <button
        type="button"
        data-cy="org-structure-department-colour"
        style={{
          width: 40,
          height: 40,
          padding: 4,
          cursor: 'pointer',
          border: '1px solid #93C5FD',
          borderRadius: 8,
          backgroundColor: current,
        }}
        aria-label="Choose colour"
      />
    </Popover>
  );
}

export function AddDepartmentModal() {
  const [form] = Form.useForm();
  const { data: branches } = useGetBranches();
  const createMutation = useCreateDepartment();
  const updateMutation = useUpdateOrgChart();

  const addModalOpen = useDepartmentStore((s) => s.addModalOpen);
  const editModalOpen = useDepartmentStore((s) => s.editModalOpen);
  const parentIdForAdd = useDepartmentStore((s) => s.parentIdForAdd);
  const departmentToEdit = useDepartmentStore((s) => s.departmentToEdit);
  const setAddModalOpen = useDepartmentStore((s) => s.setAddModalOpen);
  const setEditModalOpen = useDepartmentStore((s) => s.setEditModalOpen);
  const setParentIdForAdd = useDepartmentStore((s) => s.setParentIdForAdd);
  const setAddModalAnchor = useDepartmentStore((s) => s.setAddModalAnchor);
  const setEditModalAnchor = useDepartmentStore((s) => s.setEditModalAnchor);
  const setDepartmentToEdit = useDepartmentStore((s) => s.setDepartmentToEdit);
  const setLastCreatedDepartment = useDepartmentStore(
    (s) => s.setLastCreatedDepartment,
  );

  const isEdit = editModalOpen && !!departmentToEdit;
  const open = addModalOpen || editModalOpen;

  const needsFetch =
    open &&
    isEdit &&
    !!departmentToEdit?.id &&
    !departmentToEdit?.name?.trim?.();

  const { data: fetchedDepartment } = useQuery(
    ['orgchart', departmentToEdit?.id ?? ''],
    () => getOrgChart(departmentToEdit!.id),
    {
      enabled: needsFetch,
      staleTime: 0,
    },
  );

  useEffect(() => {
    if (!needsFetch || !fetchedDepartment) return;
    const name = fetchedDepartment.name ?? '';
    const description = fetchedDepartment.description ?? '';
    const branchId = fetchedDepartment.branchId ?? '';
    setDepartmentToEdit({
      id: departmentToEdit!.id,
      name,
      description,
      branchId,
    });
    form.setFieldsValue({
      name,
      description,
      branchId: branchId || undefined,
      colour: '#4B0082',
    });
  }, [
    needsFetch,
    fetchedDepartment,
    departmentToEdit?.id,
    setDepartmentToEdit,
    form,
  ]);

  useEffect(() => {
    if (!open || !isEdit || !departmentToEdit?.name?.trim()) return;
    form.setFieldsValue({
      name: departmentToEdit.name,
      description: departmentToEdit.description ?? '',
      branchId: departmentToEdit.branchId ?? undefined,
      colour: '#4B0082',
    });
  }, [
    open,
    isEdit,
    departmentToEdit?.id,
    departmentToEdit?.name,
    departmentToEdit?.description,
    departmentToEdit?.branchId,
    form,
  ]);

  const handleClose = () => {
    setAddModalOpen(false);
    setEditModalOpen(false);
    setParentIdForAdd(null);
    setAddModalAnchor(null);
    setEditModalAnchor(null);
    setDepartmentToEdit(null);
    form.resetFields();
    form.setFieldsValue({
      name: undefined,
      description: undefined,
      branchId: undefined,
      colour: '#4B0082',
    });
  };

  const handleSubmit = () => {
    form
      .validateFields()
      .then(() => {
        const currentValues = form.getFieldsValue();
        const name = currentValues.name;
        const description = currentValues.description ?? '';
        const branchId = currentValues.branchId;
        const departmentColor = currentValues.colour?.trim?.() || undefined;

        if (isEdit && departmentToEdit) {
          updateMutation.mutate(
            {
              id: departmentToEdit.id,
              orgChart: {
                id: departmentToEdit.id,
                name,
                description,
                branchId,
                department: [],
                ...(departmentColor && { departmentColor }),
              },
            },
            {
              onSuccess: () => {
                NotificationMessage.success({
                  message: 'Department updated',
                  description: 'Department has been updated successfully.',
                });
                handleClose();
              },
              onError: (error: any) => {
                NotificationMessage.error({
                  message: 'Failed to update department',
                  description: error?.message ?? 'Please try again.',
                });
              },
            },
          );
        } else {
          createMutation.mutate(
            {
              name,
              description,
              branchId,
              ...(parentIdForAdd && { parentId: parentIdForAdd }),
              ...(departmentColor && { departmentColor }),
            },
            {
              onSuccess: (data: any, variables) => {
                NotificationMessage.success({
                  message: 'Department created',
                  description: 'Department has been created successfully.',
                });
                const depts = data?.department ?? data?.data?.department;
                const createdId =
                  variables.parentId && Array.isArray(depts) && depts.length > 0
                    ? depts[depts.length - 1]?.id
                    : (data?.id ??
                      data?.data?.id ??
                      (Array.isArray(data?.data)
                        ? data?.data?.[0]?.id
                        : undefined));
                setLastCreatedDepartment({
                  id: createdId ?? '',
                  name: variables.name,
                  description: variables.description ?? '',
                  branchId: variables.branchId,
                });
                handleClose();
              },
              onError: (error: any) => {
                NotificationMessage.error({
                  message: 'Failed to create department',
                  description: error?.message ?? 'Please try again.',
                });
              },
            },
          );
        }
      })
      .catch(() => {
        NotificationMessage.warning({
          message: 'Validation Error',
          description: 'Please fill in all required fields.',
        });
      });
  };

  const loading = createMutation.isLoading || updateMutation.isLoading;

  const initialValues =
    isEdit && departmentToEdit
      ? {
          name: departmentToEdit.name,
          description: departmentToEdit.description ?? '',
          branchId: departmentToEdit.branchId ?? undefined,
          colour: '#4B0082',
        }
      : { colour: '#4B0082' };

  return (
    <Modal
      title={isEdit ? 'Edit Department' : 'Add Department'}
      open={open}
      onCancel={handleClose}
      width={520}
      footer={null}
      destroyOnClose
      centered
      styles={{
        wrapper: {
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
        },
        content: {
          borderRadius: 8,
          border: '1px solid var(--Colors-Base-Gray-3, #E5E7EB)',
          background: '#FFF',
        },
      }}
      data-cy={
        isEdit
          ? 'org-structure-edit-department-modal'
          : 'org-structure-add-department-modal'
      }
    >
      <Form
        form={form}
        layout="vertical"
        key={isEdit ? (departmentToEdit?.id ?? 'edit') : 'add'}
        initialValues={initialValues}
        data-cy="org-structure-department-form"
      >
        <div
          style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}
          data-cy="org-structure-department-form-row"
        >
          <Form.Item
            name="name"
            label={
              <>
                Department / Team Name{' '}
                <span
                  style={{ color: '#ff4d4f' }}
                  data-cy="org-structure-department-name-required"
                >
                  *
                </span>
              </>
            }
            rules={[
              { required: true, message: 'Please enter the department name' },
            ]}
            style={{ flex: 1 }}
          >
            <Input
              size="large"
              placeholder="Enter department/ team name"
              data-cy="org-structure-department-name"
            />
          </Form.Item>
          <Form.Item name="colour" label="Colour">
            <ColorPalettePicker />
          </Form.Item>
        </div>

        <Form.Item
          name="branchId"
          label={
            <>
              Select Branch{' '}
              <span
                style={{ color: '#ff4d4f' }}
                data-cy="org-structure-department-branch-required"
              >
                *
              </span>
            </>
          }
          rules={[{ required: true, message: 'Please select a branch' }]}
        >
          <Select
            size="large"
            placeholder="Select branch"
            data-cy="org-structure-department-branch"
          >
            {branches?.items?.map((branch: any) => (
              <Option key={branch?.id} value={branch?.id}>
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
            data-cy="org-structure-department-description"
          />
        </Form.Item>

        <div
          style={{ textAlign: 'right', marginTop: 24 }}
          data-cy="org-structure-department-form-actions"
        >
          <Space>
            <Button
              onClick={handleClose}
              data-cy="org-structure-department-cancel"
            >
              Cancel
            </Button>
            <Button
              type="primary"
              onClick={handleSubmit}
              loading={loading}
              data-cy={
                isEdit
                  ? 'org-structure-department-update'
                  : 'org-structure-department-create'
              }
            >
              {isEdit ? 'Update' : 'Create'}
            </Button>
          </Space>
        </div>
      </Form>
    </Modal>
  );
}
