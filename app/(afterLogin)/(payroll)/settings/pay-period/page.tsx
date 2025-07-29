'use client';
import React from 'react';
import { Table, Button, Space, Switch, Spin, Tooltip } from 'antd';
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
import { CustomMobilePagination } from '@/components/customPagination/mobilePagination';
import CustomPagination from '@/components/customPagination';
import { useIsMobile } from '@/hooks/useIsMobile';
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
  const { isMobile, isTablet } = useIsMobile();

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
  const onPageChange = (page: number, pageSize?: number) => {
    setCurrentPage(page);
    if (pageSize) {
      setPageSize(pageSize);
    }
  };
  const onPageSizeChange = (pageSize: number) => {
    setPageSize(pageSize);
    setCurrentPage(1);
  };

  const paginatedData = dataSource.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  return (
    <div className="p-5 rounded-2xl bg-white">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-lg text-bold">Pay Period</h1>
        <AccessGuard permissions={[Permissions.CreatePayPeriod]}>
          <Button
            type="primary"
            className="h-10 w-10 sm:w-auto"
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
          <div className="w-full">
            <Table
              dataSource={paginatedData}
              columns={columns}
              pagination={false}
            />
            {isMobile || isTablet ? (
              <CustomMobilePagination
                totalResults={dataSource?.length || 0}
                pageSize={pageSize}
                onChange={onPageChange}
                onShowSizeChange={onPageSizeChange}
              />
            ) : (
              <CustomPagination
                current={currentPage}
                total={dataSource?.length || 0}
                pageSize={pageSize}
                onChange={onPageChange}
                onShowSizeChange={onPageSizeChange}
              />
            )}
          </div>
        </div>
      </Spin>
      <PayPeriodSideBar />
      <CustomDrawer
        visible={visible}
        onClose={() => {
          (setVisible(false), reset());
        }}
      />
    </div>
  );
};

export default PayPeriod;
