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
      <PageHeader title="Types and Policies" size="small">
        <AccessGuard permissions={[Permissions.CreateLeaveType]}>
          <Button
            size="large"
            type="primary"
            icon={<LuPlus size={18} />}
            id={`createNewTypesAndPoliciesButtonId`}
            onClick={() => setIsShowTypeAndPoliciesSidebar(true)}
          >
            New Type
          </Button>
        </AccessGuard>
      </PageHeader>

      {data &&
        data.items.map((item) => <LeaveTypeCard key={item.id} item={item} />)}

      <TypesAndPoliciesSidebar />
      <TypesAndPoliciesEdit />
    </>
  );
};

export default Page;
