'use client';
import ApprovalFilterComponent from '@/components/Approval/approvalFilterComponent';
import { useApprovalStore } from '@/store/uistate/features/approval';
import { useDebounce } from '@/utils/useDebounce';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import { Button } from 'antd';
import { FaPlus } from 'react-icons/fa';
import { useRouter } from 'next/navigation';

const ApprovalFilter = () => {
  const { searchParams, setSearchParams } = useApprovalStore();

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
  const router = useRouter();
  const { setApproverType } = useApprovalStore();

  const handleDepartmentChange = (value: string) => {
    onSelectChange(value, 'entityType');
  };
  const handleNavigation = () => {
    router.push('/timesheet/settings/approvals/workFlow');
    setApproverType('');
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
          onClick={handleNavigation}
          type="primary"
        >
          <span className="hidden sm:inline">Set Approval</span>
        </Button>
      </AccessGuard>{' '}
    </div>
  );
};
export default ApprovalFilter;
