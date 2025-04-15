'use client';
import React from 'react';
import PageHeader from '@/components/common/pageHeader/pageHeader';
import { Button } from 'antd';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import BenefitTypeTable from './_components/benefitTypeTable';
import BenefitypeSideBar from './_components/benefitTypeSidebar';
import { useCompensationSettingStore } from '@/store/uistate/features/compensation/settings';
import { FaPlus } from 'react-icons/fa';

const BenefitTypePage = () => {
  const { setIsBenefitOpen } = useCompensationSettingStore();

  return (
    <>
      <PageHeader title="Benefit Types" size="small">
        <AccessGuard permissions={[Permissions.CreateBenefitType]}>
          <Button
            type="primary"
            id="createNewClosedHolidayFieldId"
            icon={<FaPlus />}
            onClick={() => {
              setIsBenefitOpen(true);
            }}
          >
            <span className="hidden lg:inline"> New Benefit Type</span>
          </Button>
        </AccessGuard>
      </PageHeader>
      <div className="flex overflow-x-auto scrollbar-none w-full ">
        <BenefitTypeTable />
      </div>
      <BenefitypeSideBar />
    </>
  );
};

export default BenefitTypePage;
