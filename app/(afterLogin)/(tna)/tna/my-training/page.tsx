'use client';
import React, { useEffect, useState } from 'react';
import BlockWrapper from '@/components/common/blockWrapper/blockWrapper';
import PageHeader from '@/components/common/pageHeader/pageHeader';
import { Button, DatePicker, Space, Table } from 'antd';
import { DATE_FORMAT } from '@/utils/constants';
import { LuPlus } from 'react-icons/lu';
import { TableColumnsType } from '@/types/table/table';
import dayjs from 'dayjs';
import StatusBadge from '@/components/common/statusBadge/statusBadge';
import { FiEdit2 } from 'react-icons/fi';
import ActionButton from '@/components/common/actionButton';
import { useTnaReviewStore } from '@/store/uistate/features/tna/review';
import TnaRequestSidebar from '@/app/(afterLogin)/(tna)/tna/review/_components/tnaRequestSidebar';
import { useRouter } from 'next/navigation';

import usePagination from '@/utils/usePagination';
import { DefaultTablePagination } from '@/utils/defaultTablePagination';
import { TnaRequestBody } from '@/store/server/features/tna/review/interface';
import {
  TrainingNeedAssessment,
  TrainingNeedAssessmentCertStatus,
  TrainingNeedAssessmentCertStatusBadgeTheme,
  TrainingNeedAssessmentStatus,
  TrainingNeedAssessmentStatusBadgeTheme,
} from '@/types/tna/tna';
import { useDeleteTna } from '@/store/server/features/tna/review/mutation';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import UserCard from '@/components/common/userCard/userCard';
import { useGetSimpleEmployee } from '@/store/server/features/employees/employeeDetail/queries';
import TnaApprovalTable from './_components/approvalTabel';
import { useGetTnaByUser } from '@/store/server/features/tna/review/queries';

const TnaReviewPage = () => {
  const EmpRender = ({ userId }: any) => {
    const {
      isLoading,
      data: employeeData,
      isError,
    } = useGetSimpleEmployee(userId);

    if (isLoading) return <div>...</div>;
    if (isError) return <>-</>;
    const fullName = `${employeeData?.firstName || '-'} ${employeeData?.middleName || '-'} ${employeeData?.lastName || '-'}`;

    return employeeData ? (
      <div className="flex items-center gap-1.5">
        <div className="flex-1">
          <UserCard
            data={employeeData}
            name={fullName}
            profileImage={employeeData?.profileImage}
            size="small"
          />
          <div className="text-[10px] leading-4 text-gray-600">
            {employeeData?.email}
          </div>
        </div>
      </div>
    ) : (
      '-'
    );
  };
  const router = useRouter();
  const [tableData, setTableData] = useState<any[]>([]);
  const { isShowTnaReviewSidebar, setIsShowTnaReviewSidebar, setTnaId } =
    useTnaReviewStore();
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
  const [filter, setFilter] = useState<Partial<TnaRequestBody['filter']>>({});
  const { data, isLoading, refetch } = useGetTnaByUser(
    { page, limit, orderBy, orderDirection },
    { filter },
  );
  const {
    mutate: deleteTna,
    isLoading: isLoadingDelete,
    isSuccess,
  } = useDeleteTna();

  useEffect(() => {
    if (isSuccess) {
      refetch();
    }
  }, [isSuccess]);

  useEffect(() => {
    if (!isShowTnaReviewSidebar) {
      refetch();
    }
  }, [isShowTnaReviewSidebar]);

  useEffect(() => {
    if (data?.items) {
      setTableData(
        data.items.map((item) => ({
          key: item.id,
          title: item.title,
          createdBy: item.assignedUserId,
          completedAt: item.completedAt,
          attachment: item.trainingProofs,
          status: item.status,
          certStatus: item.certStatus,
          commitmentPeriod: item.commitmentPeriod, // Added commitmentPeriod
          action: item,
        })),
      );
    }
  }, [data]);

  const tableColumns: TableColumnsType<any> = [
    {
      title: 'TNA',
      dataIndex: 'title',
      key: 'title',
      sorter: true,
      render: (text: string) => <div>{text}</div>,
    },
    {
      title: 'Requested by',
      dataIndex: 'createdBy',
      key: 'createdBy',
      sorter: true,
      render: (text: string) => <EmpRender userId={text} />,
    },
    {
      title: 'Completed Date',
      dataIndex: 'completedAt',
      key: 'completedAt',
      sorter: true,
      render: (date: string) => (
        <div>{date ? dayjs(date).format(DATE_FORMAT) : '-'}</div>
      ),
    },
    {
      title: 'Commitment Period', // New column added
      dataIndex: 'commitmentPeriod',
      key: 'commitmentPeriod',
      sorter: true,
      render: (text: string) => <div>{text ? text : '-'}</div>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      sorter: true,
      render: (text: TrainingNeedAssessmentStatus) => (
        <StatusBadge theme={TrainingNeedAssessmentStatusBadgeTheme[text]}>
          {text}
        </StatusBadge>
      ),
    },
    {
      title: 'Cert-Status',
      dataIndex: 'certStatus',
      key: 'certStatus',
      sorter: true,
      render: (text: TrainingNeedAssessmentCertStatus) => (
        <StatusBadge theme={TrainingNeedAssessmentCertStatusBadgeTheme[text]}>
          {text}
        </StatusBadge>
      ),
    },
    {
      title: '',
      dataIndex: 'action',
      key: 'action',
      render: (item: TrainingNeedAssessment) => (
        <Space>
          <Button
            id={`${item.id}tnaShowTnaReviewSidebarButtonId`}
            className="w-[30px] h-[30px]"
            icon={<FiEdit2 size={16} />}
            type="primary"
            disabled={
              item.certStatus === TrainingNeedAssessmentCertStatus.COMPLETED
            }
            onClick={() => {
              setTnaId(item.id);
              setIsShowTnaReviewSidebar(true);
            }}
          />

          <ActionButton
            onOpen={() => {
              router.push('/tna/review/' + item.id);
            }}
            onDelete={
              item.certStatus !== TrainingNeedAssessmentCertStatus.COMPLETED
                ? () => {
                    deleteTna([item.id]);
                  }
                : undefined
            }
            id={item.id ?? null}
          />
        </Space>
      ),
    },
  ];

  return (
    <div className="page-wrap">
      <TnaApprovalTable />
      <BlockWrapper>
        <PageHeader title="MY TNA">
          <Space size={20}>
            <DatePicker.RangePicker
              format={DATE_FORMAT}
              separator="-"
              className="h-[54px]"
              onChange={(val) => {
                if (val && val.length >= 2) {
                  setFilter({
                    completedAt: {
                      from: val[0]!.format(),
                      to: val[1]!.format(),
                    },
                  });
                } else {
                  setFilter({});
                }
              }}
            />
            <AccessGuard permissions={[Permissions.CreateTna]}>
              <Button
                icon={<LuPlus size={16} />}
                className="h-[54px]"
                type="primary"
                size="large"
                onClick={() => setIsShowTnaReviewSidebar(true)}
              >
                New TNA
              </Button>
            </AccessGuard>
          </Space>
        </PageHeader>

        <Table
          className="mt-6"
          columns={tableColumns}
          dataSource={tableData}
          loading={isLoading || isLoadingDelete}
          pagination={DefaultTablePagination(data?.meta?.totalItems)}
          onChange={(pagination, filters, sorter: any) => {
            setPage(pagination.current ?? 1);
            setLimit(pagination.pageSize ?? 10);
            setOrderDirection(sorter['order']);
            setOrderBy(sorter['order'] ? sorter['columnKey'] : undefined);
          }}
        />
      </BlockWrapper>

      <TnaRequestSidebar />
    </div>
  );
};

export default TnaReviewPage;
