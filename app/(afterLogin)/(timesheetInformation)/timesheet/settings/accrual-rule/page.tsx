'use client';
import React, { useEffect } from 'react';
import { useTimesheetSettingsStore } from '@/store/uistate/features/timesheet/settings';
import { useGetAccrualRules } from '@/store/server/features/timesheet/accrualRule/queries';
import { TableColumnsType } from '@/types/table/table';
import dayjs from 'dayjs';
import { DATE_FORMAT } from '@/utils/constants';
import { Button, Table } from 'antd';
import { LuPlus } from 'react-icons/lu';
import NewAccrualRuleSidebar from './_components/newAccrualRuleSidebar';
import usePagination from '@/utils/usePagination';
import { DefaultTablePagination } from '@/utils/defaultTablePagination';
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
    <div className="p-5 rounded-2xl bg-white w-full h-full">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg text-bold">Accrual Rule</h1>
        <AccessGuard permissions={[Permissions.CreateLeaveAccrual]}>
          <Button
            size="large"
            type="primary"
            id="accrutualRuleId"
            icon={<LuPlus size={18} />}
            onClick={() => setIsShowNewAccrualRuleSidebar(true)}
          >
            <span className="hidden md:inline"> New Accrual Rule</span>
          </Button>
        </AccessGuard>
      </div>
      <div className="overflow-x-auto scrollbar-none w-full">
        <Table
          columns={columns}
          className=""
          loading={isFetching}
          dataSource={tableData()}
          pagination={DefaultTablePagination(data?.meta?.totalItems)}
          onChange={(pagination, filters, sorter: any) => {
            setPage(pagination.current ?? 1);
            setLimit(pagination.pageSize ?? 10);
            setOrderDirection(sorter['order']);
            setOrderBy(sorter['order'] ? sorter['columnKey'] : undefined);
          }}
        />
      </div>

      <NewAccrualRuleSidebar />
    </div>
  );
};

export default Page;
