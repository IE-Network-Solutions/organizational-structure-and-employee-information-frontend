'use client';
import React from 'react';
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
    <div className="bg-white rounded-lg px-1 py-4 sm:px-6 ">
      <div className="flex justify-between mb-3 items-center">
        <h1 className="text-lg font-bold">Allowance Types</h1>
        <AccessGuard permissions={[Permissions.CreateAllowanceType]}>
          <Button
            type="primary"
            id="createNewClosedHolidayFieldId"
            icon={<FaPlus />}
            className="h-10"
            onClick={() => {
              setIsAllowanceOpen(true);
            }}
          >
            <span className="hidden lg:inline"> Allowance</span>
          </Button>
        </AccessGuard>
      </div>

      <AllowanceTypeSideBar />
      <div>
        <AllowanceTypeTable />
      </div>
    </div>
  );
};

export default AllowanceTypePage;
