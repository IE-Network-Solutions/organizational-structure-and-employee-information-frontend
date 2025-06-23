'use client';

import CustomBreadcrumb from '@/components/common/breadCramp';
import {
  CalendarFilled,
  UserOutlined,
  SyncOutlined,
  FileImageFilled,
  FileDoneOutlined,
} from '@ant-design/icons';
import { Card, Checkbox, Skeleton, Tooltip } from 'antd';
import { useEffect, useState } from 'react';
import React from 'react';
import CustomButton from '@/components/common/buttons/customButton';
import InvoicesTable from '../_components/invoicesTable/invoicesTable';
import { useRouter } from 'next/navigation';
import { useGetInvoices } from '@/store/server/features/tenant-management/invoices/queries';
import { useGetCurrencies } from '@/store/server/features/tenant-management/currencies/queries';
import {
  Currency,
  Invoice,
  Plan,
  Subscription,
} from '@/types/tenant-management';
import { useGetPlans } from '@/store/server/features/tenant-management/plans/queries';
import { useGetSubscriptions } from '@/store/server/features/tenant-management/subscriptions/queries';
import { DEFAULT_TENANT_ID } from '@/utils/constants';

const AdminDashboard = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [currentPlan, setCurrentPlan] = useState<Plan>();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [activeSubscription, setActiveSubscription] =
    useState<Subscription | null>(null);

  const [lastInvoice, setLastInvoice] = useState<Invoice | null>(null);
  const router = useRouter();

  const { data: invoicesData, isLoading: isInvoicesLoading } = useGetInvoices(
    {
      filter: {
        tenantId: DEFAULT_TENANT_ID,
      },
    },
    'ASC',
    false,
    true,
  );

  const { data: plansData, isLoading: plansLoading } = useGetPlans(
    { filter: {} },
    true,
    true,
    'ASC',
  );

  const currentCurrencyId = currentPlan?.currencyId;

  const plansWithSameCurrency = plansData?.items?.filter(
    (plan: { currencyId: string | undefined }) =>
      plan.currencyId === currentCurrencyId,
  );

  const { data: currenciesData, isLoading: currenciesLoading } =
    useGetCurrencies({ filter: {} }, true, true);

  const { data: subscriptionsData, isLoading: subscriptionsLoading } =
    useGetSubscriptions(
      {
        filter: {
          tenantId: [DEFAULT_TENANT_ID],
        },
      },
      true,
      true,
    );

  useEffect(() => {
    if (invoicesData) {
      if (invoicesData?.items && invoicesData.items.length > 0) {
        const sortedInvoices = [...invoicesData.items].sort((a, b) => {
          return (
            new Date(b.createdAt || 0).getTime() -
            new Date(a.createdAt || 0).getTime()
          );
        });
        setInvoices(sortedInvoices);
        // Set the latest invoice
        setLastInvoice(sortedInvoices[0]);
      } else {
        // No invoices available
        setInvoices([]);
        setLastInvoice(null);
      }
    }
  }, [invoicesData]);

  useEffect(() => {
    if (currenciesData?.items && currenciesData.items.length > 0) {
      setCurrencies(currenciesData.items);
    }
  }, [currenciesData]);

  useEffect(() => {
    if (plansData?.items && plansData.items.length > 0) {
      setPlans(plansData.items);
    }
  }, [plansData]);

  useEffect(() => {
    if (subscriptionsData?.items && subscriptionsData.items.length > 0) {
      const allSubscriptions = subscriptionsData.items;
      setSubscriptions(allSubscriptions);

      // Find active subscription
      const active = allSubscriptions.find((sub) => sub.isActive === true);
      if (active) {
        setActiveSubscription(active);
        setCurrentPlan(active.plan);
      } else {
        // If no active subscription found, use the latest one by creation date
        const sortedSubs = [...allSubscriptions].sort((a, b) => {
          return (
            new Date(b.createdAt || 0).getTime() -
            new Date(a.createdAt || 0).getTime()
          );
        });
        setActiveSubscription(sortedSubs[0]);
        setCurrentPlan(sortedSubs[0]?.plan);
      }
    } else {
      // No subscriptions available
      setSubscriptions([]);
      setActiveSubscription(null);
      setCurrentPlan(undefined);
    }
  }, [subscriptionsData]);

  const getFormattedSubscriptionStatus = (status?: string): string => {
    if (!status) return 'Unknown';

    // Convert first letter to uppercase
    return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
  };

  // Check if the latest invoice is paid
  const isLatestInvoicePaid = () => {
    if (!lastInvoice) return true; // If no invoice, allow actions
    return lastInvoice.status?.toLowerCase() === 'paid';
  };

  // Generate tooltip message for disabled buttons
  const getDisabledTooltip = () => {
    return 'Please pay your current invoice before making changes to your subscription';
  };

  const dashboardData = [
    {
      overview: 'Current Subscription',
      color: '#3636F0',
      icon: <SyncOutlined />,
      id: 'currentSubscription',
    },
    {
      overview: 'Total Quota',
      color: '#3636F0',
      icon: <FileImageFilled />,
      id: 'totalQuota',
    },
    {
      overview: 'Active User',
      color: '#3636F0',
      icon: <UserOutlined />,
      id: 'activeUser',
    },
    {
      overview: 'Invoice Status',
      color: '#3636F0',
      icon: <FileDoneOutlined />,
      id: 'invoiceStatus',
    },
    {
      overview: 'Subscription Status',
      color: '#3636F0',
      icon: <CalendarFilled />,
      id: 'subscriptionStatus',
    },
  ];

  // Dynamically generate dashboard values based on current data
  const getDashboardValues = () => {
    return [
      {
        id: 'currentSubscription',
        value: activeSubscription?.plan?.name || 'No Plan',
      },
      {
        id: 'totalQuota',
        value: activeSubscription?.slotTotal?.toString() || '0',
      },
      {
        id: 'activeUser',
        value: activeSubscription?.slotTotal?.toString() || '0',
      },
      {
        id: 'invoiceStatus',
        value: lastInvoice
          ? getFormattedSubscriptionStatus(lastInvoice.status)
          : 'No Invoice',
      },
      {
        id: 'subscriptionStatus',
        value: activeSubscription
          ? getFormattedSubscriptionStatus(
              activeSubscription.subscriptionStatus,
            )
          : 'No Subscription',
      },
    ];
  };

  const dashboardValues = getDashboardValues();

  const isLoading =
    isInvoicesLoading ||
    plansLoading ||
    currenciesLoading ||
    subscriptionsLoading;
  const hasSelectedPlan = !!currentPlan;

  return (
    <div className="h-auto w-auto px-6 py-6">
      <CustomBreadcrumb
        title="Hi, Admin"
        subtitle="Manage Tenant Billing, Invoices, and Profile Information"
      />

      <div className="grid gap-3  mb-[35px] mt-[25px] md:grid-cols-2 lg:grid-cols-5">
        {dashboardData.map((item, idx) => {
          const valueData = dashboardValues.find((v) => v.id === item.id);
          return (
            <Card
              key={idx}
              loading={isLoading}
              className="rounded-lg bg-white relative"
              bordered={false}
              styles={{
                body: { padding: '0px' },
              }}
              style={{
                boxShadow: isLoading
                  ? 'none'
                  : '0px 5px 10px 0px rgba(0, 0, 0, 0.1)',
                border: isLoading
                  ? 'none'
                  : '1px solid rgba(162, 161, 168, 0.2)',
                padding: isLoading ? '20px' : '0px',
              }}
            >
              {isLoading ? (
                <Skeleton active paragraph={{ rows: 2 }} />
              ) : (
                <>
                  <div className="flex flex-col gap-2 pt-6 pl-4 pr-4 pb-4">
                    <div className="bg-gray-100 rounded-md py-2 px-3 w-fit">
                      {React.cloneElement(item.icon, {
                        style: { color: item.color },
                        size: 24,
                      })}
                    </div>
                    <div className="text-sm text-gray-500">{item.overview}</div>
                  </div>

                  <div className="flex flex-col">
                    <div className="p-4 pt-0">
                      <div className="text-1xl font-bold flex items-center justify-between">
                        {valueData?.value}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </Card>
          );
        })}
      </div>

      <div className="text-2xl font-bold mb-5">
        Tenant Plan & Available Upgrades
      </div>

      {isLoading ? (
        <div className="flex flex-col md:flex-row gap-4">
          {[1, 2].map((index) => (
            <div
              key={index}
              className="bg-white rounded-lg p-4 w-full md:w-1/2 mb-4"
              style={{
                boxShadow: '0 4px 4px 0 rgba(0, 0, 0, 0.25)',
                minHeight: '571px',
              }}
            >
              <Skeleton active paragraph={{ rows: 10 }} />
            </div>
          ))}
        </div>
      ) : (
        <>
          <div
            className="flex flex-col mb-[35px] mt-[25px] md:flex-row justify-between items-center gap-4 bg-purple/10 rounded-lg p-4"
            style={{
              boxShadow: '0 4px 4px 0 rgba(0, 0, 0, 0.25)',
              overflowX: 'auto',
            }}
          >
            {(plansWithSameCurrency ?? []).length > 0 ? (
              (plansWithSameCurrency ?? []).map((plan) => (
                <div
                  key={plan.id}
                  className={`flex flex-col justify-between gap-2 rounded-lg p-4
    ${plan.id === currentPlan?.id ? 'md:min-w-[435px] ' : 'md:min-w-[335px] bg-white'}
    min-h-[571px] w-full md:w-auto`}
                >
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between text-lg font-extrabold mb-2">
                      <span>{plan.name}</span>
                      <div>
                        {' '}
                        {/* {plan.id === currentPlan?.id && (
                            <div className="text-sm rounded-lg bg-white font-bold p-2">
                              Renews in{' '}
                              <span
                                className={
                                  plan.invoiceGenerationDaysBefore < 10
                                    ? 'text-red-500'
                                    : 'text-green-500'
                                }
                              >
                                {plan.invoiceGenerationDaysBefore} days
                              </span>
                            </div>
                          )} */}
                        {activeSubscription && plan.id === currentPlan?.id && (
                          <div className="text-sm rounded-lg bg-white font-bold p-2 ">
                            Expires in{' '}
                            <span
                              className={
                                new Date(
                                  activeSubscription.trialEndAt &&
                                  activeSubscription.isTrial
                                    ? activeSubscription.trialEndAt
                                    : activeSubscription.endAt,
                                ).getTime() -
                                  Date.now() <
                                10 * 24 * 60 * 60 * 1000 // Less than 10 days
                                  ? 'text-red-500'
                                  : 'text-green-500'
                              }
                            >
                              {Math.ceil(
                                (new Date(
                                  activeSubscription.trialEndAt &&
                                  activeSubscription.isTrial
                                    ? activeSubscription.trialEndAt
                                    : activeSubscription.endAt,
                                ).getTime() -
                                  Date.now()) /
                                  (24 * 60 * 60 * 1000),
                              )}{' '}
                              days
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    {!plan.isFree && (
                      <>
                        <div className="text-5xl font-bold">
                          {plan.currency.symbol}
                          {plan.slotPrice}
                        </div>
                        <div className="text-sm text-gray-500">
                          per user billed annually
                        </div>
                      </>
                    )}
                    <div className="mt-8 mb-6 font-bold">
                      Get in depth with our system
                    </div>
                    <div className="flex flex-col gap-5">
                      {plan.planDetails &&
                        plan.planDetails.map((detail, index) => (
                          <div key={index} className="flex gap-2 font-bold">
                            <Checkbox checked={true} />
                            <span>{detail}</span>
                          </div>
                        ))}
                    </div>
                  </div>
                  {plan.id === currentPlan?.id ? (
                    <div className="flex flex-wrap gap-4 mt-8 pl-0 md:pl-4">
                      {plan.isFree !== true && (
                        <Tooltip
                          title={
                            !isLatestInvoicePaid() ? getDisabledTooltip() : ''
                          }
                          placement="bottom"
                        >
                          <span className="w-full md:w-auto">
                            <CustomButton
                              title="Update User Quota"
                              onClick={() =>
                                router.push('/admin/plan?source=quota')
                              }
                              className="text-center flex justify-center items-center w-full"
                              type="default"
                              disabled={!isLatestInvoicePaid()}
                            />
                          </span>
                        </Tooltip>
                      )}
                      {plan.isFree !== true && (
                        <Tooltip
                          title={
                            !isLatestInvoicePaid() ? getDisabledTooltip() : ''
                          }
                          placement="bottom"
                        >
                          <span className="w-full md:w-auto">
                            <CustomButton
                              title="Update Subscription Period"
                              onClick={() =>
                                router.push('/admin/plan?source=period&step=1')
                              }
                              className="text-center flex justify-center items-center w-full"
                              type="default"
                              disabled={!isLatestInvoicePaid()}
                            />
                          </span>
                        </Tooltip>
                      )}
                      {plan.isFree !== true && (
                        <CustomButton
                          title="Pay Next Bill"
                          onClick={() =>
                            router.push(
                              `/admin/invoice/${activeSubscription?.invoices[0]?.id}`,
                            )
                          }
                          className="text-center flex justify-center items-center w-full md:w-auto"
                          type="default"
                        />
                      )}
                    </div>
                  ) : (
                    <div className="flex justify-center mt-8">
                      <Tooltip
                        title={
                          !isLatestInvoicePaid() ? getDisabledTooltip() : ''
                        }
                        placement="bottom"
                      >
                        <span className="w-full">
                          <CustomButton
                            title={
                              hasSelectedPlan &&
                              plan.slotPrice < Number(currentPlan?.slotPrice)
                                ? 'Downgrade Plan'
                                : 'Upgrade Plan'
                            }
                            onClick={() =>
                              router.push(`/admin/plan?planId=${plan.id}`)
                            }
                            className="w-full text-center flex justify-center items-center"
                            type="primary"
                            disabled={!isLatestInvoicePaid()}
                          />
                        </span>
                      </Tooltip>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="w-full py-10 text-center">
                <p className="text-gray-500 text-lg">
                  No plans available. Please check back later.
                </p>
              </div>
            )}
          </div>
        </>
      )}

      <div className="text-2xl font-bold mb-5">Tenant Billing History</div>

      <InvoicesTable
        data={invoices}
        loading={isLoading}
        plans={plans}
        currencies={currencies}
        subscriptions={subscriptions}
      />
    </div>
  );
};

export default AdminDashboard;
