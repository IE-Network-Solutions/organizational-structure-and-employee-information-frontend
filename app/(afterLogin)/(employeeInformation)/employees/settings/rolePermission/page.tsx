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
    <div className="w-full h-auto p-0 sm:p-1 md:p-2 lg:p-3 xl:p-4">
      <ParentRolePermissionCards onChange={onChange} />
      <GroupPermission />
      {(currentModal === 'roleModal' || currentModal === 'editRoleModal') && (
        <ListOfRoles />
      )}
      <DeleteModal
        open={currentModal === 'deleteModal'}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setCurrentModal(null)}
      />
    </div>
  );
};

export default SettingsPage;
