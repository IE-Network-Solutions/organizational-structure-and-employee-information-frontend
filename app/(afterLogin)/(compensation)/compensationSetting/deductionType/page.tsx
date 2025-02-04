'use client';
import React from 'react';
import PageHeader from '@/components/common/pageHeader/pageHeader';
import { Button } from 'antd';
import { LuPlus } from 'react-icons/lu';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import { useCompensationSettingStore } from '@/store/uistate/features/compensation/settings';
import DeductionTypeTable from './_components/DeductionTypeTable';
import BenefitypeSideBar from './_components/DeductiontypeSideBar';
import DeductiontypeSideBar from './_components/DeductiontypeSideBar';

const DeductionTypePage = () => {
  const { setIsDeductionOpen } = useCompensationSettingStore();

  return (
    <>
      <PageHeader title="Deduction Types" size="small">
        <AccessGuard permissions={[Permissions.CreateBenefitType]}>
          <Button
            size="large"
            type="primary"
            id="createNewClosedHolidayFieldId"
            icon={<LuPlus size={18} />}
            onClick={() => {
                setIsDeductionOpen(true);
            }}
          >
            New Deduction Type
          </Button>
        </AccessGuard>
      </PageHeader>

      <DeductionTypeTable />
      <DeductiontypeSideBar />
    </>
  );
};

export default DeductionTypePage;
