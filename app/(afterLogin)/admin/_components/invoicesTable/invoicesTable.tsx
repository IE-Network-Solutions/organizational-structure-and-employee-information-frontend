'use client';

import { Table, Input, Select, DatePicker, notification } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { Invoice, Currency, Plan, InvoiceStatus, Subscription } from '@/types/tenant-management';
import { useState, useEffect } from 'react';
import { RightOutlined, LoadingOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import { useGetInvoiceDetail } from '@/store/server/features/tenant-management/invoices/queries';
import { TENANT_BASE_URL } from '@/utils/constants';

dayjs.extend(isBetween);

const { RangePicker } = DatePicker;
const { Search } = Input;

interface InvoicesTableProps {
  data: Invoice[];
  loading?: boolean;
  plans: Plan[];
  currencies: Currency[];
  subscriptions?: Subscription[];
}

const InvoicesTable = ({ 
  data, 
  loading = false, 
  plans,
  currencies,
  subscriptions = []
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
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);
  const [downloadingInvoiceId, setDownloadingInvoiceId] = useState<string | null>(null);
  const router = useRouter();

  const { data: invoiceDetail } = useGetInvoiceDetail(
    selectedInvoiceId || '',
    'PDF'
  );

  // Функция для скачивания файла
  const downloadFile = (url: string, filename: string) => {
    fetch(url)
      .then(response => response.blob())
      .then(blob => {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      })
      .catch(error => {
        notification.error({
          message: 'Error downloading file',
          description: error instanceof Error ? error.message : 'An unknown error occurred'
        });
      })
      .finally(() => {
        setDownloadingInvoiceId(null);
      });
  };

  useEffect(() => {
    if (invoiceDetail && selectedInvoiceId) {
      const response = invoiceDetail as any;
      
      const filePath = response.path || response.data?.path || response.items?.[0]?.path;
      
      if (filePath) {
        const fullUrl = `${TENANT_BASE_URL}/${filePath}`;
        
        const invoice = data.find(inv => inv.id === selectedInvoiceId);
        const fileName = invoice 
          ? `Invoice-${invoice.invoiceNumber}.pdf` 
          : `Invoice-${selectedInvoiceId}.pdf`;
        
        downloadFile(fullUrl, fileName);
      } else {
        setDownloadingInvoiceId(null);
      }
      
      setSelectedInvoiceId(null);
    }
  }, [invoiceDetail, selectedInvoiceId, data]);

  const handlePageChange = (page: number, size: number) => {
    setCurrentPage(page);
    setPageSize(size);
  };

  const handleRowClick = (id: string) => {
    router.push(`/admin/invoice/${id}`);
  };

  const getPlanName = (subscriptionId: string) => {
    // First try to find subscription by id
    const subscription = subscriptions?.find(sub => sub.id === subscriptionId);
    
    if (subscription?.plan?.name) {
      return subscription.plan.name;
    }
    
    // If not found in subscriptions directly, look for plan information in invoice notes
    const invoice = data.find(inv => inv.subscriptionId === subscriptionId);
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
    const currency = currencies?.find(c => c.id === currencyId);
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

  const statusOptions = Object.values(InvoiceStatus).map(status => ({
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
      sorter: (a, b) => a.invoiceNumber - b.invoiceNumber,
      render: (invoiceNumber: string) => <span>#{invoiceNumber}</span>,
      defaultSortOrder: 'descend',
    },
    {
      title: 'Issue Date',
      dataIndex: 'invoiceAt',
      sorter: (a, b) =>
        new Date(a.invoiceAt).getTime() - new Date(b.invoiceAt).getTime(),
      render: (date: string) =>
        dayjs(date).format('MMMM D, YYYY'),
    },
    {
      title: 'Plan',
      dataIndex: 'subscriptionId',
      sorter: (a, b) => {
        const planNameA = getPlanName(a.subscriptionId);
        const planNameB = getPlanName(b.subscriptionId);
        return planNameA.localeCompare(planNameB);
      },
      render: (subscriptionId: string) => (
        <div className="flex items-center gap-2 border border-gray-300 rounded-lg px-2 w-fit whitespace-nowrap">
          <span className="w-2 h-2 min-w-2 min-h-2 rounded-full bg-primary" />
          <span>{getPlanName(subscriptionId)}</span>
        </div>
      ),
    },
    {
      title: 'New Plan',
      dataIndex: 'newPlan',
      key: 'newPlan',
      width: 210,
      // eslint-disable-next-line @typescript-eslint/naming-convention
      render: (_: unknown, record: Invoice) => {
        const subscription = subscriptions?.find(sub => sub.id === record.subscriptionId);
        const newPlanId = subscription?.scheduledChangesMetadata?.changes?.newPlanId;
        const newPlanPeriodId = subscription?.scheduledChangesMetadata?.changes?.newPlanPeriodId;
        const newSlotTotal = subscription?.scheduledChangesMetadata?.changes?.newSlotTotal;
        const newTotalAmount = subscription?.scheduledChangesMetadata?.changes?.newTotalAmount;
        const effectiveAt = subscription?.scheduledChangesMetadata?.effectiveAt;

        if (!newPlanId) {
          return '-';
        }

        // Looking for an identity plan in an array of plans
        const newPlan = plans.find(p => p.id === newPlanId);
        const newPlanPeriod = newPlan?.periods.find(p => p.id === newPlanPeriodId);

        return (
          <div className="min-w-[210px]">
            <span className="text-xs text-gray-500">Plan changed to <span className="font-medium text-primary">{newPlan ? newPlan.name : '-'}</span></span><br />
            {newPlanPeriod && (
              <span className="text-xs text-gray-500">New plan period: <span className="font-medium text-primary">{newPlanPeriod?.periodType?.code}</span><br /></span>
            )}
            <span className="text-xs text-gray-500">New plan slot total: <span className="font-medium text-primary">{newSlotTotal ? newSlotTotal : '-'}</span></span><br />
            <span className="text-xs text-gray-500">New plan total amount: <span className="font-medium text-primary">{newTotalAmount ? newTotalAmount : '-'}</span></span><br />
            <span className="text-xs text-gray-500">New plan will be effective: <span className="font-medium text-primary">{effectiveAt ? dayjs(effectiveAt).format('DD.MM.YYYY') : '-'}</span></span>
          </div>
        );
      },
    },
    {
      title: 'Amount',
      dataIndex: 'totalAmount',
      sorter: (a, b) => a.totalAmount - b.totalAmount,
      render: (total: number, record: Invoice) => (
        <span>
          {getCurrencySymbol(record.currencyId)}
          {Number(total).toFixed(2)}
        </span>
      ),
    },
    {
      title: 'Currency',
      dataIndex: 'currencyId',
      sorter: (a, b) => a.currencyId.localeCompare(b.currencyId),
      render: (currencyId: string) => {
        const currency = currencies?.find(c => c.id === currencyId);
        return <span>{currency?.symbol || currencyId}</span>;
      },
    },
    {
      title: 'Payment Date',
      dataIndex: 'dueAt',
      sorter: (a, b) =>
        new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime(),
      render: (date: string) =>
        dayjs(date).format('MMMM D, YYYY'),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      sorter: (a, b) => a.status.localeCompare(b.status),
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
            className={`rounded-lg px-2 py-2 text-sm font-medium ${className}`}
          >
            {status}
          </span>
        );
      },
    },
    {
      title: '',
      dataIndex: 'actions',
      width: 100,
      render: (...args: [string, Invoice]) => {
        const record = args[1];
        const isDownloadingThis = downloadingInvoiceId === record.id;
        
        return (
          <div className="flex items-center gap-4">
            <button
              onClick={(e) => handlePdfDownload(e, record.id)}
              className="hover:opacity-75 transition-opacity"
              disabled={isDownloadingThis}
            >
              {isDownloadingThis ? (
                <LoadingOutlined className="w-5 h-5 text-primary" spin />
              ) : (
                <img
                  src="/icons/file-download.svg"
                  alt="Download PDF"
                  className="w-5 h-5 min-w-5 min-h-5"
                />
              )}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleRowClick(record.id);
              }}
              className="text-gray-500 hover:text-primary transition-colors hover:translate-x-1 transition-transform duration-300"
            >
              <RightOutlined />
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <div>
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <Search
          placeholder="Search by Invoice ID"
          allowClear
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="w-full md:w-1/3"
        />

        <Select
          placeholder="Filter by Status"
          allowClear
          options={statusOptions}
          value={statusFilter}
          onChange={setStatusFilter}
          className="w-full md:w-1/4"
        />

        <RangePicker
          placeholder={['Start Payment Date', 'End Payment Date']}
          value={paymentDateRange}
          onChange={(dates) =>
            setPaymentDateRange(dates as [dayjs.Dayjs, dayjs.Dayjs])
          }
          className="w-full md:w-1/4"
        />

        <RangePicker
          placeholder={['Start Issue Date', 'End Issue Date']}
          value={voiceDateRange}
          onChange={(dates) =>
            setVoiceDateRange(dates as [dayjs.Dayjs, dayjs.Dayjs])
          }
          className="w-full md:w-1/4"
        />
      </div>

      <Table
        columns={columns}
        dataSource={filteredData}
        rowKey="id"
        scroll={{ x: true }}
        loading={loading}
        onRow={(record) => ({
          onClick: () => handleRowClick(record.id),
        })}
        pagination={{
          total: filteredData.length,
          current: currentPage,
          pageSize: pageSize,
          showSizeChanger: true,
          showQuickJumper: false,
          className: 'px-4 py-3 invoice-table',
          showTotal: (total, range) =>
            `Showing ${range[0]} to ${range[1]} of ${total} entries`,
          position: ['bottomLeft', 'bottomRight'],
          style: {
            margin: 0,
            padding: '16px 0',
            display: 'flex',
            justifyContent: 'flex-start',
            alignItems: 'center',
            width: '100%',
          },
          onChange: handlePageChange,
          onShowSizeChange: handlePageChange,
          pageSizeOptions: ['5', '10', '20', '50'],
        }}
      />
    </div>
  );
};

export default InvoicesTable;
