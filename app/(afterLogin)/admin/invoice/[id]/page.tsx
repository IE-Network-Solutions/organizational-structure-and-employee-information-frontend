'use client';
import CustomBreadcrumb from '@/components/common/breadCramp';
import { Skeleton, Button, notification } from 'antd';
import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Invoice } from '@/types/tenant-management';
import { LoadingOutlined } from '@ant-design/icons';
import { useGetInvoiceDetail } from '@/store/server/features/tenant-management/invoices/queries';
import { TENANT_BASE_URL } from '@/utils/constants';
import dayjs from 'dayjs';

const InvoiceItem = () => {
  const router = useRouter();
  const { id } = useParams();
  
  const [isDownloading, setIsDownloading] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  
  // Get invoice data
  const { data: invoiceResponse, isLoading: isInvoiceLoading } = useGetInvoiceDetail(
    id as string,
    ''
  );
  
  // Get PDF link
  const { data: pdfResponse, isLoading: isPdfLoading } = useGetInvoiceDetail(
    id as string,
    'PDF'
  );
  
  // Extract invoice data from API response with type casting
  const invoiceData = invoiceResponse ? (invoiceResponse as any).item as Invoice : null;

  // Get PDF URL after data is loaded
  useEffect(() => {
    if (pdfResponse) {
      const response = pdfResponse as any;
      const filePath = response.path || response.data?.path;
      
      if (filePath) {
        setPdfUrl(`${TENANT_BASE_URL}/${filePath}`);
      }
    }
  }, [pdfResponse]);

  // PDF download handler
  const handleDownloadPdf = async () => {
    if (!pdfUrl) {
      notification.warning({
        message: 'PDF Not Available',
        description: 'PDF document is not available for this invoice.'
      });
      return;
    }
    
    setIsDownloading(true);
    
    try {
      // Download file from the known URL
      const response = await fetch(pdfUrl);
      const blob = await response.blob();
      
      // Create download link
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `Invoice-${invoiceData?.invoiceNumber || id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch {
      notification.error({
        message: 'Download Failed',
        description: 'Unable to download the PDF. Please try again later.'
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
    <div className="h-auto w-auto px-6 py-6">
      <CustomBreadcrumb title="Invoice Details" subtitle="" />

      <div className="mt-8">
        <div className="flex flex-col bg-white rounded-lg border border-gray-200 pt-4 pb-10 max-w-[700px] min-h-[280px] mx-auto">
          {isInvoiceLoading ? (
            <div className="flex flex-col h-full" style={{ margin: '20px' }}>
              <Skeleton paragraph={{ rows: 6 }} active />
            </div>
          ) : (
            <div className="flex flex-col">
              <div className="flex items-center justify-between gap-2 border-b border-gray-200 pb-4 px-8">
                <span className="text-2xl font-bold">
                  Invoice {invoiceData?.invoiceNumber}:{' '}
                  <span className="text-primary">
                    {formatDate(invoiceData?.invoiceAt)}
                  </span>
                </span>
                <button
                  className="text-blue-600 hover:text-blue-800"
                  onClick={handleDownloadPdf}
                  disabled={isDownloading || isPdfLoading || !pdfUrl}
                >
                  {isDownloading || isPdfLoading ? (
                    <LoadingOutlined style={{ fontSize: 25 }} spin />
                  ) : (
                    <Image
                      src="/icons/file-download.svg"
                      alt="Download"
                      width={25}
                      height={25}
                      style={{
                        minWidth: '25px',
                      }}
                    />
                  )}
                </button>
              </div>

              <div className="flex flex-col gap-2 border-b border-gray-200 mt-6 mb-2 pb-6 px-8">
                <div className="text-2xl font-bold mb-4">
                  Invoice Payment Information
                </div>
                <div className="flex flex-col gap-2">
                  {[
                    ['Invoice Number:', `#${invoiceData?.invoiceNumber || ''}`],
                    ['Issue Date:', formatDate(invoiceData?.invoiceAt)],
                    ['Due Date:', formatDate(invoiceData?.dueAt)],
                    ['Invoice Type:', invoiceData?.invoiceType || ''],
                    ['Number of users:', invoiceData?.subscription?.slotTotal || '-'],
                    ['Amount', `$${invoiceData?.totalAmount || 0}`],
                    ['Tax Amount', `$${invoiceData?.taxAmount || 0}`],
                    ['Discount', `$${invoiceData?.discountAmount || 0}`],
                  ].map(([label, value], index) => (
                    <div
                      key={index}
                      className="flex items-center justify-start gap-2"
                    >
                      <span className="text-md min-w-[90px] md:min-w-[150px]">
                        {label}
                      </span>
                      <span className="text-md font-bold">{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col justify-between w-full gap-2 border-b border-gray-200 mt-6 mb-2 pb-6 px-8">
                {[
                  [
                    'Plan Type',
                    <span
                      key="plan"
                      className="flex items-center justify-center text-md font-bold border border-success rounded-lg px-2 gap-2"
                    >
                      <span className="flex min-w-[10px] w-[10px] h-[10px] bg-success rounded-full"></span>
                      <span>{invoiceData?.subscription?.plan?.name || 'Standard plan'}</span>
                    </span>,
                  ],
                  [
                    'Status',
                    <span
                      key="status"
                      className={`text-md font-bold rounded-lg px-4 py-2 ${getStatusClass(invoiceData?.status)}`}
                    >
                      {invoiceData?.status || 'Pending'}
                    </span>,
                  ],
                  ['Notes', invoiceData?.notes || '-'],
                ].map(([label, value], index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between w-full gap-2 mb-2"
                  >
                    <span className="text-md font-bold">{label}</span>
                    <span className="min-w-[150px] flex items-center justify-center">
                      {value}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex flex-col gap-2 mt-6 mb-2 pb-6 px-8">
                <div className="flex justify-around gap-2 mt-4">
                  <div className="flex justify-center gap-4 mt-8">
                    <Button
                      onClick={() => router.back()}
                      className="text-center flex justify-center items-center"
                      type="default"
                    >
                      Back
                    </Button>
                    {invoiceData?.status?.toLowerCase() === 'pending' && (
                      <Button
                        onClick={() => router.push('/admin/plan')}
                        className="text-center flex justify-center items-center"
                        type="primary"
                      >
                        Proceed to payment
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
