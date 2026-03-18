'use client';

import { Table, Input, Select, DatePicker, notification } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  Invoice,
  Currency,
  Plan,
  InvoiceStatus,
  Subscription,
} from '@/types/tenant-management';
import { useState, useEffect } from 'react';
import { LoadingOutlined } from '@ant-design/icons';
import { MdOutlineFileDownload } from 'react-icons/md';
import { useRouter } from 'next/navigation';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import { useGetInvoiceDetail } from '@/store/server/features/tenant-management/invoices/queries';
import CustomPagination from '@/components/customPagination';
import { CustomMobilePagination } from '@/components/customPagination/mobilePagination';
import { useIsMobile } from '@/hooks/useIsMobile';

dayjs.extend(isBetween);

const { RangePicker } = DatePicker;
const { Search } = Input;

interface InvoicesTableProps {
  data: Invoice[];
  loading?: boolean;
  plans: Plan[];
  currencies: Currency[];
  subscriptions?: Subscription[];
  /** When provided, row click opens this callback (e.g. open modal) instead of navigating to invoice page */
  onInvoiceClick?: (invoiceId: string) => void;
  /** Hide search and filters (e.g. for dashboard "Recent Billing History") */
  hideFilters?: boolean;
}

const InvoicesTable = ({
  data,
  loading = false,
  currencies,
  subscriptions = [],
  onInvoiceClick,
  hideFilters = false,
}: InvoicesTableProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | null>(null);
  const [paymentDateRange, setPaymentDateRange] = useState<
    [dayjs.Dayjs, dayjs.Dayjs] | null
  >(null);
  const [voiceDateRange, setVoiceDateRange] = useState<
    [dayjs.Dayjs, dayjs.Dayjs] | null
  >(null);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(
    null,
  );
  const [downloadingInvoiceId, setDownloadingInvoiceId] = useState<
    string | null
  >(null);
  const router = useRouter();
  const { isMobile, isTablet } = useIsMobile();

  const { data: invoiceDetail } = useGetInvoiceDetail(
    selectedInvoiceId || '',
    'PDF',
  );

  useEffect(() => {
    if (invoiceDetail && selectedInvoiceId) {
      const response = invoiceDetail as any;

      const downloadUrl =
        response.downloadUrl ||
        response.data?.downloadUrl ||
        response.items?.[0]?.downloadUrl;

      if (downloadUrl) {
        window.open(downloadUrl, '_blank');
      } else {
        notification.error({
          message: 'PDF Not Available',
          description: 'PDF document is not available for this invoice.',
        });
      }

      setDownloadingInvoiceId(null);
      setSelectedInvoiceId(null);
    }
  }, [invoiceDetail, selectedInvoiceId, data]);

  const handlePageChange = (page: number, size: number) => {
    setCurrentPage(page);
    setPageSize(size);
  };

  const handleRowClick = (id: string) => {
    if (onInvoiceClick) {
      onInvoiceClick(id);
    } else {
      router.push(`/admin/invoice/${id}`);
    }
  };

  const getPlanName = (subscriptionId: string) => {
    // First try to find subscription by id
    const subscription = subscriptions?.find(
      (sub) => sub.id === subscriptionId,
    );

    if (subscription?.plan?.name) {
      return subscription.plan.name;
    }

    // If not found in subscriptions directly, look for plan information in invoice notes
    const invoice = data.find((inv) => inv.subscriptionId === subscriptionId);
    if (invoice?.notes) {
      // Try to extract plan name from notes (often in format "Subscription invoice for X план")
      const match = invoice.notes.match(/for\s+(.+?)(?:\s+план|\s*$)/i);
      if (match && match[1]) {
        return match[1];
      }
    }

    return 'Unknown Plan';
  };

  const getCurrencySymbol = (currencyId: string) => {
    const currency = currencies?.find((c) => c.id === currencyId);
    return currency?.symbol || '$';
  };

  const filteredData = data.filter((invoice) => {
    const matchesSearch = invoice.id
      .toLowerCase()
      .includes(searchText.toLowerCase());
    const matchesStatus = statusFilter ? invoice.status === statusFilter : true;
    const matchesPaymentDate = paymentDateRange
      ? dayjs(invoice.dueAt).isBetween(
          paymentDateRange[0],
          paymentDateRange[1],
          null,
          '[]',
        )
      : true;
    const matchesVoiceDate = voiceDateRange
      ? dayjs(invoice.invoiceAt).isBetween(
          voiceDateRange[0],
          voiceDateRange[1],
          null,
          '[]',
        )
      : true;

    return (
      matchesSearch && matchesStatus && matchesPaymentDate && matchesVoiceDate
    );
  });

  const statusOptions = Object.values(InvoiceStatus).map((status) => ({
    value: status,
    label: status,
  }));

  const handlePdfDownload = (e: React.MouseEvent, invoiceId: string) => {
    e.stopPropagation();
    setSelectedInvoiceId(invoiceId);
    setDownloadingInvoiceId(invoiceId);
  };

  const columns: ColumnsType<Invoice> = [
    {
      title: 'Invoice ID',
      dataIndex: 'invoiceNumber',
      render: (invoiceNumber: string) => (
        <span
          id={`invoice-number-${invoiceNumber}`}
          data-cy={`invoice-number-${invoiceNumber}`}
        >
          #{invoiceNumber}
        </span>
      ),
    },
    {
      title: 'Issue Date',
      dataIndex: 'invoiceAt',
      render: (date: string) => dayjs(date).format('MMMM D, YYYY'),
    },
    {
      title: 'Plan',
      dataIndex: 'subscriptionId',
      render: (subscriptionId: string) => (
        <div
          id={`invoice-plan-${subscriptionId}`}
          data-cy={`invoice-plan-${subscriptionId}`}
          className="flex items-center gap-2 border border-gray-300 rounded-lg px-2 w-fit whitespace-nowrap"
        >
          <span
            id={`invoice-plan-indicator-${subscriptionId}`}
            data-cy={`invoice-plan-indicator-${subscriptionId}`}
            className="w-2 h-2 min-w-2 min-h-2 rounded-full bg-primary"
          />
          <span
            id={`invoice-plan-name-${subscriptionId}`}
            data-cy={`invoice-plan-name-${subscriptionId}`}
          >
            {getPlanName(subscriptionId)}
          </span>
        </div>
      ),
    },
    {
      title: 'Amount',
      dataIndex: 'totalAmount',
      render: (total: number, record: Invoice) => (
        <span
          id={`invoice-amount-${record.id}`}
          data-cy={`invoice-amount-${record.id}`}
        >
          {getCurrencySymbol(record.currencyId)}
          {Number(total).toFixed(2)}
        </span>
      ),
    },
    {
      title: 'Currency',
      dataIndex: 'currencyId',
      render: (currencyId: string) => {
        const currency = currencies?.find((c) => c.id === currencyId);
        return (
          <span
            id={`invoice-currency-${currencyId}`}
            data-cy={`invoice-currency-${currencyId}`}
          >
            {currency?.symbol || currencyId}
          </span>
        );
      },
    },
    {
      title: 'Status',
      dataIndex: 'status',
      render: (status: InvoiceStatus) => {
        let className = '';

        switch (status) {
          case InvoiceStatus.PENDING:
            className = 'text-orange bg-orange/10';
            break;
          case InvoiceStatus.PAID:
            className = 'text-green-600 bg-green-100';
            break;
          case InvoiceStatus.OVERDUE:
            className = 'text-red-600 bg-red-100';
            break;
          case InvoiceStatus.CANCELLED:
            className = 'text-gray-400 bg-gray-200';
            break;
          default:
            className = 'text-orange-600 bg-orange-100';
        }

        return (
          <span
            id={`invoice-status-${status}`}
            data-cy={`invoice-status-${status}`}
            className={`rounded-lg px-2 py-2 text-sm font-medium ${className}`}
          >
            {status}
          </span>
        );
      },
    },
    {
      title: 'Payment Date',
      dataIndex: 'paymentAt',
      render: (date: string) =>
        date ? dayjs(date).format('MMMM D, YYYY') : '-',
    },
    {
      title: '',
      dataIndex: 'actions',
      width: 100,
      render: (...args: [string, Invoice]) => {
        const record = args[1];
        const isDownloadingThis = downloadingInvoiceId === record.id;

        return (
          <div
            id={`invoice-actions-${record.id}`}
            data-cy={`invoice-actions-${record.id}`}
            className="flex items-center gap-4"
          >
            <button
              id={`invoice-download-${record.id}`}
              data-cy={`invoice-download-${record.id}`}
              onClick={(e) => handlePdfDownload(e, record.id)}
              className="hover:opacity-75 transition-opacity"
              disabled={isDownloadingThis}
            >
              {isDownloadingThis ? (
                <LoadingOutlined
                  id={`invoice-download-indicator-${record.id}`}
                  data-cy={`invoice-download-indicator-${record.id}`}
                  className="w-5 h-5 text-primary"
                  spin
                />
              ) : (
                <MdOutlineFileDownload
                  id={`invoice-download-icon-${record.id}`}
                  data-cy={`invoice-download-icon-${record.id}`}
                  className="w-5 h-5 min-w-5 min-h-5 text-primary"
                />
              )}
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <div id="invoices-table-container" data-cy="invoices-table-container">
      {!hideFilters && (
        <div
          id="invoices-table-filters"
          data-cy="invoices-table-filters"
          className="flex flex-col md:flex-row gap-4 mb-6"
        >
          <Search
            id="invoices-table-search"
            data-cy="invoices-table-search"
            placeholder="Search by Invoice ID"
            allowClear
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="w-full md:w-1/3"
          />

          <Select
            id="invoices-table-status-filter"
            data-cy="invoices-table-status-filter"
            placeholder="Filter by Status"
            allowClear
            options={statusOptions}
            value={statusFilter}
            onChange={setStatusFilter}
            className="w-full md:w-1/4"
          />

          <RangePicker
            id="invoices-table-payment-date-range"
            data-cy="invoices-table-payment-date-range"
            placeholder={['Start Payment Date', 'End Payment Date']}
            value={paymentDateRange}
            onChange={(dates) =>
              setPaymentDateRange(dates as [dayjs.Dayjs, dayjs.Dayjs])
            }
            className="w-full md:w-1/4"
          />

          <RangePicker
            id="invoices-table-issue-date-range"
            data-cy="invoices-table-issue-date-range"
            placeholder={['Start Issue Date', 'End Issue Date']}
            value={voiceDateRange}
            onChange={(dates) =>
              setVoiceDateRange(dates as [dayjs.Dayjs, dayjs.Dayjs])
            }
            className="w-full md:w-1/4"
          />
        </div>
      )}

      <Table
        id="invoices-table"
        data-cy="invoices-table"
        columns={columns}
        dataSource={filteredData.slice(
          (currentPage - 1) * pageSize,
          currentPage * pageSize,
        )}
        rowKey="id"
        scroll={{ x: true }}
        loading={loading}
        onRow={(record) => ({
          onClick: () => handleRowClick(record.id),
        })}
        rowClassName={() => 'cursor-pointer'}
        pagination={false}
      />
      {filteredData.length > 0 && (
        <>
          {isMobile || isTablet ? (
            <CustomMobilePagination
              totalResults={filteredData.length}
              pageSize={pageSize}
              currentPage={currentPage}
              onChange={handlePageChange}
              onShowSizeChange={(page, size) => handlePageChange(page, size)}
            />
          ) : (
            <CustomPagination
              current={currentPage}
              total={filteredData.length}
              pageSize={pageSize}
              onChange={handlePageChange}
              onShowSizeChange={(size) => handlePageChange(1, size)}
              hidePageSizeSelect
            />
          )}
        </>
      )}
    </div>
  );
};

export default InvoicesTable;
