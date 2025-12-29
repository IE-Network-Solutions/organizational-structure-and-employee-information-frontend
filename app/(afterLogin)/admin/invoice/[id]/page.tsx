'use client';
import CustomBreadcrumb from '@/components/common/breadCramp';
import { Skeleton, Button, notification } from 'antd';
import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Invoice, Plan } from '@/types/tenant-management';
import { LoadingOutlined } from '@ant-design/icons';
import { useGetInvoiceDetail } from '@/store/server/features/tenant-management/invoices/queries';
import dayjs from 'dayjs';
import { useGetPlans } from '@/store/server/features/tenant-management/plans/queries';
import { useInitiatePayment } from '@/store/server/features/tenant-management/payments/queries';

const InvoiceItem = () => {
  const router = useRouter();
  const { id } = useParams();

  const [isDownloading, setIsDownloading] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [invoiceData, setInvoiceData] = useState<Invoice | null>(null);
  const [currentPlan, setCurrentPlan] = useState<Plan | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Get plans data
  const { data: plansData } = useGetPlans({ filter: {} }, true, true, 'ASC');

  // Get invoice data
  const { data: invoiceResponse, isLoading: isInvoiceLoading } =
    useGetInvoiceDetail(id as string, '');

  // Get PDF link
  const { data: pdfResponse, isLoading: isPdfLoading } = useGetInvoiceDetail(
    id as string,
    'PDF',
  );

  // Initialize payment mutation
  const initiatePaymentMutation = useInitiatePayment();

  useEffect(() => {
    if (plansData) {
      setPlans(plansData.items);
    }
  }, [plansData]);

  useEffect(() => {
    if (invoiceResponse) {
      // Correctly access invoice data from API response
      const invoiceData = (invoiceResponse as any).item as Invoice;
      setInvoiceData(invoiceData);

      // Find and set current plan
      if (invoiceData?.subscription?.planId) {
        const plan = plans.find(
          (plan) => plan.id === invoiceData.subscription.planId,
        );
        setCurrentPlan(plan as Plan);
      }
    }
  }, [invoiceResponse, plans]);

  // Handle payment method selection
  const handlePayment = async () => {
    const paymentCurrency = currentPlan?.currency.code;

    const selectedPaymentMethod =
      paymentCurrency === 'ETB'
        ? 'chapa'
        : paymentCurrency === 'USD'
          ? 'stripe'
          : null;

    if (!selectedPaymentMethod || !id) {
      notification.error({
        message: 'Payment Error',
        description: 'Please select a valid payment method to continue.',
      });
      return;
    }

    setIsProcessingPayment(true);

    try {
      const returnUrl = `${window.location.origin}/admin/dashboard`;

      const paymentData = {
        paymentMethod: selectedPaymentMethod.toUpperCase(),
        paymentProvider: selectedPaymentMethod,
        returnUrl,
      };

      const response = await initiatePaymentMutation.mutateAsync({
        invoiceId: id as string,
        data: paymentData,
      });

      const apiResponse = response as any;

      if (apiResponse?.data?.redirectUrl) {
        notification.success({
          message: 'Payment Initiated',
          description: 'You will be redirected to the payment page.',
        });

        window.location.href = apiResponse.data.redirectUrl;
      } else if (apiResponse?.redirectUrl) {
        notification.success({
          message: 'Payment Initiated',
          description: 'You will be redirected to the payment page.',
        });

        window.location.href = apiResponse.redirectUrl;
      } else {
        throw new Error('No redirect URL received from payment provider');
      }
    } catch (error) {
      notification.error({
        message: 'Payment Failed',
        description:
          error instanceof Error
            ? error.message
            : 'There was an error initiating payment. Please try again later.',
      });
    } finally {
      setIsProcessingPayment(false);
    }
  };

  // Get PDF URL after data is loaded
  useEffect(() => {
    if (pdfResponse) {
      const response = pdfResponse as any;
      const downloadUrl = response.downloadUrl || response.data?.downloadUrl;

      if (downloadUrl) {
        setPdfUrl(downloadUrl);
      }
    }
  }, [pdfResponse]);

  // PDF download handler
  const handleDownloadPdf = async () => {
    if (!pdfUrl) {
      notification.warning({
        message: 'PDF Not Available',
        description: 'PDF document is not available for this invoice.',
      });
      return;
    }

    setIsDownloading(true);

    try {
      // Open PDF in a new tab
      window.open(pdfUrl, '_blank');
    } catch {
      notification.error({
        message: 'Failed to Open PDF',
        description: 'Unable to open the PDF. Please try again later.',
      });
    } finally {
      setIsDownloading(false);
    }
  };

  // Format date
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return '';
    return dayjs(dateString).format('MMMM D, YYYY');
  };

  // Get status with appropriate style class
  const getStatusClass = (status: string | undefined) => {
    if (!status) return 'text-gray-600 bg-gray-100';

    switch (status.toLowerCase()) {
      case 'paid':
        return 'text-green-600 bg-green-100';
      case 'pending':
      case 'issued':
        return 'text-orange bg-orange/10';
      case 'overdue':
        return 'text-red-600 bg-red-100';
      case 'cancelled':
      case 'void':
        return 'text-gray-400 bg-gray-200';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div
      id="invoice-detail-page"
      data-cy="invoice-detail-page"
      className="h-auto w-auto px-6 py-6"
    >
      <CustomBreadcrumb
        title="Invoice Details"
        subtitle=""
        data-cy="invoice-detail-page-breadcrumb"
      />

      <div
        id="invoice-detail-container"
        data-cy="invoice-detail-container"
        className="mt-8"
      >
        <div
          id="invoice-detail-card"
          data-cy="invoice-detail-card"
          className="flex flex-col bg-white rounded-lg border border-gray-200 pt-4 pb-10 max-w-[700px] min-h-[280px] mx-auto"
        >
          {isInvoiceLoading ? (
            <div
              id="invoice-detail-loading"
              data-cy="invoice-detail-loading"
              className="flex flex-col h-full"
              style={{ margin: '20px' }}
            >
              <Skeleton
                paragraph={{ rows: 6 }}
                active
                data-cy="invoice-detail-loading-skeleton"
              />
            </div>
          ) : (
            <div
              id="invoice-detail-content"
              data-cy="invoice-detail-content"
              className="flex flex-col"
            >
              <div
                id="invoice-detail-header"
                data-cy="invoice-detail-header"
                className="flex items-center justify-between gap-2 border-b border-gray-200 pb-4 px-8"
              >
                <span
                  id="invoice-detail-title"
                  data-cy="invoice-detail-title"
                  className="text-2xl font-bold"
                >
                  Invoice {invoiceData?.invoiceNumber}:{' '}
                  <span
                    id="invoice-detail-date"
                    data-cy="invoice-detail-date"
                    className="text-primary"
                  >
                    {formatDate(invoiceData?.invoiceAt)}
                  </span>
                </span>
                <button
                  id="invoice-detail-download-button"
                  data-cy="invoice-detail-download-button"
                  className="text-blue-600 hover:text-blue-800"
                  onClick={handleDownloadPdf}
                  disabled={isDownloading || isPdfLoading || !pdfUrl}
                >
                  {isDownloading || isPdfLoading ? (
                    <LoadingOutlined
                      style={{ fontSize: 25 }}
                      spin
                      id="invoice-detail-download-button-indicator"
                      data-cy="invoice-detail-download-button-indicator"
                    />
                  ) : (
                    <Image
                      src="/icons/file-download.svg"
                      alt="Download"
                      width={25}
                      height={25}
                      style={{
                        minWidth: '25px',
                      }}
                      id="invoice-detail-download-button-icon"
                      data-cy="invoice-detail-download-button-icon"
                    />
                  )}
                </button>
              </div>

              <div
                id="invoice-payment-info"
                data-cy="invoice-payment-info"
                className="flex flex-col gap-2 border-b border-gray-200 mt-6 mb-2 pb-6 px-8"
              >
                <div
                  id="invoice-payment-info-title"
                  data-cy="invoice-payment-info-title"
                  className="text-2xl font-bold mb-4"
                >
                  Invoice Payment Information
                </div>
                <div
                  id="invoice-payment-info-details"
                  data-cy="invoice-payment-info-details"
                  className="flex flex-col gap-2"
                >
                  {[
                    ['Invoice Number:', `#${invoiceData?.invoiceNumber || ''}`],
                    ['Issue Date:', formatDate(invoiceData?.invoiceAt)],
                    [
                      'Payment Date:',
                      formatDate(invoiceData?.payments[0]?.paymentAt) || '-',
                    ],
                    [
                      'Billing Period:',
                      invoiceData?.subscription?.startAt &&
                      invoiceData?.subscription?.endAt
                        ? `${formatDate(invoiceData?.subscription?.startAt)} - ${formatDate(invoiceData?.subscription?.endAt)}`
                        : '-',
                    ],
                    [
                      'Number of users:',
                      invoiceData?.paymentMetadata?.targetState?.slotTotal || 0,
                      ,
                    ],
                    ['Amount', `${invoiceData?.totalAmount}`],
                  ].map(([label, value], index) => (
                    <div
                      key={index}
                      id={`invoice-payment-info-row-${index}`}
                      data-cy={`invoice-payment-info-row-${index}`}
                      className="flex items-center justify-start gap-2"
                    >
                      <span
                        id={`invoice-payment-info-label-${index}`}
                        data-cy={`invoice-payment-info-label-${index}`}
                        className="text-md min-w-[90px] md:min-w-[150px]"
                      >
                        {label}
                      </span>
                      <span
                        id={`invoice-payment-info-value-${index}`}
                        data-cy={`invoice-payment-info-value-${index}`}
                        className="text-md font-bold"
                      >
                        {value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div
                id="invoice-details-section"
                data-cy="invoice-details-section"
                className="flex flex-col gap-2 mt-6 mb-2 pb-6 px-8"
              >
                {[
                  [
                    'Plan Type',
                    <span
                      key="plan"
                      id="invoice-plan-type-value"
                      data-cy="invoice-plan-type-value"
                      className="flex items-center justify-center text-md font-bold border border-success rounded-lg px-2 gap-2"
                    >
                      <span
                        id="invoice-plan-type-indicator"
                        data-cy="invoice-plan-type-indicator"
                        className="flex min-w-[10px] w-[10px] h-[10px] bg-success rounded-full"
                      ></span>
                      <span
                        id="invoice-plan-type-value-text"
                        data-cy="invoice-plan-type-value-text"
                      >
                        {currentPlan?.name || 'N/A'}
                      </span>
                    </span>,
                  ],
                  [
                    'Status',
                    <span
                      key="status"
                      id="invoice-status-value"
                      data-cy="invoice-status-value"
                      className={`text-md font-bold rounded-lg px-4 py-2 ${getStatusClass(invoiceData?.status)}`}
                    >
                      {invoiceData?.status}
                    </span>,
                  ],
                  [
                    'Amount',
                    <span
                      key="amount"
                      id="invoice-amount-value"
                      data-cy="invoice-amount-value"
                      className="text-md font-bold"
                    >
                      {invoiceData?.totalAmount}
                    </span>,
                  ],
                  [
                    'Notes',
                    <span
                      key="notes"
                      id="invoice-notes-value"
                      data-cy="invoice-notes-value"
                      className="text-md"
                    >
                      {invoiceData?.notes || '-'}
                    </span>,
                  ],
                ].map(([label, value], index) => (
                  <div
                    key={index}
                    id={`invoice-details-row-${index}`}
                    data-cy={`invoice-details-row-${index}`}
                    className="flex items-center justify-between w-full gap-2 mb-2"
                  >
                    <span
                      id={`invoice-details-label-${index}`}
                      data-cy={`invoice-details-label-${index}`}
                      className="text-md font-bold"
                    >
                      {label}
                    </span>
                    <span
                      id={`invoice-details-value-${index}`}
                      data-cy={`invoice-details-value-${index}`}
                      className="min-w-[150px] flex items-center justify-center"
                    >
                      {value}
                    </span>
                  </div>
                ))}
              </div>

              {invoiceData?.status?.toLowerCase() === 'pending' && (
                <div
                  id="invoice-payment-section"
                  data-cy="invoice-payment-section"
                  className="flex flex-col gap-2 mt-6 mb-2 pb-6 px-8"
                >
                  <span
                    id="invoice-payment-title"
                    data-cy="invoice-payment-title"
                    className="text-2xl font-bold"
                  >
                    Pay
                  </span>
                </div>
              )}

              <div
                id="invoice-actions"
                data-cy="invoice-actions"
                className="flex flex-col gap-2 mt-6 mb-2 pb-6 px-8"
              >
                <div
                  id="invoice-actions-container"
                  data-cy="invoice-actions-container"
                  className="flex justify-around gap-2 mt-4"
                >
                  <div
                    id="invoice-actions-buttons"
                    data-cy="invoice-actions-buttons"
                    className="flex justify-center gap-4 mt-8"
                  >
                    <Button
                      id="invoice-dashboard-button"
                      data-cy="invoice-dashboard-button"
                      onClick={() => router.push('/admin/dashboard')}
                      className="text-center flex justify-center items-center"
                      type="default"
                    >
                      Dashboard
                    </Button>
                    {invoiceData?.status?.toLowerCase() === 'pending' && (
                      <Button
                        id="invoice-pay-button"
                        data-cy="invoice-pay-button"
                        onClick={handlePayment}
                        className="text-center flex justify-center items-center"
                        type="primary"
                        disabled={isInvoiceLoading || isProcessingPayment}
                        icon={
                          isProcessingPayment ? (
                            <LoadingOutlined
                              id="invoice-pay-button-indicator"
                              data-cy="invoice-pay-button-indicator"
                            />
                          ) : null
                        }
                      >
                        {isProcessingPayment ? 'Processing...' : 'Pay Now'}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InvoiceItem;
