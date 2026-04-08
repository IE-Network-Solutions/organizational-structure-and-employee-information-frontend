'use client';

import React from 'react';
import { Card, Table, Tag } from 'antd';
import { TableSkeleton } from '@/components/tableSkeleton';
import dayjs from 'dayjs';
import { useGetJobApplicants } from '@/store/server/features/recruitment/ai-job-matching/queries';
import EmptyState from '@/components/empty';

const applicantColumns = [
  {
    title: (
      <span id="ai-applicant-column-name" data-cy="ai-applicant-column-name">
        Name
      </span>
    ),
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
    title: (
      <span id="ai-applicant-column-email" data-cy="ai-applicant-column-email">
        Email
      </span>
    ),
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
    title: (
      <span id="ai-applicant-column-phone" data-cy="ai-applicant-column-phone">
        Phone
      </span>
    ),
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
    title: (
      <span id="ai-applicant-column-stage" data-cy="ai-applicant-column-stage">
        Stage
      </span>
    ),
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
    title: (
      <span
        id="ai-applicant-column-applied-on"
        data-cy="ai-applicant-column-applied-on"
      >
        Applied On
      </span>
    ),
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
        <div
          id="ai-job-applicants-empty-no-job"
          data-cy="ai-job-applicants-empty-no-job"
        >
          <EmptyState />
        </div>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card
        id="ai-job-applicants-card-loading"
        className="rounded-2xl border border-gray-100 shadow-sm"
        data-cy="ai-job-applicants-card"
        title={
          <span id="ai-job-applicants-title" data-cy="ai-job-applicants-title">
            All Applicants
          </span>
        }
        extra={
          <span
            id="ai-job-applicants-total-count"
            data-cy="ai-job-applicants-total-count"
            className="text-xs text-gray-500"
          >
            …
          </span>
        }
      >
        <div id="ai-job-applicants-loading" data-cy="ai-job-applicants-loading">
          <TableSkeleton columns={applicantColumns} />
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
        data-cy="ai-job-applicants-card-empty"
      >
        <div
          id="ai-job-applicants-empty-state"
          data-cy="ai-job-applicants-empty-state"
        >
          <EmptyState />
        </div>
      </Card>
    );
  }

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
      title={
        <span id="ai-job-applicants-title" data-cy="ai-job-applicants-title">
          All Applicants
        </span>
      }
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
        columns={applicantColumns}
        dataSource={tableData}
        pagination={false}
        scroll={{ x: 600, y: 260 }}
        size="small"
      />
    </Card>
  );
};

export default JobApplicantsList;
