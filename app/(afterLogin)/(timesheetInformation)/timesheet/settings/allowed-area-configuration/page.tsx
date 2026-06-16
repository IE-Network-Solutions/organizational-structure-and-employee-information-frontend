'use client';

import React, { useMemo, useState } from 'react';
import { useGetAllowedAreaConfigurations } from '@/store/server/features/timesheet/allowedAreaConfiguration/queries';
import { useGetDepartments } from '@/store/server/features/employees/employeeManagment/department/queries';
import { flattenDepartments } from '@/utils/approval/departmentHelpers';
import ConfigCard from './_components/configCard';
import AllowedAreaConfigModal from './_components/allowedAreaConfigModal';
import { Empty, Select, Skeleton } from 'antd';

const Page = () => {
  const [departmentFilter, setDepartmentFilter] = useState<string | undefined>(
    undefined,
  );
  const { data: departmentsData } = useGetDepartments();
  const { data, isLoading } = useGetAllowedAreaConfigurations(departmentFilter);
  const items = data?.items ?? [];

  const departmentOptions = useMemo(
    () =>
      flattenDepartments((departmentsData as any[]) ?? []).map((dept) => ({
        value: dept.id,
        label: dept.name,
      })),
    [departmentsData],
  );

  return (
    <div
      id="time-attendance-settings-allowed-area-config-container"
      data-cy="time-attendance-settings-allowed-area-config-container"
    >
      <div
        className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
        id="time-attendance-settings-allowed-area-config-filters"
        data-cy="time-attendance-settings-allowed-area-config-filters"
      >
        <Select
          allowClear
          showSearch
          placeholder="Filter by department"
          className="w-full sm:w-72 h-10"
          value={departmentFilter}
          onChange={(value) => setDepartmentFilter(value)}
          options={departmentOptions}
          optionFilterProp="label"
          data-cy="time-attendance-settings-allowed-area-config-department-filter"
        />
      </div>

      <Skeleton
        loading={isLoading}
        active
        data-cy="time-attendance-settings-allowed-area-config-list-spin"
      >
        <div
          className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 border border-[#D9D9D9] rounded-lg p-4 min-h-[120px]"
          id="time-attendance-settings-allowed-area-config-cards-container"
          data-cy="time-attendance-settings-allowed-area-config-cards-container"
        >
          {items.length === 0 ? (
            <div
              className="col-span-full py-8"
              data-cy="time-attendance-settings-allowed-area-config-empty-container"
            >
              <Empty
                description="No allowed area configurations yet"
                data-cy="time-attendance-settings-allowed-area-config-empty"
              />
            </div>
          ) : (
            items.map((item) => (
              <ConfigCard
                key={item.id}
                item={item}
                data-cy={`time-attendance-settings-allowed-area-config-card-${item.id}`}
              />
            ))
          )}
        </div>
      </Skeleton>

      <AllowedAreaConfigModal />
    </div>
  );
};

export default Page;
