'use client';

import CustomBreadcrumb from '@/components/common/breadCramp';
import {
  AppstoreOutlined,
  CalendarFilled,
  CheckCircleFilled,
  EditFilled,
} from '@ant-design/icons';
import InvoicesTable from '../_components/invoicesTable/invoicesTable';
import { useEffect, useState } from 'react';
import { Card, Skeleton } from 'antd';
import React from 'react';
import { Currency, Invoice, Plan, Subscription } from '@/types/tenant-management';
import { useGetInvoices } from '@/store/server/features/tenant-management/invoices/queries';
import { useGetCurrencies } from '@/store/server/features/tenant-management/currencies/queries';
import { useGetPlans } from '@/store/server/features/tenant-management/plans/queries';
import { useGetSubscriptions } from '@/store/server/features/tenant-management/subscriptions/queries';
import { DEFAULT_TENANT_ID } from '@/utils/constants';

const BillingPage = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  
  const { data: invoicesData, isLoading: isInvoicesLoading } = useGetInvoices(
    {filter: {
      tenantId: DEFAULT_TENANT_ID
    }},
    'ASC',
    false,
    true
  );

  const { data: plansData, isLoading: plansLoading } = useGetPlans(
    { filter: {} },
    true,
    true,
    'ASC'
  );

  const { data: currenciesData, isLoading: currenciesLoading } = useGetCurrencies(
    { filter: {} },
    true,
    true
  );

  const { data: subscriptionsData, isLoading: subscriptionsLoading } = useGetSubscriptions(
    { filter: {
      tenantId: [DEFAULT_TENANT_ID]
    } },
    true,
    true
  );
  
  useEffect(() => {
    if (invoicesData?.items && invoicesData.items.length > 0) {
      const sortedInvoices = [...invoicesData.items].sort((a, b) => {
        // Sort by creation date in descending order (newest first)
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
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

  // Calculate statistics
  const calculateStats = () => {
    let totalAmount = 0;
    let issuedAmount = 0;
    let paidAmount = 0;
    let overdueAmount = 0;

    invoices.forEach(invoice => {
      // Convert string amount to number
      // totalAmount can come as a string, so we convert it to a number
      const amount = typeof invoice.totalAmount === 'string' 
        ? parseFloat(invoice.totalAmount) 
        : (invoice.totalAmount || 0);
      
      totalAmount += amount;
      
      switch(invoice.status?.toLowerCase()) {
        case 'issued':
          issuedAmount += amount;
          break;
        case 'paid':
          paidAmount += amount;
          break;
        case 'overdue':
          overdueAmount += amount;
          break;
      }
    });

    return {
      totalAmount,
      issuedAmount,
      paidAmount,
      overdueAmount
    };
  };
  
  const stats = calculateStats();

  // Format large numbers with K (thousands) suffix
  const formatLargeNumber = (amount: number) => {
    if (amount >= 1000) {
      // Format to 1 decimal place if not a round thousand
      const isRoundThousand = amount % 1000 === 0;
      const value = amount / 1000;
      const formattedValue = isRoundThousand 
        ? value.toFixed(0) 
        : value.toFixed(1).replace(/\.0$/, ''); // Remove .0 if it ends with it
      
      return `$${formattedValue}K`;
    }
    
    // For amounts less than 1000, use regular currency format
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const dashboardData = [
    {
      overview: 'Total Invoice',
      color: '#3636F0',
      icon: <AppstoreOutlined />,
      id: 'totalInvoice',
    },
    {
      overview: 'Issued',
      color: '#3636F0',
      icon: <EditFilled />,
      id: 'issued',
    },
    {
      overview: 'Paid',
      color: '#0BA259',
      icon: <CheckCircleFilled />,
      id: 'paid',
    },
    {
      overview: 'Overdue',
      color: '#E03137',
      icon: <CalendarFilled />,
      id: 'overdue',
    },
  ];

  const dashboardValues = [
    {
      id: 'totalInvoice',
      value: formatLargeNumber(stats.totalAmount),
    },
    {
      id: 'issued',
      value: formatLargeNumber(stats.issuedAmount),
    },
    {
      id: 'paid',
      value: formatLargeNumber(stats.paidAmount),
    },
    {
      id: 'overdue',
      value: formatLargeNumber(stats.overdueAmount),
    },
  ];

  const isLoading = isInvoicesLoading || plansLoading || currenciesLoading || subscriptionsLoading;

  return (
    <div className="h-auto w-auto px-6 py-6">
      <CustomBreadcrumb
        title="Billing & Invoices"
        subtitle="Complete Billing Overview"
      />

      <div className="grid gap-3  mb-[35px] mt-[25px] md:grid-cols-2 lg:grid-cols-5">
        {dashboardData.map((item, idx) => {
          const valueData = dashboardValues.find((v) => v.id === item.id);
          return (
            <Card
              key={idx}
              loading={isLoading}
              className="rounded-lg bg-white relative"
              bordered={false}
              styles={{
                body: { padding: '0px' },
              }}
              style={{
                boxShadow: isLoading
                  ? 'none'
                  : '0px 5px 10px 0px rgba(0, 0, 0, 0.1)',
                border: isLoading
                  ? 'none'
                  : '1px solid rgba(162, 161, 168, 0.2)',
                padding: isLoading ? '20px' : '0px',
              }}
            >
              {isLoading ? (
                <Skeleton active paragraph={{ rows: 2 }} />
              ) : (
                <>
                  <div className="flex flex-row items-center gap-2 pt-6 pl-4 pr-4 pb-4">
                    <div className="bg-gray-100 rounded-md py-2 px-3 w-fit">
                      {React.cloneElement(item.icon, {
                        style: { color: item.color },
                        size: 24,
                      })}
                    </div>
                    <div className="text-sm text-gray-500">{item.overview}</div>
                  </div>

                  <div className="flex flex-col">
                    <div className="p-4 pt-0">
                      <div
                        className={`text-3xl font-bold flex items-center justify-between ${item.id === 'overdue' ? 'text-error' : ''}`}
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

      <div className="mb-[35px] mt-[25px] ">
        <InvoicesTable 
          data={invoices} 
          loading={isLoading} 
          plans={plans}
          currencies={currencies}
          subscriptions={subscriptions}
        />
      </div>
    </div>
  );
};

export default BillingPage;
