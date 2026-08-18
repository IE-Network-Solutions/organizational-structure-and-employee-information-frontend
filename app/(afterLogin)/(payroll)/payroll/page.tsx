'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Breadcrumb } from 'antd';
import CustomBreadcrumb from '@/components/common/breadCramp';
import { useIsMobile } from '@/hooks/useIsMobile';
import PayPeriodSelect from './_components/payPeriodSelect';

const PayrollPayPeriodLanding = () => {
  const router = useRouter();
  const { isMobile } = useIsMobile();

  const handleSelectPayPeriod = (id: string) => {
    router.push(`/payroll/${id}`);
  };

  return (
    <div
      id="payroll-pay-period-landing-view-container"
      data-cy="payroll-pay-period-landing-view-container"
      className={
        isMobile
          ? 'bg-white overflow-x-hidden pb-2 [padding-top:max(1.5rem,env(safe-area-inset-top,0px))] py-4 w-full'
          : ''
      }
    >
      <div
        id="payroll-pay-period-landing-inner-wrapper"
        data-cy="payroll-pay-period-landing-inner-wrapper"
        className="w-full"
      >
        <div
          id="payroll-pay-period-landing-header-view-container"
          data-cy="payroll-pay-period-landing-header-view-container"
          className="mb-6"
        >
          <CustomBreadcrumb
            title={
              <span
                id="payroll-pay-period-landing-title-view-text"
                data-cy="payroll-pay-period-landing-title-view-text"
              >
                Payroll
              </span>
            }
            subtitle={
              <Breadcrumb
                data-cy="payroll-pay-period-landing-breadcrumb"
                className="mt-2 mb-0 whitespace-nowrap"
                style={{ whiteSpace: 'nowrap' }}
                items={[
                  {
                    title: (
                      <Link
                        href="/payroll"
                        data-cy="payroll-pay-period-landing-breadcrumb-payroll-link"
                        className="text-xs sm:text-sm"
                      >
                        Payroll
                      </Link>
                    ),
                  },
                  {
                    title: (
                      <span
                        data-cy="payroll-pay-period-landing-breadcrumb-current"
                        className="text-xs sm:text-sm"
                      >
                        Pay Periods
                      </span>
                    ),
                  },
                ]}
              />
            }
          />
        </div>
      </div>

      <div
        id="payroll-pay-period-landing-content-wrapper"
        data-cy="payroll-pay-period-landing-content-wrapper"
        className="w-full"
      >
        <div
          id="payroll-pay-period-landing-content-card"
          data-cy="payroll-pay-period-landing-content-card"
          className={
            isMobile
              ? 'bg-white rounded-xl shadow-sm border border-gray-100 p-4'
              : 'bg-white rounded-xl shadow-sm border border-gray-100 p-6'
          }
        >
          <PayPeriodSelect onSelect={handleSelectPayPeriod} />
        </div>
      </div>
    </div>
  );
};

export default PayrollPayPeriodLanding;
