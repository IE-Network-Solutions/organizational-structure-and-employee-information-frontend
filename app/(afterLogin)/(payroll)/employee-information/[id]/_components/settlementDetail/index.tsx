'use client';

import React from 'react';
import { Tag, Card, Empty } from 'antd';
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

  const getCompensationName = (compensationId: any) => {
    if (comLoading)
      return (
        <div
          className="py-4"
          id="payroll-settlement-loading-view-container"
          data-cy="payroll-settlement-loading-view-container"
        >
          <LoadingOutlined
            id="payroll-settlement-loading-view-icon"
            data-cy="payroll-settlement-loading-view-icon"
          />
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
    if (Object.keys(groupedByCompensation).length === 0) {
      return (
        <div
          className="flex items-center justify-center h-full"
          id="payroll-settlement-empty-view-container"
          data-cy="payroll-settlement-empty-view-container"
        >
          <Empty
         
            data-cy="payroll-settlement-empty-view-component"
            description="No data available"
          />
        </div>
      );
    }
    return Object.entries(groupedByCompensation).map(
      ([compensationId, items]: [any, any]) => (
        <div
          key={compensationId}
          className="mb-8"
          id={`payroll-settlement-compensation-view-container-${compensationId}`}
          data-cy={`payroll-settlement-compensation-view-container-${compensationId}`}
        >
          <Card
            id={`payroll-settlement-compensation-view-card-${compensationId}`}
            data-cy={`payroll-settlement-compensation-view-card-${compensationId}`}
            loading={isLoading}
            key={compensationId}
            onClick={() => setEmployeeBenefitData(items)}
            bodyStyle={{ padding: 0 }}
            className=" bg-gray-50 rounded-xl px-4 py-3 shadow-sm"
          >
            <div
              className="flex items-center justify-between mb-2"
              id={`payroll-settlement-compensation-header-view-container-${compensationId}`}
              data-cy={`payroll-settlement-compensation-header-view-container-${compensationId}`}
            >
              <span
                className="text-gray-800 text-sm font-medium"
                id={`payroll-settlement-compensation-name-view-text-${compensationId}`}
                data-cy={`payroll-settlement-compensation-name-view-text-${compensationId}`}
              >
                {getCompensationName(compensationId)}
              </span>
              <Tag
                id={`payroll-settlement-compensation-status-view-tag-${compensationId}`}
                data-cy={`payroll-settlement-compensation-status-view-tag-${compensationId}`}
                color={
                  statusColors[
                    items?.every((item: any) => item.isPaid === true)
                      ? 'Paid'
                      : 'In progress'
                  ]
                }
                className="rounded-md px-3 py-1 text-xs"
              >
                {items?.every((item: any) => item.isPaid === true)
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
    <div
      className="p-6 bg-gray-50 min-h-screen"
      id="payroll-settlement-wrapper-view-container"
      data-cy="payroll-settlement-wrapper-view-container"
    >
      {employeeBenefitData == null ? (
        <Card
          id="payroll-settlement-list-view-card"
          data-cy="payroll-settlement-list-view-card"
          loading={isLoading}
          className="flex-1 shadow-sm"
        >
          {renderCompensationTables()}
        </Card>
      ) : (
        <BenefitTracking
       
          data-cy="payroll-settlement-benefit-tracking-view-component"
        />
      )}
    </div>
  );
};

export default SettlementDetail;
