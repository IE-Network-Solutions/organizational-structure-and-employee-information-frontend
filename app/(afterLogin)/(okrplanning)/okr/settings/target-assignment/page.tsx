'use client';
import React, { useState } from 'react';
import { Spin, Dropdown, MenuProps, Tag } from 'antd';
import { EllipsisOutlined } from '@ant-design/icons';
import { MdDeleteForever, MdModeEditOutline } from 'react-icons/md';
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
          <AccessGuard
            data-cy="okr-target-assignment-table-edit-button-access-guard-display-guard"
            permissions={[Permissions.UpdateVpTargetsAssignation]}
          >
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
            <AccessGuard
              data-cy="okr-target-assignment-table-delete-button-access-guard-display-guard"
              permissions={[Permissions.DeleteVpTargetsAssignation]}
            >
              <Button
                type="default"
                className="flex items-center space-x-1 bg-red-500 text-white hover:bg-red-600 border-none"
                icon={
                  <RiDeleteBin6Line
                    data-cy={`okr-target-assignment-table-delete-button-icon-${record.key}`}
                  />
                }
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
        <AccessGuard
          data-cy="okr-target-assignment-desktop-assign-button-access-guard-display-guard"
          permissions={[Permissions.AssignVpTargets]}
        >
          <Button
            type="primary"
            className=""
            icon={
              <FaPlus data-cy="okr-target-assignment-desktop-assign-button-icon-display-button" />
            }
            onClick={() => openDrawer()}
            id="okr-target-assignment-desktop-assign-button"
            data-cy="okr-target-assignment-desktop-assign-button"
          >
            <span
              className="hidden lg:block"
              id="okr-target-assignment-desktop-assign-button-label"
              data-cy="okr-target-assignment-desktop-assign-button-label"
            >
              Assign Target
            </span>
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

        {targetAssignmentLoading ? (
          <div
            className="flex justify-center items-center py-20"
            data-cy="okr-target-assignment-loading"
          >
            <Spin size="large" />
          </div>
        ) : (
          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
            id="okr-target-assignment-cards-grid"
            data-cy="okr-target-assignment-cards-grid"
          >
            {groupedData.map((group: any) => (
              <div
                key={group.key}
                className="bg-white border border-[#d9d9d9] rounded-[8px] p-5 hover:shadow-sm transition-shadow relative"
                id={`okr-target-card-${group.key}`}
                data-cy={`okr-target-card-${group.key}`}
              >
                {/* Top Row: Criteria Name and Menu */}
                <div
                  className="flex justify-between items-start mb-2"
                  data-cy={`okr-target-card-header-${group.key}`}
                >
                  <p
                    className="text-[15px] font-semibold text-[#262626] flex-1 mr-2 leading-tight"
                    id={`okr-target-card-title-${group.key}`}
                    data-cy={`okr-target-card-title-${group.key}`}
                  >
                    {group.criteriaName}
                  </p>
                  <div
                    id={`okr-target-card-menu-wrapper-${group.key}`}
                    data-cy={`okr-target-card-menu-wrapper-${group.key}`}
                  >
                    <Dropdown
                      menu={{ items: getMenuItems(group) }}
                      trigger={['click']}
                      placement="bottomRight"
                    >
                      <button
                        className="w-8 h-8 flex items-center justify-center border border-[#d9d9d9] rounded-[6px] text-[#8c8c8c] hover:text-[#262626] hover:border-[#2b54ad] transition-colors"
                        onClick={(e) => e.stopPropagation()}
                        data-cy={`okr-target-card-menu-button-${group.key}`}
                      >
                        <EllipsisOutlined className="text-lg" />
                      </button>
                    </Dropdown>
                  </div>
                </div>

                {/* Second Row: Department Tag */}
                <div
                  className="mb-4"
                  data-cy={`okr-target-card-dept-wrapper-${group.key}`}
                >
                  <Tag
                    className="px-2 py-0.5 text-[12px] font-medium text-[#8c8c8c] border-[#f0f0f0] rounded-[4px] bg-[#fafafa]"
                    id={`okr-target-card-dept-${group.key}`}
                    data-cy={`okr-target-card-dept-${group.key}`}
                  >
                    {group.department}
                  </Tag>
                </div>

                {/* Divider Line */}
                <div
                  className="h-[1px] bg-[#f0f0f0] mb-4"
                  data-cy={`okr-target-card-divider-${group.key}`}
                />

                {/* Bottom Row: Month Targets */}
                <div
                  className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1"
                  data-cy={`okr-target-card-targets-${group.key}`}
                >
                  <span
                    className="text-[13px] font-bold text-[#262626] whitespace-nowrap"
                    data-cy={`okr-target-card-targets-label-${group.key}`}
                  >
                    Target
                  </span>
                  {group.targets.map((t: any) => (
                    <Tag
                      key={t.id}
                      className="px-2 py-0.5 text-[12px] font-medium text-[#595959] border-[#d9d9d9] rounded-[4px] bg-white whitespace-nowrap m-0"
                      data-cy={`okr-target-card-target-item-${group.key}-${t.id}`}
                    >
                      {t.month} : {Math.round(parseFloat(t.target))}
                    </Tag>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <AssignTargetDrawer data-cy="okr-target-assignment-drawer" />
    </div>
  );
}

export default Page;
