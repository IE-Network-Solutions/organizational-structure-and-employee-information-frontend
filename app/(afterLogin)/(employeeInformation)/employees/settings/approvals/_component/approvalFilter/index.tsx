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
  const handleDepartmentChange = (value: string) => {
    onSelectChange(value, 'entityType');
  };
  return (
    <div className="flex sm:block">
      <ApprovalFilterComponent
        searchParams={searchParams}
        handleSearchInput={handleSearchInput}
        handleDepartmentChange={handleDepartmentChange}
      />
      <AccessGuard permissions={[Permissions.CreateApprovalWorkFlow]}>
        <Button
          title="Set Approval"
          id="createUserButton"
          className="h-10 w-10 sm:w-auto sm:hidden"
          icon={<FaPlus />}
          onClick={() => setAddDepartmentApproval(true)}
          type="primary"
        >
          <span className="hidden sm:inline">Set Approval</span>
        </Button>
      </AccessGuard>
    </div>
  );
};

export default ApprovalBranchFilter;
