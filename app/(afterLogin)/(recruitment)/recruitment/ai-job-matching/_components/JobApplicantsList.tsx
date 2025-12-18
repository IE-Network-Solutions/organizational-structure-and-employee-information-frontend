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
      <Card
        id="ai-job-applicants-card"
        className="rounded-2xl border border-gray-100 shadow-sm"
        data-cy="ai-job-applicants-card"
      >
        <Empty description="Select a job to view applicants" />
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card
        id="ai-job-applicants-card-loading"
        className="rounded-2xl border border-gray-100 shadow-sm"
        data-cy="ai-job-applicants-card"
      >
        <div
          id="ai-job-applicants-loading"
          data-cy="ai-job-applicants-loading"
          className="flex items-center justify-center h-48"
        >
          <Spin size="large" />
        </div>
      </Card>
    );
  }

  const applicants = data?.items ?? [];

  if (applicants.length === 0) {
    return (
      <Card
        id="ai-job-applicants-card-empty"
        className="rounded-2xl border border-gray-100 shadow-sm"
        data-cy="ai-job-applicants-card"
      >
        <Empty description="No applicants yet" />
      </Card>
    );
  }

  const columns = [
    {
      title: 'Name',
      dataIndex: 'fullName',
      key: 'fullName',
      render: (value: string, record: any, index: number) => (
        <span
          id={`ai-applicant-name-${index}`}
          data-cy={`ai-applicant-name-${index}`}
          className="font-medium text-gray-900"
        >
          {value || '—'}
        </span>
      ),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      render: (value: string, record: any, index: number) => (
        <span
          id={`ai-applicant-email-${index}`}
          data-cy={`ai-applicant-email-${index}`}
        >
          {value || '—'}
        </span>
      ),
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone',
      render: (value: string, record: any, index: number) => (
        <span
          id={`ai-applicant-phone-${index}`}
          data-cy={`ai-applicant-phone-${index}`}
        >
          {value || '—'}
        </span>
      ),
    },
    {
      title: 'Stage',
      dataIndex: 'stage',
      key: 'stage',
      render: (value: string, record: any, index: number) => (
        <Tag
          id={`ai-applicant-stage-${index}`}
          data-cy={`ai-applicant-stage-${index}`}
          color="blue"
          className="text-xs"
        >
          {value || '—'}
        </Tag>
      ),
    },
    {
      title: 'Applied On',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (value: string, record: any, index: number) => (
        <span
          id={`ai-applicant-applied-date-${index}`}
          data-cy={`ai-applicant-applied-date-${index}`}
        >
          {value ? dayjs(value).format('DD MMM YYYY') : '—'}
        </span>
      ),
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
      id="ai-job-applicants-card"
      className="rounded-2xl border border-gray-100 shadow-sm"
      data-cy="ai-job-applicants-card"
      title="All Applicants"
      extra={
        <span
          id="ai-job-applicants-total-count"
          data-cy="ai-job-applicants-total-count"
          className="text-xs text-gray-500"
        >
          {tableData.length} total
        </span>
      }
    >
      <Table
        id="ai-job-applicants-table"
        data-cy="ai-job-applicants-table"
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
