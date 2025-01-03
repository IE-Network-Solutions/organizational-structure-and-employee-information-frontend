'use client';
import React from 'react';
import { Table, Button, Space, Typography, Switch, Spin } from 'antd';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { notification } from 'antd';
import PayPeriodSideBar from './_components/payPeriodSideBar';
import usePayPeriodStore from '@/store/uistate/features/payroll/settings/payPeriod';
import { useFetchActiveFiscalYearPayPeriods } from '@/store/server/features/payroll/setting/tax-rule/queries';
import { useGetActiveFiscalYears } from '@/store/server/features/organizationStructure/fiscalYear/queries';
import { useDeletePayPeriod, useChangePayPeriodStatus } from '@/store/server/features/payroll/setting/tax-rule/mutation';
import dayjs from 'dayjs';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
const { Title } = Typography;

const PayPeriod = () => {
  const { setIsPayPeriodSidebarVisible, currentPage, pageSize, setCurrentPage, setPageSize } = usePayPeriodStore();
  const { data: activeFiscalYear } = useGetActiveFiscalYears();
  const { mutate: deletePayPeriod } = useDeletePayPeriod();
  const { mutate: changePayPeriodStatus } = useChangePayPeriodStatus();
  const { data: payPeriods, isLoading } = useFetchActiveFiscalYearPayPeriods(activeFiscalYear?.id);

  const handleAddPayPeriod = () => {
    setIsPayPeriodSidebarVisible(true);
  }
  const handleDeletePayPeriod = (payPeriodId: string) => {
    deletePayPeriod(payPeriodId);
  }

  const handleTableChange = (pagination: any) => {
    setCurrentPage(pagination.current);
    setPageSize(pagination.pageSize);
  };
  
  const onStatusChange = (record: any, checked: boolean) => {
  
    const newStatus = checked ? 'OPEN' : 'CLOSED';
    const today = dayjs();
    const isTodayInRange = today.isBetween(
      dayjs(record.startDate),
      dayjs(record.endDate),
      null,
      '[]'
    );
  
    if (newStatus === 'OPEN') {
      if (isTodayInRange) {
        changePayPeriodStatus({ payPeriodId: record.id, status: newStatus });
      } else {
        notification.warning({
          message: 'Cannot Open Pay Period',
          description:
            'Pay period can only be opened if today falls within its start and end date.',
          placement: 'topRight',
        });
      }
    } else {
      changePayPeriodStatus({ payPeriodId: record.id, status: newStatus });
    }
  };
  

  const dataSource = Array.isArray(payPeriods)
  ? payPeriods.map((payPeriod: any) => ({
      key: payPeriod.id,
      id: payPeriod.id,
      startDate: payPeriod.startDate,
      endDate: payPeriod.endDate,
      range: `${dayjs(payPeriod.startDate).format('MMMM D, YYYY')} - ${dayjs(payPeriod.endDate).format('MMMM D, YYYY')}`,
      month: dayjs(payPeriod.startDate).format('MMM'),
      status: payPeriod.status,
    }))
  : [];

  const columns = [
    {
      title: 'Range',
      dataIndex: 'range',
      key: 'range',
    },
    {
      title: 'Month',
      dataIndex: 'month',
      key: 'month',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
    },
    {
      title: 'Action',
      key: 'action',
      render: (record: any) => (
        <Space size="middle">
          <AccessGuard permissions={[Permissions.UpdatePayPeriod, Permissions.DeletePayPeriod]}>
            <Switch
            checked={record.status === 'OPEN'}
            onChange={(checked) => onStatusChange(record, checked)}
            checkedChildren="Open"
            unCheckedChildren="Close"
            />
            <Button
              type="primary"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDeletePayPeriod(record.id)}
            />
          </AccessGuard>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center">
        <Title level={3}>Pay Period</Title>
        <AccessGuard permissions={[Permissions.CreatePayPeriod]}>
          <Button
            type="default"
            icon={<PlusOutlined />}
            style={{ marginBottom: '20px' }}
            onClick={handleAddPayPeriod}
          >
            Pay Period
          </Button>
        </AccessGuard>
      </div>
      <Spin spinning={isLoading}>
      <Table
      dataSource={dataSource}
      columns={columns}
      pagination={{
        current: currentPage,
        pageSize,
        total: dataSource.length,
        showSizeChanger: true,
      }}
      onChange={handleTableChange}
      />
      </Spin>
      <PayPeriodSideBar />
    </div>
  );
};

export default PayPeriod;