'use client';
import React from 'react';
import { Table, Button, Space, Typography, Switch, Spin, Tooltip } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import PayPeriodSideBar from './_components/payPeriodSideBar';
import usePayPeriodStore from '@/store/uistate/features/payroll/settings/payPeriod';
import { useFetchActiveFiscalYearPayPeriods } from '@/store/server/features/payroll/setting/tax-rule/queries';
import { useGetActiveFiscalYears } from '@/store/server/features/organizationStructure/fiscalYear/queries';
import { useChangePayPeriodStatus } from '@/store/server/features/payroll/setting/tax-rule/mutation';
import dayjs from 'dayjs';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import CustomDrawer from './_components/customDrawer';
import useEditDrawerStore from '@/store/uistate/features/payroll/settings/drawer';
import { FaPlus } from 'react-icons/fa';
const { Title } = Typography;
interface DataSource {
  key: string;
  id: string;
  startDate: string;
  endDate: string;
  range: string;
  month: string;
  status: string;
}
const PayPeriod = () => {
  const {
    setIsPayPeriodSidebarVisible,
    currentPage,
    pageSize,
    setCurrentPage,
    setPageSize,
  } = usePayPeriodStore();
  const { setId, setStartDate, setEndDate, setVisible, visible, reset } =
    useEditDrawerStore();

  const { data: activeFiscalYear } = useGetActiveFiscalYears();
  const { mutate: changePayPeriodStatus } = useChangePayPeriodStatus();
  const { data: payPeriods, isLoading } = useFetchActiveFiscalYearPayPeriods(
    activeFiscalYear?.id,
  );

  const handleAddPayPeriod = () => {
    setIsPayPeriodSidebarVisible(true);
  };
  // const handleDeletePayPeriod = (payPeriodId: string) => {
  //   deletePayPeriod(payPeriodId);
  // };

  const handleEdit = (record: any) => {
    setId(record.id);
    setStartDate(record.startDate);
    setEndDate(record.endDate);
    setVisible(true);
  };

  const handleTableChange = (pagination: any) => {
    setCurrentPage(pagination.current);
    setPageSize(pagination.pageSize);
  };

  const onStatusChange = (record: any) => {
    changePayPeriodStatus({
      payPeriodId: record.id,
    });
  };

  const dataSource: DataSource[] = Array.isArray(payPeriods)
    ? payPeriods.reverse().map((payPeriod: DataSource) => ({
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
        <AccessGuard
          permissions={[
            Permissions.UpdatePayPeriod,
            Permissions.DeletePayPeriod,
          ]}
        >
          <Space size="middle">
            <Switch
              checked={record.status === 'OPEN'}
              onChange={() => onStatusChange(record)}
              checkedChildren="Opened"
              unCheckedChildren="Closed"
            />
            <Tooltip title="Edit">
              <Button
                type="primary"
                shape="default"
                icon={<EditOutlined />}
                onClick={() => handleEdit(record)}
              />
            </Tooltip>
          </Space>
        </AccessGuard>
      ),
    },
  ];

  return (
    <div className="p-10 rounded-2xl bg-white">
      <div className="flex justify-between items-center">
        <Title level={3}>Pay Period</Title>
        <AccessGuard permissions={[Permissions.CreatePayPeriod]}>
          <Button
            type="primary"
            icon={<FaPlus />}
            style={{ marginBottom: '20px' }}
            onClick={handleAddPayPeriod}
          >
            <span
              className="
            hidden lg:inline"
            >
              Pay Period
            </span>
          </Button>
        </AccessGuard>
      </div>
      <Spin spinning={isLoading}>
        <div className="flex overflow-x-auto scrollbar-none w-full ">
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
        </div>
      </Spin>
      <PayPeriodSideBar />
      <CustomDrawer
        visible={visible}
        onClose={() => {
          setVisible(false), reset();
        }}
      />
    </div>
  );
};

export default PayPeriod;
