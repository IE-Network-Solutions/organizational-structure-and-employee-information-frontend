'use client';

import React, { useState } from 'react';
import GroupPermissionComponent from '../groupPermission';
import RoleComponent from '../role';
import Permission from '../permission';
import { useSettingStore } from '@/store/uistate/features/employees/settings/rolePermission';
import { useGetPermissions } from '@/store/server/features/employees/settings/permission/queries';
import { useGetPermissionGroups } from '@/store/server/features/employees/settings/groupPermission/queries';
import { useGetRoles } from '@/store/server/features/employees/settings/role/queries';
import LockIcon from '@mui/icons-material/Lock';
import GridViewIcon from '@mui/icons-material/GridView';
import GroupOutlinedIcon from '@mui/icons-material/GroupOutlined';

interface OnChange {
  onChange: (key: string) => void;
}

const NAV_ITEMS = [
  {
    key: '1',
    tabName: 'Permission',
    label: 'Permissions',
    subtext: 'Individual System Permissions',
    Icon: LockIcon,
  },
  {
    key: '2',
    tabName: 'Group Permission',
    label: 'Group Permissions',
    subtext: 'Grouped System Permissions',
    Icon: GridViewIcon,
  },
  {
    key: '4',
    tabName: 'Role',
    label: 'Roles',
    subtext: 'User Roles Configuration',
    Icon: GroupOutlinedIcon,
  },
];

const ParentRolePermissionCards: React.FC<OnChange> = (props) => {
  const { tabButton, setTabButton } = useSettingStore();
  const [activeKey, setActiveKey] = useState('4');

  const { data: permissionData } = useGetPermissions(1, 1);
  const { data: groupPermissionData } = useGetPermissionGroups(1, 1);
  const { data: rolesData } = useGetRoles(1, 1);

  const counts: Record<string, number> = {
    '1': permissionData?.meta?.totalItems ?? 0,
    '2': groupPermissionData?.meta?.totalItems ?? 0,
    '4': rolesData?.meta?.totalItems ?? 0,
  };

  const handleNavClick = (key: string) => {
    const tabName: { [key: string]: string } = {
      '1': 'Permission',
      '2': 'Group Permission',
      '4': 'Role',
    };
    setActiveKey(key);
    setTabButton(tabName[key] ?? 'Permission');
    props?.onChange?.(key);
  };

  return (
    <div
      className="w-full border-none"
      id="settings-role-permission-tabs-container"
      data-cy="settings-role-permission-tabs-container"
    >
      <div className="flex gap-4 flex-col lg:flex-row">
        {/* Left navigation sidebar */}
        <nav
          className="flex lg:flex-col flex-row gap-2 lg:w-80 shrink-0  rounded-2xl p-2 lg:p-3 border border-gray-200"
          id="settings-role-permission-tabs"
          data-cy="settings-role-permission-tabs"
          role="tablist"
        >
          {NAV_ITEMS.map(({ key, label, subtext, Icon }) => {
            const isActive = activeKey === key;
            return (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => handleNavClick(key)}
                className={`w-full flex items-center gap-3 rounded-xl p-3 text-left transition-colors border ${
                  isActive
                    ? 'bg-blue-50 border-[#1E40AF] text-[#1E40AF]'
                    : 'bg-transparent border-gray-200 text-gray-700 hover:bg-gray-200/60'
                }`}
                id={`settings-role-permission-tab-${key}`}
                data-cy={`settings-role-permission-tab-${key}`}
              >
                <span
                  className={`shrink-0 flex items-center justify-center w-9 h-9 rounded-lg ${
                    isActive ? 'text-[#1E40AF]' : 'text-gray-500'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </span>
                <div className="flex-1 min-w-0">
                  <div className={`font-semibold text-gray-800 truncate ${
                    isActive ? 'text-[#1E40AF]' : 'text-gray-500'
                  }`}>
                    {label}
                  </div>
                  <div className={`text-xs text-gray-500 truncate ${
                    isActive ? 'text-[#1E40AF]' : 'text-gray-500'
                  }`}>{subtext}</div>
                </div>
                <span
                  className={`shrink-0 font-semibold ${
                    isActive ? 'text-blue-600' : 'text-gray-700'
                  }`}
                >
                  {counts[key] ?? 0}
                </span>
              </button>
            );
          })}
        </nav>

        {/* Right content panel */}
        <div className="flex-1 min-w-0 border border-gray-200 rounded-2xl p-4 lg:p-5">
          {activeKey === '1' && (
            <div
              id="settings-role-permission-tab-permission"
              data-cy="settings-role-permission-tab-permission"
            >
              <Permission data-cy="settings-role-permission-permission-component" />
            </div>
          )}
          {activeKey === '2' && (
            <GroupPermissionComponent data-cy="settings-role-permission-group-component" />
          )}
          {activeKey === '4' && (
            <RoleComponent data-cy="settings-role-permission-role-component" />
          )}
        </div>
      </div>
    </div>
  );
};

export default ParentRolePermissionCards;
