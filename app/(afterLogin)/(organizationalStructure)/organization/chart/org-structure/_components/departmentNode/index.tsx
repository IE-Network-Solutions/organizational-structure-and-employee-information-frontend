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
    <Card className="p-1.5 rounded-3xl inline-block  border-[#CBD5E0] border-2 sm:w-auto">
      {isRoot && (
        <div className="flex justify-center items-center z-50">
          <AccessGuard permissions={[Permissions.CreateDepartment]}>
            <Button
              id="ceoButton"
              icon={<PlusOutlined />}
              size="small"
              type="primary"
              className={`rounded-full absolute bottom-[-10px] hide-on-download z-50`}
              onClick={onAdd}
            />
          </AccessGuard>
        </div>
      )}
      {!isRoot && (
        <Dropdown
          overlay={menu}
          trigger={['click']}
          className="absolute top-[1px]  hide-on-download "
        >
          <AccessGuard
            permissions={[
              Permissions.UpdateDepartment,
              Permissions.DeleteDepartment,
            ]}
          >
            <Button
              icon={<Pencil size={8} />}
              id={`${data.name}ThreeDotButton`}
              size="small"
              className="absolute bg-black text-white hover:bg-gray-800 border-none rounded-full top-[-3px] right-[-3px] w-[18px] h-[18px]"
            />
          </AccessGuard>
        </Dropdown>
      )}

      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'start',
        }}
      >
        <Tooltip title={`${data.name}`} placement="top">
          <span style={{ fontWeight: 'bold' }}>{data.name}</span>
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
              className={`rounded-full absolute bottom-[-10px] hide-on-download z-50`}
              style={{ marginTop: '5px' }}
              onClick={onAdd}
            />
          </AccessGuard>
        </div>
      )}
    </Card>
  );
};
