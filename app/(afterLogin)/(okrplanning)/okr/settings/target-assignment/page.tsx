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
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';

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
          <AccessGuard permissions={[Permissions.UpdateVpTargetsAssignation]}>
            <Button
              type="default"
              className="flex items-center space-x-1 bg-blue text-white hover:bg-sky-600 border-none"
              icon={<GrEdit />}
              onClick={() => handleEditClick(record.key)}
            />
          </AccessGuard>
          <DeletePopover onDelete={() => handleDelete(record.key)}>
            <AccessGuard permissions={[Permissions.DeleteVpTargetsAssignation]}>
              <Button
                type="default"
                className="flex items-center space-x-1 bg-red-500 text-white hover:bg-red-600 border-none"
                icon={<RiDeleteBin6Line />}
              />
            </AccessGuard>
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
    <div className="p-5 rounded-2xl bg-white h-full">
      {/* Desktop layout: visible from md and up */}

      <div className="hidden md:flex justify-between mb-6">
        <h1 className="text-2xl font-bold md:text-lg">Target Assignment</h1>
        <AccessGuard permissions={[Permissions.AssignVpTargets]}>
          <Button
            type="primary"
            className=""
            icon={<FaPlus />}
            onClick={() => openDrawer()}
          >
            <span className="hidden lg:block"> Assign Target</span>
          </Button>
        </AccessGuard>
      </div>
      <div className="hidden md:block w-full">
        <TargetFilters
          onSearchChange={setSearchText}
          onTypeChange={handleTypeChange}
          targetNames={['All Types', ...criteriaTypes]}
        />
      </div>
      {/* Mobile layout: visible on small screens */}
      <div className="md:hidden">
        <h1 className="text-2xl font-bold md:text-lg">Target Assignment</h1>
        <div className="mt-4 flex justify-between gap-4">
          <TargetFilters
            onSearchChange={setSearchText}
            onTypeChange={handleTypeChange}
            targetNames={['All Types', ...criteriaTypes]}
          />
          <AccessGuard permissions={[Permissions.AssignVpTargets]}>
            <Button
              type="primary"
              className="h-10"
              icon={<FaPlus />}
              onClick={() => openDrawer()}
            >
              <span className="hidden lg:block"> Assign Target</span>
            </Button>
          </AccessGuard>
        </div>
      </div>

      <div className="flex  overflow-x-auto scrollbar-none  w-full">
        <div className="w-full">
          <Table
            dataSource={dataSource}
            columns={columns}
            pagination={{ pageSize: 5 }}
            loading={targetAssignmentLoading}
          />
        </div>
      </div>

      <AssignTargetDrawer />
    </div>
  );
}

export default Page;
