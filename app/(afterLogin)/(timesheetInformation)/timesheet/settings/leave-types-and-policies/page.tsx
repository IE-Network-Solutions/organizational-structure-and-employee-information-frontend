'use client';
import React from 'react';
import { useTimesheetSettingsStore } from '@/store/uistate/features/timesheet/settings';
import { useGetLeaveTypes } from '@/store/server/features/timesheet/leaveType/queries';
import { Button } from 'antd';
import LeaveTypeCard from './_components/leaveTypeCard';
import TypesAndPoliciesSidebar from './_components/typesAndPoliciesSidebar';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import TypesAndPoliciesEdit from './_components/typesAndPoliciesEdit';
import { FaPlus } from 'react-icons/fa';

const Page = () => {
  const { setIsShowTypeAndPoliciesSidebar } = useTimesheetSettingsStore();
  const { data } = useGetLeaveTypes();
  return (
    <div
      className="p-5 rounded-2xl bg-white h-full"
      id="time-attendance-settings-leave-types-and-policies-container"
      data-cy="time-attendance-settings-leave-types-and-policies-container"
    >
      <div
        className="flex justify-between mb-4"
        id="time-attendance-settings-leave-types-and-policies-header"
        data-cy="time-attendance-settings-leave-types-and-policies-header"
      >
        <h1
          className="text-lg text-bold"
          id="time-attendance-settings-leave-types-and-policies-title"
          data-cy="time-attendance-settings-leave-types-and-policies-title"
        >
          Types & Policies
        </h1>

        <AccessGuard
          permissions={[Permissions.CreateLeaveType]}
          data-cy="time-attendance-settings-leave-types-and-policies-add-button-access-guard"
        >
          <Button
            type="primary"
            icon={<FaPlus data-cy="time-attendance-settings-leave-types-and-policies-add-button-icon" />}
            id={`createNewTypesAndPoliciesButtonId`}
            data-cy="time-attendance-settings-leave-types-and-policies-add-button-id"
            onClick={() => setIsShowTypeAndPoliciesSidebar(true)}
            className="h-10 w-10 sm:w-auto"
          >
            <span
              className="hidden md:inline"
              id="time-attendance-settings-leave-types-and-policies-add-button-label"
              data-cy="time-attendance-settings-leave-types-and-policies-add-button-label"
            >
              {' '}
              New Type
            </span>
          </Button>
        </AccessGuard>
      </div>
      <div
        className="w-full overflow-x-auto scrollbar-none"
        id="time-attendance-settings-leave-types-and-policies-cards-container"
        data-cy="time-attendance-settings-leave-types-and-policies-cards-container"
      >
        {data &&
          data.items.map((item) => (
            <LeaveTypeCard
              key={item.id}
              item={item}
              data-cy={`time-attendance-settings-leave-types-and-policies-card-${item.id}`}
            />
          ))}
      </div>

      <TypesAndPoliciesSidebar data-cy="time-attendance-settings-leave-types-and-policies-sidebar" />
      <TypesAndPoliciesEdit data-cy="time-attendance-settings-leave-types-and-policies-edit-sidebar" />
    </div>
  );
};

export default Page;
