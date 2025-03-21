'use client';
import React, { useEffect } from 'react';
import { useTimesheetSettingsStore } from '@/store/uistate/features/timesheet/settings';
import { useGetAccrualRules } from '@/store/server/features/timesheet/accrualRule/queries';
import { TableColumnsType } from '@/types/table/table';
import dayjs from 'dayjs';
import { DATE_FORMAT } from '@/utils/constants';
import PageHeader from '@/components/common/pageHeader/pageHeader';
import { Button, Table } from 'antd';
import { LuPlus } from 'react-icons/lu';
import NewAccrualRuleSidebar from './_components/newAccrualRuleSidebar';
import usePagination from '@/utils/usePagination';
import { defaultTablePagination } from '@/utils/defaultTablePagination';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';

const Page = () => {
  const {
    page,
    limit,
    orderBy,
    orderDirection,
    setPage,
    setLimit,
    setOrderBy,
    setOrderDirection,
  } = usePagination();
  const { setIsShowNewAccrualRuleSidebar, isShowNewAccrualRuleSidebar } =
    useTimesheetSettingsStore();
  const { data, isFetching, refetch } = useGetAccrualRules({
    page,
    limit,
    orderBy,
    orderDirection,
  });
  const columns: TableColumnsType<any> = [
    {
      title: 'Accrual Rule',
      dataIndex: 'title',
      key: 'title',
      sorter: true,
      render: (text: string) => <div>{text}</div>,
    },
    {
      title: 'Accrual Period',
      dataIndex: 'period',
      key: 'period',
      render: (text: string) => <div>{text}</div>,
    },
    {
      title: 'Submitted Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (text: string) => <div>{dayjs(text).format(DATE_FORMAT)}</div>,
    },
  ];

  const tableData = () => {
    return data
      ? data.items.map((item) => ({
          key: item.id,
          title: item.title,
          period: item.period,
          createdAt: item.createdAt,
        }))
      : [];
  };

  useEffect(() => {
    if (!isShowNewAccrualRuleSidebar) {
      refetch();
    }
  }, [isShowNewAccrualRuleSidebar]);

  return (
    <>
      <PageHeader title="Accrual Rule" size="small">
        <AccessGuard permissions={[Permissions.CreateLeaveAccrual]}>
          <Button
            size="large"
            type="primary"
            id="accrutualRuleId"
            icon={<LuPlus size={18} />}
            onClick={() => setIsShowNewAccrualRuleSidebar(true)}
          >
            New Rule
          </Button>
        </AccessGuard>
      </PageHeader>

      <Table
        columns={columns}
        className="mt-6"
        loading={isFetching}
        dataSource={tableData()}
        pagination={defaultTablePagination(data?.meta?.totalItems)}
        onChange={(pagination, filters, sorter: any) => {
          setPage(pagination.current ?? 1);
          setLimit(pagination.pageSize ?? 10);
          setOrderDirection(sorter['order']);
          setOrderBy(sorter['order'] ? sorter['columnKey'] : undefined);
        }}
      />

      <NewAccrualRuleSidebar />
    </>
  );
};

export default Page;
