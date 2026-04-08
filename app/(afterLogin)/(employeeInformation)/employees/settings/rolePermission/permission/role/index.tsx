import { Card, Pagination, Skeleton } from 'antd';
import React, { useState } from 'react';
import EditAndDeleteButtonCard from './editDeleteButtonCard';
import { useGetRoles } from '@/store/server/features/employees/settings/role/queries';
import { useSettingStore } from '@/store/uistate/features/employees/settings/rolePermission';
import EmptyState from '@/components/empty';

const toSlug = (value: string | number | null | undefined) =>
  String(value ?? 'na')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

const RoleComponent: React.FC = () => {
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
  const componentSlug = toSlug('permission-role');

  return (
    <Card
      id={`settings-permission-role-card-${componentSlug}`}
      data-cy={`settings-permission-role-card-${componentSlug}`}
    >
      <div
        className="flex justify-center items-center"
        id={`settings-permission-role-loading-${componentSlug}`}
        data-cy={`settings-permission-role-loading-${componentSlug}`}
      >
        {rolePermissionsData?.items?.length === 0 && roleLoading && (
          <Skeleton
            active
            data-cy={`settings-permission-role-spinner-${componentSlug}`}
          />
        )}
      </div>
      {rolePermissionsData && rolePermissionsData?.items?.length > 0 ? (
        <>
          <div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1 md:gap-2 lg:gap-4"
            id={`settings-permission-role-grid-${componentSlug}`}
            data-cy={`settings-permission-role-grid-${componentSlug}`}
          >
            {rolePermissionsData?.items?.map((item: any, index: number) => (
              <div
                key={index}
                id={`settings-permission-role-card-wrapper-${item?.id}`}
                data-cy={`settings-permission-role-card-wrapper-${item?.id}`}
              >
                <EditAndDeleteButtonCard
                  item={item}
                  handleButtonClick={handleButtonClick}
                  visibleEditCardId={visibleEditCardId}
                  data-cy={`settings-permission-role-card-${item?.id}`}
                />
              </div>
            ))}
          </div>
          <Pagination
            className="flex justify-end"
            current={roleCurrentPage}
            pageSize={pageSize}
            total={1}
            onChange={(page, pageSize) => onPageChange(page, pageSize)}
            showSizeChanger
            onShowSizeChange={(page, pageSize) => onPageChange(page, pageSize)}
            data-cy={`settings-permission-role-pagination-${componentSlug}`}
          />
        </>
      ) : (
        <div
          className="flex justify-center items-center"
          id={`settings-permission-role-empty-${componentSlug}`}
          data-cy={`settings-permission-role-empty-${componentSlug}`}
        >
          <EmptyState />
        </div>
      )}
    </Card>
  );
};

export default RoleComponent;
