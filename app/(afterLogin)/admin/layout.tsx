'use client';

import React, { ReactNode, useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Button, Divider, notification } from 'antd';
import { LeftOutlined } from '@ant-design/icons';
import { TbUserSquare } from 'react-icons/tb';
import CustomBreadcrumb from '@/components/common/breadCramp';
import { MdOutlinePayment } from 'react-icons/md';
import { useGetSubscriptions } from '@/store/server/features/tenant-management/subscriptions/queries';
import { usePrepaySubscription } from '@/store/server/features/tenant-management/manage-subscriptions/mutation';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { Subscription } from '@/types/tenant-management';
import { InvoiceModal } from './_components/InvoiceModal/InvoiceModal';

interface AdminLayoutProps {
  children: ReactNode;
}

const getBreadcrumbConfig = (pathname: string) => {
  if (pathname.startsWith('/admin/billing')) {
    return {
      title: 'Billing and Invoice',
      subtitle: 'Admin Console / Billing and Invoice',
    };
  }
  if (pathname.startsWith('/admin/profile')) {
    return {
      title: 'Company Profile',
      subtitle: 'Admin Console / Company Profile',
    };
  }
  if (pathname.startsWith('/admin/plan')) {
    return {
      title: 'Plan Management',
      subtitle: 'Admin Console / Plan Management',
    };
  }
  if (pathname.startsWith('/admin/invoice')) {
    return {
      title: 'Invoice Details',
      subtitle: 'Admin Console / Billing and Invoice',
    };
  }
  return {
    title: 'Dashboard',
    subtitle: 'Admin Console / Dashboard',
  };
};

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { title, subtitle } = getBreadcrumbConfig(pathname || '');
  const tenantId = useAuthenticationStore((s) => s.tenantId);
  const [invoiceId, setInvoiceId] = useState<string | null>(null);
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
  const isBillingPage = pathname?.startsWith('/admin/billing');
  const isProfilePage = pathname?.startsWith('/admin/profile');
  const isDashboardPage =
    pathname === '/admin' || pathname?.startsWith('/admin/dashboard');
  const prepaySubscriptionMutation = usePrepaySubscription();
  const { data: subscriptionsData } = useGetSubscriptions(
    tenantId ? { filter: { tenantId: [tenantId] } } : {},
    true,
    !!tenantId && !!isBillingPage,
  );

  const currentSubscription = useMemo(() => {
    const items = (subscriptionsData?.items ?? []) as Subscription[];
    if (!items.length) return null;
    const active = items.find((s) => s.isActive);
    if (active) return active;
    const sorted = [...items].sort(
      (a, b) =>
        new Date(b.createdAt || 0).getTime() -
        new Date(a.createdAt || 0).getTime(),
    );
    return sorted[0] ?? null;
  }, [subscriptionsData]);

  const getInvoiceIdFromResponse = (payload: any): string | null =>
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
    null;

  const handlePayNextBill = async () => {
    if (!tenantId || !currentSubscription?.id) {
      notification.error({
        message: 'Payment Error',
        description:
          'Current subscription was not found. Please refresh and try again.',
      });
      return;
    }
    try {
      const response = await prepaySubscriptionMutation.mutateAsync({
        subscriptionId: currentSubscription.id,
        tenantId,
      });
      const nextInvoiceId = getInvoiceIdFromResponse(response);
      if (!nextInvoiceId) {
        notification.error({
          message: 'Invoice Error',
          description:
            'Prepay succeeded but invoice id was not found in the response.',
        });
        return;
      }
      setInvoiceId(nextInvoiceId);
      setInvoiceModalOpen(true);
    } catch (error) {
      notification.error({
        message: 'Payment Failed',
        description:
          error instanceof Error
            ? error.message
            : 'Failed to prepay next bill.',
      });
    }
  };

  return (
    <div className="h-auto w-auto py-6" data-cy="admin-layout">
      <div
        data-cy="app-afterlogin-admin-layout-tsx-layout-div-136"
        className="flex items-start justify-between gap-2 flex-nowrap"
      >
        <div
          data-cy="app-afterlogin-admin-layout-tsx-layout-div-137"
          className="flex items-start gap-3 min-w-0 flex-1"
        >
          {!isDashboardPage && (
            <span
              className="mt-[22px] border border-gray-300 rounded-lg p-2 cursor-pointer flex items-center justify-center"
              data-cy="admin-layout-back-button"
              onClick={() => router.back()}
            >
              <LeftOutlined className="text-base" size={16} />
            </span>
          )}
          <CustomBreadcrumb
            title={title}
            rootClassName="!w-auto min-w-0"
            titleClassName="!text-[#000000]/[0.7]"
            subtitle={
              <>
                <Link
                  href="/admin/dashboard"
                  className="text-slate-500 hover:text-primary"
                >
                  Admin Console
                </Link>
                {' / '}
                <span
                  data-cy="app-afterlogin-admin-layout-tsx-layout-span-159"
                  className="text-[#000000]/[0.7]"
                >
                  {String(subtitle).replace(/^Admin Console\s*\/\s*/, '')}
                </span>
              </>
            }
          />
        </div>
        {isBillingPage ? (
          <Button
            type="default"
            onClick={handlePayNextBill}
            loading={prepaySubscriptionMutation.isLoading}
            data-cy="admin-layout-pay-next-bill"
            className="!inline-flex !items-center !shrink-0 !mt-[10px] !h-10 !font-normal"
          >
            <span
              data-cy="app-afterlogin-admin-layout-tsx-layout-span-174"
              className="inline-flex items-center gap-2 leading-none"
            >
              <MdOutlinePayment size={20} className="shrink-0" />
              <span
                data-cy="app-afterlogin-admin-layout-tsx-layout-span-176"
                className="hidden sm:inline"
              >
                Pay Next Bill
              </span>
            </span>
          </Button>
        ) : !isProfilePage ? (
          <Link href="/admin/profile" className="shrink-0">
            <Button
              type="primary"
              icon={<TbUserSquare />}
              data-cy="admin-layout-update-profile"
              className="!mt-[10px] !h-10"
            >
              <span
                data-cy="app-afterlogin-admin-layout-tsx-layout-span-187"
                className="hidden sm:inline font-normal"
              >
                Update Profile
              </span>
            </Button>
          </Link>
        ) : null}
      </div>
      <Divider className="!my-0" />
      {/* <Card className="rounded-lg" styles={{ body: { padding: 0 } }}> */}
      <InvoiceModal
        open={invoiceModalOpen}
        invoiceId={invoiceId}
        onClose={() => {
          setInvoiceModalOpen(false);
          setInvoiceId(null);
        }}
      />
      <div
        data-cy="app-afterlogin-admin-layout-tsx-layout-div-202"
        className="pt-[24px] pb-6"
      >
        {children}
      </div>
      {/* </Card> */}
    </div>
  );
};

export default AdminLayout;
