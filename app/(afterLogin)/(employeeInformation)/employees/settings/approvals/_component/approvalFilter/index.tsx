'use client';
import ApprovalFilterComponent from '@/components/Approval/approvalFilterComponent';
import { useApprovalBranchStore } from '@/store/uistate/features/employees/branchTransfer/workflow';
import { useDebounce } from '@/utils/useDebounce';
import React from 'react';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import { Button } from 'antd';
import { FaPlus } from 'react-icons/fa';
import { useApprovalStore } from '@/store/uistate/features/approval';

const ApprovalBranchFilter = () => {
  const { searchParams, setSearchParams } = useApprovalBranchStore();
  const { setAddDepartmentApproval } = useApprovalStore();

  const handleSearchEmployee = async (
    value: string,
    keyValue: keyof typeof searchParams,
  ) => {
    setSearchParams(keyValue, value);
  };
  const onSelectChange = handleSearchEmployee;
  const onSearchChange = useDebounce(handleSearchEmployee, 2000);

  const handleSearchInput = (
    value: string,
    keyValue: keyof typeof searchParams,
  ) => {
    const trimmedValue = value.trim();
    onSearchChange(trimmedValue, keyValue);
  };
  const handleDepartmentChange = (
    value: string,
    key: 'entityType' | 'entityId' = 'entityType',
    options?: { entityType?: string; entityId?: string },
  ) => {
    // If both entityType and entityId are provided in options, update both
    if (options?.entityType !== undefined && options?.entityId !== undefined) {
      onSelectChange(options.entityType, 'entityType');
      onSelectChange(options.entityId, 'entityId');
    } else {
      // Otherwise, use the original behavior for backward compatibility
      onSelectChange(value, key);
    }
  };
  return (
    <div
      className="flex sm:block"
      id="settings-approvals-filter"
      data-cy="settings-approvals-filter"
    >
      <ApprovalFilterComponent
        searchParams={searchParams}
        handleSearchInput={handleSearchInput}
        handleDepartmentChange={handleDepartmentChange}
        data-cy="settings-approvals-filter-component"
      />
      <AccessGuard
        permissions={[Permissions.CreateApprovalWorkFlow]}
        id="settings-approvals-filter-button-guard"
        data-cy="settings-approvals-filter-button-guard"
      >
        <Button
          title="Set Approval"
          id="createUserButton"
          className="h-10 w-10 sm:w-auto sm:hidden"
          icon={<FaPlus />}
          onClick={() => setAddDepartmentApproval(true)}
          type="primary"
          data-cy="settings-approvals-filter-button"
        >
          <span
            className="hidden sm:inline"
            data-cy="settings-approvals-filter-button-text"
            id="settings-approvals-filter-button-text"
          >
            Set Approval
          </span>
        </Button>
      </AccessGuard>
    </div>
  );
};

export default ApprovalBranchFilter;
