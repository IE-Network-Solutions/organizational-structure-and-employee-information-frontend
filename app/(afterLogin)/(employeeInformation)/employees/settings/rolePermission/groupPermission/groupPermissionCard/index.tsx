'use client';

import React from 'react';
import { Card, Tag } from 'antd';
import { GroupPermissionkey } from '@/types/dashboard/adminManagement';
import { useSettingStore } from '@/store/uistate/features/employees/settings/rolePermission';
import KebabMenu from '@/components/common/kebabMenu';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';

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

  const permissionsCount = props?.item?.permissions?.length ?? 0;

  return (
    <Card
      bodyStyle={{
        paddingTop: '10px',
        paddingBottom: '10px',
        paddingLeft: '2px',
        paddingRight: '2px',
      }}
      className="cursor-pointer relative px-3 rounded-lg border-0"
      style={{ background: '#F9FAFB' }}
      key={props?.item?.id}
      id={`settings-group-permission-card-${props?.item?.id}`}
      data-cy={`settings-group-permission-card-${props?.item?.id}`}
    >
      <div
        className="flex flex-row md:flex-row justify-between items-start"
        id={`settings-group-permission-wrapper`}
        data-cy={`settings-group-permission-wrapper`}
      >
        <div
          data-cy="settings-group-permission-card-name-content"
          className="flex-1 min-w-0"
        >
          <p
            className="font-bold truncate text-xs text-gray-900 mb-2"
            id={`settings-group-permission-card-name-${props?.item?.id}`}
            data-cy={`settings-group-permission-card-name-${props?.item?.id}`}
          >
            {props?.item?.name}
          </p>
          <Tag
            className="inline-flex items-center py-1 px-2 rounded-md text-xs font-medium bg-[#f9fafb] text-gray-600 border border-[#d9d9d9]"
            id={`settings-group-permission-card-count-${props?.item?.id}`}
            data-cy={`settings-group-permission-card-count-${props?.item?.id}`}
          >
            {permissionsCount} Permission{permissionsCount !== 1 ? 's' : ''}
          </Tag>
        </div>

        {props?.item?.tenantId && (
          <div
            className="mt-0 shrink-0"
            id={`settings-group-permission-card-menu-wrapper-${props?.item?.id}`}
            data-cy={`settings-group-permission-card-menu-wrapper-${props?.item?.id}`}
          >
            <div
              data-cy="settings-group-permission-card-menu-wrapper"
              className="border border-[#d9d9d9] rounded-md"
            >
              <button
                id={props?.item?.id}
                className=" text-gray-600 hover:text-gray-800"
                onClick={() => props?.handleButtonClick(props?.item?.id)}
                data-cy={`settings-group-permission-card-menu-btn-${props?.item?.id}`}
              >
                <MoreHorizIcon
                  data-cy={`settings-group-permission-card-menu-btn-icon-${props?.item?.id}`}
                  id={`settings-group-permission-card-menu-btn-icon-${props?.item?.id}`}
                />
              </button>
            </div>

            {props?.visibleEditCardId === props?.item?.id && (
              <AccessGuard
                permissions={[
                  Permissions.UpdateGroupPermission,
                  Permissions.DeleteGroupPermission,
                ]}
                id={`settings-group-permission-card-menu-guard-${props?.item?.id}`}
                data-cy={`settings-group-permission-card-menu-guard-${props?.item?.id}`}
              >
                <KebabMenu
                  item={props?.item}
                  handleButtonClick={props?.handleButtonClick}
                  editGroupPermissionHandler={editGroupPermissionHandler}
                  deleteGroupPermissionHandler={deleteGroupPermissionHandler}
                  data-cy={`settings-group-permission-card-menu-${props?.item?.id}`}
                />
              </AccessGuard>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};

export default GroupPermissionCard;
