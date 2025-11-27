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
          data-cy={`payroll-payperiod-actions-view-container-${record.id}`}
          permissions={[
            Permissions.UpdatePayPeriod,
            Permissions.DeletePayPeriod,
          ]}
        >
          <Space
            id={`payroll-payperiod-actions-view-space-${record.id}`}
            data-cy={`payroll-payperiod-actions-view-space-${record.id}`}
            size="middle"
          >
            <Switch
              id={`payroll-payperiod-status-toggle-switch-${record.id}`}
              data-cy={`payroll-payperiod-status-toggle-switch-${record.id}`}
              checked={record.status === 'OPEN'}
              onChange={() => onStatusChange(record)}
              checkedChildren="Opened"
              unCheckedChildren="Closed"
            />
            <Tooltip
              data-cy={`payroll-payperiod-edit-click-button-tooltip-${record.id}`}
              title="Edit"
            >
              <Button
                id={`payroll-payperiod-edit-click-button-${record.id}`}
                data-cy={`payroll-payperiod-edit-click-button-${record.id}`}
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
    <div
      id="payroll-payperiod-page-view-container"
      data-cy="payroll-payperiod-page-view-container"
      className="p-5 rounded-2xl bg-white"
    >
      <div
        id="payroll-payperiod-header-view-container"
        data-cy="payroll-payperiod-header-view-container"
        className="flex justify-between items-center mb-4"
      >
        <h1
          id="payroll-payperiod-title-view-text"
          data-cy="payroll-payperiod-title-view-text"
          className="text-lg text-bold"
        >
          Pay Period
        </h1>
        <AccessGuard
          data-cy="payroll-payperiod-add-click-button-access-guard"
          permissions={[Permissions.CreatePayPeriod]}
        >
          <Button
            id="payroll-payperiod-add-click-button"
            data-cy="payroll-payperiod-add-click-button"
            type="primary"
            className="h-10 w-10 sm:w-auto"
            icon={<FaPlus />}
            style={{ marginBottom: '20px' }}
            onClick={handleAddPayPeriod}
          >
            <span
              id="payroll-payperiod-add-click-button-text"
              data-cy="payroll-payperiod-add-click-button-text"
              className="hidden lg:inline"
            >
              Pay Period
            </span>
          </Button>
        </AccessGuard>
      </div>
      <Spin data-cy="payroll-payperiod-table-spinner" spinning={isLoading}>
        <div
          id="payroll-payperiod-table-wrapper-view-container"
          data-cy="payroll-payperiod-table-wrapper-view-container"
          className="flex overflow-x-auto scrollbar-none w-full "
        >
          <div
            id="payroll-payperiod-table-inner-view-container"
            data-cy="payroll-payperiod-table-inner-view-container"
            className="w-full"
          >
            <Table
              id="payroll-payperiod-table-view-table"
              data-cy="payroll-payperiod-table-view-table"
              dataSource={paginatedData}
              columns={columns}
              pagination={false}
            />
            {isMobile || isTablet ? (
              <CustomMobilePagination
                data-cy="payroll-payperiod-mobile-pagination-view-component"
                totalResults={dataSource?.length || 0}
                pageSize={pageSize}
                onChange={onPageChange}
                onShowSizeChange={onPageSizeChange}
              />
            ) : (
              <CustomPagination
                data-cy="payroll-payperiod-desktop-pagination-view-component"
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
      <PayPeriodSideBar data-cy="payroll-payperiod-sidebar-view-component" />
      <CustomDrawer
        data-cy="payroll-payperiod-edit-drawer-view-component"
        visible={visible}
        onClose={() => {
          (setVisible(false), reset());
        }}
      />
    </div>
  );
};

export default PayPeriod;
