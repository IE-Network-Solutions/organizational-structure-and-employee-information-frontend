'use client';

import React from 'react';
import { Card, Empty, Spin, Table, Tag } from 'antd';
import dayjs from 'dayjs';
import { useGetJobApplicants } from '@/store/server/features/recruitment/ai-job-matching/queries';

interface JobApplicantsListProps {
  jobId: string | null;
}

const JobApplicantsList: React.FC<JobApplicantsListProps> = ({ jobId }) => {
  const { data, isLoading } = useGetJobApplicants(jobId, Boolean(jobId));

  if (!jobId) {
    return (
      <Card className="rounded-2xl border border-gray-100 shadow-sm">
        <Empty description="Select a job to view applicants" />
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className="rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center justify-center h-48">
          <Spin size="large" />
        </div>
      </Card>
    );
  }

  const applicants = data?.items ?? [];

  if (applicants.length === 0) {
    return (
      <Card className="rounded-2xl border border-gray-100 shadow-sm">
        <Empty description="No applicants yet" />
      </Card>
    );
  }

  const columns = [
    {
      title: 'Name',
      dataIndex: 'fullName',
      key: 'fullName',
      render: (value: string) => (
        <span className="font-medium text-gray-900">{value || '—'}</span>
      ),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: 'Stage',
      dataIndex: 'stage',
      key: 'stage',
      render: (value: string) => (
        <Tag color="blue" className="text-xs">
          {value || '—'}
        </Tag>
      ),
    },
    {
      title: 'Applied On',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (value: string) =>
        value ? dayjs(value).format('DD MMM YYYY') : '—',
    },
  ];

  const tableData = applicants.map((candidate, index) => ({
    key: candidate.id || index,
    fullName: candidate.fullName || '—',
    email: candidate.email || '—',
    phone: candidate.phone || '—',
    stage: candidate.jobCandidate?.[0]?.applicantStatusStage?.title || '—',
    createdAt: candidate.createdAt,
  }));

  return (
    <Card
      className="rounded-2xl border border-gray-100 shadow-sm"
      title="All Applicants"
      extra={
        <span className="text-xs text-gray-500">{tableData.length} total</span>
      }
    >
      <Table
        columns={columns}
        dataSource={tableData}
        pagination={false}
        scroll={{ x: 600, y: 260 }}
        size="small"
      />
    </Card>
  );
};

export default JobApplicantsList;
