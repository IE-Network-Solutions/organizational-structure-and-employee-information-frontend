'use client';
import { useUpdateEmployeeRolePermission } from '@/store/server/features/employees/employeeDetail/mutations';
import { useGetEmployee } from '@/store/server/features/employees/employeeManagment/queries';
import { useGetPermissionGroupsWithOutPagination } from '@/store/server/features/employees/settings/groupPermission/queries';
import { useGetPermissionsWithOutPagination } from '@/store/server/features/employees/settings/permission/queries';
import { useGetRolesWithPermission } from '@/store/server/features/employees/settings/role/queries';
import { useEmployeeManagementStore } from '@/store/uistate/features/employees/employeeManagment';
import { useSettingStore } from '@/store/uistate/features/employees/settings/rolePermission';
import {
  Button,
  Card,
  Checkbox,
  Col,
  Collapse,
  Form,
  Modal,
  Row,
  Select,
  Input,
  Switch,
  Space,
  Tag,
} from 'antd';
import React, { useEffect, useState, useMemo } from 'react';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUserOutlined';
import EngineeringIcon from '@mui/icons-material/Engineering';
import PermIdentityIcon from '@mui/icons-material/PermIdentity';
import RefreshIcon from '@mui/icons-material/Refresh';
import CloseIcon from '@mui/icons-material/Close';
import {
  AppstoreOutlined,
  FileTextOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import { CiCalendar, CiSettings, CiStar, CiBookmark } from 'react-icons/ci';
import { TbMessage2 } from 'react-icons/tb';
import { AiOutlineDollarCircle } from 'react-icons/ai';
import { PiMoneyLight, PiSuitcaseSimpleThin } from 'react-icons/pi';
import { LuCircleDollarSign, LuUsers } from 'react-icons/lu';
import { Permissions } from '@/types/commons/permissionEnum';
import AccessGuard from '@/utils/permissionGuard';

interface Ids {
  id: string;
}
const RolePermission: React.FC<Ids> = ({ id }) => {
  const [form] = Form.useForm();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroupFilter, setSelectedGroupFilter] = useState<string>('all');
  const { data: employeeData, isLoading } = useGetEmployee(id);
  const { data: rolesWithPermission } = useGetRolesWithPermission();
  const { data: groupPermissionData } =
    useGetPermissionGroupsWithOutPagination();
  const { data: permissionListData } = useGetPermissionsWithOutPagination();

  const {
    setSelectedRoleOnOption,
    setSelectedRoleOnList,
    selectedGroupPermission,
    setSelectedGroupForModal,
    selectedRoleOnOption,
    setTempSelectedPermissions,
    setSelectedPermissionsUnderGroup,
    setModalVisible,
    selectedPermissionsUnderGroup,
    selectedGroupForModal,
    setSelectAll,
    modalVisible,
    selectAll,
    tempSelectedPermissions,
  } = useSettingStore();
  const { mutate: employeeRolePermissionUpdate } =
    useUpdateEmployeeRolePermission();
  const { setEdit, edit, selectedPermissions, setSelectedPermissions } =
    useEmployeeManagementStore();

  useEffect(() => {
    if (!edit.rolePermission) setEdit('rolePermission');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const basicGroupPermissionId =
    groupPermissionData?.items?.filter((item) => item.isBasic) ?? [];
  const basicGroupPermissions = basicGroupPermissionId.flatMap(
    (item) => item.permissions ?? [],
  );

  useEffect(() => {
    if (employeeData) {
      const userRoleId = employeeData?.roleId;
      const allPermissionIds =
        employeeData?.userPermissions?.map((perm: any) => perm.permissionId) ||
        [];

      const allPermissions = Array.from(
        new Set([
          ...allPermissionIds,
          ...(basicGroupPermissions?.map((perm) => perm.id) ?? []),
        ]),
      );

      const groupPermissionIds = Array.from(
        new Set([
          ...selectedGroupPermission,
          ...(basicGroupPermissionId?.map((item) => item.id) ?? []),
        ]),
      );

      form.setFieldsValue({
        roleId: userRoleId,
        permission: allPermissions,
        groupPermissionId: groupPermissionIds,
      });

      setSelectedRoleOnOption(userRoleId);
      setSelectedPermissions(allPermissions);
    }
  }, [employeeData, form]);

  const onRoleChangeHandler = (value: string) => {
    const selectedRole = rolesWithPermission?.find((role) => role.id === value);

    if (selectedRole) {
      const rolePermissions =
        selectedRole?.permissions?.map((perm) => perm.id) || [];

      const updatedPermissions = Array.from(
        new Set([
          ...rolePermissions,
          ...(basicGroupPermissions?.map((perm) => perm.id) ?? []),
        ]),
      );

      form.setFieldsValue({
        roleId: value,
        permission: updatedPermissions,
      });

      setSelectedRoleOnList(selectedRole);
      setSelectedRoleOnOption(value);
      setSelectedPermissions(updatedPermissions);
    }
  };

  const handleModalPermissionChange = (checkedValues: string[]) => {
    setTempSelectedPermissions(checkedValues);
  };

  const handleConfirmPermissions = () => {
    if (selectedGroupForModal) {
      const updatedPermissions = Array.from(
        new Set([...selectedPermissionsUnderGroup, ...tempSelectedPermissions]),
      );
      setSelectedPermissionsUnderGroup(updatedPermissions);

      form.setFieldsValue({
        permission: Array.from(
          new Set([...selectedPermissions, ...updatedPermissions]),
        ),
      });
    }

    setModalVisible(false);
    setSelectedGroupForModal(null);
    setSelectAll(false);
  };

  const handleUpdateUserRolePermission = (values: any) => {
    employeeRolePermissionUpdate({ id, values });
  };

  // const handleEditChange = (editKey: keyof EditState) => {
  //   setEdit(editKey);
  // };
  const handleSelectAll = () => {
    if (selectAll) {
      setTempSelectedPermissions([]);
    } else {
      const allPermissionIds =
        selectedGroupForModal?.permissions?.map((perm: any) => perm.id) || [];
      setTempSelectedPermissions(allPermissionIds);
    }
    setSelectAll(!selectAll);
  };

  // Helper function to get role icon
  const getRoleIcon = (roleName: string) => {
    const name = roleName.toLowerCase();
    if (name.includes('owner')) {
      return <VerifiedUserIcon />;
    } else if (name.includes('admin')) {
      return <EngineeringIcon />;
    }
    return <PermIdentityIcon />;
  };

  // Helper function to get role description
  const getRoleDescription = (roleName: string) => {
    const name = roleName.toLowerCase();
    if (name.includes('owner')) {
      return 'Full System Access';
    } else if (name.includes('admin')) {
      return 'Manage Users and Settings';
    }
    return 'Standard Access';
  };

  // Calculate permission counts for roles
  const getRolePermissionCount = (role: any) => {
    return role?.permissions?.length || 0;
  };

  // Filter group permissions based on selected filter
  const filteredGroupPermissions = useMemo(() => {
    if (!groupPermissionData?.items) return [];
    if (selectedGroupFilter === 'all') return groupPermissionData.items;
    return groupPermissionData.items.filter((group: any) =>
      group.name.toLowerCase().includes(selectedGroupFilter.toLowerCase()),
    );
  }, [groupPermissionData, selectedGroupFilter]);

  // Get selected permissions count for a group
  const getGroupSelectedCount = (group: any) => {
    const groupPermissionIds = group.permissions?.map((p: any) => p.id) || [];
    const selectedCount = (selectedPermissions as string[]).filter(
      (id: string) => groupPermissionIds.includes(id),
    ).length;
    return selectedCount;
  };

  // Check if group is fully selected
  const isGroupFullySelected = (group: any) => {
    const groupPermissionIds = group.permissions?.map((p: any) => p.id) || [];
    return (
      groupPermissionIds.length > 0 &&
      groupPermissionIds.every((id: string) =>
        (selectedPermissions as string[]).includes(id),
      )
    );
  };

  // Handle group toggle
  const handleGroupToggle = (group: any, checked: boolean) => {
    const groupPermissionIds = group.permissions?.map((p: any) => p.id) || [];
    if (checked) {
      const updatedPermissions = Array.from(
        new Set([...selectedPermissions, ...groupPermissionIds]),
      );
      setSelectedPermissions(updatedPermissions);
      form.setFieldsValue({ permission: updatedPermissions });
    } else {
      const updatedPermissions = selectedPermissions.filter(
        (id: string) => !groupPermissionIds.includes(id),
      );
      setSelectedPermissions(updatedPermissions);
      form.setFieldsValue({ permission: updatedPermissions });
    }
  };

  // Handle individual permission toggle
  const handlePermissionToggle = (permissionId: string, checked: boolean) => {
    if (checked) {
      const updatedPermissions = [...selectedPermissions, permissionId];
      setSelectedPermissions(updatedPermissions);
      form.setFieldsValue({ permission: updatedPermissions });
    } else {
      const updatedPermissions = selectedPermissions.filter(
        (id: string) => id !== permissionId,
      );
      setSelectedPermissions(updatedPermissions);
      form.setFieldsValue({ permission: updatedPermissions });
    }
  };

  // Get active permissions list
  const activePermissions = useMemo(() => {
    if (!permissionListData?.items || !selectedPermissions.length) return [];
    return permissionListData.items.filter((perm: any) =>
      (selectedPermissions as string[]).includes(perm.id),
    );
  }, [permissionListData, selectedPermissions]);

  // Group active permissions by their permission group
  const activePermissionsByGroup = useMemo(() => {
    if (!groupPermissionData?.items || !selectedPermissions.length) return [];

    return groupPermissionData.items
      .map((group: any) => {
        const groupPermissions =
          group.permissions?.filter((perm: any) =>
            (selectedPermissions as string[]).includes(perm.id),
          ) || [];

        if (!groupPermissions.length) return null;

        return {
          group,
          permissions: groupPermissions,
        };
      })
      .filter(Boolean);
  }, [groupPermissionData, selectedPermissions]);

  // Remove permission from active list
  const handleRemovePermission = (permissionId: string) => {
    const updatedPermissions = selectedPermissions.filter(
      (id: string) => id !== permissionId,
    );
    setSelectedPermissions(updatedPermissions);
    form.setFieldsValue({ permission: updatedPermissions });
  };

  // Get group icon
  const getGroupIcon = (groupName: string) => {
    const name = groupName.toLowerCase();

    if (name.includes('dashboard')) {
      return <AppstoreOutlined style={{ fontSize: 18 }} />;
    }

    if (name.includes('organization') || name.includes('org ')) {
      return <CiSettings size={18} />;
    }

    if (name.includes('employee')) {
      return <LuUsers size={18} />;
    }

    if (
      name.includes('recruit') ||
      name.includes('talent') ||
      name.includes('job')
    ) {
      return <PiSuitcaseSimpleThin size={18} />;
    }

    if (name.includes('okr')) {
      return <CiStar size={18} />;
    }

    if (
      name.includes('feedback') ||
      name.includes('cfr') ||
      name.includes('conversation') ||
      name.includes('recognition')
    ) {
      return <TbMessage2 size={18} />;
    }

    if (
      name.includes('learning') ||
      name.includes('training') ||
      name.includes('tna')
    ) {
      return <CiBookmark size={18} />;
    }

    if (name.includes('payroll') || name.includes('salary')) {
      return <AiOutlineDollarCircle size={18} />;
    }

    if (
      name.includes('timesheet') ||
      name.includes('attendance') ||
      name.includes('leave')
    ) {
      return <CiCalendar size={18} />;
    }

    if (
      name.includes('compensation') ||
      name.includes('benefit') ||
      name.includes('allowance') ||
      name.includes('deduction')
    ) {
      return <PiMoneyLight size={18} />;
    }

    if (name.includes('incentive') || name.includes('variable pay')) {
      return <LuCircleDollarSign size={18} />;
    }

    if (name.includes('audit')) {
      return <FileTextOutlined style={{ fontSize: 18 }} />;
    }

    if (name.includes('admin') || name.includes('configuration')) {
      return <CiSettings size={18} />;
    }

    return <AppstoreOutlined style={{ fontSize: 18 }} />;
  };

  return (
    <div id="role-permission-container" data-cy="role-permission-container ">
      <Card
        loading={isLoading}
        id="role-permission-card"
        data-cy="role-permission-card"
        headStyle={{ borderBottom: 'none' }}
        bordered={false}
        bodyStyle={{ padding: '0' }}
      >
        <Form
          form={form}
          name="dependencies"
          autoComplete="off"
          style={{ maxWidth: '100%' }}
          layout="vertical"
          onFinish={handleUpdateUserRolePermission}
          id="role-permission-form"
          data-cy="role-permission-form"
          disabled={
            !AccessGuard.checkAccess({
              permissions: [Permissions.UpdateRoleForUser],
              id: 'role-permission-edit-guard',
              selfShouldAccess: true,
            })
          }
        >
          {/* Roles Section */}
          <div
            className="border-[1px] border-[#D9D9D9] rounded-md p-2 mb-4"
            id="roles-section"
            data-cy="roles-section"
          >
            <h3
              data-cy="roles-section-title"
              className="text-base font-bold text-gray-900 mb-4"
            >
              Roles
            </h3>
            <Row gutter={[16, 16]} id="roles-row" data-cy="roles-row">
              {rolesWithPermission?.map((role) => {
                const isSelected = selectedRoleOnOption === role.id;
                const permissionCount = getRolePermissionCount(role);
                return (
                  <Col
                    xs={24}
                    sm={8}
                    key={role.id}
                    id={`role-col-${role.id}`}
                    data-cy={`role-col-${role.id}`}
                  >
                    <Card
                      className={`rounded-lg border cursor-pointer transition-all ${
                        isSelected
                          ? 'border-[#1e40af] bg-blue-50'
                          : 'border-gray-200 hover:shadow-md'
                      }`}
                      onClick={() => {
                        onRoleChangeHandler(role.id);
                      }}
                      id={`role-card-${role.id}`}
                      data-cy={`role-card-${role.id}`}
                      bodyStyle={{ padding: '16px' }}
                    >
                      <div
                        data-cy="role-permission-name-div"
                        className="flex items-center justify-between"
                      >
                        <div
                          data-cy="role-permission-name-div"
                          className="flex items-center gap-3 flex-1"
                        >
                          <div
                            data-cy="role-permission-icon-div"
                            className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              isSelected
                                ? 'bg-blue-100 text-[#1e40af]'
                                : 'bg-gray-100'
                            }`}
                          >
                            {getRoleIcon(role.name)}
                          </div>
                          <div
                            data-cy="role-permission-name-div"
                            className="flex-1"
                          >
                            <p
                              data-cy="role-permission-name-p"
                              className={`text-base font-semibold ${
                                isSelected ? 'text-[#1e40af]' : 'text-gray-900'
                              } m-0`}
                            >
                              {role.name}
                            </p>
                            <p
                              data-cy="role-permission-description-p"
                              className={`text-xs ${
                                isSelected
                                  ? 'bg-blue-100 text-[#1e40af]'
                                  : 'text-gray-500'
                              } m-0`}
                            >
                              {getRoleDescription(role.name)}
                            </p>
                          </div>
                        </div>
                        <div
                          data-cy="role-permission-count-div"
                          className="flex items-center gap-3"
                        >
                          <span
                            data-cy="role-permission-count-span"
                            className={`text-xs ${
                              isSelected ? 'text-[#1e40af]' : 'text-gray-500'
                            }`}
                          >
                            {permissionCount} Permissions
                          </span>
                          <Checkbox
                            checked={isSelected}
                            onChange={() => {
                              onRoleChangeHandler(role.id);
                            }}
                            id={`role-checkbox-${role.id}`}
                            data-cy={`role-checkbox-${role.id}`}
                          />
                        </div>
                      </div>
                    </Card>
                  </Col>
                );
              })}
            </Row>
          </div>

          {/* Main Content Row */}
          <Row
            // gutter={6}
            id="main-content-row"
            data-cy="main-content-row"
            justify="space-between"
          >
            {/* Left Column - Permission Management */}
            <Col
              xs={24}
              lg={16}
              id="permission-management-col"
              data-cy="permission-management-col"
              className="mb-4 border-[1px] border-[#D9D9D9] rounded-md px-2 py-4"
            >
              <div data-cy="active-permission-group-filters-container">
                <Space direction="vertical" size="middle" className="w-full">
                  <div
                    data-cy="active-permission-group-filters-container"
                    className="flex justify-between gap-2"
                  >
                    {/* Search Bar */}

                    <Input
                      placeholder="Search Permission"
                      id="permission-search"
                      allowClear
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-[300px] pr-0 py-0 h-8"
                      data-cy="permission-search"
                      suffix={
                        <div
                          className="text-gray-400 border-l border-gray-300 py-1 px-2"
                          data-cy="manage-employees-search-input"
                        >
                          <SearchOutlined data-cy="manage-employees-search-icon" />
                        </div>
                      }
                    />

                    {/* Update Button */}
                    <AccessGuard
                      permissions={[Permissions.UpdateRoleForUser]}
                      id="role-permission-edit-guard"
                      data-cy="role-permission-edit-guard"
                    >
                      <Button
                        icon={<RefreshIcon style={{ fontSize: '14px' }} />}
                        onClick={() => {
                          // Refresh logic can be added here
                        }}
                        htmlType="submit"
                        id="permission-update-btn"
                        data-cy="permission-update-btn"
                        className="border border-[#d9d9d9] text-[#4d4d4d] text-sm font-normal"
                      >
                        Update
                      </Button>
                    </AccessGuard>
                  </div>

                  {/* Group Filters */}
                  <div
                    data-cy="active-permission-group-filters-div"
                    className="flex gap-2 overflow-x-auto scrollbar-hide pb-1"
                  >
                    <Tag
                      data-cy="active-permission-group-all-tag"
                      className={`cursor-pointer inline-flex items-center gap-2 rounded-md px-2.5 py-1.5 border ${
                        selectedGroupFilter === 'all'
                          ? 'border-[#1d4ed8] text-[#1d4ed8] bg-white'
                          : 'border-gray-300 text-gray-700 bg-white'
                      }`}
                      onClick={() => setSelectedGroupFilter('all')}
                    >
                      <span
                        data-cy="active-permission-group-all-count-span"
                        className={`inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded text-xs font-medium ${
                          selectedGroupFilter === 'all'
                            ? 'bg-blue-50 border border-[#1d4ed8] text-[#1d4ed8]'
                            : 'bg-gray-100 border border-gray-300 text-gray-600'
                        }`}
                      >
                        {activePermissions.length}
                      </span>
                      All Groups
                    </Tag>
                    {groupPermissionData?.items?.map((group: any) => {
                      const isSelected =
                        selectedGroupFilter === group.name.toLowerCase();
                      const selectedCount = getGroupSelectedCount(group);
                      return (
                        <Tag
                          key={group.id}
                          className={`cursor-pointer inline-flex items-center gap-2 rounded-md px-2.5 py-1.5 border ${
                            isSelected
                              ? 'border-[#1d4ed8] text-[#1d4ed8] bg-white'
                              : 'border-gray-300 text-gray-700 bg-white'
                          }`}
                          onClick={() =>
                            setSelectedGroupFilter(group.name.toLowerCase())
                          }
                        >
                          <span
                            data-cy="active-permission-group-selected-count-span"
                            className={`inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded text-xs font-medium ${
                              isSelected
                                ? 'bg-blue-50 border border-[#1d4ed8] text-[#1d4ed8]'
                                : 'bg-gray-100 border border-gray-300 text-gray-600'
                            }`}
                          >
                            {selectedCount}
                          </span>
                          {group.name}
                        </Tag>
                      );
                    })}
                  </div>
                </Space>
              </div>

              {/* Permission Groups List - collapsible panels with permissions nested under each group */}
              <div
                className="max-h-96 overflow-y-auto scrollbar-hide"
                id="role-permission-collapse"
                data-cy="role-permission-collapse"
              >
                <Collapse
                  ghost
                  bordered={false}
                  expandIcon={() => null}
                  className="role-permission-collapse [&_.ant-collapse-item]:border [&_.ant-collapse-item]:border-gray-200 [&_.ant-collapse-item]:rounded-lg [&_.ant-collapse-item]:bg-gray-50 [&_.ant-collapse-item]:mb-3 [&_.ant-collapse-header]:px-4 [&_.ant-collapse-header]:py-3 [&_.ant-collapse-content]:bg-white [&_.ant-collapse-content-box]:px-4 [&_.ant-collapse-content-box]:pb-4 [&_.ant-collapse-content-box]:pt-0"
                >
                  {filteredGroupPermissions.map((group: any) => {
                    const selectedCount = getGroupSelectedCount(group);
                    const totalCount = group.permissions?.length || 0;
                    const isFullySelected = isGroupFullySelected(group);
                    const groupPermissions = group.permissions || [];
                    const permissionsToShow = searchQuery
                      ? groupPermissions.filter(
                          (p: any) =>
                            p.name
                              ?.toLowerCase()
                              .includes(searchQuery.toLowerCase()) ||
                            p.description
                              ?.toLowerCase()
                              .includes(searchQuery.toLowerCase()),
                        )
                      : groupPermissions;
                    if (permissionsToShow.length === 0) return null;
                    return (
                      <Collapse.Panel
                        key={group.id}
                        header={
                          <div
                            data-cy="active-permission-group-header-div"
                            className="flex items-center gap-3 flex-1 pr-2"
                          >
                            <div
                              data-cy="active-permission-group-icon-div"
                              className="w-8 h-8 rounded flex items-center justify-center bg-gray-100 shrink-0"
                            >
                              {getGroupIcon(group.name)}
                            </div>
                            <div
                              data-cy="active-permission-group-name-div"
                              className="flex-1 min-w-0"
                            >
                              <p
                                data-cy="active-permission-group-name-p"
                                className="text-sm font-semibold text-gray-900 m-0"
                              >
                                {group.name}
                              </p>
                              <p
                                data-cy="active-permission-group-selected-count-p"
                                className="text-xs text-gray-500 m-0"
                              >
                                {selectedCount} of {totalCount} Selected
                              </p>
                            </div>
                          </div>
                        }
                        extra={
                          <span
                            data-cy="active-permission-group-switch-span"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Switch
                              checked={isFullySelected}
                              onChange={(checked) =>
                                handleGroupToggle(group, checked)
                              }
                              id={`permission-group-switch-${group.id}`}
                              data-cy={`permission-group-switch-${group.id}`}
                              className={`${isFullySelected ? 'bg-[#1d4ed8]' : ''}`}
                              disabled={
                                !AccessGuard.checkAccess({
                                  permissions: [Permissions.UpdateRoleForUser],
                                  id: 'role-permission-edit-guard',
                                  selfShouldAccess: true,
                                })
                              }
                            />
                          </span>
                        }
                        id={`permission-group-panel-${group.id}`}
                        data-cy={`permission-group-panel-${group.id}`}
                      >
                        <div
                          data-cy="active-permission-list-div"
                          className="space-y-3 pt-2 border-t border-gray-100"
                        >
                          {permissionsToShow.map((permission: any) => {
                            const isChecked = (
                              selectedPermissions as string[]
                            ).includes(permission.id);
                            return (
                              <div
                                key={permission.id}
                                className="flex items-start gap-3 py-2 hover:bg-gray-50 rounded px-1 -mx-1"
                                id={`permission-item-${permission.id}`}
                                data-cy={`permission-item-${permission.id}`}
                              >
                                <Checkbox
                                  checked={isChecked}
                                  onChange={(e) =>
                                    handlePermissionToggle(
                                      permission.id,
                                      e.target.checked,
                                    )
                                  }
                                  id={`permission-checkbox-${permission.id}`}
                                  data-cy={`permission-checkbox-${permission.id}`}
                                  className="pt-0.5"
                                  disabled={
                                    !AccessGuard.checkAccess({
                                      permissions: [
                                        Permissions.UpdateRoleForUser,
                                      ],
                                      id: 'role-permission-edit-guard',
                                      selfShouldAccess: true,
                                    })
                                  }
                                />
                                <div
                                  data-cy="active-permission-item-div"
                                  className="flex-1"
                                >
                                  <span
                                    data-cy="active-permission-item-name"
                                    className="text-sm font-medium text-gray-900"
                                  >
                                    {permission.name}
                                  </span>
                                  {permission.description && (
                                    <p
                                      data-cy="active-permission-item-description"
                                      className="text-xs text-gray-500 m-0 mt-0.5"
                                    >
                                      {permission.description}
                                    </p>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </Collapse.Panel>
                    );
                  })}
                </Collapse>
              </div>
            </Col>

            {/* Right Column - Active Permissions */}
            <Col
              xs={24}
              lg={7}
              id="active-permissions-col"
              data-cy="active-permissions-col"
              className="mb-4 border-[1px] border-[#D9D9D9] rounded-md px-2 py-4"
            >
              <div data-cy="active-permission-list-container" className="mb-4">
                <div
                  data-cy="active-permission-list-header-div"
                  className="flex items-center justify-between mb-4"
                >
                  <h3
                    data-cy="active-permission-list-title"
                    className="text-base font-normal text-[#4d4d4d] m-0"
                  >
                    Active Permissions
                  </h3>
                  <Tag className="border border-[#91caff] bg-[#e6f4ff] text-[#1677ff]">
                    {activePermissions.length} Active
                  </Tag>
                </div>
              </div>

              {/* Active Permissions List */}
              <div
                data-cy="active-permission-list-div"
                className="max-h-96 overflow-y-auto space-y-4 scrollbar-hide"
              >
                {activePermissionsByGroup.length === 0 ? (
                  <div
                    data-cy="active-permission-list-no-permissions-div"
                    className="text-center text-gray-500 py-8"
                  >
                    No active permissions
                  </div>
                ) : (
                  activePermissionsByGroup.map(
                    ({ group, permissions }: any) => (
                      <div
                        key={group.id}
                        data-cy="active-permission-group-section"
                        className="space-y-2"
                      >
                        <div
                          data-cy="active-permission-group-section-header-div"
                          className="flex items-center gap-2"
                        >
                          <div
                            data-cy="active-permission-group-section-header-icon-div"
                            className="w-6 h-6 flex items-center justify-center text-[#4d4d4d]"
                          >
                            {getGroupIcon(group.name)}
                          </div>
                          <span
                            data-cy="active-permission-group-section-header-name-span"
                            className="text-base font-normal text-[#4d4d4d]"
                          >
                            {group.name}
                          </span>
                        </div>

                        <div
                          data-cy="active-permission-group-section-permissions-div"
                          className="space-y-2"
                        >
                          {permissions.map((permission: any) => (
                            <div
                              key={permission.id}
                              className="flex items-center justify-between px-3 py-1.5 bg-white border border-gray-200 rounded-lg shadow-sm"
                              id={`active-permission-item-${permission.id}`}
                              data-cy={`active-permission-item-${permission.id}`}
                            >
                              <span
                                data-cy="active-permission-item-name"
                                className="text-sm text-gray-700"
                              >
                                {permission.name}
                              </span>
                              <Button
                                type="text"
                                size="small"
                                icon={<CloseIcon className="text-gray-400" />}
                                onClick={() =>
                                  handleRemovePermission(permission.id)
                                }
                                disabled={false}
                                id={`remove-permission-btn-${permission.id}`}
                                data-cy={`remove-permission-btn-${permission.id}`}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    ),
                  )
                )}
              </div>
            </Col>
          </Row>

          {/* Hidden form fields for submission */}
          <Form.Item
            name="roleId"
            hidden
            rules={[{ required: true, message: 'Please select a role!' }]}
          >
            <Select />
          </Form.Item>
          <Form.Item
            name="permission"
            hidden
            rules={[
              {
                required: true,
                message: 'Please select at least one permission!',
              },
            ]}
          >
            <Select mode="multiple" />
          </Form.Item>
          <Form.Item name="groupPermissionId" hidden>
            <Select mode="multiple" />
          </Form.Item>

          {/* Submit Button */}
          <Row
            className="flex justify-end mt-6"
            id="role-permission-submit-row"
            data-cy="role-permission-submit-row"
          ></Row>
        </Form>
      </Card>
      <Modal
        title={`Select Permissions for ${selectedGroupForModal?.name}`}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        data-cy="role-permission-modal"
        footer={[
          <Button
            key="cancel"
            onClick={() => setModalVisible(false)}
            id="role-permission-modal-cancel-btn"
            data-cy="role-permission-modal-cancel-btn"
          >
            Cancel
          </Button>,
          <Button
            key="confirm"
            type="primary"
            onClick={handleConfirmPermissions}
            id="role-permission-modal-confirm-btn"
            data-cy="role-permission-modal-confirm-btn"
          >
            Confirm
          </Button>,
        ]}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '10px',
          }}
          id="role-permission-modal-select-all-wrapper"
          data-cy="role-permission-modal-select-all-wrapper"
        >
          <Checkbox
            checked={selectAll}
            onChange={handleSelectAll}
            id="role-permission-modal-select-all"
            data-cy="role-permission-modal-select-all"
          >
            Select All
          </Checkbox>
        </div>
        <Checkbox.Group
          options={selectedGroupForModal?.permissions.map((perm: any) => ({
            label: perm.name,
            value: perm.id,
          }))}
          value={tempSelectedPermissions}
          onChange={handleModalPermissionChange}
          data-cy="role-permission-modal-checkbox-group"
        />
      </Modal>
    </div>
  );
};

export default RolePermission;
