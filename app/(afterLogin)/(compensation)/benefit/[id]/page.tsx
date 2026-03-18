'use client';

import React, { useEffect } from 'react';
import { Input } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import BenefitEntitlementTable from './_components/benefitEntitelmentTable';
import { useFetchBenefit } from '@/store/server/features/compensation/benefit/queries';
import { useParams } from 'next/navigation';
import { useBenefitEntitlementStore } from '@/store/uistate/features/compensation/benefit';
import { useAllowanceEntitlementStore } from '@/store/uistate/features/compensation/allowance';

const BenefitEntitlementPage = () => {
  const { id } = useParams();
  const { data: benefitData } = useFetchBenefit(id);
  const {
    setBenefitMode,
    setBenefitDefaultAmount,
    setBenefitApplicableTo,
    employeeBenefitData,
  } = useBenefitEntitlementStore();
  const { setSearchText } = useAllowanceEntitlementStore();
  const isTrackingView = Boolean(employeeBenefitData);

  useEffect(() => {
    setBenefitMode(benefitData?.mode);
    setBenefitApplicableTo(benefitData?.applicableTo);
    if (benefitData?.mode == 'CREDIT') {
      setBenefitDefaultAmount(benefitData?.defaultAmount);
    }
  }, [
    benefitData,
    setBenefitMode,
    setBenefitApplicableTo,
    setBenefitDefaultAmount,
  ]);

  return (
    <div
      className="px-3 py-4"
      id="compensation-benefit-single-wrapper"
      data-cy="compensation-benefit-single-wrapper"
    >
      <div
        className="bg-white border border-gray-200 rounded-lg overflow-hidden !shadow-none"
        id="compensation-benefit-single-inner"
        data-cy="compensation-benefit-single-inner"
      >
        {!isTrackingView && (
          <div
            className="px-3 sm:px-4 pt-3 sm:pt-4 pb-0"
            id="compensation-benefit-search-wrapper"
            data-cy="compensation-benefit-search-wrapper"
          >
            <Input
              placeholder="Search Employee"
              addonAfter={<SearchOutlined className="text-gray-400" />}
              allowClear
              className="w-full max-w-md h-10 rounded-md text-sm sm:text-base"
              onChange={(e) => setSearchText(e.target.value)}
              data-cy="compensation-benefit-search-employee"
            />
          </div>
        )}

        <div
          className={`overflow-x-auto px-3 sm:px-4 ${isTrackingView ? 'py-3 sm:py-4' : 'pb-3 sm:pb-4'}`}
          id="compensation-benefit-table-wrapper"
          data-cy="compensation-benefit-table-wrapper"
        >
          <BenefitEntitlementTable
            title={benefitData?.name ?? ''}
            compact
            data-cy="compensation-benefit-entitlement-table"
          />
        </div>
      </div>
    </div>
  );
};

export default BenefitEntitlementPage;
