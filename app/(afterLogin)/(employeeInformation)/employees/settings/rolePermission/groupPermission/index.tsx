import { Card, Empty, Skeleton, Spin } from 'antd';
import React, { useState } from 'react';
import GroupPermissionCard from './groupPermissionCard';
import { EmptyImage } from '@/components/emptyIndicator';
import { useSettingStore } from '@/store/uistate/features/employees/settings/rolePermission';
import { useGetPermissionGroups } from '@/store/server/features/employees/settings/groupPermission/queries';
import CustomPagination from '@/components/customPagination';
import { CustomMobilePagination } from '@/components/customPagination/mobilePagination';
import { useIsMobile } from '@/hooks/useIsMobile';

const GroupPermissionComponent = () => {
  const { isMobile, isTablet } = useIsMobile();
  const {
    pageSize,
    permissonGroupCurrentPage,
    setPermissionGroupCurrentPage,
    setPageSize,
  } = useSettingStore();
  const [visibleEditCardId, setVisibleEditCardId] = useState<string | null>(
    null,
  );
  const { data: groupPermissionData, isLoading: groupPermissionLoading } =
    useGetPermissionGroups(permissonGroupCurrentPage, pageSize);

  const handleButtonClick = (id: string) => {
    setVisibleEditCardId(visibleEditCardId === id ? null : id);
  };
  const onPageChange = (page: number, pageSize: number) => {
    setPermissionGroupCurrentPage(page);
    setPageSize(pageSize);
  };

  return (
    <Card
      bodyStyle={{ padding: 0 }}
      className="border-none"
      id="settings-role-permission-group-card"
      data-cy="settings-role-permission-group-card"
    >
      <div
        className="flex justify-center items-center"
        id="settings-role-permission-group-loading"
        data-cy="settings-role-permission-group-loading"
      >
        {groupPermissionData?.items?.length === 0 && groupPermissionLoading && (
          <Spin size="large" data-cy="settings-role-permission-group-spinner" />
        )}
      </div>
      {groupPermissionData && groupPermissionData.items?.length > 0 ? (
        <>
          <div
            className="grid grid-cols-2 w-auto md:grid-cols-2 lg:grid-cols-3 gap-4"
            id="settings-role-permission-group-grid"
            data-cy="settings-role-permission-group-grid"
          >
            {groupPermissionData?.items?.map((item: any, index: number) => (
              <div
                key={index}
                id={`settings-role-permission-group-card-wrapper-${item?.id}`}
                data-cy={`settings-role-permission-group-card-wrapper-${item?.id}`}
              >
                <GroupPermissionCard
                  item={item}
                  handleButtonClick={handleButtonClick}
                  visibleEditCardId={visibleEditCardId}
                  data-cy={`settings-role-permission-group-card-${item?.id}`}
                />
              </div>
            ))}
          </div>
          <div
            id="settings-role-permission-group-pagination"
            data-cy="settings-role-permission-group-pagination"
          >
            {isMobile || isTablet ? (
              <CustomMobilePagination
                totalResults={groupPermissionData?.meta?.totalItems ?? 0}
                pageSize={pageSize}
                onChange={onPageChange}
                onShowSizeChange={onPageChange}
                data-cy="settings-role-permission-group-pagination-mobile"
              />
            ) : (
              <CustomPagination
                current={permissonGroupCurrentPage}
                total={groupPermissionData?.meta?.totalItems ?? 0}
                pageSize={pageSize}
                onChange={onPageChange}
                onShowSizeChange={(pageSize) => {
                  setPageSize(pageSize);
                  setPermissionGroupCurrentPage(1);
                }}
                data-cy="settings-role-permission-group-pagination-desktop"
              />
            )}
          </div>
        </>
      ) : (
        <div
          className="flex justify-center items-center"
          id="settings-role-permission-group-empty-wrapper"
          data-cy="settings-role-permission-group-empty-wrapper"
        >
          <Skeleton />
        </div>
      )}
    </Card>
  );
};

export default GroupPermissionComponent;
