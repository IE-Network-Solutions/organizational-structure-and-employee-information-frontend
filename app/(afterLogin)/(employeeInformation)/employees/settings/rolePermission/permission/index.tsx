import { Input, Skeleton } from 'antd';
import React, { useEffect } from 'react';
import { useSettingStore } from '@/store/uistate/features/employees/settings/rolePermission';
import {
  useGetPermissions,
  useSearchPermissions,
} from '@/store/server/features/employees/settings/permission/queries';
import useDebounce from '@/store/uistate/features/useDebounce';
import { useIsMobile } from '@/hooks/useIsMobile';
import CustomPagination from '@/components/customPagination';
import { CustomMobilePagination } from '@/components/customPagination/mobilePagination';

const Permission: React.FC<any> = () => {
  const {
    permissionCurrentPage,
    pageSize,
    setPermissionCurrentPage,
    setPageSize,
    selectedRowKeys,
    searchTerm,
    setSearchTerm,
  } = useSettingStore();

  const { data: permissionData, isLoading: permissionLoading } =
    useGetPermissions(permissionCurrentPage, pageSize);
  const { isMobile, isTablet } = useIsMobile();

  const debouncedTerm = useDebounce(searchTerm?.searchTerm, 2000); // returns true and false
  const {
    data: searchUserData,
    isLoading: isSearching,
    refetch,
  } = useSearchPermissions(searchTerm);

  const displayData =
    searchTerm?.searchTerm === null ||
    searchTerm?.searchTerm === '' ||
    searchTerm?.searchTerm === undefined
      ? permissionData
      : searchUserData;

  useEffect(() => {
    if (debouncedTerm) {
      refetch();
    }
  }, [debouncedTerm, refetch]);

  const onPageChange = (page: number, pageSize: number) => {
    setPermissionCurrentPage(page);
    setPageSize(pageSize);
  };
  const hasSelected = selectedRowKeys?.length > 0;
  const items = displayData?.items ?? [];
  const handleSearchChange = (e: any, termKey: string) => {
    if (e === undefined || e === '') {
      setSearchTerm({
        termKey: null,
        searchTerm: null,
      });
    } else {
      setSearchTerm({ termKey: termKey, searchTerm: e });
    }
  };

  return (
    <div
      id="settings-permission-container"
      data-cy="settings-permission-container"
    >
      <div
        id="settings-permission-filters"
        data-cy="settings-permission-filters"
        className="mb-4"
      >
        <Input
          className="w-full h-10"
          placeholder="Search permission"
          allowClear
          onChange={(e) => handleSearchChange(e.target.value, 'name')}
          data-cy="settings-permission-search-input"
        />
      </div>
      <div
        className="mb-4"
        id="settings-permission-selected-count"
        data-cy="settings-permission-selected-count"
      >
        <span
          className=""
          id="settings-permission-selected-count-text"
          data-cy="settings-permission-selected-count-text"
        >
          {hasSelected ? `Selected ${selectedRowKeys?.length} items` : ''}
        </span>
      </div>
      {(permissionLoading || isSearching) && (
        <div
          data-cy="settings-permission-loading-container"
          className="flex justify-center py-8"
        >
          <Skeleton active data-cy="settings-permission-loading" />
        </div>
      )}
      {!(permissionLoading || isSearching) && items.length > 0 && (
        <div
          id="settings-permission-table"
          data-cy="settings-permission-table"
          className="rounded-xl border border-[#E5E7EB] bg-white p-3"
        >
          <div
            data-cy="settings-permission-horizontal-list"
            className="flex flex-wrap items-center gap-2"
          >
            {items.map(
              (
                item: { id?: string; name?: string; slug?: string },
                index: number,
              ) => (
                <div
                  key={item?.id ?? item?.slug ?? `${index}`}
                  className="inline-flex max-w-full items-center rounded-lg bg-white px-2.5 py-2 text-sm text-[#334155] ring-1 ring-[#EEF2F7]"
                  data-cy={`settings-permission-item-${item?.id ?? item?.slug}`}
                >
                  <span
                    className="truncate"
                    data-cy={`settings-permission-item-text-${item?.id ?? item?.slug ?? index}`}
                  >
                    {item?.name ?? 'N/A'}
                  </span>
                </div>
              ),
            )}
          </div>
        </div>
      )}
      {!(permissionLoading || isSearching) &&
        items.length === 0 &&
        displayData !== undefined && (
          <div
            className="py-8 text-center text-gray-500"
            data-cy="settings-permission-empty"
          >
            No permissions found
          </div>
        )}
      {isMobile || isTablet ? (
        <CustomMobilePagination
          totalResults={displayData?.meta?.totalItems ?? 0}
          pageSize={pageSize}
          onChange={onPageChange}
          onShowSizeChange={(pageSize) => {
            setPageSize(pageSize);
            setPermissionCurrentPage(1);
          }}
          data-cy="settings-permission-pagination-mobile"
        />
      ) : (
        <CustomPagination
          current={permissionCurrentPage}
          total={displayData?.meta?.totalItems ?? 0}
          pageSize={pageSize}
          onChange={onPageChange}
          onShowSizeChange={(pageSize) => {
            setPageSize(pageSize);
            setPermissionCurrentPage(1);
          }}
          data-cy="settings-permission-pagination-desktop"
        />
      )}
    </div>
  );
};

export default Permission;
