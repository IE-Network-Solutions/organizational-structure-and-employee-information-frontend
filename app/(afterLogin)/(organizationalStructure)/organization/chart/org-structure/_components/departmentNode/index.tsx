import { Department } from '@/types/dashboard/organization';
import {
  EditOutlined,
  DeleteOutlined,
  MoreOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { Button, Card, Dropdown, Menu, Tooltip } from 'antd';
import { Pencil } from 'lucide-react';

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
    <Card className="p-1.5 rounded-3xl inline-block  border-[#CBD5E0] border-2 sm:w-auto ">
      {isRoot && (
        <Button
          id="ceoButton"
          icon={<PlusOutlined />}
          size="small"
          type="primary"
          className={`p-2 rounded-full absolute bottom-[-10px] center-[-40px] hide-on-download`}
          onClick={onAdd}
        />
      )}
      {!isRoot && (
        <Dropdown
          overlay={menu}
          trigger={['click']}
          className="absolute top-[5px] right-[5px]  hide-on-download "
        >
          <Button
            icon={<Pencil size={8} />}
            id={`${data.name}ThreeDotButton`}
            size="small"
            className="absolute bg-black text-white hover:bg-gray-800 border-none rounded-full top-[-3px] right-[-3px] w-[18px] h-[18px]"
          />
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
          <Button
            id={`${data.name}Button`}
            icon={<PlusOutlined />}
            size="small"
            type="primary"
            className={`rounded-full absolute bottom-[-10px] hide-on-download z-50`}
            style={{ marginTop: '5px' }}
            onClick={onAdd}
          />
        </div>
      )}
    </Card>
  );
};
