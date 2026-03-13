'use client';

import { FC, ReactNode, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from 'antd';
import { EditOutlined, PlusOutlined } from '@ant-design/icons';

interface PayrollSettingsLayoutProps {
  children: ReactNode;
}

type TabKey = 'tax-rule' | 'pension' | 'pay-period' | 'approvals';

const PayrollSettingsLayout: FC<PayrollSettingsLayoutProps> = ({ children }) => {
  const pathname = usePathname();
  const [currentItem, setCurrentItem] = useState<TabKey>('tax-rule');

  const tabs = useMemo(
    () => [
      { key: 'tax-rule' as const, label: 'Tax Rule', href: '/settings/tax-rule' },
      { key: 'pension' as const, label: 'Pension', href: '/settings/pension' },
      {
        key: 'pay-period' as const,
        label: 'Pay Period',
        href: '/settings/pay-period',
      },
      {
        key: 'approvals' as const,
        label: 'Approval Workflow',
        href: '/settings/approvals',
      },
    ],
    [],
  );

  useEffect(() => {
    const pathSegments = pathname.split('/').filter(Boolean);
    const lastKey = pathSegments[pathSegments.length - 1] as TabKey | undefined;
    if (lastKey && tabs.some((t) => t.key === lastKey)) setCurrentItem(lastKey);
  }, [pathname, tabs]);

  const handlePrimaryActionClick = () => {
    const targetId =
      currentItem === 'tax-rule'
        ? 'payroll-tax-rule-add-click-button'
        : currentItem === 'pension'
          ? 'payroll-pension-add-click-button'
          : currentItem === 'pay-period'
            ? 'payroll-payperiod-add-click-button'
            : 'settings-approvals-payroll-settings-add-approval-btn';

    const el = document.getElementById(targetId) as HTMLButtonElement | null;
    el?.click();
  };

  return (
    <div
      id="payroll-settings-page-view-container"
      data-cy="payroll-settings-page-view-container"
      className="min-h-screen bg-white text-gray-800 font-sans p-6 md:p-10"
    >
      <div
        id="payroll-settings-page-content-view-container"
        data-cy="payroll-settings-page-content-view-container"
        className="max-w-7xl mx-auto"
      >
        <div
          id="payroll-settings-header-view-container"
          data-cy="payroll-settings-header-view-container"
          className="mb-8"
        >
          <h1
            id="payroll-settings-header-title-view-text"
            data-cy="payroll-settings-header-title-view-text"
            className="text-2xl font-bold text-gray-900 mb-1"
          >
            Settings
          </h1>
          <div
            id="payroll-settings-breadcrumb-view-container"
            data-cy="payroll-settings-breadcrumb-view-container"
            className="text-sm text-gray-400 flex items-center gap-2"
          >
            <span
              id="payroll-settings-breadcrumb-parent-view-text"
              data-cy="payroll-settings-breadcrumb-parent-view-text"
            >
              Talent Acquisition
            </span>
            <span
              id="payroll-settings-breadcrumb-separator-view-text"
              data-cy="payroll-settings-breadcrumb-separator-view-text"
            >
              /
            </span>
            <span
              id="payroll-settings-breadcrumb-current-view-text"
              data-cy="payroll-settings-breadcrumb-current-view-text"
              className="text-gray-600"
            >
              Settings
            </span>
          </div>
        </div>
        <div
          id="payroll-settings-tabs-row-view-container"
          data-cy="payroll-settings-tabs-row-view-container"
          className="flex flex-row justify-between items-center flex-wrap border-b border-gray-200 pb-0 mb-6 gap-3"
        >
          <div
            id="payroll-settings-tabs-view-container"
            data-cy="payroll-settings-tabs-view-container"
            className="flex space-x-8 px-2 overflow-x-auto flex-1 min-w-0"
          >
            {tabs.map((tab) => {
              const isActive = currentItem === tab.key;
              return (
                <Link
                  key={tab.key}
                  href={tab.href}
                  id={`payroll-settings-tab-link-${tab.key}`}
                  data-cy={`payroll-settings-tab-link-${tab.key}`}
                  className={`pb-4 text-sm font-medium transition-colors whitespace-nowrap ${
                    isActive
                      ? 'text-primary border-b-2 border-primary'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {tab.label}
                </Link>
              );
            })}
          </div>
          <div
            id="payroll-settings-tabs-actions-slot-view-container"
            data-cy="payroll-settings-tabs-actions-slot-view-container"
            className="flex-shrink-0 mb-3 sm:mb-2 flex justify-end"
          >
            <Button
              id="payroll-settings-tabs-primary-action-button"
              data-cy="payroll-settings-tabs-primary-action-button"
              type="primary"
              className="flex items-center gap-2 bg-primary hover:!bg-primary/90 text-white px-5 py-2.5 rounded-md text-sm font-medium transition-colors shadow-sm whitespace-nowrap"
              icon={
                currentItem === 'pay-period' ? (
                  <EditOutlined data-cy="payroll-settings-tabs-primary-action-button-icon" />
                ) : (
                  <PlusOutlined data-cy="payroll-settings-tabs-primary-action-button-icon" />
                )
              }
              onClick={handlePrimaryActionClick}
            >
              <span
                id="payroll-settings-tabs-primary-action-button-text"
                data-cy="payroll-settings-tabs-primary-action-button-text"
                className="hidden sm:inline"
              >
                {currentItem === 'tax-rule'
                  ? 'Add Tax Rule'
                  : currentItem === 'pension'
                    ? 'Add Pension Rule'
                    : currentItem === 'pay-period'
                      ? 'Update Pay Period'
                      : 'Set Approval'}
              </span>
            </Button>
          </div>
        </div>
        <div
          id="payroll-settings-content-view-container"
          data-cy="payroll-settings-content-view-container"
          className="w-full"
        >
          {children}
        </div>
      </div>
    </div>
  );
};

export default PayrollSettingsLayout;
