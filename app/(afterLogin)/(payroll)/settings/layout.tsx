'use client';

import { FC, ReactNode, useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Breadcrumb, Button, Divider, theme } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { FaPencil } from 'react-icons/fa6';
import useApprovalsSettingsStore from '@/store/uistate/features/payroll/settings/approvals/approvalsSettingsStore';

interface PayrollSettingsLayoutProps {
  children: ReactNode;
}

type TabKey = 'tax-rule' | 'pension' | 'pay-period' | 'approvals';

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
      className="min-h-screen bg-white text-gray-800 font-sans py-4 -mx-2 md:-mx-6 w-[calc(100%+16px)] md:w-[calc(100%+48px)] px-4 md:px-6"
    >
      <div
        id="payroll-settings-page-content-view-container"
        data-cy="payroll-settings-page-content-view-container"
        className="w-full"
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
            className="text-sm text-gray-400 flex flex-col items-start"
          >
            <div
              id="payroll-settings-breadcrumb"
              data-cy="payroll-settings-breadcrumb"
            >
              <Breadcrumb
                className="mt-2 mb-0 whitespace-nowrap"
                style={{ whiteSpace: 'nowrap' }}
                items={[
                  {
                    title: (
                      <a
                        href="/payroll/payroll"
                        onClick={(e) => {
                          e.preventDefault();
                          router.push('/payroll/payroll');
                        }}
                        data-cy="payroll-settings-breadcrumb-payroll-link"
                        id="payroll-settings-breadcrumb-payroll-link"
                        className="text-xs sm:text-sm"
                      >
                        Payroll
                      </a>
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
            </div>
          </div>
          <div
            id="payroll-settings-breadcrumb-tabs-divider-bleed"
            data-cy="payroll-settings-breadcrumb-tabs-divider-bleed"
            className="-mx-4 md:-mx-6 w-[calc(100%+2rem)] md:w-[calc(100%+3rem)]"
          >
            <Divider
              id="payroll-settings-breadcrumb-tabs-divider"
              data-cy="payroll-settings-breadcrumb-tabs-divider"
              className="!my-0 !mt-4 !border-gray-200"
            />
          </div>
        </div>
        <div
          id="payroll-settings-tabs-row-view-container"
          data-cy="payroll-settings-tabs-row-view-container"
          className="mt-5 mb-6"
        >
          <div
            id="payroll-settings-tabs-actions-slot-view-container"
            data-cy="payroll-settings-tabs-actions-slot-view-container"
            className="w-full"
          >
            {/*
              Custom tab rail: matches incentives/page.tsx label styling (font-semibold
              text-md p-3) and tabBar bottom spacing; avoids AntD ink-bar bugs with
              scroll + tabBarExtraContent.
            */}
            <div
              id="payroll-settings-tabs"
              data-cy="payroll-settings-tabs"
              className="w-full"
            >
              <div className="flex w-full items-end justify-between gap-2 border-b border-gray-200" data-cy="payroll-settings-tabs-container">
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
                        className={`relative shrink-0 border-0 bg-transparent p-3 text-left font-semibold text-md outline-none transition-colors focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2 ${
                          isActive
                            ? 'text-primary'
                            : 'text-gray-800 hover:text-gray-900'
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
                  {currentItem === 'pension' ? (
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
                className="h-4 shrink-0"
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
