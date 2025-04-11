'use client';
import React from 'react';
import { useTimesheetSettingsStore } from '@/store/uistate/features/timesheet/settings';
import { useGetLeaveTypes } from '@/store/server/features/timesheet/leaveType/queries';
import PageHeader from '@/components/common/pageHeader/pageHeader';
import { Button } from 'antd';
import { LuPlus } from 'react-icons/lu';
import LeaveTypeCard from './_components/leaveTypeCard';
import TypesAndPoliciesSidebar from './_components/typesAndPoliciesSidebar';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import TypesAndPoliciesEdit from './_components/typesAndPoliciesEdit';

const Page = () => {
  const { setIsShowTypeAndPoliciesSidebar } = useTimesheetSettingsStore();
  const { data } = useGetLeaveTypes();
  return (
    <>
      <div className="relative">
        <div className="absolute top-0 left-0 w-full h-1/2 mb-5 ">
          <PageHeader title="Types and Policies" size="small">
            <AccessGuard permissions={[Permissions.CreateLeaveType]}>
              <Button
                size="large"
                type="primary"
                icon={<LuPlus size={18} />}
                id={`createNewTypesAndPoliciesButtonId`}
                onClick={() => setIsShowTypeAndPoliciesSidebar(true)}
              >
                <span className="hidden md:inline"> New Type</span>
              </Button>
            </AccessGuard>
          </PageHeader>
        </div>
      </div>
      <div className="w-full overflow-x-auto p-2 mt-12">
        {data &&
          data.items.map((item) => <LeaveTypeCard key={item.id} item={item} />)}
      </div>

      <TypesAndPoliciesSidebar />
      <TypesAndPoliciesEdit />
    </>
  );
};

export default Page;
