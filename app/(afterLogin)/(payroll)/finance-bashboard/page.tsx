'use client';

import React, { useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Breadcrumb, Select } from 'antd';
import dayjs from 'dayjs';
import CustomBreadcrumb from '@/components/common/breadCramp';
import BlockWrapper from '@/components/common/blockWrapper/blockWrapper';
import { useGetPayPeriod } from '@/store/server/features/payroll/payroll/queries';
import { useDashboardPayrollStore } from '@/store/uistate/features/payroll/dashboardPayroll';
import Graph from './_components/graph';
import PaymentCards from './_components/payment-cards';
import PieChart from './_components/pie-chart';
import PayrollCards from './_components/cards';
import RecentHrActions from '../../(employeeInformation)/employees/dashboard/_components/recent-hr-actions';
import { useGetAggregateAuditPostLogs } from '@/store/server/features/tenant-management/audit-logs/queries';

const { Option } = Select;

type PayPeriod = {
  id: string;
  startDate: string;
  endDate: string;
  status?: string;
  isActive?: boolean;
};

const DashboardPayroll = () => {
  const { data: payPeriodData } = useGetPayPeriod();
  const payPeriodId = useDashboardPayrollStore((s) => s.payPeriodId);
  const setPayPeriodId = useDashboardPayrollStore((s) => s.setPayPeriodId);
  const modules = ['PayrollAuditLog'];
  const { data: auditLogs, isLoading: isLoadingAuditLogs } =
    useGetAggregateAuditPostLogs(
      {
        modules: modules,
        page: 1,
        limit: 5,
        orderBy: 'performedAt',
        orderDirection: 'DESC',
      },
      true,
    );
  const auditLogsData = useMemo(() => {
    return auditLogs?.items ?? [];
  }, [auditLogs]);

  useEffect(() => {
    if (
      Array.isArray(payPeriodData) &&
      payPeriodData.length > 0 &&
      !payPeriodId
    ) {
      const activePayPeriod = payPeriodData.find((period: PayPeriod) => {
        const normalizedStatus = period.status?.toUpperCase();
        return (
          period.isActive ||
          normalizedStatus === 'OPEN' ||
          normalizedStatus === 'ACTIVE'
        );
      });

      setPayPeriodId((activePayPeriod ?? payPeriodData[0]).id);
    }
  }, [payPeriodData, payPeriodId, setPayPeriodId]);

  return (
    <div
      className="h-auto w-full"
      id="dashboard-payroll-page"
      data-cy="dashboard-payroll-page"
    >
      <BlockWrapper className="h-auto w-full bg-white">
        <div
          className="flex w-full items-center justify-between"
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
            className="w-[217px] h-8"
          >
            {payPeriodData?.map((period: PayPeriod) => (
              <Option
                key={period.id}
                value={period.id}
                data-cy={`dashboard-payroll-pay-period-option-${period.id}`}
              >
                {dayjs(period.startDate).format('MMM DD, YYYY')} —{' '}
                {dayjs(period.endDate).format('MMM DD, YYYY')}
              </Option>
            ))}
          </Select>
        </div>

        <div data-cy="dashboard-payroll-content">
          <PayrollCards data-cy="dashboard-payroll-cards" />
          <div
            className="grid grid-cols-12 gap-4"
            data-cy="dashboard-payroll-middle-row"
          >
            <div
              className="col-span-12 flex flex-col-reverse lg:grid lg:grid-cols-12 gap-4 w-full"
              data-cy="dashboard-payroll-upper-section"
            >
              <div
                className="col-span-12 lg:col-span-8"
                data-cy="dashboard-payroll-graph-wrapper"
              >
                <Graph data-cy="dashboard-payroll-graph" />
              </div>
              <div
                className="col-span-12 w-full lg:col-span-4"
                data-cy="dashboard-payroll-payment-cards-wrapper"
              >
                <div
                  className="w-full min-w-0"
                  data-cy="dashboard-payroll-payment-cards-inner"
                >
                  <PaymentCards data-cy="dashboard-payroll-payment-cards" />
                </div>
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
                <RecentHrActions
                  auditLogs={auditLogsData}
                  isLoading={isLoadingAuditLogs}
                  auditLogModules={modules}
                />
              </div>
            </div>
          </div>
        </div>
      </BlockWrapper>
    </div>
  );
};

export default DashboardPayroll;
