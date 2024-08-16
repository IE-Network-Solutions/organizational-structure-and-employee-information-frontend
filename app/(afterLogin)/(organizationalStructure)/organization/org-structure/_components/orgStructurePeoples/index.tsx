'use client';
import React, { useState } from 'react';
import { Tree, TreeNode } from 'react-organizational-chart';
import { Card, Button, Menu, Dropdown, Tooltip } from 'antd';
import {
  EditOutlined,
  DeleteOutlined,
  MoreOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { v4 as uuidv4 } from 'uuid';
import { Department } from '@/types/dashboard/organization';
import useOrganizationStore from '@/store/uistate/features/organizationStructure/orgState';
import DepartmentForm from '@/app/(afterLogin)/(onboarding)/onboarding/_components/departmentForm.tsx';
import { useGetOrgCharts } from '@/store/server/features/organizationStructure/organizationalChart/query';
import CustomButton from '@/components/common/buttons/customButton';
import { BsThreeDotsVertical } from 'react-icons/bs';
import { IoAddSharp } from 'react-icons/io5';
import {
  useDeleteOrgChart,
  useUpdateOrgChart,
} from '@/store/server/features/organizationStructure/organizationalChart/mutation';
import { OrgChart } from '@/store/server/features/organizationStructure/organizationalChart/interface';
import DeleteModal from '@/components/common/deleteModal';
import CustomDrawer from '../customDrawer';

interface DepartmentNodeProps {
  data: Department;
  onEdit: () => void;
  onAdd: () => void;
  onDelete: () => void;
  isRoot?: boolean;
}

const DepartmentNode: React.FC<DepartmentNodeProps> = ({
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
          className="p-2 rounded-full absolute bottom-[-10px] center-[-40px]"
          onClick={onAdd}
        />
      )}
      {!isRoot && (
        <Dropdown
          overlay={menu}
          trigger={['click']}
          className="absolute top-[5px] right-[5px]"
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
          className="rounded-full absolute bottom-[-10px] "
          style={{ marginTop: '5px' }}
          onClick={onAdd}
        />
      )}
    </Card>
  );
};

const renderTreeNodes = (
  data: Department[],
  onEdit: (department: Department) => void,
  onAdd: (parent: any) => void,
  onDelete: (departmentId: string) => void,
  isRoot = false,
) =>
  data.map((item) => {
    return (
      <TreeNode
        key={item.id}
        label={
          <DepartmentNode
            data={item}
            onEdit={() => onEdit(item)}
            onAdd={() => onAdd(item)}
            onDelete={() => onDelete(item.id)}
            isRoot={isRoot}
          />
        }
      >
        {item.department &&
          renderTreeNodes(item.department, onEdit, onAdd, onDelete)}
      </TreeNode>
    );
  });

const OrgChartComponent: React.FC = () => {
  const {
    isFormVisible,
    setIsFormVisible,
    selectedDepartment,
    setSelectedDepartment,
    parentId,
    setParentId,
    isDeleteConfirmVisible,
    setIsDeleteConfirmVisible,
  } = useOrganizationStore();

  const { data: orgStructureData } = useGetOrgCharts();
  const { mutate: updateDepartment } = useUpdateOrgChart();
  const { mutate: deleteDepartment, isLoading: deleteLoading } =
    useDeleteOrgChart();
  const [parent, setParrent] = useState<Department>();

  const handleEdit = (department: Department) => {
    setSelectedDepartment(department);
    setIsFormVisible(true);
  };

  const handleAdd = (parent: any) => {
    setParentId(parent?.id || '');
    setParrent(parent);
    setSelectedDepartment(null);
    setIsFormVisible(true);
  };

  const handleDelete = (departmentId: string) => {
    setIsDeleteConfirmVisible(true);
    setSelectedDepartment({ id: departmentId } as Department);
  };

  const handleFormSubmit = (values: OrgChart) => {
    if (selectedDepartment) {
      updateDepartment({
        id: selectedDepartment.id,
        orgChart: { ...selectedDepartment, ...values },
      });
    } else if (parentId) {
      const newId = uuidv4();

      const data = {
        ...parent,
        department: [...(parent?.department || []), { ...values, id: newId }],
      };

      updateDepartment({
        id: parentId,
        orgChart: data,
      });
    }
    setIsFormVisible(false);
  };

  const handleDeleteConfirm = () => {
    if (selectedDepartment) {
      deleteDepartment(selectedDepartment.id);
    }
    setIsDeleteConfirmVisible(false);
  };

  const [drawerVisible, setDrawerVisible] = useState(false);
  const [drawerContent, setDrawerContent] = useState('');
  const [footerButtonText, setFooterButtonText] = useState('');
  const [drawTitle, setDrawTitle] = useState('');

  const showDrawer = (
    drawerContent: string,
    footerBtnText: string,
    title: string,
  ) => {
    setDrawerVisible(true);
    setDrawerContent(drawerContent);
    setFooterButtonText(footerBtnText);
    setDrawTitle(title);
  };

  const closeDrawer = () => {
    setDrawerVisible(false);
  };

  const menu = (
    <Menu>
      <Menu.Item
        key="1"
        className="py-2"
        style={{ paddingRight: '64px' }}
        onClick={() => showDrawer('archive', 'Archive', 'Archive Level')}
      >
        Archive
      </Menu.Item>
      <Menu.Item
        key="2"
        className="py-2"
        style={{ paddingRight: '64px' }}
        onClick={() => showDrawer('merge', 'Merge', 'Merge Department')}
      >
        Merge
      </Menu.Item>
      <Menu.Item
        key="3"
        className="py-2"
        style={{ paddingRight: '64px' }}
        onClick={() => showDrawer('dissolve', 'Dissove', 'Dessolve Department')}
      >
        Dissolve
      </Menu.Item>
    </Menu>
  );
  return (
    <div className="w-full overflow-x-auto">
      <Card
        className="w-full"
        title={<div className="text-2xl font-bold">ORG Structure</div>}
        extra={
          <div className="py-4 flex justify-center items-center gap-4">
            <CustomButton
              title="Download"
              type="default"
              icon={<IoAddSharp size={24} />}
            />
            <Dropdown
              overlay={menu}
              trigger={['click']}
              placement="bottomRight"
            >
              <CustomButton title="" icon={<BsThreeDotsVertical size={24} />} />
            </Dropdown>
          </div>
        }
      >
        <div className="w-full py-7 overflow-x-auto lg:overflow-x-visible">
          <div className="p-4 sm:p-2 md:p-6 lg:p-8">
            <Tree
              label={
                <DepartmentNode
                  data={{
                    id: orgStructureData?.id || '',
                    name: orgStructureData?.name || '',
                    department: orgStructureData?.department || [],
                    branchId: orgStructureData?.branchId,
                    description: '',
                    collapsed: false,
                  }}
                  onEdit={() => {}}
                  onAdd={() => handleAdd(orgStructureData)}
                  onDelete={() => {}}
                  isRoot={true}
                />
              }
              lineWidth={'2px'}
              lineColor={'#722ed1'}
              lineBorderRadius={'10px'}
            >
              {renderTreeNodes(
                orgStructureData?.department || [],
                handleEdit,
                handleAdd,
                handleDelete,
                false,
              )}
            </Tree>
          </div>

          <DepartmentForm
            onClose={() => setIsFormVisible(false)}
            open={isFormVisible}
            submitAction={handleFormSubmit}
            departmentData={selectedDepartment ?? undefined}
            title={selectedDepartment ? 'Edit Department' : 'Add Department'}
          />

          <DeleteModal
            open={isDeleteConfirmVisible}
            onConfirm={handleDeleteConfirm}
            onCancel={() => setIsDeleteConfirmVisible(false)}
            loading={deleteLoading}
          />
        </div>
        <CustomDrawer
          visible={drawerVisible}
          onClose={closeDrawer}
          drawerContent={drawerContent}
          footerButtonText={footerButtonText}
          onSubmit={() => {}}
          title={drawTitle}
        />
      </Card>
    </div>
  );
};

export default OrgChartComponent;
