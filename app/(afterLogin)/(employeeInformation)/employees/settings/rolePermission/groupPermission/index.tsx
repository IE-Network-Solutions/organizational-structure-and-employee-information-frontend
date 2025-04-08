import { Card, Empty, Pagination, Spin } from 'antd';
import React, { useState } from 'react';
import GroupPermissionCard from './groupPermissionCard';
import { EmptyImage } from '@/components/emptyIndicator';
import { useSettingStore } from '@/store/uistate/features/employees/settings/rolePermission';
import { useGetPermissionGroups } from '@/store/server/features/employees/settings/groupPermission/queries';

const GroupPermissionComponent = () => {
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

  const  handleButtonClick = (id: string) => {
    setVisibleEditCardId(visibleEditCardId === id ? null : id);
  };
  const onPageChange = (page: number, pageSize: number) => {
    setPermissionGroupCurrentPage(page);
    setPageSize(pageSize);
  };

  return (
    <Card className="border-none">
      <div className="flex justify-center items-center">
        {groupPermissionData?.items?.length === 0 && groupPermissionLoading && (
          <Spin size="large" />
        )}
      </div>
      {groupPermissionData && groupPermissionData.items?.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1 md:gap-2 lg:gap-4">
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
          <div className="flex justify-end">
            <Pagination
              current={permissonGroupCurrentPage}
              pageSize={pageSize}
              total={groupPermissionData?.meta?.totalPages}
              onChange={(page, pageSize) => onPageChange(page, pageSize)}
              showSizeChanger
              onShowSizeChange={(page, pageSize) =>
                onPageChange(page, pageSize)
              }
            />
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
