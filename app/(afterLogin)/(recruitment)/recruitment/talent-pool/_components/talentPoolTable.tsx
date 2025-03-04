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

/* eslint-disable @typescript-eslint/naming-convention */
const TalentPoolTable: React.FC<any> = () => {
  const { page, currentPage, setCurrentPage, setPage, searchParams } =
    useTalentPoolStore();
  const { data: candidates, isLoading: responseLoading } = useGetTalentPool(
    searchParams?.date_range ?? '',
    searchParams?.department ?? '',
    searchParams?.job ?? '',
    searchParams?.stages ?? '',
    page,
    currentPage,
  );

  const { mutate: moveTalentPoolMutation } = useMoveTalentPoolToCandidates();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null);

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
        <div>
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
        const displayText = text ? text : '-';
        const maxLength = 20;

        const truncatedText =
          displayText.length > maxLength
            ? `${displayText.substring(0, maxLength)}...`
            : displayText;

        return (
          <a
            className="flex justify-start gap-7 items-center"
            href={text ? text : '#'}
            download
          >
            <div className="text-wrap">{truncatedText}</div>
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
        <div className="">{dayjs(text).format('DD/MMM/YYYY')}</div>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: any) => (
        <Button type="primary" onClick={() => showModal(record)}>
          Transfer
        </Button>
      ),
    },
  ];

  const onPageChange = (page: number, pageSize?: number) => {
    setCurrentPage(page);
    if (pageSize) {
      setPage(pageSize);
    }
  };

  return (
    <>
      {responseLoading ? (
        <>
          <SkeletonLoading
            alignment="vertical"
            componentType="table"
            count={1}
            type="default"
            columns={columns}
          />
        </>
      ) : (
        <Table
          dataSource={candidates?.items}
          columns={columns}
          pagination={{
            total: candidates?.meta?.totalItems,
            current: currentPage,
            pageSize: page,
            onChange: onPageChange,
            showSizeChanger: true,
            onShowSizeChange: onPageChange,
          }}
          loading={responseLoading}
          scroll={{ x: 1000 }}
        />
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
