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
  const { employeeBenefitData } = useBenefitEntitlementStore();

  return (
    <div
      className="bg-white rounded-lg px-1 py-4 sm:p-6"
      id="compensation-deduction-single-wrapper"
      data-cy="compensation-deduction-single-wrapper"
    >
      <div
        id="compensation-deduction-single-inner"
        data-cy="compensation-deduction-single-inner"
      >
        {employeeBenefitData == null && (
          <div
            id="compensation-deduction-single-header-section"
            data-cy="compensation-deduction-single-header-section"
          >
            {/* PageHeader for mobile */}
            <div
              className="block sm:hidden mb-4"
              id="compensation-deduction-mobile-header-wrapper"
              data-cy="compensation-deduction-mobile-header-wrapper"
            >
              <PageHeader
                data-cy="compensation-deduction-mobile-page-header"
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
              />
            </div>

            {/* Main layout for larger screens */}
            <div
              className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-3"
              id="compensation-deduction-desktop-header-row"
              data-cy="compensation-deduction-desktop-header-row"
            >
              <div
                className="hidden sm:block"
                id="compensation-deduction-desktop-header-wrapper"
                data-cy="compensation-deduction-desktop-header-wrapper"
              >
                <PageHeader
                  data-cy="compensation-deduction-desktop-page-header"
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
                />
              </div>
              <div
                className="flex w-full sm:w-auto sm:flex-row sm:gap-4"
                id="compensation-deduction-actions-row"
                data-cy="compensation-deduction-actions-row"
              >
                <div
                  className="w-5/6 sm:w-72 mr-2"
                  id="compensation-deduction-search-wrapper"
                  data-cy="compensation-deduction-search-wrapper"
                >
                  <Select
                    showSearch
                    allowClear
                    className="h-10 w-full"
                    placeholder="Search by name"
                    id="compensation-deduction-search-select"
                    data-cy="compensation-deduction-search-select"
                  />
                </div>
                <div
                  className="w-auto"
                  id="compensation-deduction-create-button-wrapper"
                  data-cy="compensation-deduction-create-button-wrapper"
                >
                  <AccessGuard
                    data-cy="compensation-deduction-create-button-access-guard"
                    permissions={[Permissions.CreateAllowanceEntitlement]}
                    id="compensation-deduction-create-button-access-guard"
                  >
                    <Button
                      size="large"
                      type="primary"
                      id="createNewClosedHolidayFieldId"
                      className="h-10 w-10 sm:w-full"
                      data-cy="compensation-deduction-create-button"
                      icon={
                        <FaPlus data-cy="compensation-deduction-create-button-icon" />
                      }
                      onClick={() => {
                        setIsBenefitEntitlementSidebarOpen(true);
                      }}
                      disabled={isAllowanceGlobal}
                    >
                      <span
                        className="hidden sm:inline"
                        id="compensation-deduction-create-button-text"
                        data-cy="compensation-deduction-create-button-text"
                      >
                        Employees
                      </span>
                    </Button>
                  </AccessGuard>
                </div>
              </div>
            </div>
          </div>
        )}

          <BenefitEntitlementTable
            title={deductionData?.name ? deductionData?.name : ''}
            data-cy="compensation-deduction-entitlement-table"
          />
      </div>
    </div>
  );
};

export default SingleDeductionPage;
