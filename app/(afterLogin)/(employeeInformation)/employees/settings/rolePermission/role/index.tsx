import { Card, Empty, Spin } from 'antd';
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
    <Card
      bodyStyle={{ padding: 0 }}
      className="border-none"
      id="settings-role-card"
      data-cy="settings-role-card"
    >
      <div
        className="flex justify-center items-center"
        id="settings-role-loading"
        data-cy="settings-role-loading"
      >
        {rolePermissionsData?.items?.length === 0 && roleLoading && (
          <Spin size="large" data-cy="settings-role-spinner" />
        )}
      </div>
      {rolePermissionsData && rolePermissionsData?.items?.length > 0 ? (
        <>
          <div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1 md:gap-2 lg:gap-4"
            id="settings-role-grid"
            data-cy="settings-role-grid"
          >
            {rolePermissionsData?.items?.map((item: any, index: number) => (
              <div
                key={index}
                id={`settings-role-card-wrapper-${item?.id}`}
                data-cy={`settings-role-card-wrapper-${item?.id}`}
              >
                <EditAndDeleteButtonCard
                  item={item}
                  handleButtonClick={handleButtonClick}
                  visibleEditCardId={visibleEditCardId}
                  data-cy={`settings-role-card-${item?.id}`}
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
              data-cy="settings-role-pagination-mobile"
            />
          ) : (
            <CustomPagination
              current={roleCurrentPage}
              total={rolePermissionsData?.meta?.totalItems ?? 0}
              pageSize={pageSize}
              onChange={onPageChange}
              onShowSizeChange={(pageSize) => {
                setPageSize(pageSize);
                setRoleCurrentPage(1);
              }}
              data-cy="settings-role-pagination-desktop"
            />
          )}
        </>
      ) : (
        <div
          className="flex justify-center items-center"
          id="settings-role-empty"
          data-cy="settings-role-empty-wrapper"
        >
          {' '}
          <Empty
            description={'data not found'}
            image={<EmptyImage data-cy="settings-role-empty-image" />}
            data-cy="settings-role-empty"
          />
        </div>
      )}
    </Card>
  );
};

export default RoleComponent;
