'use client';

import React, { useMemo, useState } from 'react';
import { Button, notification } from 'antd';
import { useRouter } from 'next/navigation';
import { InvoiceModal } from '../../../admin/_components/InvoiceModal/InvoiceModal';
import { useGetSubscriptions } from '@/store/server/features/tenant-management/subscriptions/queries';
import { useRenewSubscription } from '@/store/server/features/tenant-management/manage-subscriptions/mutation';
import { DEFAULT_TENANT_ID } from '@/utils/constants';
import { Subscription } from '@/types/tenant-management';
import AccessGuard from '@/utils/permissionGuard';

const WarningIcon = () => {
  return (
    <div
      data-cy="-noadminlayout-admin-subscription-expired-page-tsx-page-div-15"
      className="relative flex items-center justify-center"
    >
      <svg
        data-cy="-noadminlayout-admin-subscription-expired-page-tsx-page-svg-16"
        width="84"
        height="84"
        viewBox="0 0 84 84"
        fill="none"
        aria-hidden
      >
        <path
          data-cy="-noadminlayout-admin-subscription-expired-page-tsx-page-path-17"
          d="M42 10.5c1.5 0 2.9.8 3.6 2.1l30.2 52.3c.7 1.2.7 2.8 0 4-0.7 1.3-2 2.1-3.5 2.1H11.7c-1.5 0-2.9-.8-3.6-2.1-.7-1.2-.7-2.8 0-4L38.3 12.6c.7-1.3 2.1-2.1 3.7-2.1Z"
          stroke="#F6C945"
          strokeWidth="6"
          strokeLinejoin="round"
        />
        <path
          data-cy="-noadminlayout-admin-subscription-expired-page-tsx-page-path-23"
          d="M42 32.5v18"
          stroke="#F6C945"
          strokeWidth="6"
          strokeLinecap="round"
        />
        <path
          data-cy="-noadminlayout-admin-subscription-expired-page-tsx-page-path-29"
          d="M42 60.5h.04"
          stroke="#F6C945"
          strokeWidth="8"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
};

export default function SubscriptionExpiredAdminPage() {
  const router = useRouter();
  const renewSubscriptionMutation = useRenewSubscription();
  const [invoiceId, setInvoiceId] = useState<string | null>(null);
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);

  const { data: subscriptionsData, isLoading: subscriptionsLoading } =
    useGetSubscriptions(
      { filter: { tenantId: [DEFAULT_TENANT_ID] } },
      true,
      true,
    );

  const expiredSubscription = useMemo(() => {
    const items = (subscriptionsData as any)?.items as
      | Subscription[]
      | undefined;
    if (!Array.isArray(items) || items.length === 0) return null;
    const now = Date.now();
    const isExpiredByDateAndInactive = (s: Subscription) => {
      if (s.isActive) return false;
      const endAt = s.endAt ? new Date(s.endAt).getTime() : NaN;
      return Number.isFinite(endAt) && endAt < now;
    };
    const sorted = [...items].sort(
      (a, b) =>
        new Date(b.createdAt || 0).getTime() -
        new Date(a.createdAt || 0).getTime(),
    );
    return sorted.find(isExpiredByDateAndInactive) ?? null;
  }, [subscriptionsData]);

  const canRenewSubscription = AccessGuard.checkAccess({
    permissions: ['view_admin_billing'],
  });
  const canChangePlan = AccessGuard.checkAccess({
    permissions: ['view_admin_dashboard'],
  });

  const getInvoiceIdFromResponse = (payload: any): string | null => {
    return (
      payload?.invoice?.id ??
      payload?.data?.invoice?.id ??
      payload?.item?.invoice?.id ??
      payload?.invoices?.[0]?.id ??
      payload?.data?.invoices?.[0]?.id ??
      payload?.item?.invoices?.[0]?.id ??
      payload?.items?.[0]?.id ??
      payload?.data?.items?.[0]?.id ??
      payload?.item?.items?.[0]?.id ??
      payload?.id ??
      payload?.data?.id ??
      payload?.item?.id ??
      null
    );
  };

  const handleRenew = async () => {
    if (subscriptionsLoading) return;
    if (!expiredSubscription?.id) {
      notification.error({
        message: 'Renewal Error',
        description:
          'No expired subscription was found (checked: subscription is not active AND end date is in the past).',
      });
      return;
    }

    try {
      const response = await renewSubscriptionMutation.mutateAsync({
        subscriptionId: expiredSubscription.id,
        tenantId: DEFAULT_TENANT_ID,
        planId: expiredSubscription.planId,
        planPeriodId: expiredSubscription.planPeriodId,
        slotTotal: expiredSubscription.slotTotal,
      });
      const nextInvoiceId = getInvoiceIdFromResponse(response);
      if (!nextInvoiceId) {
        notification.error({
          message: 'Invoice Error',
          description:
            'Renewal succeeded but an invoice id was not returned. Please open Billing to continue payment.',
        });
        return;
      }
      setInvoiceId(nextInvoiceId);
      setInvoiceModalOpen(true);
    } catch (error) {
      notification.error({
        message: 'Renewal Failed',
        description:
          error instanceof Error
            ? error.message
            : 'Failed to renew subscription.',
      });
    }
  };

  return (
    <div
      data-cy="-noadminlayout-admin-subscription-expired-page-tsx-page-div-139"
      className="w-full h-[calc(70vh-64px)] min-h-[560px] flex items-center justify-center"
    >
      <InvoiceModal
        open={invoiceModalOpen}
        invoiceId={invoiceId}
        onClose={() => {
          setInvoiceModalOpen(false);
          setInvoiceId(null);
        }}
        onPaySuccess={() => {
          setInvoiceModalOpen(false);
        }}
      />
      <div
        data-cy="-noadminlayout-admin-subscription-expired-page-tsx-page-div-151"
        className="w-full max-w-[680px] px-6"
      >
        <div
          data-cy="-noadminlayout-admin-subscription-expired-page-tsx-page-div-152"
          className="flex flex-col items-center text-center"
        >
          <WarningIcon />

          <div
            data-cy="-noadminlayout-admin-subscription-expired-page-tsx-page-div-155"
            className="mt-3 inline-flex items-center justify-center rounded-full bg-[#FFF7E6] px-4 py-1 text-xs font-medium text-[#D48B00]"
          >
            Subscription Notice
          </div>

          <h1
            data-cy="-noadminlayout-admin-subscription-expired-page-tsx-page-h1-159"
            className="mt-4 text-3xl font-bold text-gray-900"
          >
            Your Subscription Has Expired
          </h1>
          <p
            data-cy="-noadminlayout-admin-subscription-expired-page-tsx-page-p-162"
            className="mt-2 max-w-[520px] text-sm text-gray-500"
          >
            Your access to Essentials features has been paused. Renew your plan
            to restore full access to all features.
          </p>

          <div
            data-cy="-noadminlayout-admin-subscription-expired-page-tsx-page-div-167"
            className="mt-7 flex flex-wrap items-center justify-center gap-4"
          >
            {canRenewSubscription && (
              <Button
                type="primary"
                className="min-w-[140px] bg-[#1E40AF] hover:!bg-[#1D4ED8]"
                onClick={handleRenew}
                loading={renewSubscriptionMutation.isLoading}
                data-cy="subscription-expired-renew"
              >
                Renew Now
              </Button>
            )}
            {canChangePlan && (
              <Button
                className="min-w-[140px]"
                onClick={() =>
                  router.push('/admin/dashboard?manageSubscription=1')
                }
                data-cy="subscription-expired-change-plan"
              >
                Change Plan
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
