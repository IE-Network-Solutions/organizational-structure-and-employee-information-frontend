'use client';

import React, { useEffect } from 'react';
import { Input } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import BenefitEntitlementTable from '../../benefit/[id]/_components/benefitEntitelmentTable';
import DeductionEntitlementTable from './_components/deductionEntitlementTable';
import { useFetchAllowance } from '@/store/server/features/compensation/allowance/queries';
import { useParams } from 'next/navigation';
import { useBenefitEntitlementStore } from '@/store/uistate/features/compensation/benefit';
import { useAllowanceEntitlementStore } from '@/store/uistate/features/compensation/allowance';

const DeductionEntitlementPage = () => {
  const { id } = useParams();
  const { data: deductionData } = useFetchAllowance(id);
  const {
    setBenefitMode,
    setBenefitDefaultAmount,
    setBenefitApplicableTo,
    setEmployeeBenefitData,
    setCurrentPage,
    setDetailCurrentPage,
  } = useBenefitEntitlementStore();
  const { setSearchText, setCurrentPage: setAllowanceTablePage } =
    useAllowanceEntitlementStore();

  const isRateBased = deductionData?.isRate === true;

  useEffect(() => {
    setEmployeeBenefitData(null);
    setCurrentPage(1);
    setDetailCurrentPage(1);
    setSearchText('');
    setAllowanceTablePage(1);
  }, [
    id,
    setEmployeeBenefitData,
    setCurrentPage,
    setDetailCurrentPage,
    setSearchText,
    setAllowanceTablePage,
  ]);

  useEffect(() => {
    setBenefitMode(deductionData?.mode);
    setBenefitApplicableTo(deductionData?.applicableTo);
    if (deductionData?.mode == 'CREDIT') {
      setBenefitDefaultAmount(deductionData?.defaultAmount);
    }
  }, [
    deductionData,
    setBenefitMode,
    setBenefitApplicableTo,
    setBenefitDefaultAmount,
  ]);

  return (
    <div
      className="px-3 pb-2 pt-4 sm:pt-5"
      id="compensation-deduction-single-wrapper"
      data-cy="compensation-deduction-single-wrapper"
    >
      <div
        className="bg-white border border-gray-200 rounded-lg overflow-hidden !shadow-none"
        id="compensation-deduction-single-inner"
        data-cy="compensation-deduction-single-inner"
      >
        <div
          className="px-2 sm:px-3 pt-3 sm:pt-4 pb-1"
          id="compensation-deduction-search-wrapper"
          data-cy="compensation-deduction-search-wrapper"
        >
          <Input
            placeholder="Search Employee"
            addonAfter={<SearchOutlined className="text-gray-400" />}
            allowClear
            className="w-full max-w-[280px] h-10 rounded-md text-sm [&_.ant-input]:!text-sm [&_.ant-input-group-addon]:!px-3 [&_.ant-input-group-addon]:!bg-white"
            onChange={(e) => setSearchText(e.target.value)}
            data-cy="compensation-deduction-search-employee"
          />
        </div>

        <div
          className="overflow-x-auto px-2 sm:px-3 pb-3 sm:pb-4 pt-1"
          id="compensation-deduction-table-wrapper"
          data-cy="compensation-deduction-table-wrapper"
        >
          {isRateBased ? (
            <DeductionEntitlementTable
              compact
              title={deductionData?.name ?? ''}
              data-cy="compensation-deduction-entitlement-table"
            />
          ) : (
            <BenefitEntitlementTable
              title={deductionData?.name ?? ''}
              compact
              deductionDetailLayout
              data-cy="compensation-deduction-entitlement-table"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default DeductionEntitlementPage;
