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
    <div className="p-5 rounded-2xl bg-white h-full">
      <div className="flex justify-between mb-4">
        <h1 className="text-lg text-bold">Types & Policies</h1>

        <AccessGuard permissions={[Permissions.CreateLeaveType]}>
          <Button
            type="primary"
            icon={<FaPlus />}
            id={`createNewTypesAndPoliciesButtonId`}
            onClick={() => setIsShowTypeAndPoliciesSidebar(true)}
            className="h-10 w-10 sm:w-auto"
          >
            <span className="hidden md:inline"> New Type</span>
          </Button>
        </AccessGuard>
      </div>
      <div className="w-full overflow-x-auto scrollbar-none">
        {data &&
          data.items.map((item) => <LeaveTypeCard key={item.id} item={item} />)}
      </div>

      <TypesAndPoliciesSidebar />
      <TypesAndPoliciesEdit />
    </div>
  );
};

export default Page;
