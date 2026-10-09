'use client';

/* eslint-disable local-rules/data-cy-required */

import React, { useMemo, useState } from 'react';
import {
  Button,
  Dropdown,
  Empty,
  Input,
  MenuProps,
  Segmented,
  Skeleton,
  Tag,
} from 'antd';
import {
  BankOutlined,
  EllipsisOutlined,
  SearchOutlined,
  TeamOutlined,
  UserOutlined,
} from '@ant-design/icons';
import AccessGuard from '@/utils/permissionGuard';
import DeleteModal from '@/components/common/deleteConfirmationModal';
import { useGetDepartments } from '@/store/server/features/employees/employeeManagment/department/queries';
import { useGetAllUsers } from '@/store/server/features/okrplanning/okr/users/queries';
import { useGetOkrObjectiveTypes } from '@/store/server/features/okrplanning/okr-objective-type/queries';
import { useGetObjectiveTypeWeightAssignments } from '@/store/server/features/okrplanning/okr-objective-type-weight/queries';
import { useDeleteObjectiveTypeWeightAssignment } from '@/store/server/features/okrplanning/okr-objective-type-weight/mutations';
import {
  OkrObjectiveTypeWeightAssignment,
  OkrWeightScopeType,
} from '@/store/server/features/okrplanning/okr-objective-type-weight/interface';
import WeightAssignmentModal from './_components/WeightAssignmentModal';

const MANAGE_OKR_SETTINGS = 'manage_okr_settings';

type ScopeFilter = 'ALL' | OkrWeightScopeType;

type ScopeOption = {
  value: string;
  label: string;
};

const SCOPE_LABELS: Record<OkrWeightScopeType, string> = {
  TENANT: 'Company',
  DEPARTMENT: 'Department',
  USER: 'User',
};

const SCOPE_TAG_COLOR: Record<OkrWeightScopeType, string> = {
  TENANT: 'blue',
  DEPARTMENT: 'geekblue',
  USER: 'purple',
};

const getPersonName = (person: any) =>
  person?.fullName ||
  [person?.firstName, person?.middleName, person?.lastName]
    .filter(Boolean)
    .join(' ') ||
  person?.email ||
  'Unnamed employee';

const formatPercent = (value: number) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return '0%';
  return `${Number.isInteger(numeric) ? numeric : numeric.toFixed(2)}%`;
};

const ScopeIcon = ({ scopeType }: { scopeType: OkrWeightScopeType }) => {
  if (scopeType === 'DEPARTMENT') return <TeamOutlined />;
  if (scopeType === 'USER') return <UserOutlined />;
  return <BankOutlined />;
};

const ObjectiveTypeWeightsPage = () => {
  const [scopeFilter, setScopeFilter] = useState<ScopeFilter>('ALL');
  const [searchText, setSearchText] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] =
    useState<OkrObjectiveTypeWeightAssignment | null>(null);
  const [deleteTarget, setDeleteTarget] =
    useState<OkrObjectiveTypeWeightAssignment | null>(null);

  const { data: objectiveTypes = [], isLoading: isTypesLoading } =
    useGetOkrObjectiveTypes({ activeOnly: true });
  const { data: assignments = [], isLoading: isAssignmentsLoading } =
    useGetObjectiveTypeWeightAssignments();
  const { data: departmentsData } = useGetDepartments();
  const { data: usersData } = useGetAllUsers();
  const { mutate: deleteAssignment, isLoading: isDeleting } =
    useDeleteObjectiveTypeWeightAssignment();

  const departments = useMemo(
    () =>
      Array.isArray(departmentsData)
        ? departmentsData
        : (departmentsData?.items ?? departmentsData?.data ?? []),
    [departmentsData],
  );
  const users = useMemo(
    () =>
      Array.isArray(usersData)
        ? usersData
        : (usersData?.items ?? usersData?.data ?? []),
    [usersData],
  );

  const departmentOptions: ScopeOption[] = useMemo(
    () =>
      departments.map((department: any) => ({
        value: department.id,
        label: department.name || department.departmentName || 'Department',
      })),
    [departments],
  );

  const userOptions: ScopeOption[] = useMemo(
    () =>
      users.map((user: any) => ({
        value: user.id,
        label: getPersonName(user),
      })),
    [users],
  );

  const departmentNameById = useMemo(
    () => new Map(departmentOptions.map((item) => [item.value, item.label])),
    [departmentOptions],
  );
  const userNameById = useMemo(
    () => new Map(userOptions.map((item) => [item.value, item.label])),
    [userOptions],
  );
  const typeNameById = useMemo(
    () => new Map(objectiveTypes.map((type) => [type.id, type.name])),
    [objectiveTypes],
  );

  const hasCompanyDefault = assignments.some(
    (item) => item.scopeType === 'TENANT',
  );

  const cards = useMemo(() => {
    const resolveTitle = (item: OkrObjectiveTypeWeightAssignment) => {
      if (item.scopeType === 'TENANT') return 'Company default';
      if (item.scopeType === 'DEPARTMENT') {
        return (
          departmentNameById.get(item.scopeId ?? '') || 'Unknown department'
        );
      }
      return userNameById.get(item.scopeId ?? '') || 'Unknown employee';
    };

    const resolveSubtitle = (item: OkrObjectiveTypeWeightAssignment) => {
      if (item.scopeType === 'TENANT') {
        return 'Applies to everyone unless a department or user override exists.';
      }
      if (item.scopeType === 'DEPARTMENT') {
        return 'Overrides the company default for this department.';
      }
      return 'Overrides department and company defaults for this employee.';
    };

    const query = searchText.trim().toLowerCase();
    return assignments
      .filter((item) =>
        scopeFilter === 'ALL' ? true : item.scopeType === scopeFilter,
      )
      .map((item) => ({
        item,
        title: resolveTitle(item),
        subtitle: resolveSubtitle(item),
      }))
      .filter(({ title, item }) => {
        if (!query) return true;
        return (
          title.toLowerCase().includes(query) ||
          SCOPE_LABELS[item.scopeType].toLowerCase().includes(query)
        );
      })
      .sort((a, b) => {
        const order = { TENANT: 0, DEPARTMENT: 1, USER: 2 } as const;
        const byScope = order[a.item.scopeType] - order[b.item.scopeType];
        if (byScope !== 0) return byScope;
        return a.title.localeCompare(b.title);
      });
  }, [assignments, departmentNameById, scopeFilter, searchText, userNameById]);

  const getAssignmentTitle = (item: OkrObjectiveTypeWeightAssignment) => {
    if (item.scopeType === 'TENANT') return 'Company default';
    if (item.scopeType === 'DEPARTMENT') {
      return departmentNameById.get(item.scopeId ?? '') || 'Unknown department';
    }
    return userNameById.get(item.scopeId ?? '') || 'Unknown employee';
  };

  const isLoading = isTypesLoading || isAssignmentsLoading;
  const hasSearch = searchText.trim().length > 0;
  const isFilteredEmpty =
    cards.length === 0 &&
    assignments.length > 0 &&
    (hasSearch || scopeFilter !== 'ALL');

  const openCreateModal = () => {
    setEditingAssignment(null);
    setIsModalOpen(true);
  };

  const openEditModal = (assignment: OkrObjectiveTypeWeightAssignment) => {
    setEditingAssignment(assignment);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingAssignment(null);
  };

  const confirmDelete = () => {
    if (!deleteTarget?.id) return;
    deleteAssignment(deleteTarget.id, {
      onSuccess: () => setDeleteTarget(null),
    });
  };

  const getMenuItems = (
    assignment: OkrObjectiveTypeWeightAssignment,
  ): MenuProps['items'] => [
    {
      key: 'edit',
      label: (
        <button
          type="button"
          className="w-full border-none bg-transparent px-0 text-left text-[14px] text-[rgba(0,0,0,0.7)]"
          onClick={() => openEditModal(assignment)}
        >
          Edit assignment
        </button>
      ),
    },
    { type: 'divider' },
    {
      key: 'delete',
      label: (
        <button
          type="button"
          className="w-full border-none bg-transparent px-0 text-left text-[14px] text-[#ff4d4f]"
          onClick={() => setDeleteTarget(assignment)}
        >
          Delete assignment
        </button>
      ),
    },
  ];

  return (
    <AccessGuard permissions={[MANAGE_OKR_SETTINGS]}>
      <div className="w-full rounded-xl bg-white px-4 py-5 sm:px-6 lg:px-8">
        <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="mb-1 text-xl font-semibold text-[#262626]">
              Objective type weights
            </h2>
            <p className="m-0 max-w-2xl text-sm text-[#595959]">
              Assign how each objective type contributes to the final OKR score.
              Company weights are the default; department and user assignments
              override them.
            </p>
          </div>
          <Button type="primary" onClick={openCreateModal}>
            Assign weights
          </Button>
        </div>

        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Segmented<ScopeFilter>
            value={scopeFilter}
            onChange={setScopeFilter}
            options={[
              { label: 'All', value: 'ALL' },
              { label: 'Company', value: 'TENANT' },
              { label: 'Department', value: 'DEPARTMENT' },
              { label: 'User', value: 'USER' },
            ]}
          />
          <Input
            allowClear
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            placeholder="Search assignments"
            prefix={<SearchOutlined className="text-[#8c8c8c]" />}
            className="w-full sm:max-w-[280px]"
          />
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <Skeleton
                key={item}
                active
                paragraph={{ rows: 4 }}
                className="rounded-xl border border-[#f0f0f0] p-5"
              />
            ))}
          </div>
        ) : cards.length === 0 ? (
          <div className="flex min-h-[280px] items-center justify-center rounded-xl border border-dashed border-[#d9d9d9] bg-[#fafafa] px-4 py-10">
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <div className="text-center">
                  <p className="mb-1 text-sm font-medium text-[#262626]">
                    {isFilteredEmpty
                      ? 'No assignments match your filters'
                      : 'No weight assignments yet'}
                  </p>
                  <p className="m-0 text-sm text-[#8c8c8c]">
                    {isFilteredEmpty
                      ? 'Try a different filter or clear the search.'
                      : 'Start with a company default, then add department or user overrides as needed.'}
                  </p>
                </div>
              }
            >
              {!isFilteredEmpty && (
                <Button type="primary" onClick={openCreateModal}>
                  Assign weights
                </Button>
              )}
            </Empty>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {cards.map(({ item, title, subtitle }) => (
              <article
                key={item.id}
                className="flex flex-col rounded-xl border border-[#f0f0f0] bg-[#fafafa] p-4 transition-shadow hover:shadow-sm sm:p-5"
              >
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-[#2b54ad] shadow-sm">
                      <ScopeIcon scopeType={item.scopeType} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="m-0 truncate text-[14px] font-semibold text-[#262626]">
                          {title}
                        </h3>
                        <Tag
                          color={SCOPE_TAG_COLOR[item.scopeType]}
                          className="m-0"
                        >
                          {SCOPE_LABELS[item.scopeType]}
                        </Tag>
                      </div>
                      <p className="mb-0 mt-1 text-[12px] leading-relaxed text-[#8c8c8c]">
                        {subtitle}
                      </p>
                    </div>
                  </div>

                  <Dropdown
                    menu={{ items: getMenuItems(item) }}
                    trigger={['click']}
                    placement="bottomRight"
                  >
                    <button
                      type="button"
                      className="flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-md border-none bg-transparent text-[#8c8c8c] hover:bg-white hover:text-[#262626]"
                      aria-label={`Actions for ${title}`}
                    >
                      <EllipsisOutlined />
                    </button>
                  </Dropdown>
                </div>

                <ul className="m-0 flex-1 list-none space-y-2 rounded-lg border border-[#f0f0f0] bg-white p-3">
                  {(item.lines ?? []).map((line) => (
                    <li
                      key={`${item.id}-${line.objectiveTypeId}`}
                      className="flex items-center justify-between gap-3 text-[13px]"
                    >
                      <span className="truncate text-[#595959]">
                        {typeNameById.get(line.objectiveTypeId) ||
                          'Objective type'}
                      </span>
                      <span className="shrink-0 font-semibold text-[#262626]">
                        {formatPercent(line.weightPercent)}
                      </span>
                    </li>
                  ))}
                  {(item.lines ?? []).length === 0 && (
                    <li className="text-[13px] text-[#8c8c8c]">
                      No weight lines configured.
                    </li>
                  )}
                </ul>
              </article>
            ))}
          </div>
        )}
      </div>

      <WeightAssignmentModal
        open={isModalOpen}
        assignment={editingAssignment}
        departmentOptions={departmentOptions}
        userOptions={userOptions}
        hasCompanyDefault={hasCompanyDefault}
        onClose={closeModal}
      />

      <DeleteModal
        open={Boolean(deleteTarget)}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={isDeleting}
        title="Delete weight assignment"
        deleteMessage={
          deleteTarget
            ? `Remove the ${SCOPE_LABELS[deleteTarget.scopeType].toLowerCase()} weight assignment for “${getAssignmentTitle(deleteTarget)}”?`
            : 'Remove this weight assignment?'
        }
        deleteText="Delete"
        cancelText="Cancel"
        hideImage
        danger
      />
    </AccessGuard>
  );
};

export default ObjectiveTypeWeightsPage;
