'use client';

import React, { useState, useEffect } from 'react';
import { Modal, Button, Divider, Skeleton, Tag, notification } from 'antd';
import { CreditCardOutlined, LoadingOutlined } from '@ant-design/icons';
import { MdOutlineFileDownload } from 'react-icons/md';
import dayjs from 'dayjs';
import { Invoice, Plan } from '@/types/tenant-management';
import { useGetInvoiceDetail } from '@/store/server/features/tenant-management/invoices/queries';
import { useGetPlans } from '@/store/server/features/tenant-management/plans/queries';
import { useInitiatePayment } from '@/store/server/features/tenant-management/payments/queries';

interface InvoiceModalProps {
  open: boolean;
  invoiceId: string | null;
  onClose: () => void;
  onPaySuccess?: () => void;
}

const formatDate = (dateString: string | undefined) => {
  if (!dateString) return '';
  return dayjs(dateString).format('MMMM D, YYYY');
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
    useGetInvoiceDetail(effectiveId, '');
  const { data: pdfResponse } = useGetInvoiceDetail(effectiveId, 'PDF');
  const { data: plansData } = useGetPlans({ filter: {} }, true, true, 'ASC');
  const initiatePaymentMutation = useInitiatePayment();

  const invoiceData = (invoiceResponse as any)?.item as Invoice | undefined;
  const currentPlan = invoiceData?.subscription?.planId
    ? plans.find((p) => p.id === invoiceData.subscription.planId)
    : null;
  const billingCycleLabel =
    invoiceData?.subscription?.planPeriod?.periodType?.code ??
    // Fallback for APIs that return period only in payment metadata target state
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
    if (pdfUrl) window.open(pdfUrl, '_blank');
    else
      notification.warning({
        message: 'PDF Not Available',
        description: 'PDF is not available for this invoice.',
      });
  };

  const handlePay = async () => {
    const paymentCurrency = currentPlan?.currency?.code;
    const method =
      paymentCurrency === 'ETB'
        ? 'chapa'
        : paymentCurrency === 'USD'
          ? 'stripe'
          : null;
    if (!method || !invoiceId) {
      notification.error({
        message: 'Payment Error',
        description: 'Please select a valid payment method to continue.',
      });
      return;
    }
    try {
      const returnUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/admin/dashboard`;
      const response = await initiatePaymentMutation.mutateAsync({
        invoiceId,
        data: {
          paymentMethod: method.toUpperCase(),
          paymentProvider: method,
          returnUrl,
        },
      });
      const api = response as any;
      const redirectUrl = api?.data?.redirectUrl || api?.redirectUrl;
      if (redirectUrl) {
        notification.success({
          message: 'Payment Initiated',
          description: 'Redirecting to payment page.',
        });
        window.location.href = redirectUrl;
        onPaySuccess?.();
      } else {
        throw new Error('No redirect URL received');
      }
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

  return (
    <Modal
      title=""
      closeIcon={null}
      open={open}
      onCancel={onClose}
      footer={null}
      width={560}
      centered
      destroyOnClose
      className="invoice-modal"
      data-cy="invoice-modal"
      styles={{ content: { padding: '8px 0px' } }}
    >
      {!invoiceId ? (
        <div
          data-cy="admin-components-invoicemodal-invoicemodal-tsx-invoicemodal-div-143"
          className="py-6 text-gray-500 mt-5"
        >
          No invoice selected.
        </div>
      ) : isInvoiceLoading ? (
        <Skeleton active paragraph={{ rows: 8 }} />
      ) : !invoiceData ? (
        <div
          data-cy="admin-components-invoicemodal-invoicemodal-tsx-invoicemodal-div-147"
          className="py-6 text-gray-500 mt-5"
        >
          Invoice not found.
        </div>
      ) : (
        <div
          data-cy="admin-components-invoicemodal-invoicemodal-tsx-invoicemodal-div-149"
          className="flex flex-col mt-5"
        >
          {/* Invoice summary: number, date, download */}
          <div
            data-cy="admin-components-invoicemodal-invoicemodal-tsx-invoicemodal-div-151"
            className="flex items-start justify-between gap-4 mx-5"
          >
            <div data-cy="admin-components-invoicemodal-invoicemodal-tsx-invoicemodal-div-152">
              <h2
                className="text-xl font-bold text-gray-900"
                data-cy="invoice-modal-title"
              >
                Invoice {invoiceData.invoiceNumber}
              </h2>
              <p
                data-cy="admin-components-invoicemodal-invoicemodal-tsx-invoicemodal-p-159"
                className="text-sm text-gray-600 mt-1"
              >
                {formatDate(invoiceData.invoiceAt)}
              </p>
            </div>
            <button
              type="button"
              onClick={handleDownloadPdf}
              className="p-1.5 text-gray-600 hover:text-primary hover:opacity-80 rounded"
              data-cy="invoice-modal-download"
            >
              <MdOutlineFileDownload className="w-6 h-6" />
            </button>
          </div>

          <Divider className="my-2 border-gray-300" />

          {/* Payment Information */}
          <div data-cy="admin-components-invoicemodal-invoicemodal-tsx-invoicemodal-div-176">
            <h3
              data-cy="admin-components-invoicemodal-invoicemodal-tsx-invoicemodal-h3-177"
              className="text-lg font-bold text-gray-900 mb-3 mx-5"
            >
              Payment Information
            </h3>
            <Divider className="border-gray-300 my-2" />
            <div
              data-cy="admin-components-invoicemodal-invoicemodal-tsx-invoicemodal-div-181"
              className="flex flex-col gap-2 text-sm mx-5"
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
                  className="flex justify-between gap-4 items-baseline"
                >
                  <span
                    data-cy="admin-components-invoicemodal-invoicemodal-tsx-invoicemodal-span-215"
                    className="text-gray-600"
                  >
                    {label}:
                  </span>
                  <span
                    data-cy="admin-components-invoicemodal-invoicemodal-tsx-invoicemodal-span-216"
                    className="font-medium text-gray-900 text-right"
                  >
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <Divider className="border-gray-300 my-2" />

          {/* Plan Detail */}
          <div data-cy="admin-components-invoicemodal-invoicemodal-tsx-invoicemodal-div-227">
            <h3
              data-cy="admin-components-invoicemodal-invoicemodal-tsx-invoicemodal-h3-228"
              className="text-lg font-bold text-gray-900 mb-3 mx-5"
            >
              Plan Detail
            </h3>
            <Divider className="border-gray-300 my-2" />

            <div
              data-cy="admin-components-invoicemodal-invoicemodal-tsx-invoicemodal-div-233"
              className="flex flex-col gap-2 text-sm mx-5"
            >
              <div
                data-cy="admin-components-invoicemodal-invoicemodal-tsx-invoicemodal-div-234"
                className="flex justify-between items-center gap-4"
              >
                <span
                  data-cy="admin-components-invoicemodal-invoicemodal-tsx-invoicemodal-span-235"
                  className="text-gray-600"
                >
                  Plan Type
                </span>
                <Tag color="blue" className="!rounded-full">
                  {currentPlan?.name ??
                    invoiceData.subscription?.plan?.name ??
                    'N/A'}
                </Tag>
              </div>
              <div
                data-cy="admin-components-invoicemodal-invoicemodal-tsx-invoicemodal-div-242"
                className="flex justify-between items-center gap-4"
              >
                <span
                  data-cy="admin-components-invoicemodal-invoicemodal-tsx-invoicemodal-span-243"
                  className="text-gray-600"
                >
                  Billing Cycle
                </span>
                <Tag color="blue" className="!rounded-full">
                  {billingCycleLabel}
                </Tag>
              </div>
              <div
                data-cy="admin-components-invoicemodal-invoicemodal-tsx-invoicemodal-div-248"
                className="flex justify-between items-center gap-4"
              >
                <span
                  data-cy="admin-components-invoicemodal-invoicemodal-tsx-invoicemodal-span-249"
                  className="text-gray-600"
                >
                  Status
                </span>
                <Tag
                  color={
                    invoiceData.status?.toLowerCase() === 'paid'
                      ? 'success'
                      : invoiceData.status?.toLowerCase() === 'pending' ||
                          invoiceData.status?.toLowerCase() === 'issued'
                        ? 'warning'
                        : 'error'
                  }
                  className="!rounded-full"
                >
                  {invoiceData.status}
                </Tag>
              </div>
            </div>
          </div>
          <Divider className="border-gray-300 my-2" />

          {/* Notes */}
          <div
            data-cy="admin-components-invoicemodal-invoicemodal-tsx-invoicemodal-div-269"
            className="mx-5"
          >
            <h3
              data-cy="admin-components-invoicemodal-invoicemodal-tsx-invoicemodal-h3-270"
              className="text-lg font-bold text-gray-900"
            >
              Notes
            </h3>
          </div>

          <Divider className="border-gray-300 my-2" />

          <p
            data-cy="admin-components-invoicemodal-invoicemodal-tsx-invoicemodal-p-275"
            className="text-sm text-gray-600 leading-normal mx-5"
          >
            {invoiceData.notes || '—'}
          </p>
          <Divider className="border-gray-300 my-2" />

          {/* Footer actions */}
          <div
            data-cy="admin-components-invoicemodal-invoicemodal-tsx-invoicemodal-div-281"
            className="flex justify-end gap-3 my-5 pt-2 mx-5"
          >
            <Button onClick={onClose} data-cy="invoice-modal-cancel">
              Cancel
            </Button>
            {isPending && (
              <Button
                type="primary"
                icon={
                  initiatePaymentMutation.isLoading ? (
                    <LoadingOutlined />
                  ) : (
                    <CreditCardOutlined />
                  )
                }
                onClick={handlePay}
                loading={initiatePaymentMutation.isLoading}
                data-cy="invoice-modal-pay"
              >
                Pay
              </Button>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
};
