'use client';
import React, { useEffect, useState } from 'react';
import BlockWrapper from '@/components/common/blockWrapper/blockWrapper';
import PageHeader from '@/components/common/pageHeader/pageHeader';
import { Button, DatePicker, Modal, Space, Table } from 'antd';
import { DATE_FORMAT } from '@/utils/constants';
import { LuPlus, LuSettings2 } from 'react-icons/lu';
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
import { useIsMobile } from '@/hooks/useIsMobile';
import useEmployeeStore from '@/store/uistate/features/payroll/employeeInfoStore';
import { CustomMobilePagination } from '@/components/customPagination/mobilePagination';
import CustomPagination from '@/components/customPagination';

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
  const {
    isShowTnaReviewSidebar,
    setIsShowTnaReviewSidebar,
    setTnaId,
    loading,
  } = useTnaReviewStore();
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
  const { isFilterModalOpen, setIsFilterModalOpen } = useEmployeeStore();
  const { isMobile, isTablet } = useIsMobile();

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

  const onPageChange = (page: number, pageSize?: number) => {
    setPage(page);
    if (pageSize) {
      setLimit(pageSize);
    }
  };
  const onPageSizeChange = (pageSize: number) => {
    setLimit(pageSize);
    setPage(1);
  };
  return (
    <div className="page-wrap bg-gray-100">
      <TnaApprovalTable />
      <BlockWrapper>
        <PageHeader title="TNA">
          <Space size={16}>
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
            {isMobile && (
              <div className="flex justify-between items-center gap-4">
                <Button
                  className="p-6 mr-2 border border-gray-300"
                  onClick={() => setIsFilterModalOpen(true)}
                  icon={<LuSettings2 size={20} />}
                />
              </div>
            )}
            <AccessGuard permissions={[Permissions.CreateTna]}>
              <Button
                icon={<LuPlus size={20} />}
                className="h-[50px] w-[50px] sm:w-full"
                type="primary"
                size="large"
                onClick={() => setIsShowTnaReviewSidebar(true)}
              >
                {!isMobile && <span>New TNA</span>}
              </Button>
            </AccessGuard>
          </Space>
        </PageHeader>
        {!isMobile && (
          <Filters
            onSearch={handleSearch}
            disable={['name', 'payPeriod', 'department']}
          />
        )}
        {isFilterModalOpen && (
          <Modal
            title="Filters"
            open={isFilterModalOpen}
            onCancel={() => setIsFilterModalOpen(false)}
            footer={
              <div className="flex justify-center gap-4">
                <Button
                  key="cancel"
                  onClick={() => {
                    setSearchQuery('');
                    setIsFilterModalOpen(false);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  key="filter"
                  type="primary"
                  onClick={() => setIsFilterModalOpen(false)}
                  className="text-white bg-blue border-none"
                  loading={loading}
                >
                  Filter
                </Button>
              </div>
            }
            width={isMobile ? '90%' : '50%'}
          >
            <Filters
              onSearch={handleSearch}
              disable={['name', 'payPeriod', 'department']}
              oneRow={false}
            />
          </Modal>
        )}
        <div className="flex  overflow-x-auto scrollbar-none  w-full ">
          <Table
            className="mt-6 w-full"
            rowClassName={() => 'h-[60px]'}
            scroll={{ x: 'max-content' }}
            columns={tableColumns}
            dataSource={tableData}
            loading={isLoading || isLoadingDelete}
            pagination={false}
            onChange={(sorter: any) => {
              setOrderDirection(sorter['order']);
              setOrderBy(sorter['order'] ? sorter['columnKey'] : undefined);
            }}
          />
        </div>{' '}
        {isMobile || isTablet ? (
          <CustomMobilePagination
            totalResults={data?.meta?.totalItems || 0}
            pageSize={limit}
            onChange={onPageChange}
            onShowSizeChange={onPageChange}
          />
        ) : (
          <CustomPagination
            current={page}
            total={data?.meta?.totalItems || 0}
            pageSize={limit}
            onChange={onPageChange}
            onShowSizeChange={onPageSizeChange}
          />
        )}
      </BlockWrapper>

      <TnaRequestSidebar />
    </div>
  );
};

export default TnaReviewPage;
