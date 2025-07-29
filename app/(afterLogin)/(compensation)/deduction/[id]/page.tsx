'use client';
import React, { useEffect } from 'react';
import PageHeader from '@/components/common/pageHeader/pageHeader';
import { useParams } from 'next/navigation';
import { useFetchAllowance } from '@/store/server/features/compensation/allowance/queries';
import { useAllowanceEntitlementStore } from '@/store/uistate/features/compensation/allowance';
import { Button, Select } from 'antd';
import AccessGuard from '@/utils/permissionGuard';
import { FaPlus } from 'react-icons/fa';
import { Permissions } from '@/types/commons/permissionEnum';
import BenefitEntitlementTable from '../../benefit/[id]/_components/benefitEntitelmentTable';
import { useBenefitEntitlementStore } from '@/store/uistate/features/compensation/benefit';

const SingleDeductionPage = () => {
  const { id } = useParams();
  const { data: deductionData } = useFetchAllowance(id);
  const { setIsAllowanceGlobal, isAllowanceGlobal } =
    useAllowanceEntitlementStore();
  const { setIsBenefitEntitlementSidebarOpen } = useBenefitEntitlementStore();
  useEffect(() => {
    if (deductionData?.applicableTo === 'GLOBAL') {
      setIsAllowanceGlobal(true);
    } else {
      setIsAllowanceGlobal(false);
    }
  }, [deductionData, setIsAllowanceGlobal]);

  return (
    <div className="bg-white rounded-lg px-1 py-4 sm:p-6">
      <div>
        {/* PageHeader for mobile */}
        <div className="block sm:hidden mb-4">
          <PageHeader
            title={
              deductionData?.name
                ? deductionData?.name.length > 15
                  ? deductionData?.name.slice(0, 15) + '...'
                  : deductionData?.name
                : ''
            }
            size="small"
            toolTip={deductionData?.name}
            horizontalPadding="px-0"
          ></PageHeader>
        </div>
        {/* Main layout for larger screens */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div className="hidden sm:block">
            <PageHeader
              title={
                deductionData?.name
                  ? deductionData?.name.length > 15
                    ? deductionData?.name.slice(0, 15) + '...'
                    : deductionData?.name
                  : ''
              }
              size="small"
              toolTip={deductionData?.name}
              horizontalPadding="px-0"
            ></PageHeader>
          </div>
          <div className="flex w-full sm:w-auto sm:flex-row sm:gap-4">
            <div className="w-5/6 sm:w-72 mr-2">
              {/* <Input addonBefore={<SearchOutlined />} placeholder="Search by name" size='small' /> */}
              <Select
                showSearch
                allowClear
                className="h-10 w-full"
                placeholder="Search by name"
              />
            </div>
            {/* Button: 15% on mobile */}
            <div className="w-auto">
              <AccessGuard
                permissions={[Permissions.CreateAllowanceEntitlement]}
              >
                <Button
                  size="large"
                  type="primary"
                  id="createNewClosedHolidayFieldId"
                  className="h-10 w-10 sm:w-full"
                  icon={<FaPlus />}
                  onClick={() => {
                    setIsBenefitEntitlementSidebarOpen(true);
                  }}
                  disabled={isAllowanceGlobal}
                >
                  <span className="hidden sm:inline">Employees</span>
                </Button>
              </AccessGuard>
            </div>
          </div>
        </div>
      </div>
      <div>
        {/* <DeductionEntitlementTable /> */}

        <BenefitEntitlementTable
          title={deductionData?.name ? deductionData?.name : ''}
        />
      </div>
    </div>
  );
};

export default SingleDeductionPage;
