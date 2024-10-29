import { Department } from '@/types/dashboard/organization';
import {
  EditOutlined,
  DeleteOutlined,
  MoreOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { Button, Card, Dropdown, Menu, Tooltip } from 'antd';

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
    <Card className="p-1.5 rounded-md inline-block border border-[#e8e8e8] sm:w-auto">
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
          className="absolute top-[5px] right-[5px]  hide-on-download"
        >
          <Button
            icon={<MoreOutlined />}
            id={`${data.name}ThreeDotButton`}
            size="small"
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
        <Button
          id={`${data.name}Button`}
          icon={<PlusOutlined />}
          size="small"
          type="primary"
          className={`rounded-full absolute bottom-[-10px] hide-on-download`}
          style={{ marginTop: '5px' }}
          onClick={onAdd}
        />
      )}
    </Card>
  );
};
