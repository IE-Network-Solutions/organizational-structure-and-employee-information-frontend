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
      className="flex justify-between gap-4 sm:block"
      id="time-attendance-settings-approvals-filter-container"
      data-cy="time-attendance-settings-approvals-filter-container"
    >
      <div
        className="flex-1"
        id="time-attendance-settings-approvals-filter-component-container"
        data-cy="time-attendance-settings-approvals-filter-component-container"
      >
        <ApprovalFilterComponent
          searchParams={searchParams}
          handleSearchInput={handleSearchInput}
          handleDepartmentChange={handleDepartmentChange}
          data-cy="time-attendance-settings-approvals-filter-component"
        />
      </div>
    </div>
  );
};
export default ApprovalFilter;
