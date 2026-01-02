'use client';
import React from 'react';

import ApprovalFilterComponent from '@/components/Approval/approvalFilterComponent';
import { useApprovalTNAStore } from '@/store/uistate/features/tna/settings/approval';
import { useDebounce } from '@/utils/useDebounce';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import { Button } from 'antd';
import { FaPlus } from 'react-icons/fa';
import { useRouter } from 'next/navigation';

const ApprovalFilter = () => {
  const { searchParams, setSearchParams } = useApprovalTNAStore();
  const handleSearchEmployee = async (
    value: string,
    keyValue: keyof typeof searchParams,
  ) => {
    setSearchParams(keyValue, value);
  };
  const onSelectChange = handleSearchEmployee;
  const onSearchChange = useDebounce(handleSearchEmployee, 2000);
  const router = useRouter();
  const { setApproverType } = useApprovalTNAStore();

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
  const handleNavigation = () => {
    router.push('/tna/settings/approvals/workFlow');
    setApproverType('');
  };
  return (
    <div
      className="flex justify-between gap-4 sm:block"
      id="tnaApprovalFilterContainerId"
      data-cy="tna-approval-filter-container"
    >
      <div
        className="flex-1"
        id="tnaApprovalFilterComponentId"
        data-cy="tna-approval-filter-component"
      >
        <ApprovalFilterComponent
          searchParams={searchParams}
          handleSearchInput={handleSearchInput}
          handleDepartmentChange={handleDepartmentChange}
          data-cy="tna-approval-filter-component"
        />
      </div>

      <AccessGuard
        permissions={[Permissions.CreateApprovalWorkFlow]}
        data-cy="tna-approval-filter-create-guard"
        id="tnaApprovalFilterCreateGuardId"
      >
        <Button
          title="Set Approval"
          id="createUserButton"
          data-cy="tna-approval-filter-create-button"
          className="h-10 w-10 sm:w-auto sm:hidden"
          icon={<FaPlus />}
          onClick={handleNavigation}
          type="primary"
        >
          <span
            className="hidden sm:inline"
            data-cy="tna-approval-filter-create-button-text"
            id="tnaApprovalFilterCreateButtonTextId"
          >
            Set Approval
          </span>
        </Button>
      </AccessGuard>
    </div>
  );
};

export default ApprovalFilter;
