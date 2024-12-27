'use client';
import React from 'react';
import PageHeader from '@/components/common/pageHeader/pageHeader';
import { Button } from 'antd';
import { LuPlus } from 'react-icons/lu';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import AllowanceTypeTable from './_components/allowanceTypeTable';
import AllowanceTypeSideBar from './_components/allowanceTypeSidebar';
import { useCompensationSettingStore } from '@/store/uistate/features/compensation/settings';

const AllowanceTypePage = () => {
  const { setIsAllowanceOpen } = useCompensationSettingStore();

  return (
    <>
      <PageHeader title="Allowance Types" size="small">
        <AccessGuard permissions={[Permissions.CreateClosedDate]}>
          <Button
            size="large"
            type="primary"
            id="createNewClosedHolidayFieldId"
            icon={<LuPlus size={18} />}
            onClick={() => { setIsAllowanceOpen(true)}}
          >
            New Allowance Type
          </Button>
        </AccessGuard>
      </PageHeader>
      <AllowanceTypeSideBar />
      <AllowanceTypeTable />
    </>
  );
};

export default AllowanceTypePage;