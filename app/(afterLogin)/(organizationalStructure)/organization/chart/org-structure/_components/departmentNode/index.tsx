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
  const departmentId =
    data.id || data.name?.replace(/\s+/g, '-').toLowerCase() || 'department';
  const menu = (
    <Menu
      data-cy={`org-structure-department-menu-${departmentId}`}
      id={`org-structure-department-menu-${departmentId}`}
    >
      <Menu.Item
        id={`${data.name}EditButton`}
        data-cy={`org-structure-department-edit-${departmentId}`}
        icon={
          <EditOutlined
            data-cy="org-org-structure-components-departmentnode-index-editoutlined-1"
            id="org-org-structure-components-departmentnode-index-editoutlined-1"
          />
        }
        onClick={onEdit}
      >
        Edit
      </Menu.Item>
      <Menu.Item
        id={`${data.name}DeleteButton`}
        data-cy={`org-structure-department-delete-${departmentId}`}
        icon={
          <DeleteOutlined
            data-cy="org-org-structure-components-departmentnode-index-deleteoutlined-1"
            id="org-org-structure-components-departmentnode-index-deleteoutlined-1"
          />
        }
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
      data-cy={`org-structure-department-node-${departmentId}`}
      id={`org-structure-department-node-${departmentId}`}
    >
      {isRoot && (
        <div
          className="flex justify-center items-center z-50"
          data-cy="org-org-structure-components-departmentnode-index-div-1"
          id="org-org-structure-components-departmentnode-index-div-1"
        >
          <AccessGuard
            permissions={[Permissions.CreateDepartment]}
            data-cy="org-org-structure-components-departmentnode-index-accessguard-1"
            id="org-org-structure-components-departmentnode-index-accessguard-1"
          >
            <Button
              id="ceoButton"
              data-cy="org-structure-root-add-department-btn"
              icon={
                <PlusOutlined
                  data-cy="org-org-structure-components-departmentnode-index-plusoutlined-1"
                  id="org-org-structure-components-departmentnode-index-plusoutlined-1"
                />
              }
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
          data-cy="org-org-structure-components-departmentnode-index-accessguard-2"
          id="org-org-structure-components-departmentnode-index-accessguard-2"
        >
          <Dropdown
            overlay={menu}
            trigger={['click']}
            className="absolute top-[1px] hide-on-download"
            data-cy={`org-structure-department-dropdown-${departmentId}`}
          >
            <Button
              icon={
                <Pencil
                  size={8}
                  data-cy="org-org-structure-components-departmentnode-index-pencil-1"
                  id="org-org-structure-components-departmentnode-index-pencil-1"
                />
              }
              id={`${data.name}ThreeDotButton`}
              data-cy={`org-structure-department-actions-${departmentId}`}
              size="small"
              className="absolute bg-black text-white hover:bg-gray-800 border-none rounded-full top-[-3px] right-[-3px] w-[18px] h-[18px]"
            />
          </Dropdown>
        </AccessGuard>
      )}

      <div
        className="flex justify-center items-start"
        data-cy="org-org-structure-components-departmentnode-index-div-2"
        id="org-org-structure-components-departmentnode-index-div-2"
      >
        <Tooltip
          title={data.name}
          placement="top"
          data-cy="org-org-structure-components-departmentnode-index-tooltip-1"
          id="org-org-structure-components-departmentnode-index-tooltip-1"
        >
          <span
            style={{
              fontWeight: 'bold',
              fontSize: '12px',
              whiteSpace: 'nowrap',
            }}
            data-cy={`org-structure-department-name-${departmentId}`}
            id={`org-structure-department-name-${departmentId}`}
          >
            {data.name}
          </span>
        </Tooltip>
      </div>

      {!isRoot && (
        <div
          className="flex justify-center items-center z-50"
          data-cy="org-org-structure-components-departmentnode-index-div-3"
          id="org-org-structure-components-departmentnode-index-div-3"
        >
          <AccessGuard
            permissions={[Permissions.CreateDepartment]}
            data-cy="org-org-structure-components-departmentnode-index-accessguard-3"
            id="org-org-structure-components-departmentnode-index-accessguard-3"
          >
            <Button
              id={`${data.name}Button`}
              data-cy={`org-structure-department-add-child-${departmentId}`}
              icon={
                <PlusOutlined
                  data-cy="org-org-structure-components-departmentnode-index-plusoutlined-2"
                  id="org-org-structure-components-departmentnode-index-plusoutlined-2"
                />
              }
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
