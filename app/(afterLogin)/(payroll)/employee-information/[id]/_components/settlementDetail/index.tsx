'use client';

import React from 'react';
import { Avatar, Typography, Tag, Card, Table, Space } from 'antd';
import { useGetSettlementTracking } from '@/store/server/features/payroll/settlementTracking/queries';
import { useGetPayPeriod } from '@/store/server/features/payroll/payroll/queries';
import { useGetAllowance } from '@/store/server/features/payroll/employeeInformation/queries';
import { useGetAllUsers } from '@/store/server/features/employees/employeeManagment/queries';
import { useParams } from 'next/navigation';

const { Title, Text } = Typography;

const SettlementDetail = () => {
  const params = useParams();
  const employeeId = params?.id as string;

  const { data: settlementTrackingData } = useGetSettlementTracking({
    employeeId,
  });
  const { data: payPeriodData } = useGetPayPeriod();
  const { data: compensationDatas } = useGetAllowance();
  const { data: employeeData } = useGetAllUsers();

  const getCompensationName = (compensationId: any) => {
    const compensation = compensationDatas?.find(
      (item: any) => item.id === compensationId,
    );
    return compensation?.name;
  };

  const getPayPeriodName = (payPeriodId: any) => {
    const payPeriod = payPeriodData?.find(
      (item: any) => item.id === payPeriodId,
    );
    return (
      payPeriod?.startDate ??
      'not set' + ' - ' + payPeriod?.endDate ??
      'not set'
    );
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
  const columns = [
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: (text: string) => (
        <Text className="text-gray-900 text-sm">{text}</Text>
      ),
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (text: string) => (
        <Text className="text-gray-900 font-medium text-sm">{text}</Text>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag
          color={status === 'paid' ? 'success' : 'processing'}
          className="capitalize text-xs font-medium px-3 py-1"
        >
          {status}
        </Tag>
      ),
    },
  ];
  // Render tables for each compensation group
  const renderCompensationTables = () => {
    return Object.entries(groupedByCompensation).map(
      ([compensationId, items]: [any, any]) => (
        <div key={compensationId} className="mb-8">
          <Title level={5} className="mb-4">
            {getCompensationName(compensationId)}
          </Title>
          <Table
            columns={columns}
            dataSource={items.map((item: any) => ({
              key: item.id,
              date: getPayPeriodName(item.payPeriodId),
              amount: item.amount,
              status: item.isPaid ? 'paid' : 'pending',
            }))}
            pagination={false}
            size="small"
          />
        </div>
      ),
    );
  };
  const getEmployeeName = (employeeId: any) => {
    const employee = employeeData?.items?.find(
      (item: any) => item.id === employeeId,
    );
    return {
      name: `${employee?.firstName} ${employee?.middleName} ${employee?.lastName}`,
      profilePicture: employee?.profilePicture,
      email: employee?.email,
    };
  };
  const periods =
    payPeriodData?.filter((item: any) =>
      settlementTrackingData
        ?.map((st: any) => st.payPeriodId)
        .includes(item.id),
    ) ?? [];

  const startDates = periods.map((p: any) => new Date(p.startDate).getTime());
  const endDates = periods.map((p: any) => new Date(p.endDate).getTime());

  const earliestStart = startDates.length
    ? new Date(Math.min(...startDates)).toLocaleDateString()
    : '';
  const latestEnd = endDates.length
    ? new Date(Math.max(...endDates)).toLocaleDateString()
    : '';

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex gap-8">
        <Card className="flex-1 shadow-sm">
          <div className="mb-8">
            <Space className="w-full justify-end mb-4">
              <div className="space-y-2">
                <div className="flex justify-between gap-8 text-sm">
                  <Text className="text-gray-500">Amount:</Text>
                  <Text strong className="text-gray-900">
                    {Array.isArray(settlementTrackingData)
                      ? settlementTrackingData.reduce(
                          (acc, item) => acc + (Number(item.amount) || 0),
                          0,
                        )
                      : 0}
                  </Text>
                </div>
                <div className="flex justify-between gap-8 text-sm">
                  <Text className="text-gray-500">Pay Period:</Text>
                  <Text className="text-gray-900">
                    {earliestStart} - {latestEnd}
                  </Text>
                </div>
                <div className="flex justify-between gap-8 text-sm">
                  <Text className="text-gray-500">Total paid:</Text>
                  <Text strong className="text-gray-900">
                    {Array.isArray(settlementTrackingData)
                      ? settlementTrackingData
                          ?.filter((item: any) => item.isPaid === true)
                          .reduce(
                            (acc, item) => acc + (Number(item.amount) || 0),
                            0,
                          )
                      : 0}
                  </Text>
                </div>
                <div className="flex justify-between gap-8 text-sm">
                  <Text className="text-red-500">Remaining:</Text>
                  <Text strong className="text-gray-900">
                    {Array.isArray(settlementTrackingData)
                      ? settlementTrackingData
                          ?.filter((item: any) => item.isPaid === false)
                          .reduce(
                            (acc, item) => acc + (Number(item.amount) || 0),
                            0,
                          )
                      : 0}
                  </Text>
                </div>
                <div className="flex justify-between gap-8 text-sm">
                  <Text className="text-gray-500">Created By:</Text>
                  <Space>
                    <Avatar
                      size="small"
                      src={
                        getEmployeeName(settlementTrackingData?.[0]?.createdBy)
                          ?.profilePicture
                      }
                    />
                    <Text className="text-gray-900">
                      {settlementTrackingData?.[0]?.createdBy
                        ? getEmployeeName(
                            settlementTrackingData?.[0]?.createdBy,
                          )?.name
                        : 'Not mentioned'}
                    </Text>
                  </Space>
                </div>
              </div>
            </Space>
          </div>

          {renderCompensationTables()}
        </Card>
      </div>
    </div>
  );
};

export default SettlementDetail;
