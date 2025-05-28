import { Card, Empty, Pagination, Spin } from 'antd';
import React, { useState } from 'react';
import EditAndDeleteButtonCard from './editDeleteButtonCard';
import { EmptyImage } from '@/components/emptyIndicator';
import { useGetRoles } from '@/store/server/features/employees/settings/role/queries';
import { useSettingStore } from '@/store/uistate/features/employees/settings/rolePermission';
import CustomPagination from '@/components/customPagination';
import { CustomMobilePagination } from '@/components/customPagination/mobilePagination';
import { useIsMobile } from '@/hooks/useIsMobile';

const RoleComponent: React.FC = () => {
  const { isMobile, isTablet } = useIsMobile();
  const { roleCurrentPage, pageSize, setRoleCurrentPage, setPageSize } =
    useSettingStore();
  const [visibleEditCardId, setVisibleEditCardId] = useState<string | null>(
    null,
  );
  const handleButtonClick = (id: string | null) => {
    setVisibleEditCardId(visibleEditCardId === id ? null : id);
  };
  const { data: rolePermissionsData, isLoading: roleLoading } = useGetRoles(
    roleCurrentPage,
    pageSize,
  );
  const onPageChange = (page: number, pageSize: number) => {
    setRoleCurrentPage(page);
    setPageSize(pageSize);
  };
  return (
    <Card bodyStyle={{ padding: 0 }} className="border-none">
      <div className="flex justify-center items-center">
        {rolePermissionsData?.items?.length === 0 && roleLoading && (
          <Spin size="large" />
        )}
      </div>
      {rolePermissionsData && rolePermissionsData?.items?.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1 md:gap-2 lg:gap-4">
            {rolePermissionsData?.items?.map((item: any, index: number) => (
              <div key={index}>
                <EditAndDeleteButtonCard
                  item={item}
                  handleButtonClick={handleButtonClick}
                  visibleEditCardId={visibleEditCardId}
                />
              </div>
            ))}
          </div>
          {isMobile || isTablet ? (
            <CustomMobilePagination
              totalResults={rolePermissionsData?.meta?.totalItems ?? 0}
              pageSize={pageSize}
              onChange={onPageChange}
              onShowSizeChange={onPageChange}
            />
          ) : (
            <CustomPagination
              current={roleCurrentPage}
              total={rolePermissionsData?.meta?.totalItems ?? 0}
              pageSize={pageSize}
              onChange={onPageChange}
              onShowSizeChange={(pageSize) => setPageSize(pageSize)}
            />
          )}
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

export default RoleComponent;
