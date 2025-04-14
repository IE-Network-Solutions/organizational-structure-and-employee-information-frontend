'use client';
import React from 'react';
import PageHeader from '@/components/common/pageHeader/pageHeader';
import { Button } from 'antd';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import { useCompensationSettingStore } from '@/store/uistate/features/compensation/settings';
import DeductionTypeTable from './_components/DeductionTypeTable';
// import BenefitypeSideBar from './_components/DeductiontypeSideBar';
import DeductiontypeSideBar from './_components/DeductiontypeSideBar';
import { FaPlus } from 'react-icons/fa';

const DeductionTypePage = () => {
  const { setIsDeductionOpen } = useCompensationSettingStore();

  return (
    <>
      <PageHeader title="Deduction Types" size="small">
        <AccessGuard permissions={[Permissions.CreateBenefitType]}>
          <Button
            type="primary"
            id="createNewClosedHolidayFieldId"
            icon={<FaPlus />}
            onClick={() => {
              setIsDeductionOpen(true);
            }}
          >
            <span className="hidden lg:inline"> New DeductionT ype</span>
          </Button>
        </AccessGuard>
      </PageHeader>
      <div className="flex overflow-x-auto scrollbar-none w-full ">
        <DeductionTypeTable />
      </div>
      <DeductiontypeSideBar />
    </>
  );
};

export default DeductionTypePage;
