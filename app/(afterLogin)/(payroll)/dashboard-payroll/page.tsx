'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { Breadcrumb, Divider, Select } from 'antd';
import dayjs from 'dayjs';
import CustomBreadcrumb from '@/components/common/breadCramp';
import BlockWrapper from '@/components/common/blockWrapper/blockWrapper';
import { useGetPayPeriod } from '@/store/server/features/payroll/payroll/queries';
import { useDashboardPayrollStore } from '@/store/uistate/features/payroll/dashboardPayroll';
import Cards from './_components/cards';
import Graph from './_components/graph';
import PaymentCards from './_components/payment-cards';
import ActionCards from './_components/action-cards';
import PieChart from './_components/pie-chart';

const { Option } = Select;

const DashboardPayroll = () => {
  const { data: payPeriodData } = useGetPayPeriod();
  const payPeriodId = useDashboardPayrollStore((s) => s.payPeriodId);
  const setPayPeriodId = useDashboardPayrollStore((s) => s.setPayPeriodId);

  useEffect(() => {
    if (payPeriodData?.length && !payPeriodId) {
      setPayPeriodId(payPeriodData[0].id);
    }
  }, [payPeriodData, payPeriodId, setPayPeriodId]);

  return (
    <div
      className="h-auto w-full md:pr-2 pr-0"
      id="dashboard-payroll-page"
      data-cy="dashboard-payroll-page"
    >
      <BlockWrapper className="h-auto w-full bg-white">
        <div
          className="flex w-full flex-col gap-4 px-3 pt-4 pb-4 sm:flex-row sm:items-end sm:justify-between sm:px-3"
          data-cy="dashboard-payroll-header"
        >
          <CustomBreadcrumb
            title="Dashboard"
            subtitle={
              <Breadcrumb
                items={[
                  {
                    title: (
                      <Link
                        className="text-xs sm:text-sm text-slate-500"
                        href="/payroll"
                        data-cy="dashboard-payroll-breadcrumb-payroll"
                      >
                        Payroll
                      </Link>
                    ),
                  },
                  {
                    title: (
                      <span
                        className="text-xs sm:text-sm text-slate-500"
                        data-cy="dashboard-payroll-breadcrumb-dashboard"
                      >
                        Dashboard
                      </span>
                    ),
                  },
                ]}
              />
            }
            data-cy="dashboard-payroll-breadcrumb"
          />
          <Select
            id="dashboard-payroll-pay-period-select"
            data-cy="dashboard-payroll-pay-period-select"
            placeholder="Pay Period"
            value={payPeriodId}
            onChange={(value) => setPayPeriodId(value)}
            allowClear={false}
            className="w-full shrink-0 self-end sm:w-auto sm:min-w-[200px] sm:max-w-full [&_.ant-select-selector]:!h-11 [&_.ant-select-selector]:!rounded-lg [&_.ant-select-selector]:!border-gray-300"
          >
            {payPeriodData?.map(
              (period: { id: string; startDate: string; endDate: string }) => (
                <Option
                  key={period.id}
                  value={period.id}
                  data-cy={`dashboard-payroll-pay-period-option-${period.id}`}
                >
                  {dayjs(period.startDate).format('MMM DD, YYYY')} —{' '}
                  {dayjs(period.endDate).format('MMM DD, YYYY')}
                </Option>
              ),
            )}
          </Select>
        </div>

        <Divider
          className="full-bleed-header-divider"
          style={{ margin: 0, borderColor: '#e5e7eb' }}
          data-cy="dashboard-payroll-header-divider"
        />

        <div className="px-3 py-4 sm:px-3" data-cy="dashboard-payroll-content">
          <Cards data-cy="dashboard-payroll-cards" />
          <div
            className="grid grid-cols-12 gap-4"
            data-cy="dashboard-payroll-middle-row"
          >
            <div
              className="col-span-12 lg:col-span-8"
              data-cy="dashboard-payroll-graph-wrapper"
            >
              <Graph data-cy="dashboard-payroll-graph" />
            </div>
            <div
              className="col-span-12 flex w-full lg:col-span-4"
              data-cy="dashboard-payroll-payment-cards-wrapper"
            >
              <div
                className="w-full min-w-0"
                data-cy="dashboard-payroll-payment-cards-inner"
              >
                <PaymentCards data-cy="dashboard-payroll-payment-cards" />
              </div>
            </div>
            <div
              className="col-span-12 lg:col-span-8"
              data-cy="dashboard-payroll-pie-chart-wrapper"
            >
              <PieChart data-cy="dashboard-payroll-pie-chart" />
            </div>
            <div
              className="col-span-12 flex w-full lg:col-span-4"
              data-cy="dashboard-payroll-action-cards-wrapper"
            >
              <div
                className="w-full min-w-0"
                data-cy="dashboard-payroll-action-cards-inner"
              >
                <ActionCards data-cy="dashboard-payroll-action-cards" />
              </div>
            </div>
          </div>
        </div>
      </BlockWrapper>
    </div>
  );
};

export default DashboardPayroll;
