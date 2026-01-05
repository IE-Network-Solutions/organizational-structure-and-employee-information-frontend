import { Button, Dropdown, MenuProps, Popconfirm } from 'antd';
import { MoreOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';

const CommentActionMenu = ({
  onEdit,
  onDelete,
}: {
  onEdit: () => void;
  onDelete: () => void;
}) => {
  const items: MenuProps['items'] = [
    {
      key: 'edit',
      label: 'Edit',
      icon: <EditOutlined />,
      onClick: onEdit,
    },
    {
      key: 'delete',
      label: (
        <Popconfirm
          title="Are you sure you want to delete this comment?"
          onConfirm={onDelete}
          okText="Yes"
          cancelText="No"
        >
          <span className="w-full inline-block">Delete</span>
        </Popconfirm>
      ),
      icon: <DeleteOutlined />,
      danger: true,
    },
  ];

  return (
    <Dropdown menu={{ items }} trigger={['click']} placement="bottomRight">
      <Button
        type="text"
        icon={<MoreOutlined style={{ fontSize: '18px' }} />}
        className="text-gray-400 hover:text-gray-600 flex items-center justify-center !w-8 !h-8"
      />
    </Dropdown>
  );
};

export default CommentActionMenu;
