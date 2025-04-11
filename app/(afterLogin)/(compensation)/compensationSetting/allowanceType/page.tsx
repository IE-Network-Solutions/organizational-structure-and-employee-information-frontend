'use client';
import React from 'react';
import PageHeader from '@/components/common/pageHeader/pageHeader';
import { Button } from 'antd';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import AllowanceTypeTable from './_components/allowanceTypeTable';
import AllowanceTypeSideBar from './_components/allowanceTypeSidebar';
import { useCompensationSettingStore } from '@/store/uistate/features/compensation/settings';
import { FaPlus } from 'react-icons/fa';

const AllowanceTypePage = () => {
  const { setIsAllowanceOpen } = useCompensationSettingStore();

  return (
    <>
      <PageHeader title="Allowance Types" size="small">
        <AccessGuard permissions={[Permissions.CreateAllowanceType]}>
          <Button
            type="primary"
            id="createNewClosedHolidayFieldId"
            icon={<FaPlus />}
            onClick={() => {
              setIsAllowanceOpen(true);
            }}
          >
            <span className="hidden lg:inline"> New Allowance Type</span>
          </Button>
        </AccessGuard>
      </PageHeader>
      <AllowanceTypeSideBar />
      <div className="flex overflow-x-auto scrollbar-none w-full ">
        <AllowanceTypeTable />
      </div>
    </>
  );
};

export default AllowanceTypePage;
