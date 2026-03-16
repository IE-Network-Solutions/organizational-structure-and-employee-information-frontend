'use client';

import React, { useEffect, useMemo } from 'react';
import { Modal, Select, Button, Space, Form } from 'antd';
import { useIsMobile } from '@/hooks/useIsMobile';
import { useQueryClient } from 'react-query';
import { useGetOrgCharts } from '@/store/server/features/organizationStructure/organizationalChart/query';
import { useDeleteOrgChart } from '@/store/server/features/organizationStructure/organizationalChart/mutation';
import type { OrgChart } from '@/store/server/features/organizationStructure/organizationalChart/interface';
import useDepartmentStore from '@/store/uistate/features/organizationStructure/orgState/departmentStates';

function excludeDescendants(
  data: OrgChart | undefined,
  selectedId: string,
): Array<{ value: string; label: string }> {
  const descendants = new Set<string>();

  function collectDescendants(node: OrgChart | undefined): void {
    if (node?.department?.length) {
      node.department.forEach((child) => {
        if (child.id) descendants.add(child.id);
        collectDescendants(child as OrgChart);
      });
    }
  }

  function findAndExclude(node: OrgChart | undefined): void {
    if (!node) return;
    if (node.id === selectedId) {
      collectDescendants(node);
    } else if (node.department?.length) {
      node.department.forEach((child) => findAndExclude(child as OrgChart));
    }
  }

  findAndExclude(data);

  const flatList: Array<{ value: string; label: string }> = [];

  function flattenAndFilter(node: OrgChart | undefined): void {
    if (!node || !node.id) return;
    if (!descendants.has(node.id)) {
      flatList.push({ value: node.id, label: node.name ?? '' });
    }
    if (node.department?.length) {
      node.department.forEach((child) => flattenAndFilter(child as OrgChart));
    }
  }

  flattenAndFilter(data);
  return flatList;
}

export function DeleteDepartmentModal() {
  const queryClient = useQueryClient();
  const { isMobile } = useIsMobile();
  const { data: orgStructureData } = useGetOrgCharts();
  const deleteMutation = useDeleteOrgChart();
  const [form] = Form.useForm<{
    departmentTobeDeletedId?: string;
    departmentTobeShiftedId?: string;
  }>();

  const deleteModalOpen = useDepartmentStore((s) => s.deleteModalOpen);
  const deleteStep = useDepartmentStore((s) => s.deleteStep);
  const departmentTobeDeletedId = useDepartmentStore(
    (s) => s.departmentTobeDeletedId,
  );
  const departmentTobeDeletedName = useDepartmentStore(
    (s) => s.departmentTobeDeletedName,
  );
  const departmentTobeShiftedId = useDepartmentStore(
    (s) => s.departmentTobeShiftedId,
  );

  const setDeleteModalOpen = useDepartmentStore((s) => s.setDeleteModalOpen);
  const setDeleteStep = useDepartmentStore((s) => s.setDeleteStep);
  const setDepartmentTobeShiftedId = useDepartmentStore(
    (s) => s.setDepartmentTobeShiftedId,
  );

  const shiftOptions = useMemo(
    () =>
      departmentTobeDeletedId && orgStructureData
        ? excludeDescendants(orgStructureData, departmentTobeDeletedId).filter(
            (o) => o.value !== departmentTobeDeletedId,
          )
        : [],
    [orgStructureData, departmentTobeDeletedId],
  );

  useEffect(() => {
    if (!deleteModalOpen) return;
    form.setFieldsValue({
      departmentTobeDeletedId: departmentTobeDeletedId ?? undefined,
      departmentTobeShiftedId: departmentTobeShiftedId ?? undefined,
    });
  }, [deleteModalOpen, departmentTobeDeletedId, departmentTobeShiftedId, form]);

  const handleClose = () => {
    setDeleteModalOpen(false);
    setDeleteStep(1);
    setDepartmentTobeShiftedId(null);
    form.resetFields();
  };

  const handleContinue = async () => {
    try {
      await form.validateFields();
      setDeleteStep(2);
    } catch {
      // validation errors are shown by Form.Item
    }
  };

  const handleConfirmDelete = () => {
    if (!departmentTobeDeletedId || !departmentTobeShiftedId) return;
    deleteMutation.mutate(
      {
        departmentTobeDeletedId,
        departmentTobeShiftedId,
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries('orgchartsPeoples');
          handleClose();
        },
      },
    );
  };

  const handleStep2Cancel = () => {
    setDeleteStep(1);
  };

  if (!deleteModalOpen) return null;

  if (deleteStep === 2) {
    return (
      <Modal
        title={
          <span
            className="text-lg font-semibold text-[#000000B2]"
            data-cy="org-structure-delete-department-confirm-title"
          >
            Delete Department
          </span>
        }
        open
        onCancel={handleStep2Cancel}
        closable
        centered
        className="org-structure-department-modal [&_.ant-modal-close]:mt-3 [&_.ant-modal-content]:rounded-lg [&_.ant-modal-content]:shadow-lg [&_.ant-modal-content]:border-0 [&_.ant-modal-header]:flex [&_.ant-modal-header]:items-center [&_.ant-modal-header]:border-b [&_.ant-modal-header]:border-gray-100 [&_.ant-modal-header]:px-3 [&_.ant-modal-header]:py-3 [&_.ant-modal-body]:px-3 [&_.ant-modal-body]:pb-3 [&_.ant-modal-title]:flex-1 [&_.ant-modal-title]:leading-none"
        footer={
          <Space>
            <Button
              className="h-8 sm:h-10 px-4 sm:px-4 font-normal border-gray-300 text-gray-700 bg-white hover:border-[#4096FF] hover:text-[#4096FF]"
              style={{ boxShadow: 'none' }}
              onClick={handleStep2Cancel}
            >
              Cancel
            </Button>
            <Button
              type="primary"
              danger
              loading={deleteMutation.isLoading}
              onClick={handleConfirmDelete}
              className="h-8 sm:h-10 px-4 sm:px-4 font-normal"
              style={{ boxShadow: 'none' }}
            >
              Delete
            </Button>
          </Space>
        }
        width={isMobile ? 'calc(100vw - 24px)' : 420}
        data-cy="org-structure-delete-department-confirm-modal"
      >
        <p
          style={{ color: '#595959', margin: 0 }}
          data-cy="org-structure-delete-confirm-message"
        >
          Are you sure you want to delete this department ?
        </p>
      </Modal>
    );
  }

  return (
    <Modal
      title={
        <span
          className="text-lg font-semibold text-[#000000B2]"
          data-cy="org-structure-delete-department-title"
        >
          Delete Department
        </span>
      }
      open
      onCancel={handleClose}
      closable
      centered
      footer={null}
      width={isMobile ? 'calc(100vw - 24px)' : 520}
      data-cy="org-structure-delete-department-modal"
      className="org-structure-department-modal [&_.ant-modal-close]:mt-3 [&_.ant-modal-content]:rounded-lg [&_.ant-modal-content]:shadow-lg [&_.ant-modal-content]:border-0 [&_.ant-modal-header]:flex [&_.ant-modal-header]:items-center [&_.ant-modal-header]:border-b [&_.ant-modal-header]:border-gray-100 [&_.ant-modal-header]:px-3 [&_.ant-modal-header]:py-3 [&_.ant-modal-body]:px-3 [&_.ant-modal-body]:pb-3 [&_.ant-modal-title]:flex-1 [&_.ant-modal-title]:leading-none"
    >
      <Form
        form={form}
        layout="vertical"
        requiredMark={false}
        onValuesChange={(changedValues, allValues) => {
          if (allValues.departmentTobeShiftedId !== undefined) {
            setDepartmentTobeShiftedId(
              allValues.departmentTobeShiftedId ?? null,
            );
          }
        }}
      >
        <Space direction="vertical" style={{ width: '100%' }} size={12}>
          <div data-cy="org-structure-delete-department-to-delete-field-wrap">
            <Form.Item
              label={
                <div className="flex items-center justify-between">
                  <span>Department to be Deleted</span>
                  <span className="text-red-500">*</span>
                </div>
              }
              name="departmentTobeDeletedId"
              required
              rules={[
                {
                  required: true,
                  message: 'Please select a department to be deleted',
                },
              ]}
              data-cy="org-structure-delete-department-to-delete-form-item"
            >
              <Select
                size="middle"
                style={{ width: '100%', height: 32 }}
                options={[
                  ...(departmentTobeDeletedId && departmentTobeDeletedName
                    ? [
                        {
                          value: departmentTobeDeletedId,
                          label: departmentTobeDeletedName,
                        },
                      ]
                    : []),
                ]}
                disabled
                data-cy="org-structure-delete-department-field"
              />
            </Form.Item>
          </div>
          <div data-cy="org-structure-delete-shift-to-field-wrap">
            <Form.Item
              label={
                <div className="flex items-center justify-between">
                  <span>Shift employee to</span>
                  <span className="text-red-500">*</span>
                </div>
              }
              name="departmentTobeShiftedId"
              required
              rules={[
                {
                  required: true,
                  message: 'Please select a department to shift employees to',
                },
              ]}
              data-cy="org-structure-delete-shift-to-form-item"
            >
              <Select
                size="middle"
                style={{ width: '100%', height: 32 }}
                placeholder="Select a department to shift employees to"
                popupClassName="org-structure-branch-select-dropdown"
                onChange={(v) => {
                  form.setFieldValue('departmentTobeShiftedId', v ?? undefined);
                  setDepartmentTobeShiftedId(v ?? null);
                }}
                options={shiftOptions}
                showSearch
                optionFilterProp="label"
                filterOption={(input, option) =>
                  (option?.label ?? '')
                    .toString()
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
                data-cy="org-structure-delete-shift-to-select"
              />
            </Form.Item>
          </div>
        </Space>
        <div
          className="flex justify-end gap-3 mt-6"
          data-cy="org-structure-delete-department-form-actions"
        >
          <Button
            onClick={handleClose}
            className="h-8 sm:h-10 px-4 sm:px-5 font-normal border-gray-300 text-gray-700 bg-white hover:border-[#4096FF] hover:text-[#4096FF]"
            style={{ boxShadow: 'none' }}
            data-cy="org-structure-delete-cancel"
          >
            Cancel
          </Button>
          <Button
            type="primary"
            danger
            onClick={handleContinue}
            className="h-8 sm:h-10 px-4 sm:px-5 font-normal"
            style={{ boxShadow: 'none' }}
            data-cy="org-structure-delete-continue"
          >
            Continue
          </Button>
        </div>
      </Form>
    </Modal>
  );
}
