'use client';

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
import { useIsMobile } from '@/hooks/useIsMobile';

interface OnChange {
  onChange: (key: string) => void;
}

const NAV_ITEMS = [
  {
    key: '4',
    tabName: 'Role',
    label: 'Roles',
    subtext: 'User Roles Configuration',
    Icon: GroupOutlinedIcon,
  },
  {
    key: '2',
    tabName: 'Group Permission',
    label: 'Group Permissions',
    subtext: 'Grouped System Permissions',
    Icon: GridViewIcon,
  },
  {
    key: '1',
    tabName: 'Permission',
    label: 'Permissions',
    subtext: 'Individual System Permissions',
    Icon: LockIcon,
  },
];

const ParentRolePermissionCards: React.FC<OnChange> = (props) => {
  const { setTabButton, activeKey, setActiveKey } = useSettingStore();
  const { isMobile } = useIsMobile();

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
      <div
        data-cy="settings-role-permission-tabs-content-container"
        className="flex gap-4 flex-col lg:flex-row"
      >
        {/* Left navigation sidebar */}
        <nav
          className="flex lg:flex-col flex-row gap-2 rounded-lg p-2 lg:p-3 border border-gray-200"
          id="settings-role-permission-tabs"
          data-cy="settings-role-permission-tabs"
          role="tablist"
        >
          {NAV_ITEMS.map((item) => {
            const { key, label, subtext, Icon: IconComponent } = item;
            const isActive = activeKey === key;
            return (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => handleNavClick(key)}
                className={`w-full flex items-center gap-3 rounded-lg p-2 sm:p-3 text-left transition-colors border ${
                  isActive
                    ? 'bg-blue-50 border-[#1E40AF] text-[#1E40AF]'
                    : 'bg-transparent border-gray-200 text-gray-700 hover:bg-gray-200/60'
                }`}
                id={`settings-role-permission-tab-${key}`}
                data-cy={`settings-role-permission-tab-${key}`}
              >
                <button
                  data-cy="settings-role-permission-tab-icon"
                  className={`shrink-0 flex items-center justify-center h-6 w-6 rounded-md ${
                    isActive
                      ? 'text-[#1E40AF] border border-[#1E40AF]'
                      : 'border border-[#e8e8e8]'
                  }`}
                >
                  <IconComponent
                    className={`w-5 h-5 ${isActive ? 'text-[#1E40AF]' : 'text-[#848484]'}`}
                  />
                </button>
                <div
                  data-cy="settings-role-permission-tab-content"
                  className="flex-1 min-w-0"
                >
                  <div
                    data-cy="settings-role-permission-tab-label"
                    className={`font-normal text-base truncate ${
                      isActive ? 'text-[#4a65be]' : 'text-gray-500'
                    }`}
                  >
                    {!isMobile && label}
                  </div>
                  <div
                    data-cy="settings-role-permission-tab-subtext"
                    className={`text-xs font-normal truncate ${
                      isActive ? 'text-[#768acd]' : 'text-gray-500'
                    }`}
                  >
                    {!isMobile && subtext}
                  </div>
                </div>
                <span
                  data-cy="settings-role-permission-tab-count"
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
        <div
          data-cy="settings-role-permission-content-container"
          className="flex-1 min-w-0 border border-gray-200 rounded-2xl p-4 lg:p-5"
        >
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
