'use client';

import React from 'react';
import { Typography, Tag, Card } from 'antd';
import { useGetSettlementTracking } from '@/store/server/features/payroll/settlementTracking/queries';
import { useGetPayPeriod } from '@/store/server/features/payroll/payroll/queries';
import { useGetAllowance } from '@/store/server/features/payroll/employeeInformation/queries';
import { useGetAllUsers } from '@/store/server/features/employees/employeeManagment/queries';
import { useParams } from 'next/navigation';
import { useBenefitEntitlementStore } from '@/store/uistate/features/compensation/benefit';
import BenefitTracking from '@/app/(afterLogin)/(compensation)/benefit/[id]/_components/benefitTracker';

const { Title, Text } = Typography;

const SettlementDetail = () => {
  const params = useParams();
  const employeeId = params?.id as string;

  const { data: settlementTrackingData, isLoading } = useGetSettlementTracking({
    employeeId,
  });
  const { data: payPeriodData } = useGetPayPeriod();
  const { data: compensationDatas } = useGetAllowance();

  const getCompensationName = (compensationId: any) => {
    const compensation = compensationDatas?.find(
      (item: any) => item.id === compensationId,
    );
    return compensation?.name;
  };

  
  // Group by compensation ID
  const groupByCompensation = (data: any[]) => {
    return data?.reduce((acc: any, item: any) => {
      const compensationId = item.compensationItemId;
      if (!acc[compensationId]) {
        acc[compensationId] = [];
      }
      acc[compensationId].push(item);
      return acc;
    }, {});
  };

  const groupedByCompensation = groupByCompensation(
    settlementTrackingData ?? [],
  );
  
  const statusColors: Record<string, string> = {
    Paid: 'success',
    'In progress': 'warning',
  };
  // Render tables for each compensation group
  const renderCompensationTables = () => {
    return Object.entries(groupedByCompensation).map(
      ([compensationId, items]: [any, any]) => (
        <div key={compensationId} className="mb-8">
          <Card
            loading={isLoading}
            key={compensationId}
            onClick={() => setEmployeeBenefitData(items)}
            bodyStyle={{ padding: 0 }}
            className=" bg-gray-50 rounded-xl px-4 py-3 shadow-sm"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-800 text-sm font-medium">
                {getCompensationName(compensationId)}
              </span>
              <Tag
                color={
                  statusColors[
                    items?.some((item: any) => item.isPaid !== true)
                      ? 'Paid'
                      : 'In progress'
                  ]
                }
                className="rounded-md px-3 py-1 text-xs"
              >
                {items?.some((item: any) => item.isPaid !== true)
                  ? 'Paid'
                  : 'In progress'}
              </Tag>
            </div>
          </Card>
          {/* <Table
            columns={columns}
            dataSource={items.map((item: any) => ({
              key: item.id,
              date: getPayPeriodName(item.payPeriodId),
              amount: item.amount,
              status: item.isPaid ? 'paid' : 'pending',
            }))}
            pagination={false}
            size="small"
          /> */}
        </div>
      ),
    );
  };

  const periods =
    payPeriodData?.filter((item: any) =>
      settlementTrackingData
        ?.map((st: any) => st.payPeriodId)
        .includes(item.id),
    ) ?? [];

  const startDates = periods.map((p: any) => new Date(p.startDate).getTime());
  const endDates = periods.map((p: any) => new Date(p.endDate).getTime());

  // const earliestStart = startDates.length
  //   ? new Date(Math.min(...startDates)).toLocaleDateString()
  //   : '';
  // const latestEnd = endDates.length
  //   ? new Date(Math.max(...endDates)).toLocaleDateString()
  //   : '';
   
  const { employeeBenefitData, setEmployeeBenefitData } =
    useBenefitEntitlementStore();
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {employeeBenefitData == null ? (
        <Card className="flex-1 shadow-sm">{renderCompensationTables()}</Card>
      ) : (
        <BenefitTracking />
      )}
    </div>
  );
};

export default SettlementDetail;
