import React, { useEffect, useState } from 'react';
import { Select, Modal } from 'antd';
import { useGetUserDepartment } from '@/store/server/features/okrplanning/okr/department/queries';
import { useGetMetrics } from '@/store/server/features/okrplanning/okr/metrics/queries';
import { useGetAllUsers } from '@/store/server/features/okrplanning/okr/users/queries';
import {
  useGetActiveFiscalYears,
  useGetAllFiscalYears,
} from '@/store/server/features/organizationStructure/fiscalYear/queries';
import { useOKRStore } from '@/store/uistate/features/okrplanning/okr';
import CustomButton from '@/components/common/buttons/customButton';
import { LuSettings2 } from 'react-icons/lu';

const { Option } = Select;

const OkrSearch: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
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
  }, [getAllFiscalYears, fiscalYearId, okrTab]);

  const DepartmentWithUsers = Departments?.filter(
    (i: any) => i.users?.length > 0,
  );

  const handleFilter = (value: string, key: keyof typeof searchObjParams) => {
    setSearchObjParams(key, value);
  };

  const MobileFilterContent = () => (
    <div id="mobile-filter-content" className="flex flex-col gap-4">
      <h3 className="text-lg font-medium mb-2">Filter</h3>

      {/* Fiscal Year */}
      <div className="flex flex-col gap-2">
        <label className="text-sm text-gray-600">Fiscal year</label>
        <Select
          loading={fyLoading}
          disabled={okrTab != 4}
          value={fiscalYearId}
          id="mobile-fiscal-year-select"
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
      <div className="flex flex-col gap-2">
        <label className="text-sm text-gray-600">Session</label>
        <Select
          loading={fyLoading}
          value={sessionIds}
          disabled={okrTab != 4}
          id="mobile-session-select"
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
        <div className="flex flex-col gap-2">
          <label className="text-sm text-gray-600">Department</label>
          <Select
            id="mobile-department-select"
            placeholder="Filter by Department"
            className="w-full h-14"
            allowClear
            showSearch
            value={searchObjParams.departmentId}
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
        <div className="flex flex-col gap-2">
          <label className="text-sm text-gray-600">Metric Type</label>
          <Select
            id="mobile-metric-type-select"
            placeholder="Filter by Metric Type"
            className="w-full h-14"
            allowClear
            value={searchObjParams.metricTypeId}
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
  );

  return (
    <>
      {/* Desktop View */}
      <div id="desktop-search-filters" className="hidden md:block">
        <div className="grid grid-cols-12 gap-4">
          {/* User Filter */}
          {okrTab != 1 && (
            <div className="col-span-12 lg:col-span-4">
              <Select
                id="desktop-user-select"
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
              id="desktop-fiscal-year-select"
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
              id="desktop-session-select"
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
                id="desktop-department-select"
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
                id="desktop-metric-type-select"
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

      {/* Mobile View */}
      <div id="mobile-search-filters" className="md:hidden">
        <div className="flex justify-between gap-4 w-full">
          {okrTab != 1 && (
            <div className="flex-1">
              <Select
                id="mobile-user-select"
                showSearch
                placeholder="Select a person"
                className="w-full h-10"
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
          <div className={`${okrTab == 1 ? 'ml-auto' : ''}`}>
            <CustomButton
              id="mobile-filter-button"
              type="default"
              size="small"
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 border rounded-lg h-10"
              title=""
              icon={<LuSettings2 size={20} />}
            />
          </div>
        </div>

        <Modal
          open={isModalOpen}
          onCancel={() => setIsModalOpen(false)}
          footer={
            <div className="flex gap-2 justify-center mt-4">
              <CustomButton
                id="mobile-filter-cancel-button"
                onClick={() => setIsModalOpen(false)}
                className="px-6 py-2 border rounded-lg text-sm text-gray-900"
                title="Cancel"
                type="default"
              />
              <CustomButton
                id="mobile-filter-apply-button"
                title="Filter"
                type="primary"
                onClick={() => {
                  setIsModalOpen(false);
                }}
                className="px-6 py-2 text-white rounded-lg text-sm"
              />
            </div>
          }
          className="!m-4 md:hidden"
          style={{
            top: '20%',
            transform: 'translateY(-50%)',
            maxHeight: '90vh',
            overflowY: 'auto',
          }}
          width="90%"
          centered
        >
          <MobileFilterContent />
        </Modal>
      </div>
    </>
  );
};

export default OkrSearch;
