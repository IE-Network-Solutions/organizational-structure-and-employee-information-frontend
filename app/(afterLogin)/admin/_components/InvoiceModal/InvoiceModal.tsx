'use client';

import React, { useEffect, useState } from 'react';
import { Modal, Button, Dropdown, Skeleton, Tag, notification } from 'antd';
import type { MenuProps } from 'antd';
import { CloseOutlined, LoadingOutlined } from '@ant-design/icons';
import { MdOutlineFileDownload } from 'react-icons/md';
import dayjs from 'dayjs';
import { Invoice, Plan } from '@/types/tenant-management';
import { useGetInvoiceDetail } from '@/store/server/features/tenant-management/invoices/queries';
import { useGetPlans } from '@/store/server/features/tenant-management/plans/queries';
import { useInitiatePayment } from '@/store/server/features/tenant-management/payments/queries';
import {
  InvoicePayCardMenuIcon,
  InvoicePayChapaMenuIcon,
  InvoicePayWalletIcon,
} from './invoicePaymentIcons';

interface InvoiceModalProps {
  open: boolean;
  invoiceId: string | null;
  onClose: () => void;
  onPaySuccess?: () => void;
}

type PaymentOption = 'card' | 'chapa';

const formatDate = (dateString: string | undefined) => {
  if (!dateString) return '';
  return dayjs(dateString).format('MMMM D, YYYY');
};

const getTagClassName = (status: string | undefined) => {
  switch (status?.toLowerCase()) {
    case 'paid':
      return '!border-[#d5f0c8] !bg-[#f2ffe8] !text-[#7bc56f]';
    case 'pending':
    case 'issued':
      return '!border-[#ffe9b8] !bg-[#fff7e1] !text-[#d7a94b]';
    default:
      return '!border-[#ffd7d7] !bg-[#fff1f1] !text-[#e37a7a]';
  }
};

export const InvoiceModal: React.FC<InvoiceModalProps> = ({
  open,
  invoiceId,
  onClose,
  onPaySuccess,
}) => {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);

  const effectiveId = open && invoiceId ? invoiceId : '';
  const { data: invoiceResponse, isLoading: isInvoiceLoading } =
    useGetInvoiceDetail(effectiveId, '', !!effectiveId);
  const { data: pdfResponse } = useGetInvoiceDetail(
    effectiveId,
    'PDF',
    !!effectiveId,
  );
  const { data: plansData } = useGetPlans({ filter: {} }, true, true, 'ASC');
  const initiatePaymentMutation = useInitiatePayment();

  const invoiceData = (invoiceResponse as any)?.item as Invoice | undefined;
  const currentPlan = invoiceData?.subscription?.planId
    ? plans.find((p) => p.id === invoiceData.subscription.planId)
    : null;
  const billingCycleLabel =
    invoiceData?.subscription?.planPeriod?.periodType?.code ??
    (invoiceData?.paymentMetadata?.targetState?.plan?.periods ?? []).find(
      (pp: any) =>
        pp?.id === invoiceData?.paymentMetadata?.targetState?.planPeriodId,
    )?.periodType?.code ??
    '—';

  useEffect(() => {
    if (plansData?.items) setPlans(plansData.items);
  }, [plansData]);

  useEffect(() => {
    if (pdfResponse) {
      const res = pdfResponse as any;
      const url = res.downloadUrl || res.data?.downloadUrl;
      if (url) setPdfUrl(url);
    }
  }, [pdfResponse]);

  const handleDownloadPdf = () => {
    if (pdfUrl) {
      window.open(pdfUrl, '_blank');
      return;
    }

    notification.warning({
      message: 'PDF Not Available',
      description: 'PDF is not available for this invoice.',
    });
  };

  const handlePay = async (paymentOption: PaymentOption = 'card') => {
    if (!invoiceId) {
      notification.error({
        message: 'Payment Error',
        description: 'Please select a valid payment method to continue.',
      });
      return;
    }

    const paymentMap: Record<
      PaymentOption,
      { paymentMethod: string; paymentProvider: string }
    > = {
      card: {
        paymentMethod: 'STRIPE',
        paymentProvider: 'stripe',
      },
      chapa: {
        paymentMethod: 'CHAPA',
        paymentProvider: 'chapa',
      },
    };

    try {
      const returnUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/admin/dashboard`;
      const response = await initiatePaymentMutation.mutateAsync({
        invoiceId,
        data: {
          ...paymentMap[paymentOption],
          returnUrl,
        },
      });
      const api = response as any;
      const redirectUrl = api?.data?.redirectUrl || api?.redirectUrl;
      if (!redirectUrl) throw new Error('No redirect URL received');

      notification.success({
        message: 'Payment Initiated',
        description: 'Redirecting to payment page.',
      });
      window.location.href = redirectUrl;
      onPaySuccess?.();
    } catch (error) {
      notification.error({
        message: 'Payment Failed',
        description:
          error instanceof Error
            ? error.message
            : 'There was an error initiating payment.',
      });
    }
  };

  const payableStatuses = new Set(['pending', 'issued', 'overdue', 'unpaid']);
  const isPending = payableStatuses.has(
    invoiceData?.status?.toLowerCase() ?? '',
  );

  const paymentMenu: MenuProps = {
    items: [
      {
        key: 'card',
        icon: <InvoicePayCardMenuIcon />,
        label: 'Card',
      },
      {
        key: 'chapa',
        icon: <InvoicePayChapaMenuIcon />,
        label: 'Chapa',
      },
    ],
    onClick: ({ key }) => {
      void handlePay(key as PaymentOption);
    },
  };

  return (
    <Modal
      title="Invoice"
      closeIcon={
        <CloseOutlined
          className="text-gray-600 hover:text-gray-900"
          data-cy="invoice-modal-close"
        />
      }
      open={open}
      onCancel={onClose}
      footer={null}
      width={684}
      centered
      destroyOnClose
      className="invoice-modal"
      data-cy="invoice-modal"
      styles={{ content: { padding: 0 } }}
    >
      {!invoiceId ? (
        <div
          data-cy="admin-components-invoicemodal-invoicemodal-tsx-invoicemodal-div-143"
          className="px-6 py-6 text-gray-500"
        >
          No invoice selected.
        </div>
      ) : isInvoiceLoading ? (
        <div data-cy="invoice-modal-loading" className="px-6 py-4">
          <Skeleton active paragraph={{ rows: 8 }} />
        </div>
      ) : !invoiceData ? (
        <div
          data-cy="admin-components-invoicemodal-invoicemodal-tsx-invoicemodal-div-147"
          className="px-6 py-6 text-gray-500"
        >
          Invoice not found.
        </div>
      ) : (
        <div
          data-cy="admin-components-invoicemodal-invoicemodal-tsx-invoicemodal-div-149"
          className="flex min-h-0 flex-1 flex-col bg-white"
        >
          <div
            data-cy="invoice-modal-inner-box"
            className="mx-5 mt-4 flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border border-[#eceff3] bg-white"
          >
            <div
              data-cy="invoice-modal-scroll"
              className="flex min-h-0 flex-1 flex-col overflow-y-auto"
            >
              <div
                data-cy="admin-components-invoicemodal-invoicemodal-tsx-invoicemodal-div-151"
                className="flex items-start justify-between gap-4 px-5 pb-4 pt-5"
              >
                <div data-cy="admin-components-invoicemodal-invoicemodal-tsx-invoicemodal-div-152">
                  <h2
                    className="text-[17px] font-semibold text-gray-900"
                    data-cy="invoice-modal-title"
                  >
                    Invoice {invoiceData.invoiceNumber}
                  </h2>
                  <p
                    data-cy="admin-components-invoicemodal-invoicemodal-tsx-invoicemodal-p-159"
                    className="mt-1 text-[13px] text-gray-500"
                  >
                    {formatDate(invoiceData.invoiceAt)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleDownloadPdf}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded border border-[#d9d9d9] text-gray-500 transition-colors hover:border-primary hover:text-primary"
                  data-cy="invoice-modal-download"
                >
                  <MdOutlineFileDownload className="h-4 w-4" />
                </button>
              </div>

              <div
                className="h-px w-full shrink-0 bg-[#eceff3]"
                data-cy="invoice-modal-separator-after-header"
                aria-hidden
              />

              <div
                data-cy="invoice-modal-payment-information"
                className="px-5 py-4"
              >
                <h3
                  data-cy="admin-components-invoicemodal-invoicemodal-tsx-invoicemodal-h3-177"
                  className="mb-4 text-[16px] font-semibold text-gray-900"
                >
                  Payment Information
                </h3>
                <div
                  className="-mx-5 mb-4 h-px bg-[#eceff3]"
                  data-cy="invoice-modal-separator-under-payment-title"
                  aria-hidden
                />
                <div
                  data-cy="admin-components-invoicemodal-invoicemodal-tsx-invoicemodal-div-181"
                  className="flex flex-col gap-4 text-[14px]"
                >
                  {[
                    ['Invoice Number', `#${invoiceData.invoiceNumber}`],
                    ['Issue Date', formatDate(invoiceData.invoiceAt)],
                    [
                      'Payment Date',
                      invoiceData.payments?.[0]?.paymentAt
                        ? formatDate(invoiceData.payments[0].paymentAt)
                        : '-',
                    ],
                    [
                      'Billing Period',
                      invoiceData.subscription?.startAt &&
                      invoiceData.subscription?.endAt
                        ? `${formatDate(invoiceData.subscription.startAt)} - ${formatDate(invoiceData.subscription.endAt)}`
                        : '-',
                    ],
                    [
                      'Number of Users',
                      String(
                        invoiceData.paymentMetadata?.targetState?.slotTotal ??
                          invoiceData.subscription?.slotTotal ??
                          '—',
                      ),
                    ],
                    [
                      'Amount',
                      `${invoiceData.currency?.symbol ?? ''}${invoiceData.totalAmount}`,
                    ],
                  ].map(([label, value]) => (
                    <div
                      data-cy="admin-components-invoicemodal-invoicemodal-tsx-invoicemodal-div-211"
                      key={String(label)}
                      className="grid grid-cols-[140px_minmax(0,1fr)] items-start gap-4"
                    >
                      <span
                        data-cy="admin-components-invoicemodal-invoicemodal-tsx-invoicemodal-span-215"
                        className="text-gray-500"
                      >
                        {label}
                      </span>
                      <span
                        data-cy="admin-components-invoicemodal-invoicemodal-tsx-invoicemodal-span-216"
                        className="text-right font-medium text-gray-900"
                      >
                        {value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div
                className="h-px w-full shrink-0 bg-[#eceff3]"
                data-cy="invoice-modal-separator-after-payment"
                aria-hidden
              />

              <div data-cy="invoice-modal-plan-detail" className="px-5 py-4">
                <h3
                  data-cy="admin-components-invoicemodal-invoicemodal-tsx-invoicemodal-h3-228"
                  className="mb-4 text-[16px] font-semibold text-gray-900"
                >
                  Plan Detail
                </h3>
                <div
                  className="-mx-5 mb-4 h-px bg-[#eceff3]"
                  data-cy="invoice-modal-separator-under-plan-title"
                  aria-hidden
                />
                <div
                  data-cy="admin-components-invoicemodal-invoicemodal-tsx-invoicemodal-div-233"
                  className="flex flex-col gap-3 text-[14px]"
                >
                  <div
                    data-cy="admin-components-invoicemodal-invoicemodal-tsx-invoicemodal-div-234"
                    className="grid grid-cols-[140px_minmax(0,1fr)] items-center gap-4"
                  >
                    <span
                      data-cy="admin-components-invoicemodal-invoicemodal-tsx-invoicemodal-span-235"
                      className="text-gray-500"
                    >
                      Plan Type
                    </span>
                    <div
                      data-cy="invoice-modal-plan-type-tag-wrap"
                      className="flex justify-end"
                    >
                      <Tag className="!m-0 !rounded !border-[#dbeafe] !bg-[#f0f7ff] !px-2 !py-0 !text-[11px] !font-medium !leading-5 !text-[#4f8bc9]">
                        {currentPlan?.name ??
                          invoiceData.subscription?.plan?.name ??
                          'N/A'}
                      </Tag>
                    </div>
                  </div>
                  <div
                    data-cy="admin-components-invoicemodal-invoicemodal-tsx-invoicemodal-div-242"
                    className="grid grid-cols-[140px_minmax(0,1fr)] items-center gap-4"
                  >
                    <span
                      data-cy="admin-components-invoicemodal-invoicemodal-tsx-invoicemodal-span-243"
                      className="text-gray-500"
                    >
                      Billing Cycle
                    </span>
                    <div
                      data-cy="invoice-modal-billing-cycle-tag-wrap"
                      className="flex justify-end"
                    >
                      <Tag className="!m-0 !rounded !border-[#dbeafe] !bg-[#f0f7ff] !px-2 !py-0 !text-[11px] !font-medium !leading-5 !text-[#4f8bc9]">
                        {billingCycleLabel}
                      </Tag>
                    </div>
                  </div>
                  <div
                    data-cy="admin-components-invoicemodal-invoicemodal-tsx-invoicemodal-div-248"
                    className="grid grid-cols-[140px_minmax(0,1fr)] items-center gap-4"
                  >
                    <span
                      data-cy="admin-components-invoicemodal-invoicemodal-tsx-invoicemodal-span-249"
                      className="text-gray-500"
                    >
                      Status
                    </span>
                    <div
                      data-cy="invoice-modal-status-tag-wrap"
                      className="flex justify-end"
                    >
                      <Tag
                        className={`!m-0 !rounded !px-2 !py-0 !text-[11px] !font-medium !leading-5 ${getTagClassName(
                          invoiceData.status,
                        )}`}
                      >
                        {invoiceData.status}
                      </Tag>
                    </div>
                  </div>
                </div>
              </div>

              <div
                className="h-px w-full shrink-0 bg-[#eceff3]"
                data-cy="invoice-modal-separator-after-plan"
                aria-hidden
              />

              <div
                data-cy="admin-components-invoicemodal-invoicemodal-tsx-invoicemodal-div-269"
                className="px-5 py-4"
              >
                <h3
                  data-cy="admin-components-invoicemodal-invoicemodal-tsx-invoicemodal-h3-270"
                  className="mb-4 text-[16px] font-semibold text-gray-900"
                >
                  Notes
                </h3>
                <div
                  className="-mx-5 mb-4 h-px bg-[#eceff3]"
                  data-cy="invoice-modal-separator-under-notes-title"
                  aria-hidden
                />
                <p
                  data-cy="admin-components-invoicemodal-invoicemodal-tsx-invoicemodal-p-275"
                  className="text-[13px] leading-normal text-gray-900"
                >
                  {invoiceData.notes || '—'}
                </p>
              </div>
            </div>
          </div>

          <div
            data-cy="admin-components-invoicemodal-invoicemodal-tsx-invoicemodal-div-281"
            className="ml-auto flex shrink-0 items-center justify-end gap-3 px-5 py-4"
          >
            <Button
              onClick={onClose}
              data-cy="invoice-modal-cancel"
              className="!h-9 !rounded-md !border-gray-200 !px-4 !font-normal !text-[#000000]/[0.7]"
            >
              Back
            </Button>
            {isPending && (
              <Dropdown
                menu={paymentMenu}
                trigger={['click']}
                disabled={initiatePaymentMutation.isLoading}
                placement="topRight"
              >
                <Button
                  type="primary"
                  data-cy="invoice-modal-pay"
                  icon={
                    initiatePaymentMutation.isLoading ? (
                      <LoadingOutlined />
                    ) : (
                      <span
                        data-cy="invoice-modal-pay-wallet-icon"
                        className="inline-flex text-white [&_svg]:shrink-0"
                      >
                        <InvoicePayWalletIcon />
                      </span>
                    )
                  }
                  className="!inline-flex !h-9 !items-center !rounded-md !border-[#1c3ca5] !bg-[#1c3ca5] !px-4 !font-normal !text-white hover:!border-[#163494] hover:!bg-[#163494]"
                >
                  Pay
                </Button>
              </Dropdown>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
};
