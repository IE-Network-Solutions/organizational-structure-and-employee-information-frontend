'use client';
import React from 'react';
import PageHeader from '@/components/common/pageHeader/pageHeader';
import { Button } from 'antd';
import { LuPlus } from 'react-icons/lu';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import BenefitTypeTable from './_components/benefitTypeTable';
import BenefitypeSideBar from './_components/benefitTypeSidebar';
import { useCompensationSettingStore } from '@/store/uistate/features/compensation/settings';

const BenefitTypePage = () => {
  const { setIsBenefitOpen } = useCompensationSettingStore();

  return (
    <>
      <PageHeader title="Bennefit Types" size="small">
        <AccessGuard permissions={[Permissions.CreateClosedDate]}>
          <Button
            size="large"
            type="primary"
            id="createNewClosedHolidayFieldId"
            icon={<LuPlus size={18} />}
            onClick={() => { setIsBenefitOpen(true)}}
          >
            New Benefit Type
          </Button>
        </AccessGuard>
      </PageHeader>

      <BenefitTypeTable />
      <BenefitypeSideBar />
    </>
  );
};

export default BenefitTypePage;