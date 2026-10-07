'use client';
import ApprovalFilterComponent from '@/components/Approval/approvalFilterComponent';
import { useApprovalTNAStore } from '@/store/uistate/features/tna/settings/approval';
import { APPROVALTYPES } from '@/types/enumTypes';
import { useDebounce } from '@/utils/useDebounce';

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

  // TNA has a single request type, so the type chooser stays pinned to it.
  const handleApprovalTypeChange = () => {
    setSearchParams('approvalType', [APPROVALTYPES.TNA]);
  };

  return (
    <div
      className="flex justify-between gap-4 sm:block"
      id="tna-settings-approvals-filter-container"
      data-cy="tna-settings-approvals-filter-container"
    >
      <div
        className="flex-1"
        id="tna-settings-approvals-filter-component-container"
        data-cy="tna-settings-approvals-filter-component-container"
      >
        <ApprovalFilterComponent
          searchParams={searchParams}
          handleSearchInput={handleSearchInput}
          handleDepartmentChange={handleDepartmentChange}
          handleApprovalTypeChange={handleApprovalTypeChange}
          data-cy="tna-settings-approvals-filter-component"
        />
      </div>
    </div>
  );
};
export default ApprovalFilter;
