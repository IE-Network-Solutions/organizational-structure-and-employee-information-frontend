'use client';

// import AdminSettingHeader from './_components/adminSidebarHeader';
import { useSettingStore } from '@/store/uistate/features/employees/settings/rolePermission';
import GroupPermission from './groupPermission/groupPermissionFrom';
import ParentRolePermissionCards from './mainCard';
import ListOfRoles from './role/roleForm';
import DeleteModal from '@/components/common/deleteConfirmationModal';
import { useDeleteGroupPermission } from '@/store/server/features/employees/settings/groupPermission/mutations';
import { useDeleteRole } from '@/store/server/features/employees/settings/role/mutations';

const SettingsPage = () => {
  const {
    currentModal,
    roleCurrentPage,
    pageSize,
    setDeletedId,
    setCurrentModal,
    setTabButton,
    deletedId,
  } = useSettingStore();
  const deletePermissionGroupMutation = useDeleteGroupPermission();
  const deleteRoleMutation = useDeleteRole();

  const handleDeleteConfirm = () => {
    switch (deletedId?.key) {
      case 'groupId':
        const props = { deletedId, setCurrentModal, setDeletedId };
        deletePermissionGroupMutation.mutate(props);
        break;
      case 'roleId':
        const deleteRoleprops = {
          deletedId,
          roleCurrentPage,
          pageSize,
          setCurrentModal,
          setDeletedId,
        };
        deleteRoleMutation.mutate(deleteRoleprops);
      default:
    }
  };
  const onChange = (key: string) => {
    const tabName: { [key: number]: string } = {
      1: 'Permission',
      2: 'Group Permission',
      3: 'Admins',
      4: 'Role',
    };
    const tabKey = Number(key);
    setTabButton(tabName[tabKey]);
  };
  return (
    <div
      className="p-5 rounded-2xl bg-white h-full"
      id="settings-role-permission-container"
      data-cy="settings-role-permission-container"
    >
      <ParentRolePermissionCards
        onChange={onChange}
        data-cy="settings-role-permission-tabs"
      />
      <GroupPermission data-cy="settings-role-permission-group" />
      {(currentModal === 'roleModal' || currentModal === 'editRoleModal') && (
        <ListOfRoles data-cy="settings-role-permission-role-form" />
      )}
      <DeleteModal
        open={currentModal === 'deleteModal'}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setCurrentModal(null)}
        data-cy="settings-role-permission-delete-modal"
      />
    </div>
  );
};

export default SettingsPage;
