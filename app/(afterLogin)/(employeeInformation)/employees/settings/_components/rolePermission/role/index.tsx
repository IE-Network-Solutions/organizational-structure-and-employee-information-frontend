import { Card, Empty, Pagination, Spin } from 'antd';
import React, { useState } from 'react';
import EditAndDeleteButtonCard from './editDeleteButtonCard';
import { EmptyImage } from '@/components/emptyIndicator';
import { useGetRoles } from '@/store/server/features/employees/settings/role/queries';
import { useSettingStore } from '@/store/uistate/features/employees/settings/rolePermission';

const RoleComponent: React.FC = () => {
  const { roleCurrentPage, pageSize, setRoleCurrentPage, setPageSize } =
    useSettingStore();
  const [visibleEditCardId, setVisibleEditCardId] = useState<string | null>(
    null,
  );
  const handleButtonClick = (id: string | null) => {
    setVisibleEditCardId(visibleEditCardId === id ? null : id);
  };
  const { data: rolePermissionsData, isLoading: roleLoading } = useGetRoles();
  const onPageChange = (page: number, pageSize: number) => {
    setRoleCurrentPage(page);
    setPageSize(pageSize);
  };
  return (
    <Card>
      <div className="flex justify-center items-center">
        {rolePermissionsData?.length === 0 && roleLoading && (
          <Spin size="large" />
        )}
      </div>
      {rolePermissionsData && rolePermissionsData?.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1 md:gap-2 lg:gap-4">
            {rolePermissionsData?.map((item: any, index: number) => (
              <div key={index}>
                <EditAndDeleteButtonCard
                  item={item}
                  handleButtonClick={handleButtonClick}
                  visibleEditCardId={visibleEditCardId}
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
          />
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
