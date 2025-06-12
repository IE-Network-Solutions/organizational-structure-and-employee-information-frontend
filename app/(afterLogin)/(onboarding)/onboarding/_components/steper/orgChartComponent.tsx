'use client';
import React, { useEffect, useRef } from 'react';
import { Tree, TreeNode } from 'react-organizational-chart';
import { Card, Button, Menu, Dropdown, Tooltip, Modal } from 'antd';
import {
  EditOutlined,
  DeleteOutlined,
  MoreOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { Department } from '@/types/dashboard/organization';
import DepartmentForm from '../departmentForm.tsx';
import useOrganizationStore from '@/store/uistate/features/organizationStructure/orgState';
import { useGetBranches } from '@/store/server/features/organizationStructure/branchs/queries';
import { v4 as uuidv4 } from 'uuid';

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
  onAdd: (parentId: string) => void,
  onDelete: (departmentId: string) => void,
  isRoot = false,
) =>
  data.map((item) => (
    <TreeNode
      key={item.id}
      label={
        <DepartmentNode
          data={item}
          onEdit={() => onEdit(item)}
          onAdd={() => onAdd(item.id)}
          onDelete={() => onDelete(item.id)}
          isRoot={isRoot}
        />
      }
    >
      {item.department &&
        renderTreeNodes(item.department, onEdit, onAdd, onDelete)}
    </TreeNode>
  ));

const OrgChartComponent: React.FC = () => {
  const {
    orgData,
    addDepartment,
    updateDepartment,
    deleteDepartment,
    isFormVisible,
    setIsFormVisible,
    selectedDepartment,
    setSelectedDepartment,
    parentId,
    setParentId,
    isDeleteConfirmVisible,
    setIsDeleteConfirmVisible,
    setBranchId,
    setOrgData,
  } = useOrganizationStore();

  const handleEdit = (department: Department) => {
    setSelectedDepartment(department);
    setIsFormVisible(true);
  };

  const handleAdd = (parentId: string) => {
    setParentId(parentId);
    setSelectedDepartment(null);
    setIsFormVisible(true);
  };

  const handleDelete = (departmentId: string) => {
    setIsDeleteConfirmVisible(true);
    setSelectedDepartment({ id: departmentId } as Department);
  };

  const handleFormSubmit = (values: Department) => {
    if (selectedDepartment) {
      updateDepartment({ ...selectedDepartment, ...values });
    } else if (parentId) {
      addDepartment(parentId, values);
    }
    setIsFormVisible(false);
  };

  const handleDeleteConfirm = () => {
    if (selectedDepartment) {
      deleteDepartment(selectedDepartment.id);
    }
    setIsDeleteConfirmVisible(false);
  };

  const { data: branches } = useGetBranches();

  const isInitialized = useRef(false); // Add this inside your component before useEffect

useEffect(() => {
  if (!isInitialized.current && branches && branches.items.length > 0) {
    const branchId = branches.items[0].id;
    setBranchId(branchId);

    if (!orgData.department || orgData.department.length === 0) {
      const defaultDepartments: Department[] = [
        { id: uuidv4(), name: 'HR', department: [], branchId, description: '', collapsed: false },
        { id: uuidv4(), name: 'Marketing', department: [], branchId, description: '', collapsed: false },
        { id: uuidv4(), name: 'Finance', department: [], branchId, description: '', collapsed: false },
      ];

      setOrgData({
        ...orgData,
        name: orgData.name || 'CEO',
        branchId,
        department: defaultDepartments,
      });

      isInitialized.current = true; // mark as initialized
    }
  }
}, [branches]);

 console.log(orgData,"orgData")
  return (
    <div className="w-full py-7 overflow-x-auto lg:overflow-x-visible">
      <div className="p-4 sm:p-2 md:p-6 lg:p-8">
        <Tree
          label={
            <DepartmentNode
              data={{
                id: 'root',
                name: orgData?.name || 'CEO',
                department: orgData?.department || [],
                branchId: orgData?.branchId,
                description: '',
                collapsed: false,
              }}
               onEdit={() => handleEdit({
        id: 'root',
        name: orgData?.name || 'CEO',
        department: orgData?.department || [],
        branchId: orgData?.branchId,
        description: '',
        collapsed: false,
      })}
              onAdd={() => handleAdd('root')}
              onDelete={() => {}}
              isRoot={true}
            />
          }
          lineWidth={'2px'}
          lineColor={'#722ed1'}
          lineBorderRadius={'10px'}
        >
          {renderTreeNodes(
            orgData?.department || [],
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

      <Modal
        title="Confirm Deletion"
        open={isDeleteConfirmVisible}
        onOk={handleDeleteConfirm}
        onCancel={() => setIsDeleteConfirmVisible(false)}
      >
        <p>Are you sure you want to delete this department?</p>
      </Modal>
    </div>
  );
};

export default OrgChartComponent;
