'use client';
import React, { useState } from 'react';
import { Button, Table } from 'antd';
import { FaPlus } from 'react-icons/fa';
import { GrEdit } from 'react-icons/gr';
import { RiDeleteBin6Line } from 'react-icons/ri';
import useDrawerStore from '@/store/uistate/features/okrplanning/okrSetting/assignTargetDrawerStore';
import AssignTargetDrawer from './_components/assign-target-drawer';
import TargetFilters from './_components/target-filters';
import { useGetTargetAssignment } from '@/store/server/features/okrplanning/okr/target/queries';
import { useGetDepartmentsWithUsers } from '@/store/server/features/employees/employeeManagment/department/queries';
import DeletePopover from '@/components/common/actionButton/deletePopover';
import { useDeleteAssignedTarget } from '@/store/server/features/okrplanning/okr/target/mutation';
import { useGetCriteriaTargets } from '@/store/server/features/okrplanning/okr/criteria/queries';

function Page() {
  const [searchText, setSearchText] = useState('');
  const [selectedType, setSelectedType] = useState('All Types');
  const { data: criteriaData } = useGetCriteriaTargets();

  const { data: targetAssignmentData, isLoading: targetAssignmentLoading } =
    useGetTargetAssignment();
  const { data: departmentData } = useGetDepartmentsWithUsers();
  const { mutate: deleteAssignedTarget } = useDeleteAssignedTarget();
  const { openDrawer } = useDrawerStore();

  const criteriaTypes: string[] = (criteriaData?.items || []).map(
    (item: any) => item.name,
  );
  const dataSource = targetAssignmentData?.items
    .map((item: any) => {
      const matchingDepartment = departmentData?.find(
        (dept: any) => dept.id == item.departmentId,
      );

      return {
        key: item.id,
        department: matchingDepartment ? matchingDepartment.name : '--',
        criteriaName: item.vpCriteria.name,
        month: item.month,
        target: item.target,
      };
    })
    .filter((item: any) => {
      const matchesSearch = item.department
        ?.toLowerCase()
        .includes(searchText.toLowerCase());
      const matchesType =
        selectedType === 'All Types' ||
        item.criteriaName
          ?.toLowerCase()
          .includes(selectedType?.toLowerCase() || '');
      return matchesSearch && matchesType;
    });

  const columns = [
    {
      title: 'Department',
      dataIndex: 'department',
      key: 'department',
    },
    {
      title: 'Criteria Name',
      dataIndex: 'criteriaName',
      key: 'criteriaName',
    },
    {
      title: 'Month',
      dataIndex: 'month',
      key: 'month',
    },
    {
      title: 'Target',
      dataIndex: 'target',
      key: 'target',
    },
    {
      title: 'Action',
      key: 'action',
      render: (record: any) => (
        <div className="flex space-x-2">
          <Button
            type="default"
            className="flex items-center space-x-1 bg-blue text-white hover:bg-sky-600 border-none"
            icon={<GrEdit />}
            onClick={() => handleEditClick(record.key)}
          />
          <DeletePopover onDelete={() => handleDelete(record.key)}>
            <Button
              type="default"
              className="flex items-center space-x-1 bg-red-500 text-white hover:bg-red-600 border-none"
              icon={<RiDeleteBin6Line />}
            />
          </DeletePopover>
        </div>
      ),
    },
  ];

  const handleEditClick = (id: string) => {
    openDrawer(id);
  };
  const handleDelete = (id: string) => {
    deleteAssignedTarget(id);
  };
  const handleTypeChange = (value: string) => setSelectedType(value);

  return (
    <div className="p-10">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Target Assignment</h1>
        <Button
          type="primary"
          className="flex items-center space-x-2 py-8 px-8"
          icon={<FaPlus />}
          onClick={() => openDrawer()}
        >
          Assign Target
        </Button>
      </div>

      <TargetFilters
        onSearchChange={setSearchText}
        onTypeChange={handleTypeChange}
        targetNames={['All Types', ...criteriaTypes]}
      />
      <Table
        dataSource={dataSource}
        columns={columns}
        pagination={{ pageSize: 5 }}
        loading={targetAssignmentLoading}
      />

      <AssignTargetDrawer />
    </div>
  );
}

export default Page;
