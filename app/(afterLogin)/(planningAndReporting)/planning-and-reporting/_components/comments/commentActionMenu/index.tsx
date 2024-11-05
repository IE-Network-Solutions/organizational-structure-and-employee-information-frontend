import { Button, Dropdown, Menu, Popconfirm } from 'antd';
import { MoreOutlined } from '@ant-design/icons';

const CommentActionMenu = ({
  onEdit,
  onDelete,
}: {
  onEdit: any;
  onDelete: any;
}) => {
  const menu = (
    <Menu>
      <Menu.Item key="edit" onClick={onEdit}>
        Edit
      </Menu.Item>
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
    </Menu>
  );

  return (
    <Dropdown overlay={menu} trigger={['click']}>
      <Button type="text" icon={<MoreOutlined />} />
    </Dropdown>
  );
};

export default CommentActionMenu;
