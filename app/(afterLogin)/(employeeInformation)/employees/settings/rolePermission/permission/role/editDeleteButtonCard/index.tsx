'use client';

import React from 'react';
import { Card } from 'antd';
import { IoMdMore } from 'react-icons/io';
import { RolePermissionCardProps } from '@/types/dashboard/adminManagement';
import KebabMenu from '@/components/common/kebabMenu';
import { useSettingStore } from '@/store/uistate/features/employees/settings/rolePermission';
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
  return (
    <Card
      className="cursor-pointer relative"
      key={props?.item?.id}
      id={`settings-permission-role-card-item-${props?.item?.id}`}
      data-cy={`settings-permission-role-card-item-${props?.item?.id}`}
    >
      <div
        className="flex justify-between"
        id={`settings-permission-role-card-header-${props?.item?.id}`}
        data-cy={`settings-permission-role-card-header-${props?.item?.id}`}
      >
        <p
          className="font-bold overflow-hidden"
          id={`settings-permission-role-card-name-${props?.item?.id}`}
          data-cy={`settings-permission-role-card-name-${props?.item?.id}`}
        >
          {props?.item?.name}
        </p>
        <div
          id={`settings-permission-role-card-menu-wrapper-${props?.item?.id}`}
          data-cy={`settings-permission-role-card-menu-wrapper-${props?.item?.id}`}
        >
          <button
            id={`cardIdComponent${props?.item?.id}`}
            className="rounded px-2 py-0.5 text-xl text-gray-600"
            onClick={() => props?.handleButtonClick(props?.item?.id)}
            data-cy={`settings-permission-role-card-menu-btn-${props?.item?.id}`}
          >
            <IoMdMore data-cy={`settings-permission-role-card-menu-btn-icon-${props?.item?.id}`} />
          </button>
          {props?.visibleEditCardId === props?.item?.id && (
            <KebabMenu
              item={props?.item?.id}
              handleButtonClick={props?.handleButtonClick}
              editGroupPermissionHandler={handleEdit}
              deleteGroupPermissionHandler={handleDelete}
              data-cy={`settings-permission-role-card-menu-${props?.item?.id}`}
            />
          )}
        </div>
      </div>
      <p
        className="text-gray-400 text-xs mt-8 overflow-hidden"
        id={`settings-permission-role-card-description-${props?.item?.id}`}
        data-cy={`settings-permission-role-card-description-${props?.item?.id}`}
      >
        {props?.item?.description}
      </p>
    </Card>
  );
};

export default EditAndDeleteButtonCard;
