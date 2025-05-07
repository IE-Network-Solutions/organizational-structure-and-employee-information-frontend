'use client';

import React from 'react';
import { Tag, Card } from 'antd';
import { useGetSettlementTracking } from '@/store/server/features/payroll/settlementTracking/queries';
import { useGetAllowance } from '@/store/server/features/payroll/employeeInformation/queries';
import { useParams } from 'next/navigation';
import { useBenefitEntitlementStore } from '@/store/uistate/features/compensation/benefit';
import BenefitTracking from '@/app/(afterLogin)/(compensation)/benefit/[id]/_components/benefitTracker';
import { LoadingOutlined } from '@ant-design/icons';

const SettlementDetail = () => {
  const params = useParams();
  const employeeId = params?.id as string;

  const { data: settlementTrackingData, isLoading } = useGetSettlementTracking({
    employeeId,
  });
  const { data: compensationDatas, isLoading: comLoading } = useGetAllowance();

  const { expandedCards, setExpandedCards } = useCompensationSettingStore();
  // Add state to track which cards are expanded

  // Toggle card expansion
  const toggleCard = (compensationId: string) => {
    const newExpandedCards = { ...expandedCards };
    newExpandedCards[compensationId] = !newExpandedCards[compensationId];
    setExpandedCards(newExpandedCards);
  };

  const getCompensationName = (compensationId: any) => {
    if (comLoading)
      return (
        <div className="py-4">
          <LoadingOutlined />
        </div>
      );
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
                    items?.some((item: any) => item.isPaid === true)
                      ? 'Paid'
                      : 'In progress'
                  ]
                }
                className="rounded-md px-3 py-1 text-xs"
              >
                {items?.some((item: any) => item.isPaid === true)
                  ? 'Paid'
                  : 'In progress'}
              </Tag>
            </div>
          </Card>
        </div>
      ),
    );
  };

  const { employeeBenefitData, setEmployeeBenefitData } =
    useBenefitEntitlementStore();
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {employeeBenefitData == null ? (
        <Card loading={isLoading} className="flex-1 shadow-sm">
          {renderCompensationTables()}
        </Card>
      ) : (
        <BenefitTracking />
      )}
    </div>
  );
};

export default SettlementDetail;
