'use client';
import React from 'react';
import { Select } from 'antd';

import { PlanningAndReportingStore } from '@/store/uistate/features/planningAndReporting/useStore';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';

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
  const { userId } = useAuthenticationStore();
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
    <div className="flex flex-col items-center space-y-4 w-full pb-4">
      <div className="flex flex-wrap w-full">
        <div className="w-full md:w-1/2 p-2">
          <AccessGuard permissions={[Permissions.ViewAllEmployeePlan]}>
            <Select
              placeholder="Select Employee"
              onChange={(value) => onSearchChange(value, 'employee', true)}
              allowClear
              showSearch
              className="w-full h-14"
              optionFilterProp="children" // Defines which part of the Option is filtered
              filterOption={(input: any, option: any) => {
                const optionText = option?.children?.toString(); // Ensure it's a string
                return optionText?.toLowerCase().includes(input.toLowerCase());
              }}
            >
              {optionArray1?.map((item: any) => {
                let displayFirstName = item.firstName || ''; // Handle null firstName
                let displayMiddleName = item.middleName || ''; // Handle null middleName

                // Truncate long names
                const maxNameLength = 10;
                if (displayFirstName.length > maxNameLength) {
                  displayFirstName =
                    displayFirstName.substring(0, maxNameLength) + '...';
                }
                if (displayMiddleName.length > maxNameLength) {
                  displayMiddleName =
                    displayMiddleName.substring(0, maxNameLength) + '...';
                }

                // Construct full name
                const fullName =
                  displayFirstName || displayMiddleName
                    ? `${displayFirstName} ${displayMiddleName}`.trim()
                    : 'Unnamed Employee'; // Fallback name

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
                selectedUser.length === 1 && selectedUser.includes(userId)
                  ? optionArray2?.[0]?.key // Exactly one user selected, and it's the current user
                  : selectedUser.length > 1
                    ? undefined // Multiple users selected
                    : selectedUser.includes('all')
                      ? 'All User' // If "all" is selected, choose 'allPlan'
                      : undefined // Default fallback if no conditions match
              }
              onChange={(value) => onSearchChange(value, 'type', true)}
              allowClear
              className="w-full h-14"
            >
              {optionArray2?.map((item, index) => (
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
              placeholder="status"
              onChange={(value) => onSearchChange(value, 'status', true)}
              allowClear
              className="w-full h-14"
            >
              {optionArray3?.map((item: any, index: number) => (
                <Option key={index} value={item.id}>
                  {item.name}
                </Option>
              ))}
            </Select>
          </AccessGuard>
        </div>
      </div>
    </div>
  );
};

export default EmployeeSearch;
