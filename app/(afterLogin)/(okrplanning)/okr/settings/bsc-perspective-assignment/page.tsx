'use client';

import React, { useMemo } from 'react';
import { Input, Select, Space } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import EmptyState from '@/components/empty';
import {
  useGetBscCycles,
  useGetBscKpiLibrary,
  useGetBscRolePerspectives,
} from '@/store/server/features/bsc/queries';
import { useBscUiStore } from '@/store/uistate/features/bsc';
import { buildRoleList } from '../bsc-setup/_utils/roleList';
import AssignPerspectivesModal from './_components/AssignPerspectivesModal';

const { Option } = Select;

export default function BscPerspectiveAssignmentPage() {
  const router = useRouter();
  const {
    roleSearch,
    setRoleSearch,
    roleDepartmentFilter,
    setRoleDepartmentFilter,
    openAssignPerspectives,
  } = useBscUiStore();

  const { data: configs, isLoading: configsLoading } = useGetBscCycles();
  const { data: kpis, isLoading: kpisLoading } = useGetBscKpiLibrary();
  const { data: allocations, isLoading: allocationsLoading } =
    useGetBscRolePerspectives();

  const roles = useMemo(
    () => buildRoleList(configs || [], kpis || [], allocations || []),
    [configs, kpis, allocations],
  );

  const departments = useMemo(() => {
    const set = new Set<string>();
    roles.forEach((r) => r.departmentNames.forEach((d) => set.add(d)));
    return Array.from(set).sort();
  }, [roles]);

  const filtered = useMemo(() => {
    const q = roleSearch.trim().toLowerCase();
    return roles.filter((r) => {
      if (
        roleDepartmentFilter &&
        !r.departmentNames.some((d) => d === roleDepartmentFilter)
      ) {
        return false;
      }
      if (!q) return true;
      return (
        r.positionTitle.toLowerCase().includes(q) ||
        r.departmentNames.some((d) => d.toLowerCase().includes(q))
      );
    });
  }, [roles, roleSearch, roleDepartmentFilter]);

  const allocationFor = (role: (typeof roles)[number]) =>
    (allocations || []).find((row) => {
      if (row.evaluationConfigId !== role.evaluationConfigId) return false;
      if (role.positionId && row.positionId) {
        return row.positionId === role.positionId;
      }
      return (
        row.positionTitle.toLowerCase() === role.positionTitle.toLowerCase()
      );
    });

  const loading = configsLoading || kpisLoading || allocationsLoading;

  return (
    <div className="w-full" data-cy="bsc-perspective-assignment-page">
      <div
        data-cy="okr-settings-bsc-perspective-assignment-page-tsx-page-div-77"
        className="rounded-xl pt-5 px-8 pb-8 bg-white min-h-[400px]"
      >
        {loading ? (
          <div
            data-cy="okr-settings-bsc-perspective-assignment-page-tsx-page-div-79"
            className="py-16 text-center text-gray-400"
          >
            Loading…
          </div>
        ) : roles.length === 0 ? (
          <div
            data-cy="okr-settings-bsc-perspective-assignment-page-tsx-page-div-81"
            className="flex min-h-[280px] items-center justify-center py-8"
          >
            <EmptyState
              title="No roles assigned yet"
              description={
                configs?.length
                  ? 'Pick any organizational role and assign catalog perspectives with weights.'
                  : 'Create a BSC setup first, then assign perspectives to any role.'
              }
              actionText={
                configs?.length ? 'Assign to a role' : 'Go to BSC Setup'
              }
              onAction={() =>
                configs?.length
                  ? openAssignPerspectives()
                  : router.push('/okr/settings/bsc-setup')
              }
            />
          </div>
        ) : (
          <>
            <Space className="mb-6 w-full" wrap>
              <Input
                allowClear
                placeholder="Search roles or departments"
                prefix={<SearchOutlined />}
                value={roleSearch}
                onChange={(e) => setRoleSearch(e.target.value)}
                className="w-72"
                data-cy="bsc-assignment-role-search"
              />
              <Select
                allowClear
                placeholder="Filter by department"
                className="w-56"
                value={roleDepartmentFilter}
                onChange={setRoleDepartmentFilter}
              >
                {departments.map((d) => (
                  <Option key={d} value={d}>
                    {d}
                  </Option>
                ))}
              </Select>
            </Space>

            <div
              data-cy="okr-settings-bsc-perspective-assignment-page-tsx-page-div-126"
              className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
            >
              {filtered.map((role) => {
                const allocation = allocationFor(role);
                const weightEntries = allocation
                  ? Object.entries(allocation.weights).filter(
                      ([, weight]) => Number(weight) > 0,
                    )
                  : [];
                return (
                  <div
                    key={role.key}
                    className="relative rounded-[12px] bg-[#F9FAFB] p-5 transition-shadow hover:shadow-sm cursor-pointer"
                    onClick={() =>
                      router.push(
                        `/okr/settings/bsc-perspective-assignment/role/${encodeURIComponent(role.key)}`,
                      )
                    }
                    data-cy={`bsc-assignment-role-card-${role.key}`}
                  >
                    <p
                      data-cy="okr-settings-bsc-perspective-assignment-page-tsx-page-p-145"
                      className="mb-4 text-[15px] font-semibold leading-tight text-[#262626]"
                    >
                      {role.positionTitle}
                    </p>
                    <div
                      data-cy="okr-settings-bsc-perspective-assignment-page-tsx-page-div-148"
                      className="flex flex-wrap items-center gap-2"
                    >
                      {role.departmentNames.slice(0, 2).map((d) => (
                        <div
                          data-cy="okr-settings-bsc-perspective-assignment-page-tsx-page-div-150"
                          key={d}
                          className="rounded-[6px] border border-[#d9d9d9] bg-[#fafafa] px-3 py-1.5 text-[12px] text-[#595959]"
                        >
                          {d}
                        </div>
                      ))}
                      {weightEntries.length ? (
                        weightEntries.map(([name, weight]) => (
                          <div
                            data-cy="okr-settings-bsc-perspective-assignment-page-tsx-page-div-159"
                            key={name}
                            className="rounded-[6px] border border-[#d9d9d9] bg-[#fafafa] px-3 py-1.5 text-[12px] text-[#595959]"
                          >
                            {name} {weight}%
                          </div>
                        ))
                      ) : (
                        <div
                          data-cy="okr-settings-bsc-perspective-assignment-page-tsx-page-div-167"
                          className="rounded-[6px] border border-[#d9d9d9] bg-[#fafafa] px-3 py-1.5 text-[12px] text-[#595959]"
                        >
                          Not assigned
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {!filtered.length && (
              <div
                data-cy="okr-settings-bsc-perspective-assignment-page-tsx-page-div-178"
                className="py-12 text-center text-gray-400"
              >
                No roles match your search
              </div>
            )}
          </>
        )}
      </div>
      <AssignPerspectivesModal />
    </div>
  );
}
