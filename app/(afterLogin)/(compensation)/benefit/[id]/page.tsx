'use client';
import React, { useEffect } from 'react';
import PageHeader from '@/components/common/pageHeader/pageHeader';
import BenefitEntitlementTable from './_components/benefitEntitelmentTable';
import { useFetchBenefit } from '@/store/server/features/compensation/benefit/queries';
import { useParams } from 'next/navigation';
import { useBenefitEntitlementStore } from '@/store/uistate/features/compensation/benefit';
import { Button, Select } from 'antd';
import { useAllowanceEntitlementStore } from '@/store/uistate/features/compensation/allowance';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import { useGetAllUsers } from '@/store/server/features/employees/employeeManagment/queries';
import { FaPlus } from 'react-icons/fa';

const BenefitEntitlemetPage = () => {
  const { id } = useParams();
  const { data: benefitData } = useFetchBenefit(id);
  const { setBenefitMode, setBenefitDefaultAmount, setBenefitApplicableTo } =
    useBenefitEntitlementStore();
  const { setIsBenefitEntitlementSidebarOpen, BenefitApplicableTo } =
    useBenefitEntitlementStore();
  const { data: employeeData } = useGetAllUsers();

  const { setSearchQuery } = useAllowanceEntitlementStore();

  useEffect(() => {
    setBenefitMode(benefitData?.mode);
    setBenefitApplicableTo(benefitData?.applicableTo);
    if (benefitData?.mode == 'CREDIT') {
      setBenefitDefaultAmount(benefitData?.defaultAmount);
    }
  }, [benefitData, setBenefitMode]);

  const handleSearchChange = (value: any) => {
    setSearchQuery(value);
  };

  const handleBenefitEntitlementAdd = () => {
    setIsBenefitEntitlementSidebarOpen(true);
  };

  const options =
    employeeData?.items?.map((emp: any) => ({
      value: emp.id,
      label: `${emp?.firstName || ''} ${emp?.middleName} ${emp?.lastName}`, // Full name as label
      employeeData: emp,
    })) || [];
    const { employeeBenefitData } =
    useBenefitEntitlementStore();
  return (
    <div className="bg-white rounded-lg px-1 py-2 sm:px-6 sm:mr-4">
      <div>
      {employeeBenefitData == null && (
        <div>
        {/* PageHeader for mobile only */}
        <div className="block sm:hidden mb-4">
          <PageHeader
            title={
              benefitData?.name
                ? benefitData.name.length > 15
                  ? benefitData.name.slice(0, 15) + '...'
                  : benefitData.name
                : ''
            }
            toolTip={benefitData?.name}
            horizontalPadding="0px"
          />
        </div>

        {/* Header and controls layout for larger screens */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 pt-2">
          {/* PageHeader for larger screens only */}
          <div className="hidden sm:block">
            <PageHeader
              title={
                benefitData?.name
                  ? benefitData.name.length > 15
                    ? benefitData.name.slice(0, 15) + '...'
                    : benefitData.name
                  : ''
              }
              toolTip={benefitData?.name}
              horizontalPadding="0px"
            />
          </div>

          {/* Select and Button layout */}
          <div className="flex flex-row w-full sm:w-auto gap-2">
            {/* Select - takes 75% on mobile, fixed width on desktop */}
            <div className="w-10/12 mr-2 sm:hidden">
              <Select
                showSearch
                allowClear
                className="min-h-10 w-full"
                placeholder="Search by name"
                onChange={handleSearchChange}
                filterOption={(input, option) => {
                  const label = option?.label;
                  return (
                    typeof label === 'string' &&
                    label.toLowerCase().includes(input.toLowerCase())
                  );
                }}
                options={options}
              />
            </div>

            {/* Button - takes 25% on mobile, auto on desktop */}
            <div className="w-auto">
              <AccessGuard permissions={[Permissions.CreateBenefitEntitlement]}>
                <Button
                  size="large"
                  type="primary"
                  className="h-10 w-full sm:w-auto"
                  id="createNewClosedHolidayFieldId"
                  icon={<FaPlus />}
                  onClick={handleBenefitEntitlementAdd}
                  disabled={BenefitApplicableTo === 'GLOBAL'}
                >
                  <span className="hidden sm:inline">Employees</span>
                </Button>
              </AccessGuard>
            </div>
          </div>
          

        </div>
        <div className="w-full sm:block hidden mt-2">
              <Select
                showSearch
                allowClear
                className="min-h-10 w-full"
                placeholder="Search by name"
                onChange={handleSearchChange}
                filterOption={(input, option) => {
                  const label = option?.label;
                  return (
                    typeof label === 'string' &&
                    label.toLowerCase().includes(input.toLowerCase())
                  );
                }}
                options={options}
              />

            </div>
            </div>
        )}

        {/* Table Section */}
        <div className="overflow-x-auto mt-4">
          <BenefitEntitlementTable
            title={benefitData?.name ? benefitData?.name : ''}
          />
        </div>
      </div>
    </div>
  );
};

export default BenefitEntitlemetPage;
