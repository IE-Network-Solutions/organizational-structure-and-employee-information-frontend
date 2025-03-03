'use client';
import ApprovalFilterComponent from '@/components/Approval/approvalFilterComponent';
import { useApprovalStore } from '@/store/uistate/features/approval';
import { useDebounce } from '@/utils/useDebounce';

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
  const handleDepartmentChange = (value: string) => {
    onSelectChange(value, 'entityType');
  };
  return (
    <div>
      <ApprovalFilterComponent
        searchParams={searchParams}
        handleSearchInput={handleSearchInput}
        handleDepartmentChange={handleDepartmentChange}
      />
    </div>
  );
};
export default ApprovalFilter;
