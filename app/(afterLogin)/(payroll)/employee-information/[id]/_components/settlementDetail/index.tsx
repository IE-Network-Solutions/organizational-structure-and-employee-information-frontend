'use client';

import React from 'react';
import { Avatar, Typography, Tag, Card, Table, Space } from 'antd';
import { DownOutlined, UpOutlined } from '@ant-design/icons';
import { useGetSettlementTracking } from '@/store/server/features/payroll/settlementTracking/queries';
import { useGetPayPeriod } from '@/store/server/features/payroll/payroll/queries';
import { useGetAllowance } from '@/store/server/features/payroll/employeeInformation/queries';
import { useGetAllUsers } from '@/store/server/features/employees/employeeManagment/queries';
import { useParams } from 'next/navigation';
import { useIsMobile } from '@/hooks/useIsMobile';
import { useCompensationSettingStore } from '@/store/uistate/features/compensation/settings';
import DownloadSettlement from './_components/Download';

const { Text } = Typography;

const SettlementDetail = () => {
  const params = useParams();
  const employeeId = params?.id as string;

  const { data: settlementTrackingData } = useGetSettlementTracking({
    employeeId,
  });
  const { data: payPeriodData } = useGetPayPeriod();
  const { data: compensationDatas } = useGetAllowance();
  const { data: employeeData } = useGetAllUsers();

  const { expandedCards, setExpandedCards } = useCompensationSettingStore();
  // Add state to track which cards are expanded

  // Toggle card expansion
  const toggleCard = (compensationId: string) => {
    const newExpandedCards = { ...expandedCards };
    newExpandedCards[compensationId] = !newExpandedCards[compensationId];
    setExpandedCards(newExpandedCards);
  };

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
        <Text className="text-gray-600 text-sm">{text}</Text>
      ),
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (text: string) => (
        <Text className="text-gray-900 text-sm">{text} ETB</Text>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag
          color={status === 'paid' ? 'success' : 'processing'}
          className="capitalize text-xs px-4 py-1 rounded-full"
          style={{
            background: status === 'paid' ? '#E8FFF3' : '#EEF6FF',
            color: status === 'paid' ? '#039855' : '#2E90FA',
            border: 'none',
          }}
        >
          {status}
        </Tag>
      ),
    },
  ];

  const renderCompensationCard = (compensationId: string, items: any[]) => {
    const totalAmount = items.reduce(
      (acc, item) => acc + (Number(item.amount) || 0),
      0,
    );
    const paidAmount = items
      .filter((item) => item.isPaid)
      .reduce((acc, item) => acc + (Number(item.amount) || 0), 0);
    const remainingAmount = totalAmount - paidAmount;
    const isExpanded = expandedCards[compensationId];

    return (
      <Card
        key={compensationId}
        className={isMobile ? 'mb-2 shadow-sm' : 'mb-4 shadow-sm'}
        bodyStyle={{ padding: isMobile ? '12px ' : '24px' }}
        headStyle={{ backgroundColor: '#F5F5F5' }}
        title={
          <div
            className="flex items-center justify-between cursor-pointer p-4 rounded-md"
            onClick={() => toggleCard(compensationId)}
            style={{ backgroundColor: '#F5F5F5' }}
          >
            <Text strong className="text-lg">
              {getCompensationName(compensationId)}
            </Text>
            {isExpanded ? <UpOutlined /> : <DownOutlined />}
          </div>
        }
      >
        {isExpanded && (
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <Text className="text-gray-500">Total Amount</Text>
                  <Text strong>{totalAmount} ETB</Text>
                </div>
                <div className="flex justify-between items-center">
                  <Text className="text-gray-500">Pay Period</Text>
                  <Text>{getPayPeriodName(items[0]?.payPeriodId)}</Text>
                </div>
                <div className="flex justify-between items-center">
                  <Text className="text-gray-500">Total Paid</Text>
                  <Text className="text-green-600" strong>
                    {paidAmount} ETB
                  </Text>
                </div>
                <div className="flex justify-between items-center">
                  <Text className="text-gray-500">Remaining</Text>
                  <Text className="text-red-500" strong>
                    {remainingAmount} ETB
                  </Text>
                </div>
                <div className="flex justify-between items-center">
                  <Text className="text-gray-500">Created By</Text>
                  <Space>
                    <Avatar
                      size="small"
                      src={getEmployeeName(items[0]?.createdBy)?.profilePicture}
                    />
                    <Text>
                      {
                        getEmployeeName(
                          items[0]?.compensationItemEntitlement?.employeeId,
                        )?.name
                      }
                    </Text>
                  </Space>
                </div>
              </div>
            </div>

            <Table
              columns={columns}
              dataSource={items.map((item) => ({
                key: item.id,
                date: getPayPeriodName(item.payPeriodId),
                amount: item.amount,
                status: item.isPaid ? 'paid' : 'pending',
              }))}
              pagination={false}
              size="small"
            />
          </div>
        )}
      </Card>
    );
  };

  const { isMobile } = useIsMobile();
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
  return (
    <div
      className={
        isMobile ? 'bg-gray-50 min-h-screen' : 'p-2 bg-white min-h-screen'
      }
    >
      <Card className={isMobile ? 'p-0' : 'max-w-5xl mx-auto'}>
        <div className="pb-4">
          <DownloadSettlement />
        </div>
        {Object.entries(groupedByCompensation).map(([compensationId, items]) =>
          renderCompensationCard(compensationId, items as any[]),
        )}
      </Card>
    </div>
  );
};

export default SettlementDetail;
