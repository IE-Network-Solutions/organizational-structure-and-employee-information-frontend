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
  const handleDepartmentChange = (value: string) => {
    onSelectChange(value, 'entityType');
  };
  const handleNavigation = () => {
    router.push('/tna/settings/approvals/workFlow');
    setApproverType('');
  };
  return (

    <div className="flex justify-between gap-4 sm:block">
      <div className="flex-1">
        <ApprovalFilterComponent
          searchParams={searchParams}
          handleSearchInput={handleSearchInput}
          handleDepartmentChange={handleDepartmentChange}
        />
      </div>

      <AccessGuard permissions={[Permissions.CreateApprovalWorkFlow]}>
        <Button
          title="Set Approval"
          id="createUserButton"
          className="h-10 w-10 sm:w-auto sm:hidden"
          icon={<FaPlus />}
          onClick={handleNavigation}
          type="primary"
        >
          <span className="hidden sm:inline">Set Approval</span>
        </Button>
      </AccessGuard>
    </div>
  );
};

export default ApprovalFilter;
