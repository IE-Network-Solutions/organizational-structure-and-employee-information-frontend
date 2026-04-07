'use client';
import React, { useState } from 'react';
import { Button, Skeleton, Table } from 'antd';
import { useGetTalentPool } from '@/store/server/features/recruitment/tallentPool/query';
import dayjs from 'dayjs';
import { useMoveTalentPoolToCandidates } from '@/store/server/features/recruitment/tallentPool/mutation';
import SkeletonLoading from '@/components/common/loadings/skeletonLoading';
import TransferTalentPoolToCandidateModal from './transferModal';
import { useTalentPoolStore } from '@/store/uistate/features/recruitment/talentPool';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import { useIsMobile } from '@/hooks/useIsMobile';
import { CustomMobilePagination } from '@/components/customPagination/mobilePagination';
import CustomPagination from '@/components/customPagination';
import SaveAltIcon from '@mui/icons-material/SaveAlt';

/* eslint-disable @typescript-eslint/naming-convention */
const TalentPoolTable: React.FC<any> = () => {
  const { page, currentPage, setCurrentPage, setPage, searchParams } =
    useTalentPoolStore();
  const { data: candidates, isLoading: responseLoading } = useGetTalentPool(
    searchParams?.date_range ?? '',
    searchParams?.department ?? '',
    searchParams?.job ?? '',
    searchParams?.stages ?? '',
    searchParams?.talentPoolCategory ?? '',
    page,
    currentPage,
    searchParams?.search ?? '',
  );

  const { mutate: moveTalentPoolMutation } = useMoveTalentPoolToCandidates();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null);
  const { isMobile, isTablet } = useIsMobile();

  const showModal = (record: any) => {
    setSelectedCandidate(record);
    setIsModalVisible(true);
  };

  const handleOk = (value: any) => {
    if (selectedCandidate) {
      moveTalentPoolMutation({ value, taletnPoolId: selectedCandidate.id });
      setIsModalVisible(false);
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };
  const columns = [
    {
      title: (
        <span
          className="font-bold text-sm text-[#4b4b4b]"
          id="talent-acquisition-talent-pool-table-column-name"
          data-cy="talent-acquisition-talent-pool-table-column-name"
        >
          Name
        </span>
      ),
      dataIndex: ['jobCandidateInformation', 'fullName'],
      key: 'name',
      render: (_: any, record: any) => (
        <div
          id="talent-acquisition-talent-pool-table-cell-name"
          data-cy={`talent-acquisition-talent-pool-table-cell-name-${record?.jobCandidateInformation?.id || record?.id}`}
          className="flex flex-col gap-1"
        >
          <span
            className="text-sm font-normal text-black text-nowrap"
            data-cy={`talent-acquisition-talent-pool-table-cell-name-full-name-text-${record?.jobCandidateInformation?.id || record?.id}`}
          >
            {record?.jobCandidateInformation?.fullName ?? '-'}
          </span>

          <span
            className="text-xs font-normal text-black opacity-45"
            data-cy={`talent-acquisition-talent-pool-table-cell-name-email-text-${record?.jobCandidateInformation?.id || record?.id}`}
          >
            {record?.jobCandidateInformation?.email ?? '-'}
          </span>
        </div>
      ),
    },
    {
      title: (
        <span
          className="font-bold text-sm text-[#4b4b4b]"
          id="talent-acquisition-talent-pool-table-column-phone"
          data-cy="talent-acquisition-talent-pool-table-column-phone"
        >
          Phone Number
        </span>
      ),
      dataIndex: ['jobCandidateInformation', 'phone'],
      key: 'phoneNumber',
      className: 'text-sm text-[#4b4b4b]',
    },
    {
      title: (
        <span
          className="font-bold text-sm text-[#4b4b4b] text-nowrap"
          id="talent-acquisition-talent-pool-table-column-talent-pool-category"
          data-cy="talent-acquisition-talent-pool-table-column-talent-pool-category"
        >
          Talent Pool Category
        </span>
      ),
      dataIndex: ['talentPoolCategory', 'title'],
      key: 'title',
      className: 'text-sm text-[#4b4b4b]',
      width: 250,
    },
    {
      title: (
        <span
          className="font-bold text-sm text-[#4b4b4b]"
          id="talent-acquisition-talent-pool-table-column-reason"
          data-cy="talent-acquisition-talent-pool-table-column-reason"
        >
          Reason
        </span>
      ),
      dataIndex: 'reason',
      key: 'reason',
      className: 'text-sm text-[#4b4b4b]',
      width: 150,
    },
    {
      title: (
        <span
          className="font-bold text-sm text-[#4b4b4b]"
          id="talent-acquisition-talent-pool-table-column-cv"
          data-cy="talent-acquisition-talent-pool-table-column-cv"
        >
          CV
        </span>
      ),
      dataIndex: ['jobCandidateInformation', 'resumeUrl'],
      key: 'cv',
      render: (text: string) => {
        // const displayText = text ? text : '-';
        // const maxLength = 20;

        // const truncatedText =
        //   displayText.length > maxLength
        //     ? `${displayText.substring(0, maxLength)}...`
        //     : displayText;

        return (
          <a
            id={`talent-acquisition-talent-pool-table-link-cv-${text || 'default'}`}
            data-cy={`talent-acquisition-talent-pool-table-link-cv-${text || 'default'}`}
            className="flex justify-start gap-7 items-center"
            href={text ? text : '#'}
            target="_blank"
            rel="noopener noreferrer"
          >
            {/* <div className="text-wrap">{truncatedText}</div> */}
            <SaveAltIcon fontSize="small" className="text-[#1e40af]" />
          </a>
        );
      },
    },
    {
      title: (
        <span
          className="font-bold text-sm text-[#4b4b4b] text-nowrap"
          id="talent-acquisition-talent-pool-table-column-moved-in-date"
          data-cy="talent-acquisition-talent-pool-table-column-moved-in-date"
        >
          Moved in Date
        </span>
      ),
      dataIndex: 'createdAt',
      key: 'movedInDate',
      render: (text: string) => (
        <div
          id="talent-acquisition-talent-pool-table-cell-date"
          data-cy={`talent-acquisition-talent-pool-table-cell-date-${text}`}
          className="text-sm text-[#4b4b4b]"
        >
          {dayjs(text).format('DD/MMM/YYYY')}
        </div>
      ),
      width: 170,
    },
    {
      title: (
        <span
          className="font-bold text-sm text-[#4b4b4b]"
          id="talent-acquisition-talent-pool-table-column-action"
          data-cy="talent-acquisition-talent-pool-table-column-action"
        >
          Action
        </span>
      ),
      key: 'actions',
      render: (_: any, record: any) => (
        <AccessGuard permissions={[Permissions.TransferCandidate]}>
          <Button
            type="text"
            id={`talent-acquisition-talent-pool-table-button-reonboard-${record?.jobCandidateInformation?.id || record?.id}`}
            data-cy={`talent-acquisition-talent-pool-table-button-reonboard-${record?.jobCandidateInformation?.id || record?.id}`}
            onClick={() => showModal(record)}
          >
            <div
              data-cy="talent-resource-talent-pool-components-talentpooltable-tsx-talentpooltable-div-153"
              className="text-[#1e40af] text-xs font-normal"
            >
              Add to Candidates
            </div>
          </Button>
        </AccessGuard>
      ),
    },
  ];

  const filteredItems = candidates?.items || [];
  const skeletonRowCount = 6;
  const tableDataSource = responseLoading
    ? Array.from({ length: skeletonRowCount }).map((_, index) => ({
        key: `skeleton-${index}`,
      }))
    : filteredItems;

  const tableColumns = responseLoading
    ? columns.map((column: any) => ({
        ...column,
        sorter: false,
        render: () => <Skeleton.Input active className="!h-5 !w-full" />,
      }))
    : columns;

  const onPageChange = (page: number, pageSize?: number) => {
    setCurrentPage(page);
    if (pageSize) {
      setPage(pageSize);
    }
  };
  const onSizeChange = (size: number) => {
    setPage(size);
    setCurrentPage(1);
  };

  return (
    <>
      
        <Table
          data-cy="talent-acquisition-talent-pool-table"
          dataSource={tableDataSource}
          columns={tableColumns}
          pagination={false}
          scroll={{ x: 1000 }}
          rowKey={(record: any) => record?.id ?? record?.key}
          rowHoverable={false}
          rowClassName={(notUsed, index) => {
            const base = index % 2 === 0 ? 'bg-white' : 'bg-[#FAFAFA]';
            return base;
          }}
        />

      {isMobile || isTablet ? (
        <div
          id="talent-acquisition-talent-pool-pagination-mobile"
          data-cy="talent-acquisition-talent-pool-pagination-mobile"
        >
          <CustomMobilePagination
            totalResults={candidates?.meta?.totalItems ?? 1}
            pageSize={page}
            onChange={onPageChange}
            onShowSizeChange={onPageChange}
          />
        </div>
      ) : (
        <div
          id="talent-acquisition-talent-pool-pagination-desktop"
          data-cy="talent-acquisition-talent-pool-pagination-desktop"
        >
          <CustomPagination
            current={currentPage}
            total={candidates?.meta?.totalItems ?? 1}
            pageSize={page}
            onChange={onPageChange}
            onShowSizeChange={onSizeChange}
          />
        </div>
      )}
      <TransferTalentPoolToCandidateModal
        visible={isModalVisible}
        onConfirm={handleOk}
        selectedCandidate={selectedCandidate}
        onCancel={handleCancel}
      />
    </>
  );
};

export default TalentPoolTable;

/* eslint-disable @typescript-eslint/naming-convention */
