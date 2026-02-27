'use client';

import React, { useMemo } from 'react';
import { Card } from 'antd';
import { IoMdMore } from 'react-icons/io';
import { RolePermissionCardProps } from '@/types/dashboard/adminManagement';
import KebabMenu from '@/components/common/kebabMenu';
import { useSettingStore } from '@/store/uistate/features/employees/settings/rolePermission';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';

const getPermissionCount = (item: any) => {
  // First check for merged count fields (from roles with permissions endpoint)
  if (typeof item?.permissionCount === 'number') {
    return item.permissionCount;
  }
  // Check if permissions array exists
  if (item?.permissions && Array.isArray(item.permissions)) {
    return item.permissions.length;
  }
  // Check for alternative count field names
  if (typeof item?.permissionsCount === 'number') {
    return item.permissionsCount;
  }
  return 0;
};

const getGroupCount = (item: any) => {
  // First check for merged count fields (from roles with permissions endpoint)
  if (typeof item?.groupCount === 'number') {
    return item.groupCount;
  }
  // Check if permissions array exists to calculate groups
  if (item?.permissions && Array.isArray(item.permissions)) {
    const groupIds = item.permissions
      .map((p: { permissionGroupId?: string | null }) => p?.permissionGroupId)
      .filter(Boolean);
    return new Set(groupIds).size;
  }
  // Check for alternative count field names
  if (typeof item?.groupsCount === 'number') {
    return item.groupsCount;
  }
  if (typeof item?.permissionGroupCount === 'number') {
    return item.permissionGroupCount;
  }
  return 0;
};

const EditAndDeleteButtonCard: React.FC<RolePermissionCardProps> = (props) => {
  const { setCurrentModal, setDeletedId, setSelectedRole } = useSettingStore();
  const handleEdit = () => {
    setSelectedRole(props?.item.id);
    setCurrentModal('editRoleModal');
  };
  const handleDelete = () => {
    setDeletedId({ key: 'roleId', id: props?.item?.id });
    setCurrentModal('deleteModal');
  };
  const permissionCount = getPermissionCount(props?.item);
  const groupCount = getGroupCount(props?.item);

  return (
    <Card
      bodyStyle={{ padding: '10px' }}
      className="cursor-pointer relative rounded-md border-1 border-[#d9d9d9]"
      key={props?.item?.id}
      id={`settings-role-card-item-${props?.item?.id}`}
      data-cy={`settings-role-card-item-${props?.item?.id}`}
    >
      <div
        className="flex justify-between items-start"
        id={`settings-role-card-name-wrapper-${props?.item?.id}`}
        data-cy={`settings-role-card-name-wrapper-${props?.item?.id}`}
      >
        <div className="flex-1 min-w-0">
          <p
            className="font-bold overflow-hidden text-gray-900"
            id={`settings-role-card-name-${props?.item?.id}`}
            data-cy={`settings-role-card-name-${props?.item?.id}`}
          >
            {props?.item?.name}
          </p>
          <div className="flex flex-wrap gap-2 mt-3">
            <span
              className="inline-flex items-center p-2 rounded-md text-xs font-medium bg-gray-50 text-gray-600 border border-[#d9d9d9]"
              id={`settings-role-card-permissions-pill-${props?.item?.id}`}
              data-cy={`settings-role-card-permissions-pill-${props?.item?.id}`}
            >
              {permissionCount} Permission{permissionCount !== 1 ? 's' : ''}
            </span>
            <span
              className="inline-flex items-center p-2 rounded-md text-xs font-medium bg-gray-50 text-gray-600 border border-[#d9d9d9]"
              id={`settings-role-card-groups-pill-${props?.item?.id}`}
              data-cy={`settings-role-card-groups-pill-${props?.item?.id}`}
            >
              {groupCount} Group{groupCount !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
        <div
          className="shrink-0"
          id={`settings-role-card-menu-wrapper-${props?.item?.id}`}
          data-cy={`settings-role-card-menu-wrapper-${props?.item?.id}`}
        >
          <div className="border border-[#d9d9d9] rounded-md">
            <button
              id={`cardIdComponent${props?.item?.id}`}
              className="text-gray-600 hover:text-gray-800"
              onClick={() => props?.handleButtonClick(props?.item?.id)}
              data-cy={`settings-role-card-menu-btn-${props?.item?.id}`}
            >
              <MoreHorizIcon
                data-cy={`settings-role-card-menu-btn-icon-${props?.item?.id}`}
                id={`settings-role-card-menu-btn-icon-${props?.item?.id}`}
              />
            </button>
          </div>
          {props?.visibleEditCardId === props?.item?.id && (
            <KebabMenu
              item={props?.item?.id}
              handleButtonClick={props?.handleButtonClick}
              editGroupPermissionHandler={handleEdit}
              deleteGroupPermissionHandler={handleDelete}
              data-cy={`settings-role-card-menu-${props?.item?.id}`}
            />
          )}
        </div>
      </div>
    </Card>
  );
};

export default EditAndDeleteButtonCard;
