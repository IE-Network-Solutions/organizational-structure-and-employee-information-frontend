'use client';

import React from 'react';
import { Card } from 'antd';
import { IoMdMore } from 'react-icons/io';
import { GroupPermissionkey } from '@/types/dashboard/adminManagement';
import { useSettingStore } from '@/store/uistate/features/employees/settings/rolePermission';
import KebabMenu from '@/components/common/kebabMenu';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';

type GroupPermissionCardProps = {
  item: GroupPermissionkey;
  handleButtonClick: (id: string) => void;
  visibleEditCardId: string | null;
};

const GroupPermissionCard: React.FC<GroupPermissionCardProps> = (props) => {
  const { setSelectedPermissionGroup, setCurrentModal, setDeletedId } =
    useSettingStore();

  const editGroupPermissionHandler = (item: any) => {
    setSelectedPermissionGroup(item);
    setCurrentModal('editModal');
  };

  const deleteGroupPermissionHandler = () => {
    setDeletedId({ key: 'groupId', id: props?.item?.id });
    setCurrentModal('deleteModal');
  };

  return (
    <Card
      bodyStyle={{
        paddingTop: '10px',
        paddingBottom: '10px',
        paddingLeft: '2px',
        paddingRight: '2px',
      }}
      className="cursor-pointer relative md:p-3"
      key={props?.item?.id}
    >
      <div className="flex flex-row md:flex-row justify-between">
        <p className="font-bold truncate text-xs">{props?.item?.name}</p>

        {props?.item?.tenantId && (
          <div className="mt-2 md:mt-0">
            <button
              id={props?.item?.id}
              className="rounded px-2 py-0.5 text-xl text-gray-600"
              onClick={() => props?.handleButtonClick(props?.item?.id)}
            >
              <IoMdMore />
            </button>

            {props?.visibleEditCardId === props?.item?.id && (
              <AccessGuard
                permissions={[
                  Permissions.UpdateGroupPermission,
                  Permissions.DeleteGroupPermission,
                ]}
              >
                <KebabMenu
                  item={props?.item}
                  handleButtonClick={props?.handleButtonClick}
                  editGroupPermissionHandler={editGroupPermissionHandler}
                  deleteGroupPermissionHandler={deleteGroupPermissionHandler}
                />
              </AccessGuard>
            )}
          </div>
        )}
      </div>
      <p className="text-gray-400 text-xs mt-8 truncate">
        {props?.item?.description}
      </p>
    </Card>
  );
};

export default GroupPermissionCard;
