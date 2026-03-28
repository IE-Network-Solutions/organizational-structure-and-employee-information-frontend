'use client';
import React, { useState } from 'react';
import { Spin, Dropdown, MenuProps, Tag } from 'antd';
import { EllipsisOutlined } from '@ant-design/icons';
import { MdOutlineEdit, MdDeleteOutline } from 'react-icons/md';
import useDrawerStore from '@/store/uistate/features/okrplanning/okrSetting/assignTargetDrawerStore';
import AssignTargetModal from './_components/assign-target-drawer';
import TargetFilters from './_components/target-filters';
import { useGetTargetAssignment } from '@/store/server/features/okrplanning/okr/target/queries';
import { useGetDepartmentsWithUsers } from '@/store/server/features/employees/employeeManagment/department/queries';
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

  const groupedData = (targetAssignmentData?.items || [])
    .reduce((acc: any[], item: any) => {
      const matchingDepartment = departmentData?.find(
        (dept: any) => dept.id == item.departmentId,
      );
      const deptName = matchingDepartment ? matchingDepartment.name : '--';
      const criteriaName = item.vpCriteria.name;
      const key = `${deptName}-${criteriaName}`;

      let group = acc.find((g) => g.key === key);
      if (!group) {
        group = {
          key,
          department: deptName,
          criteriaName,
          targets: [],
        };
        acc.push(group);
      }
      group.targets.push({
        id: item.id,
        month: item.month,
        target: item.target,
      });
      group.targets.sort((a: any, b: any) => a.month - b.month);
      return acc;
    }, [])
    .filter((group: any) => {
      const matchesSearch = group.department
        ?.toLowerCase()
        .includes(searchText.toLowerCase());
      const matchesType =
        selectedType === 'All Types' ||
        group.criteriaName
          ?.toLowerCase()
          .includes(selectedType?.toLowerCase() || '');
      return matchesSearch && matchesType;
    });

  const handleEditClick = (id: string) => {
    openDrawer(id);
  };

  const handleDelete = (id: string) => {
    deleteAssignedTarget(id);
  };

  const getMenuItems = (group: any): MenuProps['items'] => {
    // Note: In a grouped view, edit/delete might need to be specific to a month
    // or we edit the first target. Assuming edit opens the drawer for the configuration.
    const firstId = group.targets[0]?.id;
    return [
      {
        key: 'edit',
        label: (
          <AccessGuard
            permissions={[Permissions.UpdateVpTargetsAssignation]}
            data-cy={`okr-target-card-edit-access-guard-${group.key}`}
          >
            <div
              className="flex items-center gap-3 py-1"
              onClick={() => handleEditClick(firstId)}
              id={`okr-target-card-edit-menu-item-${group.key}`}
              data-cy={`okr-target-card-edit-menu-item-${group.key}`}
            >
              <MdOutlineEdit className="text-[#595959] text-xl" />
              <span
                className="text-[15px] text-[#262626]"
                data-cy={`okr-target-card-edit-text-${group.key}`}
              >
                Edit OKR
              </span>
            </div>
          </AccessGuard>
        ),
      },
      {
        type: 'divider',
      },
      {
        key: 'delete',
        label: (
          <AccessGuard
            permissions={[Permissions.DeleteVpTargetsAssignation]}
            data-cy={`okr-target-card-delete-access-guard-${group.key}`}
          >
            <div
              className="flex items-center gap-3 py-1 text-red-600"
              onClick={() => handleDelete(firstId)}
              id={`okr-target-card-delete-menu-item-${group.key}`}
              data-cy={`okr-target-card-delete-menu-item-${group.key}`}
            >
              <MdDeleteOutline className="text-xl" />
              <span
                className="text-[15px]"
                data-cy={`okr-target-card-delete-text-${group.key}`}
              >
                Delete OKR
              </span>
            </div>
          </AccessGuard>
        ),
      },
    ];
  };

  const handleTypeChange = (value: string) => setSelectedType(value);

  return (
    <div
      className="w-full"
      id="okr-target-assignment-page"
      data-cy="okr-target-assignment-page"
    >
      {/* Unified Container */}
      <div
        className="border border-[#f0f0f0] rounded-xl pt-5 px-8 pb-8 bg-white min-h-[400px]"
        id="okr-target-assignment-main-container"
        data-cy="okr-target-assignment-main-container"
      >
        {/* Search and Filter Row */}
        <TargetFilters
          onSearchChange={setSearchText}
          onTypeChange={handleTypeChange}
          targetNames={['All Types', ...criteriaTypes]}
          data-cy="okr-target-assignment-filters"
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
                className="bg-white border border-[#d9d9d9] rounded-[8px] py-2 px-4 min-h-[112px] hover:shadow-sm transition-shadow relative flex flex-col justify-between"
                id={`okr-target-card-${group.key}`}
                data-cy={`okr-target-card-${group.key}`}
              >
                {/* Top Row: Criteria Name and Menu */}
                <div
                  className="flex justify-between items-start mb-0"
                  data-cy={`okr-target-card-header-${group.key}`}
                >
                  <p
                    className="text-[14px] font-normal text-black flex-1 mr-2 leading-tight"
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
                        className="w-6 h-6 flex items-center justify-center border border-[#d9d9d9] rounded-[6px] text-[#374151] transition-colors"
                        onClick={(e) => e.stopPropagation()}
                        data-cy={`okr-target-card-menu-button-${group.key}`}
                      >
                        <svg width="14" height="4" viewBox="0 0 14 4" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <circle cx="2.5" cy="2" r="1.5" fill="currentColor"/>
                          <circle cx="7" cy="2" r="1.5" fill="currentColor"/>
                          <circle cx="11.5" cy="2" r="1.5" fill="currentColor"/>
                        </svg>
                      </button>
                    </Dropdown>
                  </div>
                </div>

                {/* Second Row: Department Tag */}
                <div
                  className="mb-0"
                  data-cy={`okr-target-card-dept-wrapper-${group.key}`}
                >
                  <Tag
                    className="h-[22px] px-2 py-0 text-[12px] font-medium text-[#8c8c8c] border-[#f0f0f0] rounded-[4px] bg-[#fafafa] inline-flex items-center"
                    id={`okr-target-card-dept-${group.key}`}
                    data-cy={`okr-target-card-dept-${group.key}`}
                  >
                    {group.department}
                  </Tag>
                </div>

                {/* Divider Line */}
                <div
                  className="h-[1px] bg-[#f0f0f0] mb-0"
                  data-cy={`okr-target-card-divider-${group.key}`}
                />

                {/* Bottom Row: Month Targets */}
                <div
                  className="flex items-center gap-[8px] overflow-x-auto scrollbar-none pb-1"
                  data-cy={`okr-target-card-targets-${group.key}`}
                >
                  <span
                    className="text-[14px] font-normal text-black whitespace-nowrap"
                    data-cy={`okr-target-card-targets-label-${group.key}`}
                  >
                    Target
                  </span>
                  {group.targets.map((t: any) => (
                    <Tag
                      key={t.id}
                      className="h-[22px] px-2 py-0 text-[12px] font-medium text-[rgba(0,0,0,0.7)] border-[#d9d9d9] rounded-[4px] bg-[rgba(0,0,0,0.02)] whitespace-nowrap m-0 inline-flex items-center"
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

      <AssignTargetModal data-cy="okr-target-assignment-drawer" />
    </div>
  );
}

export default Page;
