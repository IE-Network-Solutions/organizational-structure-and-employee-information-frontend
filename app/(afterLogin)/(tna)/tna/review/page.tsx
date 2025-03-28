'use client';
import React, { useEffect, useState } from 'react';
import BlockWrapper from '@/components/common/blockWrapper/blockWrapper';
import PageHeader from '@/components/common/pageHeader/pageHeader';
import { Button, DatePicker, Space, Table } from 'antd';
import { DATE_FORMAT } from '@/utils/constants';
import { LuPlus } from 'react-icons/lu';
import { TableColumnsType } from '@/types/table/table';
import dayjs from 'dayjs';
import { formatLinkToUploadFile } from '@/helpers/formatTo';
import StatusBadge from '@/components/common/statusBadge/statusBadge';
import { FiEdit2 } from 'react-icons/fi';
import ActionButton from '@/components/common/actionButton';
import { useTnaReviewStore } from '@/store/uistate/features/tna/review';
import TnaRequestSidebar from '@/app/(afterLogin)/(tna)/tna/review/_components/tnaRequestSidebar';
import { useRouter } from 'next/navigation';
import { useGetTna } from '@/store/server/features/tna/review/queries';
import usePagination from '@/utils/usePagination';
import { DefaultTablePagination } from '@/utils/defaultTablePagination';
import { TnaRequestBody } from '@/store/server/features/tna/review/interface';
import {
  TrainingNeedAssessment,
  TrainingNeedAssessmentCertStatus,
  TrainingNeedAssessmentCertStatusBadgeTheme,
  TrainingNeedAssessmentStatus,
  TrainingNeedAssessmentStatusBadgeTheme,
  TrainingProof,
} from '@/types/tna/tna';
import FileButton from '@/components/common/fileButton';
import { useDeleteTna } from '@/store/server/features/tna/review/mutation';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import UserCard from '@/components/common/userCard/userCard';
import { useGetSimpleEmployee } from '@/store/server/features/employees/employeeDetail/queries';
import TnaApprovalTable from './_components/approvalTabel';
import Filters from '@/app/(afterLogin)/(payroll)/payroll/_components/filters';

const TnaReviewPage = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (searchValues: any) => {
    const queryParams = new URLSearchParams();

    if (searchValues?.sessionId) {
      queryParams.append('sessionId', searchValues.sessionId);
    }
    if (searchValues?.yearId) {
      queryParams.append('yearId', searchValues.yearId);
    }
    if (searchValues?.currencyId) {
      queryParams.append('currencyId', searchValues.currencyId);
    }
    if (searchValues?.departmentId) {
      queryParams.append('departmentId', searchValues.departmentId);
    }
    if (searchValues?.monthId) {
      queryParams.append('monthId', searchValues.monthId);
    }

    const searchParams = queryParams.toString()
      ? `?${queryParams.toString()}`
      : '';
    setSearchQuery(searchParams);
    refetch();
  };

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
  const { data, isLoading, refetch } = useGetTna(
    { page, limit, orderBy, orderDirection },
    { filter },
    searchQuery,
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
          trainingPrice: item.trainingPrice,
          completedAt: item.completedAt,
          attachment: item.trainingProofs,
          status: item.status,
          certStatus: item.certStatus,
          action: item,
        })),
      );
    }
  }, [data]);
  <Filters onSearch={handleSearch} disable={['name', 'payPeriod']} />;

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
      title: 'price',
      dataIndex: 'trainingPrice',
      key: 'trainingPrice',
      sorter: true,
      render: (text: string) => <div>{text}</div>,
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
      title: 'Attachment',
      dataIndex: 'attachment',
      key: 'attachment',
      sorter: (a, b) => {
        const nameA = a.attachment?.[0]?.attachmentFile
          ? formatLinkToUploadFile(a.attachment[0].attachmentFile).name
          : '';
        const nameB = b.attachment?.[0]?.attachmentFile
          ? formatLinkToUploadFile(b.attachment[0].attachmentFile).name
          : '';
        return nameA.localeCompare(nameB);
      },
      render: (trainingProofs: TrainingProof[]) => {
        return (
          <div>
            {trainingProofs?.map((proof) =>
              proof.attachmentFile ? (
                <FileButton
                  key={proof.id}
                  fileName={formatLinkToUploadFile(proof.attachmentFile).name}
                  link={proof.attachmentFile}
                  className="flex-row-reverse border-0 py-0 px-0 gap-3 justify-between"
                />
              ) : (
                '-'
              ),
            )}
          </div>
        );
      },
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
          <AccessGuard permissions={[Permissions.UpdateTna]}>
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
          </AccessGuard>
          <AccessGuard
            permissions={[Permissions.UpdateTna, Permissions.DeleteTna]}
          >
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
          </AccessGuard>
        </Space>
      ),
    },
  ];

  return (
    <div className="page-wrap">
      <TnaApprovalTable />
      <BlockWrapper>
        <PageHeader title="TNA">
          <Space size={20}>
            <DatePicker.RangePicker
              format={DATE_FORMAT}
              separator="-"
              className="h-[54px]"
              onChange={(val) => {
                setFilter(
                  val && val.length >= 2
                    ? {
                        completedAt: {
                          from: val[0]!.format(),
                          to: val[1]!.format(),
                        },
                      }
                    : {},
                );
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
        <Filters
          onSearch={handleSearch}
          disable={['name', 'payPeriod', 'department']}
        />

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
