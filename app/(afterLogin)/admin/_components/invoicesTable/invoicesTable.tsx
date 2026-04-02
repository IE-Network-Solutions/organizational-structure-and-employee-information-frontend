'use client';

import {
  Table,
  Input,
  Select,
  DatePicker,
  notification,
  Tag,
  Popconfirm,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  Invoice,
  Currency,
  Plan,
  InvoiceStatus,
  Subscription,
} from '@/types/tenant-management';
import { useState, useEffect } from 'react';
import {
  CloseOutlined,
  DeleteOutlined,
  LoadingOutlined,
} from '@ant-design/icons';
import { MdOutlineFileDownload } from 'react-icons/md';
import { useRouter } from 'next/navigation';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import { useGetInvoiceDetail } from '@/store/server/features/tenant-management/invoices/queries';
import { useDeleteManageInvoice } from '@/store/server/features/tenant-management/manage-invoices/mutation';
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
  totalItems?: number;
  totalPages?: number;
  currentPage?: number;
  pageSize?: number;
  onPageChange?: (page: number, size: number) => void;
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
  totalItems,
  totalPages,
  currentPage: controlledCurrentPage,
  pageSize: controlledPageSize,
  onPageChange,
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
  const [deletingInvoiceId, setDeletingInvoiceId] = useState<string | null>(
    null,
  );
  const [openDeleteConfirmInvoiceId, setOpenDeleteConfirmInvoiceId] = useState<
    string | null
  >(null);
  const router = useRouter();
  const { isMobile, isTablet } = useIsMobile();
  const deleteInvoiceMutation = useDeleteManageInvoice();
  const effectiveCurrentPage = controlledCurrentPage ?? currentPage;
  const effectivePageSize = controlledPageSize ?? pageSize;
  const isControlledPagination =
    typeof controlledCurrentPage === 'number' &&
    typeof controlledPageSize === 'number' &&
    typeof onPageChange === 'function';

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
    if (isControlledPagination) {
      onPageChange?.(page, size);
      return;
    }
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

  const deleteInvoiceById = async (invoiceId: string) => {
    try {
      setDeletingInvoiceId(invoiceId);
      await deleteInvoiceMutation.mutateAsync(invoiceId);
    } catch (error) {
      notification.error({
        message: 'Delete Failed',
        description:
          error instanceof Error ? error.message : 'Failed to delete invoice.',
      });
    } finally {
      setDeletingInvoiceId(null);
    }
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
          className="flex items-center gap-2 rounded-[4px] border border-gray-300 bg-[rgba(0,0,0,0.02)] px-2 w-fit whitespace-nowrap"
        >
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
        const normalized = String(status).toLowerCase();
        const tagColor =
          normalized === InvoiceStatus.PAID
            ? 'success'
            : normalized === InvoiceStatus.OVERDUE
              ? 'error'
              : normalized === InvoiceStatus.CANCELLED
                ? 'default'
                : 'warning';

        return (
          <Tag
            id={`invoice-status-${status}`}
            data-cy={`invoice-status-${status}`}
            className="rounded-md px-2 py-1 text-sm font-medium m-0"
            color={tagColor}
          >
            {String(status)}
          </Tag>
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
        const isDeletingThis = deletingInvoiceId === record.id;
        const isPendingInvoice =
          String(record.status).toLowerCase() === 'pending';

        return (
          <div
            id={`invoice-actions-${record.id}`}
            data-cy={`invoice-actions-${record.id}`}
            className="flex items-center gap-4"
          >
            <button
              type="button"
              id={`invoice-download-${record.id}`}
              data-cy={`invoice-download-${record.id}`}
              onClick={(e) => handlePdfDownload(e, record.id)}
              className="inline-flex items-center justify-center p-0 m-0 bg-transparent border-0 cursor-pointer hover:opacity-75 transition-opacity leading-none"
              disabled={isDownloadingThis}
            >
              {isDownloadingThis ? (
                <LoadingOutlined
                  id={`invoice-download-indicator-${record.id}`}
                  data-cy={`invoice-download-indicator-${record.id}`}
                  className="!flex !items-center !justify-center w-5 h-5 min-w-5 min-h-5 shrink-0 text-base text-primary"
                  spin
                />
              ) : (
                <MdOutlineFileDownload
                  id={`invoice-download-icon-${record.id}`}
                  data-cy={`invoice-download-icon-${record.id}`}
                  className="w-5 h-5 min-w-5 min-h-5 text-primary shrink-0"
                />
              )}
            </button>

            {isPendingInvoice && (
              <Popconfirm
                icon={<></>}
                open={openDeleteConfirmInvoiceId === record.id}
                onOpenChange={(visible) =>
                  setOpenDeleteConfirmInvoiceId(visible ? record.id : null)
                }
                onCancel={(e) => {
                  e?.stopPropagation();
                  setOpenDeleteConfirmInvoiceId(null);
                }}
                title={
                  <div
                    className="flex items-center justify-between mb-3 mx-4"
                    data-cy={`invoice-delete-popconfirm-title-${record.id}`}
                  >
                    <p
                      className="text-lg font-bold text-gray-700 m-0"
                      data-cy={`invoice-delete-popconfirm-title-text-${record.id}`}
                    >
                      Delete Invoice
                    </p>
                    <CloseOutlined
                      className="text-gray-400 m-0 cursor-pointer hover:text-gray-600"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setOpenDeleteConfirmInvoiceId(null);
                      }}
                    />
                  </div>
                }
                description={
                  <p
                    className="text-sm text-gray-500 m-0 my-1 mb-4 mx-4"
                    data-cy={`invoice-delete-popconfirm-description-${record.id}`}
                  >
                    Are you sure you want to delete invoice #
                    {record.invoiceNumber}?
                  </p>
                }
                onConfirm={(e) => {
                  e?.stopPropagation();
                  setOpenDeleteConfirmInvoiceId(null);
                  void deleteInvoiceById(record.id);
                }}
                okText="Delete"
                okButtonProps={{
                  danger: true,
                  className: 'font-normal p-2 mr-4 mb-2 rounded-md',
                  'data-cy': `invoice-delete-popconfirm-ok-${record.id}`,
                }}
                cancelButtonProps={{
                  'data-cy': `invoice-delete-popconfirm-dismiss-${record.id}`,
                  className:
                    'font-normal m-0 p-2 mb-2 rounded-md border-gray-300',
                }}
                cancelText={
                  <div
                    className="font-normal m-0 border-gray-400"
                    data-cy={`invoice-delete-popconfirm-dismiss-text-${record.id}`}
                  >
                    Cancel
                  </div>
                }
                disabled={isDeletingThis}
                data-cy={`invoice-delete-popconfirm-${record.id}`}
                className="inline-flex items-center justify-center leading-none"
              >
                <button
                  type="button"
                  id={`invoice-delete-${record.id}`}
                  data-cy={`invoice-delete-${record.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setOpenDeleteConfirmInvoiceId(record.id);
                  }}
                  className="inline-flex items-center justify-center p-0 m-0 bg-transparent border-0 cursor-pointer hover:opacity-75 transition-opacity leading-none"
                  disabled={isDeletingThis}
                  title="Delete invoice"
                >
                  {isDeletingThis ? (
                    <LoadingOutlined
                      id={`invoice-delete-indicator-${record.id}`}
                      data-cy={`invoice-delete-indicator-${record.id}`}
                      className="!flex !items-center !justify-center w-5 h-5 min-w-5 min-h-5 shrink-0 text-base text-[#FF4D4F]"
                      spin
                    />
                  ) : (
                    <DeleteOutlined
                      id={`invoice-delete-icon-${record.id}`}
                      data-cy={`invoice-delete-icon-${record.id}`}
                      className="!flex !items-center !justify-center w-5 h-5 min-w-5 min-h-5 shrink-0 text-base text-[#FF4D4F] leading-none"
                    />
                  )}
                </button>
              </Popconfirm>
            )}
          </div>
        );
      },
    },
  ];

  const paginatedData = isControlledPagination
    ? filteredData
    : filteredData.slice(
        (effectiveCurrentPage - 1) * effectivePageSize,
        effectiveCurrentPage * effectivePageSize,
      );
  const controlledTotal =
    totalItems ??
    (typeof totalPages === 'number' && totalPages > 0
      ? totalPages * effectivePageSize
      : undefined);
  const paginationTotal = isControlledPagination
    ? (controlledTotal ?? filteredData.length)
    : filteredData.length;

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

      <div
        id="invoices-table-scroll-boundary"
        data-cy="invoices-table-scroll-boundary"
        className={
          isMobile || isTablet ? 'w-full min-w-0 max-w-full' : undefined
        }
      >
        <Table
          id="invoices-table"
          data-cy="invoices-table"
          className={[
            '[&_.ant-table-tbody_.ant-table-cell]:!text-[#000000]/[0.7]',
            isMobile || isTablet
              ? [
                  '[&_.ant-table-thead_.ant-table-cell]:!whitespace-nowrap',
                  '[&_.ant-table-tbody_.ant-table-cell]:!whitespace-nowrap',
                  '[&_.ant-table-wrapper]:!w-full [&_.ant-table-wrapper]:!max-w-full',
                  '[&_.ant-table]:!w-full [&_.ant-table]:!min-w-0 [&_.ant-table]:!max-w-full',
                  '[&_.ant-table-container]:!w-full [&_.ant-table-container]:!max-w-full',
                  '[&_.ant-table-content]:!w-full [&_.ant-table-content]:!max-w-full',
                ].join(' ')
              : '',
          ]
            .filter(Boolean)
            .join(' ')}
          columns={columns}
          dataSource={paginatedData}
          rowKey="id"
          scroll={{ x: 'max-content' }}
          loading={loading}
          onRow={(record) => ({
            onClick: () => handleRowClick(record.id),
          })}
          rowClassName={(record, index) =>
            `${record.id ? 'cursor-pointer' : 'cursor-pointer'} ${
              index % 2 === 1 ? '!bg-[#FAFAFA]' : '!bg-white'
            }`
          }
          pagination={false}
        />
      </div>
      {paginationTotal > 0 && (
        <>
          {isMobile || isTablet ? (
            <CustomMobilePagination
              totalResults={paginationTotal}
              pageSize={effectivePageSize}
              currentPage={effectiveCurrentPage}
              onChange={handlePageChange}
              onShowSizeChange={(page, size) => handlePageChange(page, size)}
            />
          ) : (
            <CustomPagination
              current={effectiveCurrentPage}
              total={paginationTotal}
              pageSize={effectivePageSize}
              onChange={handlePageChange}
              onShowSizeChange={(size) => handlePageChange(1, size)}
            />
          )}
        </>
      )}
    </div>
  );
};

export default InvoicesTable;
