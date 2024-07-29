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
    <Card className="cursor-pointer relative" key={props?.item?.id}>
      <div className="flex justify-between">
        <p className="font-bold overflow-hidden">{props?.item?.name}</p>
        <div>
          <button
            id={`cardIdComponent${props?.item?.id}`}
            className="rounded px-2 py-0.5 text-xl text-gray-600"
            onClick={() => props?.handleButtonClick(props?.item?.id)}
          >
            <IoMdMore />
          </button>
          {props?.visibleEditCardId === props?.item?.id && (
            <KebabMenu
              item={props?.item?.id}
              handleButtonClick={props?.handleButtonClick}
              editGroupPermissionHandler={handleEdit}
              deleteGroupPermissionHandler={handleDelete}
            />
          )}
        </div>
      </div>
      <p className="text-gray-400 text-xs mt-8 overflow-hidden">
        {props?.item?.description}
      </p>
    </Card>
  );
};

export default EditAndDeleteButtonCard;
