'use client';
import React, { useMemo, useState } from 'react';
import { Dropdown, MenuProps, Tag } from 'antd';
import { EllipsisOutlined } from '@ant-design/icons';
import { MdDeleteForever, MdModeEditOutline } from 'react-icons/md';
import useDrawerStore from '@/store/uistate/features/okrplanning/okrSetting/assignTargetDrawerStore';
import AssignTargetModal from './_components/assign-target-drawer';
import TargetFilters from './_components/target-filters';
import TargetAssignmentPageSkeleton from './_components/targetAssignmentPageSkeleton';
import EmptyState from '@/components/empty';
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

  const rawItems = targetAssignmentData?.items ?? [];

  const baseGrouped = useMemo(() => {
    return rawItems.reduce((acc: any[], item: any) => {
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
    }, []);
  }, [rawItems, departmentData]);

  const groupedData = useMemo(() => {
    return baseGrouped.filter((group: any) => {
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
  }, [baseGrouped, searchText, selectedType]);

  const hasActiveFilters =
    searchText.trim().length > 0 || selectedType !== 'All Types';

  const canAssignVpTargets = AccessGuard.checkAccess({
    permissions: [Permissions.AssignVpTargets],
  });

  const openCreateAssignment = () => {
    openDrawer();
  };

  const isFilteredOnlyEmpty =
    groupedData.length === 0 && baseGrouped.length > 0 && hasActiveFilters;

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
              <MdModeEditOutline className="text-[#595959] text-xl" />
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
              <MdDeleteForever className="text-xl" />
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
          <TargetAssignmentPageSkeleton />
        ) : groupedData.length === 0 ? (
          <div
            className="flex min-h-[280px] items-center justify-center py-8"
            data-cy="okr-target-assignment-empty"
            id="okrTargetAssignmentEmptyId"
          >
            <EmptyState
              title={
                isFilteredOnlyEmpty
                  ? 'No assignments match your filters'
                  : 'No target assignments yet'
              }
              description={
                isFilteredOnlyEmpty
                  ? 'Try adjusting search or the criteria type filter.'
                  : 'Create an assignment to set monthly VP targets by department and criteria.'
              }
              actionText={
                canAssignVpTargets && !isFilteredOnlyEmpty
                  ? 'Add assignment'
                  : undefined
              }
              onAction={
                canAssignVpTargets && !isFilteredOnlyEmpty
                  ? openCreateAssignment
                  : undefined
              }
            />
          </div>
        ) : (
          <div
            className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
            id="okr-target-assignment-cards-grid"
            data-cy="okr-target-assignment-cards-grid"
          >
            {groupedData.map((group: any) => (
              <div
                key={group.key}
                className="relative rounded-[8px] border border-[#d9d9d9] bg-white p-5 transition-shadow hover:shadow-sm"
                id={`okr-target-card-${group.key}`}
                data-cy={`okr-target-card-${group.key}`}
              >
                <div
                  className="mb-2 flex items-start justify-between"
                  data-cy={`okr-target-card-header-${group.key}`}
                >
                  <p
                    className="mr-2 flex-1 text-[15px] font-semibold leading-tight text-[#262626]"
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
                        type="button"
                        className="flex h-8 w-8 items-center justify-center rounded-[6px] border border-[#d9d9d9] text-[#8c8c8c] transition-colors hover:border-[#2b54ad] hover:text-[#262626]"
                        onClick={(e) => e.stopPropagation()}
                        data-cy={`okr-target-card-menu-button-${group.key}`}
                      >
                        <EllipsisOutlined className="text-lg" />
                      </button>
                    </Dropdown>
                  </div>
                </div>

                <div
                  className="mb-4"
                  data-cy={`okr-target-card-dept-wrapper-${group.key}`}
                >
                  <Tag
                    className="rounded-[4px] border-[#f0f0f0] bg-[#fafafa] px-2 py-0.5 text-[12px] font-medium text-[#8c8c8c]"
                    id={`okr-target-card-dept-${group.key}`}
                    data-cy={`okr-target-card-dept-${group.key}`}
                  >
                    {group.department}
                  </Tag>
                </div>

                <div
                  className="mb-4 h-px bg-[#f0f0f0]"
                  data-cy={`okr-target-card-divider-${group.key}`}
                />

                <div
                  className="scrollbar-none flex items-center gap-2 overflow-x-auto pb-1"
                  data-cy={`okr-target-card-targets-${group.key}`}
                >
                  <span
                    className="whitespace-nowrap text-[13px] font-bold text-[#262626]"
                    data-cy={`okr-target-card-targets-label-${group.key}`}
                  >
                    Target
                  </span>
                  {group.targets.map((t: any) => (
                    <Tag
                      key={t.id}
                      className="m-0 whitespace-nowrap rounded-[4px] border-[#d9d9d9] bg-white px-2 py-0.5 text-[12px] font-medium text-[#595959]"
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
