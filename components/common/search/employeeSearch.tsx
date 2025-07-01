'use client';
import React, { useState } from 'react';
import { Button, Modal, Select } from 'antd';

import { PlanningAndReportingStore } from '@/store/uistate/features/planningAndReporting/useStore';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import { useGetAllUsers } from '@/store/server/features/employees/employeeManagment/queries';
import { useIsMobile } from '@/hooks/useIsMobile';
import { VscSettings } from 'react-icons/vsc';

const { Option } = Select;
interface Option {
  key: string;
  value: string;
}

interface EmployeeSearchProps {
  optionArray1?: any;
  optionArray2?: Option[];
  optionArray3?: any;
}

const EmployeeSearch: React.FC<EmployeeSearchProps> = ({
  optionArray2,
  optionArray1,
  optionArray3,
}) => {
  const { setSelectedUser, selectedUser } = PlanningAndReportingStore();
  const { data: employeeData } = useGetAllUsers();
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const { userId } = useAuthenticationStore();
  const { isMobile } = useIsMobile();
  /*eslint-disable @typescript-eslint/no-unused-vars */
  const getUserIdsByDepartmentId = (selectedDepartmentId: string) => {
    const department = optionArray3.find(
      (dep: any) => dep.id === selectedDepartmentId,
    );
    if (department && department.users) {
      return department.users.map((user: any) => user.id); // Returns array of user IDs
    }
    return []; // Returns empty array if no department or users found
  };

  // const onSearchChange = useDebounce(handleSearchEmployee, 2000);
  const onSearchChange = (value: any, key: string, isSelect: boolean) => {
    setSelectedUser(['']);
    if (key === 'employee') {
      setSelectedUser([value]);
    } else if (key === 'type') {
      if (value === 'allPlan' || value === 'allReport') {
        setSelectedUser(['all']);
      } else if (value === 'subordinatePlan' || value === 'subordinateReport') {
        const subordinates = employeeData.items
          .filter((employee: any) => employee.reportingTo?.id === userId)
          .map((employee: any) => employee.id); // Get the IDs of subordinates

        setSelectedUser(
          subordinates.length > 0
            ? ['subordinate', ...subordinates]
            : ['subordinate'],
        );
      } else {
        setSelectedUser([userId]);
      }
    } else {
      const listOfUsersId = getUserIdsByDepartmentId(value);
      setSelectedUser([]);
      setSelectedUser(listOfUsersId);
    }
  };

  return (
    <>
      <div className="flex flex-col w-full">
        {isMobile ? (
          <div className="flex items-center gap-2 w-full">
            <div className="flex-1">
              <AccessGuard permissions={[Permissions.ViewAllEmployeePlan]}>
                <Select
                  placeholder="Select employee"
                  onChange={(value) => onSearchChange(value, 'employee', true)}
                  allowClear
                  showSearch
                  className="w-full h-10"
                  optionFilterProp="children"
                  filterOption={(input: any, option: any) => {
                    const optionText = option?.children?.toString();
                    return optionText?.toLowerCase().includes(input.toLowerCase());
                  }}
                >
                  {optionArray1?.map((item: any) => {
                    let displayFirstName = item?.firstName || '';
                    let displayMiddleName = item?.middleName || '';

                    const maxNameLength = 10;
                    if (displayFirstName.length > maxNameLength) {
                      displayFirstName = displayFirstName.substring(0, maxNameLength) + '...';
                    }
                    if (displayMiddleName.length > maxNameLength) {
                      displayMiddleName = displayMiddleName.substring(0, maxNameLength) + '...';
                    }

                    const fullName = displayFirstName || displayMiddleName
                      ? `${displayFirstName} ${displayMiddleName}`.trim()
                      : 'Unnamed Employee';

                    return (
                      <Option value={item.id} key={item.id}>
                        {fullName}
                      </Option>
                    );
                  })}
                </Select>
              </AccessGuard>
            </div>
            <button
              onClick={() => setIsFilterModalOpen(true)}
              className="p-2 border border-gray-300 rounded-lg"
            >
              <VscSettings size={20} />
            </button>
          </div>
        ) : (
          <div className="flex flex-wrap w-full">
            <div className="w-full md:w-1/2 p-2">
              <AccessGuard permissions={[Permissions.ViewAllEmployeePlan]}>
                <Select
                  placeholder="Select Employee"
                  onChange={(value) => onSearchChange(value, 'employee', true)}
                  allowClear
                  showSearch
                  className="w-full h-14"
                  optionFilterProp="children"
                  filterOption={(input: any, option: any) => {
                    const optionText = option?.children?.toString();
                    return optionText?.toLowerCase().includes(input.toLowerCase());
                  }}
                >
                  {optionArray1?.map((item: any) => {
                    let displayFirstName = item?.firstName || '';
                    let displayMiddleName = item?.middleName || '';

                    const maxNameLength = 10;
                    if (displayFirstName.length > maxNameLength) {
                      displayFirstName = displayFirstName.substring(0, maxNameLength) + '...';
                    }
                    if (displayMiddleName.length > maxNameLength) {
                      displayMiddleName = displayMiddleName.substring(0, maxNameLength) + '...';
                    }

                    const fullName = displayFirstName || displayMiddleName
                      ? `${displayFirstName} ${displayMiddleName}`.trim()
                      : 'Unnamed Employee';

                    return (
                      <Option value={item.id} key={item.id}>
                        {fullName}
                      </Option>
                    );
                  })}
                </Select>
              </AccessGuard>
            </div>
            <div className="w-full md:w-1/4 p-2" id="subscriptionTypeFilter">
              <AccessGuard permissions={[Permissions.ViewAllPlan]}>
                <Select
                  placeholder="Select Type"
                  value={
                    selectedUser.includes('all')
                      ? 'All User'
                      : selectedUser.includes('subordinate')
                        ? 'Subordinate'
                        : selectedUser.length === 1 && selectedUser.includes(userId)
                          ? optionArray2?.[0]?.key
                          : undefined
                  }
                  onChange={(value) => onSearchChange(value, 'type', true)}
                  allowClear
                  className="w-full h-14"
                >
                  {optionArray2?.map((item) => (
                    <Option key={item.key} value={item.key}>
                      {item.value}
                    </Option>
                  ))}
                </Select>
              </AccessGuard>
            </div>
            <div className="w-full md:w-1/4 p-2" id="subscriptionStatusFilter">
              <AccessGuard permissions={[Permissions.ViewAllStatusPlan]}>
                <Select
                  id={`selectDepartment`}
                  placeholder="Select Department"
                  onChange={(value) => onSearchChange(value, 'status', true)}
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
                  {optionArray3?.map((item: any) => (
                    <Select.Option key={item?.id} value={item?.id}>
                      {item?.name}
                    </Select.Option>
                  ))}
                </Select>
              </AccessGuard>
            </div>
          </div>
        )}
      </div>

      <Modal
        title="Filters"
        open={isFilterModalOpen}
        onCancel={() => setIsFilterModalOpen(false)}
        footer={
          <div className="flex justify-end items-center gap-2">
            <Button key="cancel" onClick={() => setIsFilterModalOpen(false)}>
              Cancel
            </Button>
            <Button
              key="apply"
              type="primary"
              onClick={() => setIsFilterModalOpen(false)}
            >
              Apply Filters
            </Button>
          </div>
        }
        width={isMobile ? '95%' : '50%'}
        centered
      >
        <div className="space-y-4">
          <div>
            <AccessGuard permissions={[Permissions.ViewAllPlan]}>
              <Select
                placeholder="Select Type"
                value={
                  selectedUser.includes('all')
                    ? 'All User'
                    : selectedUser.includes('subordinate')
                      ? 'Subordinate'
                      : selectedUser.length === 1 && selectedUser.includes(userId)
                        ? optionArray2?.[0]?.key
                        : undefined
                }
                onChange={(value) => onSearchChange(value, 'type', true)}
                allowClear
                className="w-full h-14"
              >
                {optionArray2?.map((item) => (
                  <Option key={item.key} value={item.key}>
                    {item.value}
                  </Option>
                ))}
              </Select>
            </AccessGuard>
          </div>

          <div>
            <AccessGuard permissions={[Permissions.ViewAllStatusPlan]}>
              <Select
                id={`selectDepartment`}
                placeholder="Select Department"
                onChange={(value) => onSearchChange(value, 'status', true)}
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
                {optionArray3?.map((item: any) => (
                  <Select.Option key={item?.id} value={item?.id}>
                    {item?.name}
                  </Select.Option>
                ))}
              </Select>
            </AccessGuard>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default EmployeeSearch;
