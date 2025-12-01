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
        <div
          className="flex space-x-2"
          id={`okr-target-assignment-table-actions-${record.key}`}
          data-cy={`okr-target-assignment-table-actions-${record.key}`}
        >
          <AccessGuard data-cy="okr-target-assignment-table-edit-button-access-guard-display-guard" permissions={[Permissions.UpdateVpTargetsAssignation]}>
            <Button
              type="default"
              className="flex items-center space-x-1 bg-blue text-white hover:bg-sky-600 border-none"
              icon={<GrEdit />}
              onClick={() => handleEditClick(record.key)}
              id={`okr-target-assignment-table-edit-button-${record.key}`}
              data-cy={`okr-target-assignment-table-edit-button-${record.key}`}
            />
          </AccessGuard>
          <DeletePopover
            onDelete={() => handleDelete(record.key)}
          
            data-cy={`okr-target-assignment-table-delete-popover-${record.key}`}
          >
            <AccessGuard data-cy="okr-target-assignment-table-delete-button-access-guard-display-guard" permissions={[Permissions.DeleteVpTargetsAssignation]}>
              <Button
                type="default"
                className="flex items-center space-x-1 bg-red-500 text-white hover:bg-red-600 border-none"
                icon={<RiDeleteBin6Line data-cy={`okr-target-assignment-table-delete-button-icon-${record.key}`} />}
                id={`okr-target-assignment-table-delete-button-${record.key}`}
                data-cy={`okr-target-assignment-table-delete-button-${record.key}`}
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
    <div
      className="p-5 rounded-2xl bg-white h-full"
      id="okr-target-assignment-container"
      data-cy="okr-target-assignment-container"
    >
      {/* Desktop layout: visible from md and up */}

      <div
        className="hidden md:flex justify-between mb-6"
        id="okr-target-assignment-desktop-header"
        data-cy="okr-target-assignment-desktop-header"
      >
        <h1
          className="text-2xl font-bold md:text-lg"
          id="okr-target-assignment-desktop-title"
          data-cy="okr-target-assignment-desktop-title"
        >
          Target Assignment
        </h1>
        <AccessGuard data-cy="okr-target-assignment-desktop-assign-button-access-guard-display-guard" permissions={[Permissions.AssignVpTargets]}>
          <Button
            type="primary"
            className=""
            icon={<FaPlus data-cy="okr-target-assignment-desktop-assign-button-icon-display-button" />}
            onClick={() => openDrawer()}
            id="okr-target-assignment-desktop-assign-button"
            data-cy="okr-target-assignment-desktop-assign-button"
          >
            <span
              className="hidden lg:block"
              id="okr-target-assignment-desktop-assign-button-label"
              data-cy="okr-target-assignment-desktop-assign-button-label"
            >
              Assign Target</span>
          </Button>
        </AccessGuard>
      </div>
      <div
        className="hidden md:block w-full"
        id="okr-target-assignment-desktop-filter-wrapper"
        data-cy="okr-target-assignment-desktop-filter-wrapper"
      >
        <TargetFilters
          onSearchChange={setSearchText}
          onTypeChange={handleTypeChange}
          targetNames={['All Types', ...criteriaTypes]}
        
          data-cy="okr-target-assignment-desktop-filters"
        />
      </div>
      {/* Mobile layout: visible on small screens */}
      <div
        className="md:hidden"
        id="okr-target-assignment-mobile-section"
        data-cy="okr-target-assignment-mobile-section"
      >
        <h1
          className="text-2xl font-bold md:text-lg"
          id="okr-target-assignment-mobile-title"
          data-cy="okr-target-assignment-mobile-title"
        >
          Target Assignment
        </h1>
        <div
          className="mt-4 flex justify-between gap-4"
          id="okr-target-assignment-mobile-toolbar"
          data-cy="okr-target-assignment-mobile-toolbar"
        >
          <TargetFilters
            onSearchChange={setSearchText}
            onTypeChange={handleTypeChange}
            targetNames={['All Types', ...criteriaTypes]}
           
            data-cy="okr-target-assignment-mobile-filters"
          />
          <AccessGuard permissions={[Permissions.AssignVpTargets]}>
            <Button
              type="primary"
              className="h-10"
              icon={<FaPlus />}
              onClick={() => openDrawer()}
              id="okr-target-assignment-mobile-assign-button"
              data-cy="okr-target-assignment-mobile-assign-button"
            >
              <span
                className="hidden lg:block"
                id="okr-target-assignment-mobile-assign-button-label"
                data-cy="okr-target-assignment-mobile-assign-button-label"
              >
                Assign Target
              </span>
            </Button>
          </AccessGuard>
        </div>
      </div>

      <div
        className="flex  overflow-x-auto scrollbar-none  w-full"
        id="okr-target-assignment-table-wrapper"
        data-cy="okr-target-assignment-table-wrapper"
      >
        <div
          className="w-full"
          id="okr-target-assignment-table-container"
          data-cy="okr-target-assignment-table-container"
        >
          <Table
            dataSource={dataSource}
            columns={columns}
            pagination={{ pageSize: 5 }}
            loading={targetAssignmentLoading}
            id="okr-target-assignment-table"
            data-cy="okr-target-assignment-table"
          />
        </div>
      </div>

      <AssignTargetDrawer
    
        data-cy="okr-target-assignment-drawer"
      />
    </div>
  );
}

export default Page;
