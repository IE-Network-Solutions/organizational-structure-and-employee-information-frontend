'use client';
import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Skeleton, Table } from 'antd';
import dayjs from 'dayjs';
import CustomBreadcrumb from '@/components/common/breadCramp';
import StatusBadge from '@/components/common/statusBadge/statusBadge';
import EmptyState from '@/components/empty';
import { TableColumnsType } from '@/types/table/table';
import { DATE_FORMAT } from '@/utils/constants';
import { useGetEmployeeTnaSummary } from '@/store/server/features/tna/externalTraining/queries';
import {
  ExternalTrainingRequest,
  ExternalTrainingStatus,
  ExternalTrainingStatusBadgeTheme,
  ExternalTrainingStatusLabel,
  TrainingCommitment,
  TrainingCommitmentStatusBadgeTheme,
  TrainingCommitmentStatusLabel,
} from '@/types/tna/externalTna';
import CommitmentProgressBar from '@/app/(afterLogin)/(tna)/tna/_components/commitmentProgressBar';
import ApprovalTimeline from '@/app/(afterLogin)/(tna)/tna/_components/approvalTimeline';
import EmployeeName from '@/app/(afterLogin)/(tna)/tna/_components/employeeName';

const StatCard = ({
  label,
  value,
  dataCy,
}: {
  label: string;
  value: React.ReactNode;
  dataCy: string;
}) => (
  <div
    className="box-border flex flex-col gap-1 rounded-[8px] border border-[#D9D9D9] bg-white p-4"
    data-cy={dataCy}
  >
    <span
      data-cy="tna-employee-history-stat-label"
      className="text-[11px] uppercase leading-4 tracking-wide text-black/45"
    >
      {label}
    </span>
    <span
      data-cy="tna-employee-history-stat-value"
      className="text-xl font-bold leading-7 text-black"
    >
      {value}
    </span>
  </div>
);

/** One employee's complete TNA record: history, commitments and audit trail. */
const EmployeeTnaHistoryPage = () => {
  const params = useParams();
  const router = useRouter();
  const userId = String(params?.userId ?? '');

  const { data: summary, isLoading } = useGetEmployeeTnaSummary(userId);

  const requestColumns: TableColumnsType<ExternalTrainingRequest> = [
    {
      title: 'Course',
      dataIndex: 'courseName',
      key: 'courseName',
      render: (value: string, record: ExternalTrainingRequest) => (
        <div
          data-cy="tna-employee-history-course-cell"
          className="flex flex-col"
        >
          <span
            data-cy="tna-employee-history-course-name"
            className="text-sm font-bold text-black"
          >
            {value}
          </span>
          <span
            data-cy="tna-employee-history-course-provider"
            className="text-xs text-black/45"
          >
            {record.trainingProvider || 'External training'}
          </span>
        </div>
      ),
    },
    {
      title: 'Cost',
      dataIndex: 'cost',
      key: 'cost',
      render: (value: number) => Number(value ?? 0).toLocaleString(),
    },
    {
      title: 'Requested',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (value: string) =>
        value ? dayjs(value).format(DATE_FORMAT) : '-',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (value: ExternalTrainingStatus) => (
        <StatusBadge theme={ExternalTrainingStatusBadgeTheme[value]}>
          {ExternalTrainingStatusLabel[value] ?? value}
        </StatusBadge>
      ),
    },
    {
      title: 'Payment',
      dataIndex: 'isPaymentConfirmed',
      key: 'isPaymentConfirmed',
      render: (value: boolean, record: ExternalTrainingRequest) => (
        <div
          data-cy="tna-employee-history-payment-cell"
          className="flex flex-col"
        >
          <span
            data-cy="tna-employee-history-payment-state"
            className={value ? 'text-[#389E0D]' : 'text-[#AD8B00]'}
          >
            {value ? 'Confirmed' : 'Pending'}
          </span>
          {record.paymentReference ? (
            <span
              data-cy="tna-employee-history-payment-reference"
              className="text-xs text-black/45"
            >
              Ref: {record.paymentReference}
            </span>
          ) : null}
        </div>
      ),
    },
  ];

  const commitmentColumns: TableColumnsType<TrainingCommitment> = [
    {
      title: 'Training',
      dataIndex: 'courseName',
      key: 'courseName',
      render: (value: string) => value || 'External training',
    },
    {
      title: 'Start',
      dataIndex: 'startDate',
      key: 'startDate',
      render: (value: string) =>
        value ? dayjs(value).format(DATE_FORMAT) : '-',
    },
    {
      title: 'End',
      dataIndex: 'endDate',
      key: 'endDate',
      render: (value: string) =>
        value ? dayjs(value).format(DATE_FORMAT) : '-',
    },
    {
      title: 'Remaining',
      dataIndex: 'daysRemaining',
      key: 'daysRemaining',
      render: (value: number) => `${value ?? 0} day(s)`,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (value: TrainingCommitment['status']) => (
        <StatusBadge theme={TrainingCommitmentStatusBadgeTheme[value]}>
          {TrainingCommitmentStatusLabel[value] ?? value}
        </StatusBadge>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="page-wrap" data-cy="tna-employee-history-loading">
        <Skeleton active paragraph={{ rows: 8 }} />
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="page-wrap" data-cy="tna-employee-history-empty">
        <EmptyState
          title="No TNA record"
          description="This employee has no external training history."
          actionText="Back to TNA Management"
          onAction={() => router.push('/tna/tna-management')}
        />
      </div>
    );
  }

  return (
    <div
      className="page-wrap flex flex-col gap-4"
      data-cy="tna-employee-history-page"
    >
      <CustomBreadcrumb
        title={
          <span data-cy="tna-employee-history-title">
            <EmployeeName userId={userId} fallback="Employee" />
          </span>
        }
        subtitle={
          <nav
            className="flex flex-row flex-wrap items-center text-sm leading-[22px]"
            aria-label="Breadcrumb"
            data-cy="tna-employee-history-breadcrumb"
          >
            <span
              data-cy="tna-employee-history-breadcrumb-root"
              className="text-black/45"
            >
              Learning and Growth
            </span>
            <span
              data-cy="tna-employee-history-breadcrumb-separator-one"
              className="px-2 text-black/45"
            >
              /
            </span>
            <span
              data-cy="tna-employee-history-breadcrumb-parent"
              className="text-black/45"
            >
              TNA Management
            </span>
            <span
              data-cy="tna-employee-history-breadcrumb-separator-two"
              className="px-2 text-black/45"
            >
              /
            </span>
            <span
              data-cy="tna-employee-history-breadcrumb-current"
              className="text-black/70"
            >
              Employee TNA History
            </span>
          </nav>
        }
        href="/tna/tna-management"
      />

      <div
        className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6"
        data-cy="tna-employee-history-stats"
      >
        <StatCard
          label="Total requests"
          value={summary.stats?.totalRequests ?? 0}
          dataCy="tna-employee-history-stat-total"
        />
        <StatCard
          label="Pending"
          value={summary.stats?.pendingRequests ?? 0}
          dataCy="tna-employee-history-stat-pending"
        />
        <StatCard
          label="Approved"
          value={summary.stats?.approvedRequests ?? 0}
          dataCy="tna-employee-history-stat-approved"
        />
        <StatCard
          label="Rejected"
          value={summary.stats?.rejectedRequests ?? 0}
          dataCy="tna-employee-history-stat-rejected"
        />
        <StatCard
          label="Payments confirmed"
          value={summary.stats?.paymentsConfirmed ?? 0}
          dataCy="tna-employee-history-stat-payments"
        />
        <StatCard
          label="Approved spend"
          value={Number(summary.stats?.totalApprovedCost ?? 0).toLocaleString()}
          dataCy="tna-employee-history-stat-cost"
        />
      </div>

      {summary.activeCommitments?.length ? (
        <section
          className="flex flex-col gap-3"
          data-cy="tna-employee-history-active-commitments"
        >
          <h2
            data-cy="tna-employee-history-active-commitments-title"
            className="m-0 text-sm font-bold leading-[22px] text-black"
          >
            Active Commitments
          </h2>
          <div
            data-cy="tna-employee-history-active-commitments-grid"
            className="grid grid-cols-1 gap-3 md:grid-cols-2"
          >
            {summary.activeCommitments.map((commitment) => (
              <CommitmentProgressBar
                key={commitment.id}
                commitment={commitment}
              />
            ))}
          </div>
        </section>
      ) : null}

      <section
        className="box-border flex flex-col gap-3 rounded-[8px] border border-[#D9D9D9] bg-white p-4"
        data-cy="tna-employee-history-requests"
      >
        <h2
          data-cy="tna-employee-history-requests-title"
          className="m-0 text-sm font-bold leading-[22px] text-black"
        >
          TNA History
        </h2>
        {summary.requests?.length ? (
          <Table
            rowKey="id"
            columns={requestColumns}
            dataSource={summary.requests}
            pagination={false}
            scroll={{ x: 'max-content' }}
            expandable={{
              expandedRowRender: (record) => (
                <ApprovalTimeline approvals={record.approvals} />
              ),
              rowExpandable: (record) => Boolean(record.approvals?.length),
            }}
            onRow={(record) => ({
              onDoubleClick: () =>
                router.push(`/tna/management/external/${record.id}`),
            })}
            data-cy="tna-employee-history-requests-table"
          />
        ) : (
          <EmptyState
            compact
            title="No external training requests"
            description="This employee has not requested any external training yet."
          />
        )}
      </section>

      <section
        className="box-border flex flex-col gap-3 rounded-[8px] border border-[#D9D9D9] bg-white p-4"
        data-cy="tna-employee-history-commitments"
      >
        <h2
          data-cy="tna-employee-history-commitments-title"
          className="m-0 text-sm font-bold leading-[22px] text-black"
        >
          Commitments
        </h2>
        {summary.commitments?.length ? (
          <Table
            rowKey="id"
            columns={commitmentColumns}
            dataSource={summary.commitments}
            pagination={false}
            scroll={{ x: 'max-content' }}
            data-cy="tna-employee-history-commitments-table"
          />
        ) : (
          <EmptyState
            compact
            title="No commitments"
            description="Commitments appear once an external training is approved and paid."
          />
        )}
      </section>
    </div>
  );
};

export default EmployeeTnaHistoryPage;
