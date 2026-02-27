import { Card, Empty, Input, Spin } from 'antd';
import React, { useMemo, useState } from 'react';
import { SearchOutlined } from '@ant-design/icons';
import EditAndDeleteButtonCard from './editDeleteButtonCard';
import { EmptyImage } from '@/components/emptyIndicator';
import {
  useGetRoles,
  useGetRolesWithPermission,
} from '@/store/server/features/employees/settings/role/queries';
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
  const [roleSearch, setRoleSearch] = useState('');
  const handleButtonClick = (id: string | null) => {
    setVisibleEditCardId(visibleEditCardId === id ? null : id);
  };
  // Fetch roles with permissions to get accurate counts
  const { data: rolesWithPermissionsData } = useGetRolesWithPermission();
  const { data: rolePermissionsData, isLoading: roleLoading } = useGetRoles(
    roleCurrentPage,
    pageSize,
  );

  // Create a map of role IDs to their permission/group counts from the full data
  const roleCountsMap = useMemo(() => {
    const map: Record<string, { permissionCount: number; groupCount: number }> =
      {};
    if (rolesWithPermissionsData && Array.isArray(rolesWithPermissionsData)) {
      rolesWithPermissionsData.forEach((role: any) => {
        const permissions = role?.permissions ?? [];
        const permissionCount = permissions.length;
        const groupIds = permissions
          .map((p: any) => p?.permissionGroupId)
          .filter(Boolean);
        const groupCount = new Set(groupIds).size;
        map[role.id] = { permissionCount, groupCount };
      });
    }
    return map;
  }, [rolesWithPermissionsData]);

  // Merge counts into role items
  const itemsWithCounts = useMemo(() => {
    const items = rolePermissionsData?.items ?? [];
    return items.map((item: any) => ({
      ...item,
      ...(roleCountsMap[item.id] || { permissionCount: 0, groupCount: 0 }),
    }));
  }, [rolePermissionsData?.items, roleCountsMap]);

  const onPageChange = (page: number, pageSize: number) => {
    setRoleCurrentPage(page);
    setPageSize(pageSize);
  };

  const filteredItems = useMemo(() => {
    const items = itemsWithCounts;
    if (!roleSearch.trim()) return items;
    const term = roleSearch.trim().toLowerCase();
    return items.filter((item: any) =>
      item?.name?.toLowerCase().includes(term),
    );
  }, [itemsWithCounts, roleSearch]);
  return (
    <Card
      bodyStyle={{ padding: 0 }}
      className="border-none bg-transparent shadow-none"
      id="settings-role-card"
      data-cy="settings-role-card"
    >
      <div data-cy="settings-role-search-container" className="mb-4">
        <Input
          placeholder="Search Roles"
          suffix={<SearchOutlined className="text-gray-400" />}
          value={roleSearch}
          onChange={(e) => setRoleSearch(e.target.value)}
          className="rounded-lg bg-white"
          id="settings-role-search"
          data-cy="settings-role-search"
          allowClear
        />
      </div>
      <div
        className="flex justify-center items-center"
        id="settings-role-loading"
        data-cy="settings-role-loading"
      >
        {rolePermissionsData?.items?.length === 0 && roleLoading && (
          <Spin size="large" data-cy="settings-role-spinner" />
        )}
      </div>
      {rolePermissionsData && filteredItems.length > 0 ? (
        <>
          <div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
            id="settings-role-grid"
            data-cy="settings-role-grid"
          >
            {filteredItems.map((item: any, index: number) => (
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
