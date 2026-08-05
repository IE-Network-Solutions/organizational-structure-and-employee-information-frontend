'use client';

import { FC, ReactNode, useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import CustomBreadcrumb from '@/components/common/breadCramp';
import { Breadcrumb, Button, theme } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { FaPencil } from 'react-icons/fa6';
import useApprovalsSettingsStore from '@/store/uistate/features/payroll/settings/approvals/approvalsSettingsStore';

interface PayrollSettingsLayoutProps {
  children: ReactNode;
}

type TabKey = 'tax-rule' | 'pension' | 'pay-period' | 'approvals' | 'general';

const PayrollSettingsLayout: FC<PayrollSettingsLayoutProps> = ({
  children,
}) => {
  const pathname = usePathname();
  const router = useRouter();
  const [currentItem, setCurrentItem] = useState<TabKey>('tax-rule');
  const { isApprovalsAddDisabled } = useApprovalsSettingsStore();
  const { token } = theme.useToken();

  const tabs = useMemo(
    () => [
      {
        key: 'tax-rule' as const,
        label: 'Tax Rule',
        href: '/settings/tax-rule',
      },
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
      {
        key: 'general' as const,
        label: 'Working Day Configuration on VP',
        href: '/settings/general',
      },
    ],
    [],
  );

  useEffect(() => {
    const pathSegments = pathname.split('/').filter(Boolean);
    const lastKey = pathSegments[pathSegments.length - 1] as TabKey | undefined;
    if (lastKey && tabs.some((t) => t.key === lastKey)) setCurrentItem(lastKey);
  }, [pathname, tabs]);

  // const currentTabLabel = useMemo(() => {
  //   return tabs.find((t) => t.key === currentItem)?.label ?? 'Settings';
  // }, [tabs, currentItem]);

  const handlePrimaryActionClick = () => {
    const targetId =
      currentItem === 'tax-rule'
        ? 'payroll-tax-rule-add-click-button'
        : currentItem === 'pay-period'
          ? 'payroll-payperiod-add-click-button'
          : 'settings-approvals-payroll-settings-add-approval-btn';

    const el = document.getElementById(targetId) as HTMLButtonElement | null;
    el?.click();
  };

  const isHeaderPrimaryActionDisabled =
    currentItem === 'approvals' && isApprovalsAddDisabled;

  const handleTabChange = (key: string) => {
    const next = tabs.find((t) => t.key === key);
    if (next) router.push(next.href);
  };

  const primaryActionButton = (
    <Button
      id="payroll-settings-tabs-primary-action-button"
      data-cy="payroll-settings-tabs-primary-action-button"
      type="primary"
      className={`flex !h-10 min-h-10 shrink-0 items-center justify-center gap-2 rounded-md px-3 py-0 text-sm font-medium shadow-sm transition-colors sm:px-5 sm:py-2.5 whitespace-nowrap max-sm:!w-10 max-sm:!min-w-10 max-sm:!p-0 ${
        isHeaderPrimaryActionDisabled
          ? 'cursor-not-allowed'
          : 'bg-primary hover:!bg-primary/90 text-white'
      }`}
      icon={
        currentItem === 'pay-period' ? (
          <FaPencil
            className="text-sm"
            data-cy="payroll-settings-tabs-primary-action-button-icon"
          />
        ) : (
          <PlusOutlined data-cy="payroll-settings-tabs-primary-action-button-icon" />
        )
      }
      disabled={isHeaderPrimaryActionDisabled}
      style={
        isHeaderPrimaryActionDisabled
          ? {
              backgroundColor: token.colorBgContainerDisabled,
              borderColor: token.colorBorder,
              color: token.colorTextDisabled,
              boxShadow: 'none',
            }
          : undefined
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
          : currentItem === 'pay-period'
            ? 'Update Pay Period'
            : 'Set Approval'}
      </span>
    </Button>
  );

  return (
    <div
      id="payroll-settings-page-view-container"
      data-cy="payroll-settings-page-view-container"
    >
      <div
        id="payroll-settings-page-content-view-container"
        data-cy="payroll-settings-page-content-view-container"
        className="w-full"
      >
        <div
          id="payroll-settings-header-view-container"
          data-cy="payroll-settings-header-view-container"
        >
          <div
            id="payroll-settings-breadcrumb-view-container"
            data-cy="payroll-settings-breadcrumb-view-container"
            // className="text-sm text-gray-400 flex flex-col items-start w-full"
          >
            <div
              id="payroll-settings-breadcrumb"
              data-cy="payroll-settings-breadcrumb"
              className="w-full"
            >
              <CustomBreadcrumb
                title={
                  <span
                    id="payroll-settings-header-title-view-text"
                    data-cy="payroll-settings-header-title-view-text"
                  >
                    Settings
                  </span>
                }
                subtitle={
                  <Breadcrumb
                    className="mt-2 mb-0 whitespace-nowrap"
                    items={[
                      {
                        title: (
                          <Link
                            href="/payroll/payroll"
                            data-cy="payroll-settings-breadcrumb-payroll-link"
                            id="payroll-settings-breadcrumb-payroll-link"
                            className="text-xs sm:text-sm"
                          >
                            Payroll
                          </Link>
                        ),
                      },
                      {
                        title: (
                          <span
                            data-cy="payroll-settings-breadcrumb-settings"
                            id="payroll-settings-breadcrumb-settings"
                            className="text-xs sm:text-sm"
                          >
                            Settings
                          </span>
                        ),
                      },
                    ]}
                  />
                }
              />
            </div>
          </div>
        </div>
        <div
          id="payroll-settings-tabs-row-view-container"
          data-cy="payroll-settings-tabs-row-view-container"
          className="mt-5 mb-3"
        >
          <div
            id="payroll-settings-tabs-actions-slot-view-container"
            data-cy="payroll-settings-tabs-actions-slot-view-container"
            className="w-full"
          >
            {/*
              Custom tab rail: active tab uses semibold; inactive uses normal weight.
              text-md p-3; avoids AntD ink-bar bugs with scroll + tabBarExtraContent.
            */}
            <div
              id="payroll-settings-tabs"
              data-cy="payroll-settings-tabs"
              className="w-full"
            >
              <div
                className="flex w-full items-end justify-between gap-2 border-b border-gray-200"
                data-cy="payroll-settings-tabs-container"
              >
                <div
                  className="scrollbar-hide flex min-w-0 flex-1 items-end gap-8 overflow-x-auto [-webkit-overflow-scrolling:touch]"
                  data-cy="payroll-settings-tabs-scroll"
                >
                  {tabs.map((tab) => {
                    const isActive = currentItem === tab.key;
                    return (
                      <button
                        key={tab.key}
                        type="button"
                        id={`payroll-settings-tab-${tab.key}`}
                        data-cy={`payroll-settings-tab-label-${tab.key}`}
                        onClick={() => handleTabChange(tab.key)}
                        className={`relative shrink-0 border-0 bg-transparent p-3 text-left text-md outline-none transition-colors focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2 ${
                          isActive
                            ? 'font-semibold text-primary'
                            : 'font-normal text-gray-800 hover:text-gray-900'
                        }`}
                      >
                        {tab.label}
                        {isActive ? (
                          <span
                            className="pointer-events-none absolute inset-x-0 bottom-[-1px] z-10 h-0.5 bg-primary"
                            data-cy={`payroll-settings-tab-indicator-${tab.key}`}
                            aria-hidden
                          />
                        ) : null}
                      </button>
                    );
                  })}
                </div>
                <div
                  className="ml-2 flex shrink-0 items-center self-end p-3"
                  data-cy="payroll-settings-tabs-primary-action-slot"
                >
                  {currentItem === 'pension' || currentItem === 'general' ? (
                    <div
                      className="flex h-10 min-h-10 w-10 shrink-0 items-center justify-center sm:h-10 sm:min-h-10 sm:w-auto sm:min-w-[148px]"
                      aria-hidden
                      data-cy="payroll-settings-tabs-primary-action-pension-placeholder"
                    />
                  ) : (
                    primaryActionButton
                  )}
                </div>
              </div>
              <div
                className="h-1 shrink-0"
                aria-hidden
                data-cy="payroll-settings-tabs-bottom-spacer"
              />
            </div>
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
