'use client';

import { Button, Card, Divider, Progress, Skeleton, Tag } from 'antd';
import { useEffect, useState } from 'react';
import InvoicesTable from '../_components/invoicesTable/invoicesTable';
import { InvoiceModal } from '../_components/InvoiceModal/InvoiceModal';
import { ManageSubscriptionModal } from '../_components/ManageSubscriptionModal/ManageSubscriptionModal';
import { StatusBadge } from '../_components/ui/StatusBadge';
import { useRouter, useSearchParams } from 'next/navigation';
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
import { useGetEmployeeStatus } from '@/store/server/features/dashboard/employee-status/queries';
import { DEFAULT_TENANT_ID } from '@/utils/constants';
import { useQueryClient } from 'react-query';
import dayjs from 'dayjs';

const AdminDashboard = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [currentPlan, setCurrentPlan] = useState<Plan | undefined>();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [activeSubscription, setActiveSubscription] =
    useState<Subscription | null>(null);
  const [lastInvoice, setLastInvoice] = useState<Invoice | null>(null);
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(
    null,
  );
  const [manageSubscriptionOpen, setManageSubscriptionOpen] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  const {
    data: invoicesData,
    isLoading: isInvoicesLoading,
    refetch: refetchInvoices,
  } = useGetInvoices(
    { filter: { tenantId: DEFAULT_TENANT_ID } },
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

  const { data: currenciesData, isLoading: currenciesLoading } =
    useGetCurrencies({ filter: {} }, true, true);

  const {
    data: subscriptionsData,
    isLoading: subscriptionsLoading,
    refetch: refetchSubscriptions,
  } = useGetSubscriptions(
    { filter: { tenantId: [DEFAULT_TENANT_ID] } },
    true,
    true,
  );

  const { data: employeeStatus } = useGetEmployeeStatus('');
  const seatsUsed =
    employeeStatus?.reduce((acc, s) => acc + Number(s.count), 0) ?? 0;
  const seatsTotal = activeSubscription?.slotTotal ?? 0;
  const seatsPercent =
    seatsTotal > 0
      ? Math.min(100, Math.round((seatsUsed / seatsTotal) * 100))
      : 0;

  useEffect(() => {
    const manageSubscription = searchParams.get('manageSubscription');
    if (manageSubscription === '1') {
      setManageSubscriptionOpen(true);
      router.replace('/admin/dashboard', { scroll: false });
    }
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        queryClient.invalidateQueries('invoices').then(() => refetchInvoices());
        queryClient
          .invalidateQueries('subscriptions')
          .then(() => refetchSubscriptions());
      }
    };
    const paymentSuccess = searchParams.get('payment_success');
    const paymentReturn = searchParams.get('payment_return');
    if (paymentSuccess === 'true' || paymentReturn === 'true') {
      queryClient.invalidateQueries('invoices');
      queryClient.invalidateQueries('subscriptions');
      refetchInvoices();
      refetchSubscriptions();
      router.replace('/admin/dashboard', { scroll: false });
    }
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () =>
      document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [
    searchParams,
    router,
    queryClient,
    refetchInvoices,
    refetchSubscriptions,
  ]);

  useEffect(() => {
    if (invoicesData?.items?.length) {
      const sorted = [...invoicesData.items].sort(
        (a, b) =>
          new Date(b.createdAt || 0).getTime() -
          new Date(a.createdAt || 0).getTime(),
      );
      setInvoices(sorted);
      setLastInvoice(sorted[0]);
    } else {
      setInvoices([]);
      setLastInvoice(null);
    }
  }, [invoicesData]);

  useEffect(() => {
    if (currenciesData?.items?.length) setCurrencies(currenciesData.items);
  }, [currenciesData]);

  useEffect(() => {
    if (plansData?.items?.length) setPlans(plansData.items);
  }, [plansData]);

  useEffect(() => {
    if (subscriptionsData?.items?.length) {
      const all = subscriptionsData.items;
      setSubscriptions(all);
      const active = all.find((s: Subscription) => s.isActive === true);
      if (active) {
        setActiveSubscription(active);
        setCurrentPlan(active.plan);
      } else {
        const latest = [...all].sort(
          (a, b) =>
            new Date(b.createdAt || 0).getTime() -
            new Date(a.createdAt || 0).getTime(),
        )[0];
        setActiveSubscription(latest ?? null);
        setCurrentPlan(latest?.plan);
      }
    } else {
      setSubscriptions([]);
      setActiveSubscription(null);
      setCurrentPlan(undefined);
    }
  }, [subscriptionsData]);

  const daysLeft = (() => {
    const end = activeSubscription?.endAt ?? activeSubscription?.trialEndAt;
    if (!end) return null;
    const diff = dayjs(end).diff(dayjs(), 'day');
    return Math.max(0, diff);
  })();

  const isLoading =
    isInvoicesLoading ||
    plansLoading ||
    currenciesLoading ||
    subscriptionsLoading;

  const openInvoiceModal = (id: string) => {
    setSelectedInvoiceId(id);
    setInvoiceModalOpen(true);
  };

  return (
    <div id="admin-dashboard" data-cy="admin-dashboard">
      {/* Current Subscription + Invoice cards */}
      {isLoading ? (
        <Card
          id="current-subscription-card-loading"
          className="rounded-lg border border-gray-200 shadow-sm mb-8"
        >
          <Skeleton active paragraph={{ rows: 4 }} />
        </Card>
      ) : (
        <div className="grid gap-4 mb-8 lg:grid-cols-2">
          {/* Left: Current Subscription */}
          <Card
            id="current-subscription-card"
            data-cy="current-subscription-card"
            className="rounded-lg shadow-sm h-full"
            style={{ border: '2px solid #0C8CE9' }}
            styles={{ body: { padding: '16px' } }}
          >
            <div className="flex-1 w-full">
              <div className="flex items-center justify-between gap-2 mb-2 w-full">
                <h2 className="text-sm font-medium text-gray-500">
                  Current Subscription plan
                </h2>
                {activeSubscription && (
                  <div className="flex justify-end">
                    <Tag
                      color="success"
                      data-cy="subscription-status-badge"
                      className="shrink-0 m-0"
                    >
                      Active
                    </Tag>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 flex-wrap mt-2">
                <span className="text-2xl font-bold text-gray-900">
                  {currentPlan?.name ?? 'No Plan'}
                </span>
              </div>
              {seatsTotal > 0 && (
                <div className="mt-4">
                  <div className="flex justify-end mb-1">
                    <span className="text-sm text-gray-600">
                      <span className="font-bold">
                        {seatsUsed} / {seatsTotal}
                      </span>{' '}
                      Seats Used
                    </span>
                  </div>
                  <div className="w-[93%]">
                    <Progress
                      percent={seatsPercent}
                      showInfo={false}
                      strokeColor="#1C3CA5"
                      className="mb-4"
                    />
                  </div>
                </div>
              )}
              <p className="text-sm text-gray-600 mb-3">
                Need extra feature or want to update seats?
              </p>
              <div className="flex justify-center">
                <Button
                  type="primary"
                  onClick={() => setManageSubscriptionOpen(true)}
                  data-cy="manage-subscription-button"
                  className="w-[265px] font-normal"
                >
                  Manage Subscription
                </Button>
              </div>
            </div>
          </Card>

          {/* Right: Latest Invoice summary */}
          <Card
            id="latest-invoice-card"
            data-cy="latest-invoice-card"
            className="rounded-lg shadow-sm h-full"
            style={{ border: '2px solid #e5e7eb' }}
            styles={{ body: { padding: '16px' } }}
          >
            <div className="flex flex-col justify-between gap-4 h-full">
              {lastInvoice && (
                <>
                  <div className="w-full">
                    <div className="flex items-center justify-between gap-2 w-full mb-1">
                      <span className="text-sm font-medium text-gray-500">
                        Invoice
                      </span>
                      <Tag

                        color={
                          lastInvoice.status?.toLowerCase() === 'paid'
                            ? 'success'
                            : lastInvoice.status?.toLowerCase() === 'pending' ||
                                lastInvoice.status?.toLowerCase() === 'issued'
                              ? 'warning'
                              : 'error'
                        }
                        className="shrink-0 m-0"
                      >
                        {lastInvoice.status}
                      </Tag>
                    </div>
                    <div className="text-sm text-gray-700 font-bold">
                      #{lastInvoice.invoiceNumber}
                    </div>
                  </div>
                  <Divider className="my-3" />
                  <div className="flex flex-col gap-1 w-full">
                    <div className="flex items-baseline justify-between gap-2 w-full">
                      <span className="text-sm text-gray-500">Due Date</span>

                      {daysLeft !== null && (
                        <Tag
                          color="success"
                          className="shrink-0 align-baseline m-0"
                        >
                          {daysLeft} Days Left
                        </Tag>
                      )}
                    </div>{' '}
                    <span className="text-sm text-gray-700 font-bold">
                      {dayjs(lastInvoice.dueAt).format('MMM D, YYYY')}
                    </span>
                  </div>
                </>
              )}
              <div className="flex justify-center">
                <Button
                  onClick={() => router.push('/admin/billing')}
                  data-cy="billing-and-invoice-button"
                  className="w-[265px] font-normal border-gray-300"
                >
                  Billing and Invoice
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      <Divider className="my-6" />

      {/* Recent Billing History */}
      <div className="mb-4">
        <h2 className="text-base font-bold text-gray-900">
          Recent Billing History
        </h2>
      </div>
      <InvoicesTable
        data={invoices}
        loading={isLoading}
        plans={plans}
        currencies={currencies}
        subscriptions={subscriptions}
        onInvoiceClick={openInvoiceModal}
        hideFilters
      />

      <InvoiceModal
        open={invoiceModalOpen}
        invoiceId={selectedInvoiceId}
        onClose={() => {
          setInvoiceModalOpen(false);
          setSelectedInvoiceId(null);
        }}
      />

      <ManageSubscriptionModal
        open={manageSubscriptionOpen}
        onClose={() => setManageSubscriptionOpen(false)}
        onContinueToInvoice={(invoiceId) => {
          setManageSubscriptionOpen(false);
          setSelectedInvoiceId(invoiceId);
          setInvoiceModalOpen(true);
        }}
      />
    </div>
  );
};

export default AdminDashboard;
