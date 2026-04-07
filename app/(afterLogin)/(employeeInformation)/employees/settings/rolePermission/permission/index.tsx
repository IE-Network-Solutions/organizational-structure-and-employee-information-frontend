import { Col, Input, Row, Skeleton } from 'antd';
import React, { useEffect, useMemo } from 'react';
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
  const columnsCount = 3;
  const chunkSize = Math.ceil(items.length / columnsCount) || 1;
  const columnChunks = useMemo(() => {
    return [
      items.slice(0, chunkSize),
      items.slice(chunkSize, chunkSize * 2),
      items.slice(chunkSize * 2, items.length),
    ];
  }, [items, chunkSize]);

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
        <Row
          gutter={[16, 8]}
          id="settings-permission-table"
          data-cy="settings-permission-table"
        >
          {columnChunks.map((chunk, colIndex) => (
            <Col key={colIndex} xs={24} sm={24} md={8} lg={8}>
              <div
                data-cy="settings-permission-table-column-container"
                className="flex flex-col gap-2"
              >
                {chunk.map(
                  (
                    item: { id?: string; name?: string; slug?: string },
                    index: number,
                  ) => (
                    <div
                      key={item?.id ?? item?.slug ?? `${colIndex}-${index}`}
                      className="text-gray-800 py-1"
                      data-cy={`settings-permission-item-${item?.id ?? item?.slug}`}
                    >
                      {item?.name ?? 'N/A'}
                    </div>
                  ),
                )}
              </div>
            </Col>
          ))}
        </Row>
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
