'use client';

import { FC, ReactNode, useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Breadcrumb, Button, Divider, Tabs, theme } from 'antd';
import type { TabsProps } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { FaPencil } from 'react-icons/fa6';
import usePensionRulesStore from '@/store/uistate/features/payroll/settings/pensionRules/pensionRulesStore';
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
  const { isPensionAddDisabled } = usePensionRulesStore();
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

  const currentTabLabel = useMemo(() => {
    return tabs.find((t) => t.key === currentItem)?.label ?? 'Settings';
  }, [tabs, currentItem]);

  const tabItems = useMemo<TabsProps['items']>(
    () =>
      tabs.map((tab) => ({
        key: tab.key,
        label: (
          <div
            id={`payroll-settings-tab-label-${tab.key}`}
            data-cy={`payroll-settings-tab-label-${tab.key}`}
            className={`text-base m-0 ${currentItem === tab.key ? 'text-primary font-semibold' : 'text-gray-800'}`}
          >
            {tab.label}
          </div>
        ),
      })),
    [tabs, currentItem],
  );

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

  const isHeaderPrimaryActionDisabled =
    (currentItem === 'pension' && isPensionAddDisabled) ||
    (currentItem === 'approvals' && isApprovalsAddDisabled);

  const handleTabChange = (key: string) => {
    const next = tabs.find((t) => t.key === key);
    if (next) router.push(next.href);
  };

  const primaryActionButton = (
    <Button
      id="payroll-settings-tabs-primary-action-button"
      data-cy="payroll-settings-tabs-primary-action-button"
      type="primary"
      className={`flex items-center gap-2 px-5 py-2.5 rounded-md text-sm font-medium transition-colors shadow-sm whitespace-nowrap ${
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
          : currentItem === 'pension'
            ? 'Add Pension Rule'
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
      <style jsx global>{`
        /* On mobile, AntD Tabs can render "fade" overlays that look like white blocks */
        @media (max-width: 640px) {
          #payroll-settings-tabs .ant-tabs-nav-operations,
          #payroll-settings-tabs .ant-tabs-extra-content,
          #payroll-settings-tabs .ant-tabs-nav-more {
            background: transparent !important;
            box-shadow: none !important;
          }
          #payroll-settings-tabs .ant-tabs-nav-wrap::before,
          #payroll-settings-tabs .ant-tabs-nav-wrap::after {
            box-shadow: none !important;
            background: transparent !important;
          }
        }
      `}</style>
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
              data-cy="payroll-settings-breadcrumb"
              id="payroll-settings-breadcrumb"
            />
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
          className="mb-6"
        >
          <div
            id="payroll-settings-tabs-actions-slot-view-container"
            data-cy="payroll-settings-tabs-actions-slot-view-container"
            className="w-full"
          >
            <Tabs
              id="payroll-settings-tabs"
              data-cy="payroll-settings-tabs"
              activeKey={currentItem}
              onChange={handleTabChange}
              items={tabItems}
              tabBarGutter={24}
              tabBarStyle={{
                marginBottom: 0,
                marginLeft: 0,
                paddingLeft: 0,
                paddingRight: 0,
              }}
              tabBarExtraContent={
                currentItem === 'pension' && isPensionAddDisabled
                  ? null
                  : primaryActionButton
              }
              className="text-base [&_.ant-tabs-tab]:py-4 [&_.ant-tabs-tab-btn]:py-2 [&_.ant-tabs-tab-active_.ant-tabs-tab-btn]:font-bold [&_.ant-tabs-nav]:mb-0 [&_.ant-tabs-nav-wrap]:!px-0 [&_.ant-tabs-nav-list]:!px-0 [&_.ant-tabs-nav-wrap]:before:!left-0 [&_.ant-tabs-nav-wrap]:after:!right-0 [&_.ant-tabs-nav-operations]:!bg-transparent [&_.ant-tabs-nav-operations]:!shadow-none [&_.ant-tabs-extra-content]:!bg-transparent [&_.ant-tabs-nav-more]:!bg-transparent"
            />
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
