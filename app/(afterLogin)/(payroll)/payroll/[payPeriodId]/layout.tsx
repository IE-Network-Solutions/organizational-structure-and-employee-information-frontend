'use client';

import { FC, ReactNode, useMemo } from 'react';
import { Breadcrumb, Tabs } from 'antd';
import type { TabsProps } from 'antd';
import Link from 'next/link';
import { useParams, usePathname, useRouter } from 'next/navigation';
import dayjs from 'dayjs';
import CustomBreadcrumb from '@/components/common/breadCramp';
import { useGetPayPeriod } from '@/store/server/features/payroll/payroll/queries';
import PayPeriodDetailHeader from './_components/PayPeriodDetailHeader';

interface PayPeriodDetailLayoutProps {
  children: ReactNode;
}

const PayPeriodDetailLayout: FC<PayPeriodDetailLayoutProps> = ({
  children,
}) => {
  const pathname = usePathname();
  const router = useRouter();
  const params = useParams();
  const payPeriodId = String(params?.payPeriodId || '');
  const { data: payPeriodData } = useGetPayPeriod();

  const selectedPayPeriod = (payPeriodData || []).find(
    (period: { id: string }) => period.id === payPeriodId,
  );
  const selectedPayPeriodLabel = selectedPayPeriod
    ? dayjs(selectedPayPeriod.startDate).format('MMMM YYYY')
    : 'Pay Period';

  const basePath = `/payroll/${payPeriodId}`;

  const getActiveKey = (): string => {
    if (/\/payroll\/[^/]+\/payroll\/?$/.test(pathname)) {
      return 'payroll';
    }
    if (pathname.includes('/reconciliation')) return 'reconciliation';
    if (pathname.includes('/payslips')) return 'payslips';
    return 'overview';
  };

  const activeKey = getActiveKey();

  const handleTabChange = (key: string) => {
    switch (key) {
      case 'payroll':
        router.push(`${basePath}/payroll`);
        break;
      case 'reconciliation':
        router.push(`${basePath}/reconciliation`);
        break;
      case 'payslips':
        router.push(`${basePath}/payslips`);
        break;
      default:
        router.push(basePath);
    }
  };

  const tabItems: TabsProps['items'] = useMemo(
    () => [
      {
        key: 'overview',
        label: (
          <span
            className={`m-0 text-base ${activeKey === 'overview' ? 'font-semibold text-primary' : 'text-gray-800'}`}
            data-cy="payroll-period-overview-tab-label"
          >
            Overview
          </span>
        ),
      },
      {
        key: 'payroll',
        label: (
          <span
            className={`m-0 text-base ${activeKey === 'payroll' ? 'font-semibold text-primary' : 'text-gray-800'}`}
            data-cy="payroll-period-payroll-tab-label"
          >
            Payroll
          </span>
        ),
      },
      {
        key: 'reconciliation',
        label: (
          <span
            className={`m-0 text-base ${activeKey === 'reconciliation' ? 'font-semibold text-primary' : 'text-gray-800'}`}
            data-cy="payroll-period-reconciliation-tab-label"
          >
            Reconciliation
          </span>
        ),
      },
      {
        key: 'payslips',
        label: (
          <span
            className={`m-0 text-base ${activeKey === 'payslips' ? 'font-semibold text-primary' : 'text-gray-800'}`}
            data-cy="payroll-period-payslips-tab-label"
          >
            Payslips
          </span>
        ),
      },
    ],
    [activeKey],
  );

  return (
    <div
      className="w-full"
      id="payroll-period-detail-layout"
      data-cy="payroll-period-detail-layout"
    >
      <CustomBreadcrumb
        href="/payroll"
        backControlDataCy="payroll-period-detail-back-link"
        title="Payroll"
        subtitle={
          <Breadcrumb
            className="mt-2 mb-0 whitespace-nowrap"
            items={[
              {
                title: (
                  <Link href="/payroll" className="text-xs sm:text-sm">
                    Payroll
                  </Link>
                ),
              },
              {
                title: (
                  <span className="text-xs sm:text-sm">
                    {selectedPayPeriodLabel}
                  </span>
                ),
              },
            ]}
          />
        }
        titleExtra={<PayPeriodDetailHeader />}
      />

      <Tabs
        activeKey={activeKey}
        onChange={handleTabChange}
        items={tabItems}
        tabBarStyle={{ marginBottom: 0 }}
        className="mb-4 [&_.ant-tabs-nav]:mb-0"
        data-cy="payroll-period-detail-tabs"
      />

      <div data-cy="payroll-period-detail-tab-content">{children}</div>
    </div>
  );
};

export default PayPeriodDetailLayout;
