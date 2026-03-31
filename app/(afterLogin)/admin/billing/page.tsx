'use client';

import InvoicesTable from '../_components/invoicesTable/invoicesTable';
import { useEffect, useState } from 'react';
import { Card, Skeleton } from 'antd';
import React from 'react';
import {
  Currency,
  Invoice,
  Plan,
  Subscription,
} from '@/types/tenant-management';
import { useGetInvoices } from '@/store/server/features/tenant-management/invoices/queries';
import { useGetCurrencies } from '@/store/server/features/tenant-management/currencies/queries';
import { useGetPlans } from '@/store/server/features/tenant-management/plans/queries';
import { useGetSubscriptions } from '@/store/server/features/tenant-management/subscriptions/queries';
import { DEFAULT_TENANT_ID } from '@/utils/constants';
import { MdOutlineCheckCircle, MdOutlineReceiptLong } from 'react-icons/md';
import { TbMailForward } from 'react-icons/tb';
import { IoWarningOutline } from 'react-icons/io5';
import { InvoiceModal } from '../_components/InvoiceModal/InvoiceModal';

const BillingPage = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [invoicePage, setInvoicePage] = useState(1);
  const invoicePageSize = 10;
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(
    null,
  );

  const { data: invoicesData, isLoading: isInvoicesLoading } = useGetInvoices(
    {
      filter: {
        tenantId: DEFAULT_TENANT_ID,
      },
      page: invoicePage,
      limit: invoicePageSize,
    },
    'DESC',
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

  const { data: subscriptionsData, isLoading: subscriptionsLoading } =
    useGetSubscriptions(
      {
        filter: {
          tenantId: [DEFAULT_TENANT_ID],
        },
      },
      true,
      true,
    );

  useEffect(() => {
    if (invoicesData?.items && invoicesData.items.length > 0) {
      const sortedInvoices = [...invoicesData.items].sort((a, b) => {
        // Sort by creation date in descending order (newest first)
        return (
          new Date(b.createdAt || 0).getTime() -
          new Date(a.createdAt || 0).getTime()
        );
      });
      setInvoices(sortedInvoices);
    } else {
      setInvoices([]);
    }
  }, [invoicesData]);

  useEffect(() => {
    if (currenciesData?.items && currenciesData.items.length > 0) {
      setCurrencies(currenciesData.items);
    }
  }, [currenciesData]);

  useEffect(() => {
    if (plansData?.items && plansData.items.length > 0) {
      setPlans(plansData.items);
    }
  }, [plansData]);

  useEffect(() => {
    if (subscriptionsData?.items && subscriptionsData.items.length > 0) {
      setSubscriptions(subscriptionsData.items);
    }
  }, [subscriptionsData]);

  const getCurrencyInfo = (currencyId: string) => {
    const currency = currencies?.find((c) => c.id === currencyId);
    return {
      symbol: currency?.symbol || '$',
      code: currency?.code || 'USD',
      currency,
    };
  };

  // Calculate statistics grouped by currency
  const calculateStats = () => {
    const statsByCurrency: Record<
      string,
      {
        totalAmount: number;
        issuedAmount: number;
        paidAmount: number;
        overdueAmount: number;
        currencyId: string;
      }
    > = {};

    invoices.forEach((invoice) => {
      const currencyId = invoice.currencyId || 'USD';

      if (!statsByCurrency[currencyId]) {
        statsByCurrency[currencyId] = {
          totalAmount: 0,
          issuedAmount: 0,
          paidAmount: 0,
          overdueAmount: 0,
          currencyId,
        };
      }

      // Convert string amount to number
      const amount =
        typeof invoice.totalAmount === 'string'
          ? parseFloat(invoice.totalAmount)
          : invoice.totalAmount || 0;

      statsByCurrency[currencyId].totalAmount += amount;

      switch (invoice.status?.toLowerCase()) {
        case 'pending':
          statsByCurrency[currencyId].issuedAmount += amount;
          break;
        case 'paid':
          statsByCurrency[currencyId].paidAmount += amount;
          break;
        case 'overdue':
          statsByCurrency[currencyId].overdueAmount += amount;
          break;
      }
    });

    return statsByCurrency;
  };

  const statsByCurrency = calculateStats();

  // Format large numbers with K (thousands) suffix
  const formatLargeNumber = (amount: number, currencySymbol: string) => {
    if (amount >= 1000) {
      // Format to 1 decimal place if not a round thousand
      const isRoundThousand = amount % 1000 === 0;
      const value = amount / 1000;
      const formattedValue = isRoundThousand
        ? value.toFixed(0)
        : value.toFixed(1).replace(/\.0$/, ''); // Remove .0 if it ends with it

      return `${currencySymbol}${formattedValue}K`;
    }

    // For amounts less than 1000, use currency symbol directly
    return `${currencySymbol}${amount.toFixed(0)}`;
  };

  // Get formatted stats for each currency
  const getFormattedStats = (
    statType: 'totalAmount' | 'issuedAmount' | 'paidAmount' | 'overdueAmount',
  ) => {
    const currencyEntries = Object.entries(statsByCurrency);

    if (currencyEntries.length === 0) {
      return { value: '$0 USD', currencies: [] };
    }

    // If only one currency, show simple format
    if (currencyEntries.length === 1) {
      const [currencyId, stats] = currencyEntries[0];
      const currencyInfo = getCurrencyInfo(currencyId);
      const amount = stats[statType];
      return {
        value: formatLargeNumber(amount, currencyInfo.symbol),
        currencies: [{ currencyId, ...currencyInfo, amount }],
      };
    }

    // Multiple currencies - show all with breakdown
    const formattedValues: string[] = [];
    const currencyDetails: Array<{
      currencyId: string;
      symbol: string;
      code: string;
      amount: number;
    }> = [];

    currencyEntries.forEach(([currencyId, stats]) => {
      const currencyInfo = getCurrencyInfo(currencyId);
      const amount = stats[statType];
      if (amount > 0) {
        formattedValues.push(formatLargeNumber(amount, currencyInfo.symbol));
        currencyDetails.push({
          currencyId,
          ...currencyInfo,
          amount,
        });
      }
    });

    return {
      value:
        formattedValues.length > 0 ? formattedValues.join(' / ') : '$0 USD',
      currencies: currencyDetails,
    };
  };

  const dashboardData = [
    {
      overview: 'Total Invoice',
      color: '#1E40AF',
      icon: <MdOutlineReceiptLong size={24} />,
      id: 'totalInvoice',
    },
    {
      overview: 'Issued',
      color: '#1E40AF',
      icon: <TbMailForward size={24} />,
      id: 'issued',
    },
    {
      overview: 'Paid',
      color: '#52C41A',
      icon: <MdOutlineCheckCircle size={24} />,
      id: 'paid',
    },
    {
      overview: 'Overdue',
      color: '#FF4D4F',
      icon: <IoWarningOutline size={24} />,
      id: 'overdue',
    },
  ];

  const getTintedBg = (hexColor: string, alpha: number = 0.14) => {
    const hex = hexColor.replace('#', '');
    if (hex.length !== 6) return '#EEF4FF';
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  const dashboardValues = [
    {
      id: 'totalInvoice',
      ...getFormattedStats('totalAmount'),
    },
    {
      id: 'issued',
      ...getFormattedStats('issuedAmount'),
    },
    {
      id: 'paid',
      ...getFormattedStats('paidAmount'),
    },
    {
      id: 'overdue',
      ...getFormattedStats('overdueAmount'),
    },
  ];

  const isLoading =
    isInvoicesLoading ||
    plansLoading ||
    currenciesLoading ||
    subscriptionsLoading;

  const openInvoiceModal = (invoiceId: string) => {
    setSelectedInvoiceId(invoiceId);
    setInvoiceModalOpen(true);
  };

  return (
    <div id="billing-page" data-cy="billing-page" className="h-auto w-auto">
      <div
        id="billing-cards"
        data-cy="billing-cards"
        className="grid gap-4 mb-[35px] mt-[25px] md:grid-cols-2 lg:grid-cols-4"
      >
        {dashboardData.map((item, idx) => {
          const valueData = dashboardValues.find((v) => v.id === item.id);
          return (
            <Card
              key={idx}
              id={`billing-card-${item.id}`}
              data-cy={`billing-card-${item.id}`}
              loading={isLoading}
              className="rounded-lg bg-white relative"
              bordered={false}
              styles={{
                body: { padding: '0px' },
              }}
              style={{
                boxShadow: isLoading
                  ? 'none'
                  : '0px 2px 8px 0px rgba(0, 0, 0, 0.06)',
                border: isLoading ? 'none' : '1px solid #E5E7EB',
                padding: isLoading ? '20px' : '0px',
              }}
            >
              {isLoading ? (
                <Skeleton
                  active
                  paragraph={{ rows: 2 }}
                  data-cy="billing-card-loading-skeleton"
                />
              ) : (
                <>
                  <div
                    id={`billing-card-${item.id}-header`}
                    data-cy={`billing-card-${item.id}-header`}
                    className="flex flex-row items-center gap-2.5 pt-4 pl-4 pr-4 pb-3"
                  >
                    <div
                      id={`billing-card-${item.id}-icon`}
                      data-cy={`billing-card-${item.id}-icon`}
                      className="h-8 w-8 rounded-md flex items-center justify-center"
                      style={{ backgroundColor: getTintedBg(item.color) }}
                    >
                      {React.cloneElement(item.icon, {
                        style: { color: item.color, fontSize: 16 },
                      })}
                    </div>
                    <div
                      id={`billing-card-${item.id}-label`}
                      data-cy={`billing-card-${item.id}-label`}
                      className="text-lg text-gray-700 font-medium leading-none"
                    >
                      {item.overview}
                    </div>
                  </div>

                  <div
                    id={`billing-card-${item.id}-content`}
                    data-cy={`billing-card-${item.id}-content`}
                    className="flex flex-col"
                  >
                    <div
                      id={`billing-card-${item.id}-value-container`}
                      data-cy={`billing-card-${item.id}-value-container`}
                      className="pr-4 pb-4 pt-0 pl-[58px]"
                    >
                      <div
                        id={`billing-card-${item.id}-value`}
                        data-cy={`billing-card-${item.id}-value`}
                        className={`text-[32px] leading-none font-bold flex items-center justify-between ${item.id === 'overdue' ? 'text-error' : ''}`}
                        style={
                          item.id === 'paid' ? { color: item.color } : undefined
                        }
                      >
                        {valueData?.value}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </Card>
          );
        })}
      </div>

      <div
        id="billing-invoices-section"
        data-cy="billing-invoices-section"
        className="mb-[35px] mt-[25px] "
      >
        <h2
          data-cy="-afterlogin-admin-billing-page-tsx-page-h2-390"
          className="text-base font-bold text-gray-900 mb-4"
        >
          Billing History
        </h2>
        <InvoicesTable
          data={invoices}
          loading={isLoading}
          plans={plans}
          currencies={currencies}
          subscriptions={subscriptions}
          totalItems={invoicesData?.meta?.totalItems ?? invoices.length}
          totalPages={invoicesData?.meta?.totalPages}
          currentPage={invoicePage}
          pageSize={invoicePageSize}
          onPageChange={(page) => setInvoicePage(page)}
          onInvoiceClick={openInvoiceModal}
          hideFilters
          data-cy="billing-invoices-table"
        />
      </div>
      <InvoiceModal
        open={invoiceModalOpen}
        invoiceId={selectedInvoiceId}
        onClose={() => {
          setInvoiceModalOpen(false);
          setSelectedInvoiceId(null);
        }}
      />
    </div>
  );
};

export default BillingPage;
