'use client';
import React from 'react';
import { Button, Popconfirm, Table } from 'antd';
import { TbFileDownload } from 'react-icons/tb';
import { useGetTalentPool } from '@/store/server/features/recruitment/tallentPool/query';
import dayjs from 'dayjs';
import { useMoveTalentPoolToCandidates } from '@/store/server/features/recruitment/tallentPool/mutation';
import SkeletonLoading from '@/components/common/loadings/skeletonLoading';

const TalentPoolTable: React.FC<any> = () => {
  const { data: candidates, isLoading } = useGetTalentPool();

  const { mutate: moveTalentPoolMutation } = useMoveTalentPoolToCandidates();

  const moveCandidate = (talentPoolId: string, jobInformationId: string) => {
    moveTalentPoolMutation({ talentPoolId, jobInformationId });
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
      title: 'Applied for',
      dataIndex: ['talentPoolCategory', 'title'],
      key: 'appliedFor',
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
        <Popconfirm
          title="Are you sure to move this candidate?"
          onConfirm={() =>
            moveCandidate(record?.id, record?.jobCandidateInformation?.id)
          }
          okText="Yes"
          cancelText="No"
        >
          <Button type="primary">Transfer</Button>
        </Popconfirm>
      ),
    },
  ];

  return (
    <>
      {isLoading ? (
        <>
          <SkeletonLoading
            alignment="vertical"
            componentType="table"
            count={1}
            type="default"
            // columns={columns}
          />
        </>
      ) : (
        <Table
          dataSource={candidates?.items}
          columns={columns}
          pagination={false}
        />
      )}
    </>
  );
};

export default TalentPoolTable;
