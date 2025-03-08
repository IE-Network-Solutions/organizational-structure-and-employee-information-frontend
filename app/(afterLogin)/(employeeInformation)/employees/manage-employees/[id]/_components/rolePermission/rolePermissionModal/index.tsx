import { useGetPermissionGroups } from '@/store/server/features/employees/settings/groupPermission/queries';
import { useGetPermissions } from '@/store/server/features/employees/settings/permission/queries';
import { useSettingStore } from '@/store/uistate/features/employees/settings/rolePermission';
import { Button, Card, Checkbox, Modal, Radio, Typography } from 'antd';

const { Title } = Typography;
interface RolePermissionModalProps {
  handleSave: () => void; 
  
}

const RolePermissionModal: React.FC<RolePermissionModalProps> = ({
  handleSave,
}) => {
  const {
    isModalVisible,
    setIsModalVisible,
    selectedGroup,
    setSelectedGroup,
    permissionCurrentPage,
    pageSize,
    permissonGroupCurrentPage,
    selectedPermissions,
    setSelectedPermissions,
  } = useSettingStore();

  const { data: groupPermissionData, isLoading: isGroupPermissionLoading } =
    useGetPermissionGroups(permissonGroupCurrentPage, pageSize);

  const { data: permissionData, isLoading: isPermissionLoading } =
    useGetPermissions(permissionCurrentPage, pageSize);

  const handleSelect = (value: string) => {
    const group = groupPermissionData?.items?.find((item) => item.id === value);
    setSelectedGroup(group || null);
    setIsModalVisible(true);
  };

  const handlePermissionChange = (permissionId: string) => {
    const currentPermissions = [...selectedPermissions];

    const newPermissionList = currentPermissions.includes(permissionId)
      ? currentPermissions.filter((id: string) => id !== permissionId) // Remove if already selected
      : [...currentPermissions, permissionId]; // Add if not selected

    setSelectedPermissions(newPermissionList);
  };

  const handleSelectAll = () => {
    if (selectedPermissions.length === selectedGroup?.permissions?.length) {
      setSelectedPermissions([]);
    } else {
      setSelectedPermissions(
        selectedGroup?.permissions?.map((p: any) => p.id) || [],
      );
    }
  };


  return (
    <div>
      <Modal
        title={<Title level={4}>Group Permission Details</Title>}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        centered
      >
        <div>
          <div className="flex items-center justify-between my-2">
            <div>Permission</div>
            <div className="flex items-center justify-start space-x-2">
              <span>
                <Checkbox
                  onChange={handleSelectAll}
                  checked={
                    selectedPermissions.length ===
                    selectedGroup?.permissions?.length
                  }
                >
                  <span>Select all</span>
                </Checkbox>
              </span>
            </div>
          </div>
        </div>

        <Card
          style={{ maxHeight: '300px', overflowY: 'auto' }}
          className="mb-4"
        >
          <div className="flex flex-col space-y-2">
            {selectedGroup?.permissions?.map((permission: any) => (
              <div
                key={permission?.id}
                className="flex items-center space-x-2 bg-[#f8f8f8] rounded-xl p-2"
              >
                <Checkbox
                  checked={(selectedPermissions ?? [])?.includes(
                    permission?.id,
                  )}
                  onChange={() => handlePermissionChange(permission?.id)}
                >
                  {permission.name}
                </Checkbox>
              </div>
            ))}
          </div>
        </Card>

        <div className="flex justify-end mt-4">
          <Button onClick={handleSave} htmlType="submit" type="primary">
            Save
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default RolePermissionModal;
