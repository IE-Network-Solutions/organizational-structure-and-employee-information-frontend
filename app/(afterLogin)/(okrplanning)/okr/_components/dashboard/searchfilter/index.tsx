import React, { useEffect } from 'react';
import { Select } from 'antd';
import { useGetUserDepartment } from '@/store/server/features/okrplanning/okr/department/queries';
import { useGetMetrics } from '@/store/server/features/okrplanning/okr/metrics/queries';
import { useGetAllUsers } from '@/store/server/features/okrplanning/okr/users/queries';
import {
  useGetActiveFiscalYears,
  useGetAllFiscalYears,
} from '@/store/server/features/organizationStructure/fiscalYear/queries';
import { useOKRStore } from '@/store/uistate/features/okrplanning/okr';

const { Option } = Select;

const OkrSearch: React.FC = () => {
  const {
    searchObjParams,
    setSearchObjParams,
    okrTab,
    setFiscalYearId,
    fiscalYearId,
    setSessionIds,
    sessionIds,
  } = useOKRStore();

  const { data: getAllFiscalYears, isLoading: fyLoading } =
    useGetAllFiscalYears();
  const { data: getActiveFisicalYear } = useGetActiveFiscalYears();
  const { data: Metrics } = useGetMetrics();
  const { data: allUsers } = useGetAllUsers();
  const { data: Departments } = useGetUserDepartment();
  useEffect(() => {
    const selectedFiscalYear = fiscalYearId
      ? getAllFiscalYears?.items?.find((i) => i?.id == fiscalYearId)
      : getActiveFisicalYear;

    if (!selectedFiscalYear) {
      setFiscalYearId(''); // or null, depending on your app
      setSessionIds([]);
      return;
    }

    const sessionIds =
      selectedFiscalYear?.sessions?.map((item: any) => item.id) || [];
    setSessionIds(sessionIds);
    setFiscalYearId(selectedFiscalYear?.id || '');
  }, [getAllFiscalYears, fiscalYearId, getActiveFisicalYear, okrTab]);

  const DepartmentWithUsers = Departments?.filter(
    (i: any) => i.users?.length > 0,
  );

  const handleFilter = (value: string, key: keyof typeof searchObjParams) => {
    setSearchObjParams(key, value);
  };
  return (
    <div className="w-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-12 gap-4">
        {/* User Filter */}
        {okrTab != 1 && (
          <div className="col-span-12 lg:col-span-4">
            <Select
              showSearch
              placeholder="Select a person"
              className="w-full h-14"
              allowClear
              onChange={(value) => handleFilter(value, 'userId')}
              filterOption={(input: any, option: any) =>
                (option?.label ?? '')
                  ?.toLowerCase()
                  .includes(input.toLowerCase())
              }
              options={allUsers?.items?.map((item: any) => ({
                ...item,
                value: item?.id,
                label:
                  item?.firstName +
                  ' ' +
                  item?.middleName +
                  ' ' +
                  item?.lastName,
              }))}
            />
          </div>
        )}

        {/* Fiscal Year */}
        <div className={`${okrTab == 4 ? 'col-span-3' : 'col-span-2'}`}>
          <Select
            loading={fyLoading}
            disabled={okrTab != 4}
            value={fiscalYearId}
            id={`selectFiscalYear`}
            placeholder="Filter by Fiscal Year"
            onChange={(value) => setFiscalYearId(value)}
            allowClear
            showSearch
            className="w-full h-14"
            optionFilterProp="children"
            filterOption={(input, option) =>
              (option?.children as any)
                .toLowerCase()
                .includes(input.toLowerCase())
            }
          >
            {getAllFiscalYears?.items?.map((item: any) => (
              <Select.Option key={item?.id} value={item?.id}>
                {item?.name}
              </Select.Option>
            ))}
          </Select>
        </div>

        {/* Session */}
        <div className={`${okrTab == 4 ? 'col-span-3' : 'col-span-2'}`}>
          <Select
            loading={fyLoading}
            value={sessionIds}
            disabled={okrTab != 4}
            placeholder="Filter by Session"
            mode="multiple"
            className="w-full h-14 overflow-y-auto text-[10px]"
            allowClear
            showSearch
            onChange={setSessionIds}
            filterOption={(input, option) =>
              (option?.children as any)
                .toLowerCase()
                .includes(input.toLowerCase())
            }
          >
            {getAllFiscalYears?.items
              ?.find((fy: any) => fy.id === fiscalYearId)
              ?.sessions?.map((session: any) => (
                <Option key={session.id} value={session.id}>
                  {session.name}
                </Option>
              ))}
          </Select>
        </div>

        {/* Department */}
        {okrTab != 1 && (
          <div className={`${okrTab == 4 ? 'col-span-2' : 'col-span-2'}`}>
            <Select
              placeholder="Filter by Department"
              className="w-full h-14"
              allowClear
              showSearch
              onChange={(value) => handleFilter(value, 'departmentId')}
              filterOption={(input, option) =>
                (option?.children as any)
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
            >
              {DepartmentWithUsers?.map((dept: any) => (
                <Option key={dept.id} value={dept.id}>
                  {dept.name}
                </Option>
              ))}
            </Select>
          </div>
        )}

        {/* Metric Type */}
        {okrTab != 4 && (
          <div className="col-span-12 lg:col-span-2">
            <Select
              placeholder="Filter by Metric Type"
              className="w-full h-14"
              allowClear
              onChange={(value) => handleFilter(value, 'metricTypeId')}
            >
              <Option value="">All</Option>
              {Metrics?.items?.map((metric: any) => (
                <Option key={metric.id} value={metric.id}>
                  {metric.name}
                </Option>
              ))}
            </Select>
          </div>
        )}
      </div>
    </div>
  );
};

export default OkrSearch;
