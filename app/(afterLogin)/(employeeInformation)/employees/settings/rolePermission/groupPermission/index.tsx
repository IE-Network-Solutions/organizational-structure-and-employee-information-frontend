import { Card, Empty, Spin } from 'antd';
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
    <Card bodyStyle={{ padding: 0 }} className="border-none">
      <div className="flex justify-center items-center">
        {groupPermissionData?.items?.length === 0 && groupPermissionLoading && (
          <Spin size="large" />
        )}
      </div>
      {groupPermissionData && groupPermissionData.items?.length > 0 ? (
        <>
          <div className="grid grid-cols-2 w-auto md:grid-cols-2 lg:grid-cols-3 gap-4">
            {groupPermissionData?.items?.map((item: any, index: number) => (
              <div key={index}>
                <GroupPermissionCard
                  item={item}
                  handleButtonClick={handleButtonClick}
                  visibleEditCardId={visibleEditCardId}
                />
              </div>
            ))}
          </div>
          <div>
            {isMobile || isTablet ? (
              <CustomMobilePagination
                totalResults={groupPermissionData?.meta?.totalItems ?? 0}
                pageSize={pageSize}
                onChange={onPageChange}
                onShowSizeChange={onPageChange}
              />
            ) : (
              <CustomPagination
                current={permissonGroupCurrentPage}
                total={groupPermissionData?.meta?.totalItems ?? 0}
                pageSize={pageSize}
                onChange={onPageChange}
                onShowSizeChange={(pageSize) => setPageSize(pageSize)}
              />
            )}
          </div>
        </>
      ) : (
        <div className="flex justify-center items-center">
          {' '}
          <Empty description={'data not found'} image={<EmptyImage />} />
        </div>
      )}
    </Card>
  );
};

export default GroupPermissionComponent;
