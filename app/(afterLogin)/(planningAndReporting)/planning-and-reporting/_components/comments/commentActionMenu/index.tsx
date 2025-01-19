import { Button, Dropdown, Menu, Popconfirm } from 'antd';
import { MoreOutlined } from '@ant-design/icons';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';

const CommentActionMenu = ({
  onEdit,
  onDelete,
}: {
  onEdit: any;
  onDelete: any;
}) => {
  const menu = (
    <Menu>
      <AccessGuard permissions={[Permissions.UpdateCommentOnPlanAndReport]}>
        <Menu.Item key="edit" onClick={onEdit}>
          Edit
        </Menu.Item>
      </AccessGuard>
      <AccessGuard permissions={[Permissions.DeleteCommentOnPlanAndReport]}>
        <Menu.Item key="delete">
          <Popconfirm
            title="Are you sure you want to delete this comment?"
            onConfirm={onDelete}
            okText="Yes"
            cancelText="No"
          >
            Delete
          </Popconfirm>
        </Menu.Item>
      </AccessGuard>
    </Menu>
  );

  return (
    <Dropdown overlay={menu} trigger={['click']}>
      <AccessGuard permissions={[Permissions.CreateCommentOnPlanAndReport]}>
        <Button type="text" icon={<MoreOutlined />} />
      </AccessGuard>
    </Dropdown>
  );
};

export default CommentActionMenu;
