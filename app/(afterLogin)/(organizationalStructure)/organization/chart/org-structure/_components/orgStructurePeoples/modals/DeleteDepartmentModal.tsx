'use client';

import React, { useMemo } from 'react';
import { Modal, Select, Button, Space } from 'antd';
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

  const handleClose = () => {
    setDeleteModalOpen(false);
    setDeleteStep(1);
    setDepartmentTobeShiftedId(null);
  };

  const handleContinue = () => {
    if (!departmentTobeShiftedId) return;
    setDeleteStep(2);
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

  const centeredModalStyles = {
    wrapper: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: isMobile ? 12 : 24,
    },
    content: {
      borderRadius: 8,
      border: '1px solid var(--Colors-Base-Gray-3, #E5E7EB)',
      background: '#FFF',
    },
    body: {
      padding: isMobile ? '16px' : '24px',
    },
  };

  if (deleteStep === 2) {
    return (
      <Modal
        title="Delete Department"
        open
        onCancel={handleStep2Cancel}
        centered
        styles={centeredModalStyles}
        footer={
          <Space>
            <Button
              className="h-9 sm:h-10 px-4 sm:px-5"
              onClick={handleStep2Cancel}
            >
              Cancel
            </Button>
            <Button
              type="primary"
              danger
              loading={deleteMutation.isLoading}
              onClick={handleConfirmDelete}
              className="h-9 sm:h-10 px-4 sm:px-5"
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
      title="Delete Department"
      open
      onCancel={handleClose}
      centered
      styles={centeredModalStyles}
      footer={
        <Space>
          <Button className="h-9 sm:h-10 px-4 sm:px-5" onClick={handleClose}>
            Cancel
          </Button>
          {departmentTobeShiftedId ? (
            <Button
              type="primary"
              danger
              onClick={handleContinue}
              className="h-9 sm:h-10 px-4 sm:px-5"
              style={{ backgroundColor: '#FF4D4F', borderColor: '#FF4D4F' }}
            >
              Continue
            </Button>
          ) : (
            <Button
              disabled
              className="h-9 sm:h-10 px-4 sm:px-5"
              style={{
                backgroundColor: '#fff',
                borderColor: '#d9d9d9',
                color: 'rgba(0,0,0,0.25)',
                cursor: 'not-allowed',
              }}
            >
              Continue
            </Button>
          )}
        </Space>
      }
      width={isMobile ? 'calc(100vw - 24px)' : 520}
      data-cy="org-structure-delete-department-modal"
    >
      <Space direction="vertical" style={{ width: '100%' }} size={16}>
        <div data-cy="org-structure-delete-department-to-delete-field-wrap">
          <label
            style={{ display: 'block', marginBottom: 6 }}
            data-cy="org-structure-delete-department-to-delete-label"
          >
            Department to be Deleted{' '}
            <span
              style={{ color: '#ff4d4f' }}
              data-cy="org-structure-delete-required-asterisk"
            >
              *
            </span>
          </label>
          <Select
            style={{ width: '100%' }}
            value={departmentTobeDeletedId ?? undefined}
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
        </div>
        <div data-cy="org-structure-delete-shift-to-field-wrap">
          <label
            style={{ display: 'block', marginBottom: 6 }}
            data-cy="org-structure-delete-shift-to-label"
          >
            Shift employee to{' '}
            <span
              style={{ color: '#ff4d4f' }}
              data-cy="org-structure-delete-shift-to-required"
            >
              *
            </span>
          </label>
          <Select
            style={{ width: '100%' }}
            placeholder="Select a department to shift employees to"
            value={departmentTobeShiftedId ?? undefined}
            onChange={(v) => setDepartmentTobeShiftedId(v ?? null)}
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
        </div>
      </Space>
    </Modal>
  );
}
