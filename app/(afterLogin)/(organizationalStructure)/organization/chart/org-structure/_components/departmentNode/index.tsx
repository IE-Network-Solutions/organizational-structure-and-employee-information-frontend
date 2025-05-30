import { Department } from '@/types/dashboard/organization';
import AccessGuard from '@/utils/permissionGuard';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Card, Dropdown, Menu, Tooltip } from 'antd';
import { Pencil } from 'lucide-react';
import { Permissions } from '@/types/commons/permissionEnum';

interface DepartmentNodeProps {
  data: Department;
  onEdit: () => void;
  onAdd: () => void;
  onDelete: () => void;
  isRoot?: boolean;
}

export const DepartmentNode: React.FC<DepartmentNodeProps> = ({
  data,
  onEdit,
  onAdd,
  onDelete,
  isRoot = false,
}) => {
  const menu = (
    <Menu>
      <Menu.Item
        id={`${data.name}EditButton`}
        icon={<EditOutlined />}
        onClick={onEdit}
      >
        Edit
      </Menu.Item>
      <Menu.Item
        id={`${data.name}DeleteButton`}
        icon={<DeleteOutlined />}
        onClick={onDelete}
      >
        Delete
      </Menu.Item>
    </Menu>
  );

  return (
    <Card
      bodyStyle={{ padding: 0, background: 'transparent' }}
      className="inline-block px-6 py-4 rounded-2xl border-[#CBD5E0] border-1 h-[51px]"
    >
      {isRoot && (
        <div className="flex justify-center items-center z-50">
          <AccessGuard permissions={[Permissions.CreateDepartment]}>
            <Button
              id="ceoButton"
              icon={<PlusOutlined />}
              size="small"
              type="primary"
              className="rounded-full absolute bottom-[-10px] hide-on-download z-50"
              onClick={onAdd}
            />
          </AccessGuard>
        </div>
      )}

      {!isRoot && (
        <AccessGuard
          permissions={[
            Permissions.UpdateDepartment,
            Permissions.DeleteDepartment,
          ]}
        >
          <Dropdown
            overlay={menu}
            trigger={['click']}
            className="absolute top-[1px] hide-on-download"
          >
            <Button
              icon={<Pencil size={8} />}
              id={`${data.name}ThreeDotButton`}
              size="small"
              className="absolute bg-black text-white hover:bg-gray-800 border-none rounded-full top-[-3px] right-[-3px] w-[18px] h-[18px]"
            />
          </Dropdown>
        </AccessGuard>
      )}

      <div className="flex justify-center items-start">
        <Tooltip title={data.name} placement="top">
          <span
            style={{
              fontWeight: 'bold',
              fontSize: '12px',
              whiteSpace: 'nowrap',
            }}
          >
            {data.name}
          </span>
        </Tooltip>
      </div>

      {!isRoot && (
        <div className="flex justify-center items-center z-50">
          <AccessGuard permissions={[Permissions.CreateDepartment]}>
            <Button
              id={`${data.name}Button`}
              icon={<PlusOutlined />}
              size="small"
              type="primary"
              className="rounded-full absolute bottom-[-10px] hide-on-download z-50"
              style={{ marginTop: '5px' }}
              onClick={onAdd}
            />
          </AccessGuard>
        </div>
      )}
    </Card>
  );
};
