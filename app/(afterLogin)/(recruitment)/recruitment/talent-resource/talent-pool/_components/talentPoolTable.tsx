'use client';
import React, { useState } from 'react';
import { Button, Table } from 'antd';
import { TbFileDownload } from 'react-icons/tb';
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
      title: 'Name',
      dataIndex: ['jobCandidateInformation', 'fullName'],
      key: 'name',
      render: (_: any, record: any) => (
        <div
          id="talent-acquisition-talent-pool-table-cell-name"
          data-cy={`talent-acquisition-talent-pool-table-cell-name-${record?.jobCandidateInformation?.id || record?.id}`}
        >
          <p className="font-bold">
            {record?.jobCandidateInformation?.fullName ?? '-'}
          </p>
          <p className="text-gray-500 text-sm">
            {record?.jobCandidateInformation?.email ?? '-'}
          </p>
        </div>
      ),
    },
    {
      title: 'Phone Number',
      dataIndex: ['jobCandidateInformation', 'phone'],
      key: 'phoneNumber',
    },
    {
      title: 'Talent Pool Category',
      dataIndex: ['talentPoolCategory', 'title'],
      key: 'title',
    },
    {
      title: 'Reason',
      dataIndex: 'reason',
      key: 'reason',
    },
    {
      title: 'CV',
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
            <TbFileDownload size={20} />
          </a>
        );
      },
    },
    {
      title: 'Moved in Date',
      dataIndex: 'createdAt',
      key: 'movedInDate',
      render: (text: string) => (
        <div
          id="talent-acquisition-talent-pool-table-cell-date"
          data-cy={`talent-acquisition-talent-pool-table-cell-date-${text}`}
          className=""
        >
          {dayjs(text).format('DD/MMM/YYYY')}
        </div>
      ),
    },
    {
      title: 'Action',
      key: 'actions',
      render: (_: any, record: any) => (
        <AccessGuard permissions={[Permissions.TransferCandidate]}>
          <Button
            id={`talent-acquisition-talent-pool-table-button-reonboard-${record?.jobCandidateInformation?.id || record?.id}`}
            data-cy={`talent-acquisition-talent-pool-table-button-reonboard-${record?.jobCandidateInformation?.id || record?.id}`}
            className="bg-[#ADD5F0] border-none"
            onClick={() => showModal(record)}
          >
            <div className="text-[#1D9BF0]">Re-onboard</div>
          </Button>
        </AccessGuard>
      ),
    },
  ];

  const filteredItems = candidates?.items || [];

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
      {responseLoading ? (
        <div
          id="talent-acquisition-talent-pool-table-loading"
          data-cy="talent-acquisition-talent-pool-table-loading"
        >
          <SkeletonLoading
            alignment="vertical"
            componentType="table"
            count={1}
            type="default"
            columns={columns}
          />
        </div>
      ) : (
        <Table
          data-cy="talent-acquisition-talent-pool-table"
          dataSource={filteredItems}
          columns={columns}
          pagination={false}
          loading={responseLoading}
          scroll={{ x: 1000 }}
          rowKey="id"
        />
      )}

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
