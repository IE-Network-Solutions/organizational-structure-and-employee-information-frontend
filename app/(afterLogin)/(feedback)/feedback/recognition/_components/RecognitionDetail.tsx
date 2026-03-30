import { LoadingOutlined, UserOutlined } from '@ant-design/icons';
import { useGetEmployee } from '@/store/server/features/employees/employeeManagment/queries';
import { Avatar, Button, Card, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import React, { useMemo } from 'react';
import { HiOutlineXMark } from 'react-icons/hi2';
import { useMediaQuery } from 'react-responsive';

type EmployeeMini = {
  firstName?: string;
  middleName?: string;
  lastName?: string;
  email?: string;
  profileImage?: string;
};

function formatName(user?: EmployeeMini | null) {
  if (!user) return '-';
  const full =
    `${user.firstName ?? ''} ${user.middleName ?? ''} ${user.lastName ?? ''}`
      .replace(/\s+/g, ' ')
      .trim();
  return full || '-';
}

function EmployeePill({ empId }: { empId?: string }) {
  const { data: userDetails, isLoading } = useGetEmployee(empId || '');

  if (!empId) return <span data-cy="recognition-detail-emp-pill-empty">-</span>;
  if (isLoading) return <LoadingOutlined />;

  const user = userDetails as EmployeeMini | undefined;
  return (
    <div
      className="flex min-w-0 items-center gap-2"
      data-cy="recognition-detail-emp-pill"
    >
      <Avatar src={user?.profileImage} icon={<UserOutlined />} size={24} />
      <div
        className="min-w-0 truncate text-sm font-medium"
        data-cy="recognition-detail-emp-pill-name"
      >
        {formatName(user)}
      </div>
    </div>
  );
}

interface RecognitionDetailProps {
  loading?: boolean;
  recognition: any;
  onClose?: () => void;
}

export default function RecognitionDetail({
  loading,
  recognition,
  onClose,
}: RecognitionDetailProps) {
  const isNarrow = useMediaQuery({ maxWidth: 767 });

  const recipientId = recognition?.recipientId;
  const issuerId = recognition?.issuerId;

  const { data: recipient, isLoading: recipientLoading } = useGetEmployee(
    recipientId || '',
  );

  const criteriaRows = useMemo(() => {
    const items = recognition?.criteriaScore ?? [];
    return (items as any[]).map((item, idx) => ({
      key: item?.id ?? `${idx}`,
      ...item,
    }));
  }, [recognition?.criteriaScore]);

  const totalScore = useMemo(() => {
    const items = recognition?.criteriaScore ?? [];
    return (items as any[]).reduce((acc, item) => {
      const weighted = ((item?.score ?? 0) * 100) / (item?.weight ?? 1);
      return acc + (item?.operator === '-' ? -weighted : weighted);
    }, 0);
  }, [recognition?.criteriaScore]);

  const columns: ColumnsType<any> = useMemo(() => {
    const criteriaCol = {
      title: 'Criteria',
      dataIndex: 'name',
      key: 'criteria',
      ellipsis: isNarrow,
      render: (value: string) => (
        <span
          className="inline-flex max-w-full items-center rounded-md border border-[#E5E7EB] bg-[#F9FAFB] px-2 py-0.5 text-xs md:px-3 md:py-1 md:text-sm"
          data-cy="recognition-detail-criteria-name-pill"
        >
          <span
            className="truncate"
            data-cy="recognition-detail-criteria-name-text"
          >
            {value ?? '-'}
          </span>
        </span>
      ),
    };
    const weightCol = {
      title: 'Weight',
      dataIndex: 'weight',
      key: 'weight',
      width: isNarrow ? 72 : undefined,
    };
    const operatorCol = {
      title: 'Operator',
      dataIndex: 'operator',
      key: 'operator',
      width: isNarrow ? 72 : undefined,
    };
    const extraCols = [
      { title: 'Condition', dataIndex: 'condition', key: 'condition' },
      { title: 'Value', dataIndex: 'value', key: 'value' },
      {
        title: 'Score',
        dataIndex: 'score',
        key: 'score',
        render: (value: number) => (
          <span
            className="text-sm font-medium"
            data-cy="recognition-detail-criteria-score"
          >
            {Number.isFinite(value) ? value?.toLocaleString() : '-'}
          </span>
        ),
      },
    ];
    if (isNarrow) {
      return [criteriaCol, weightCol, operatorCol];
    }
    return [criteriaCol, weightCol, operatorCol, ...extraCols];
  }, [isNarrow]);

  const recipientUser = recipient as EmployeeMini | undefined;
  const issuedDate = recognition?.dateIssued
    ? dayjs(recognition.dateIssued).format('D MMMM, YYYY')
    : '-';
  const detailText =
    recognition?.recognitionType?.description ??
    recognition?.detail ??
    recognition?.details ??
    '-';

  return (
    <div className="w-full " data-cy="recognition-detail-root">
      <Card
        className="border-none rounded p-0 shadow-none"
        bordered={false}
        loading={loading || recipientLoading}
        bodyStyle={{ padding: 0 }}
      >
        <div
          className="flex items-center justify-between mb-4"
          data-cy="recognition-detail-header-row"
        >
          <div
            className="text-base font-semibold"
            data-cy="recognition-detail-header-title"
          >
            Recognition Detail
          </div>
          <Button
            type="text"
            onClick={onClose}
            icon={<HiOutlineXMark size={18} />}
          />
        </div>

        <div className="p-0  scrollbar-none" data-cy="recognition-detail-body">
          <div
            className="rounded-xl border border-[#E5E7EB] bg-white p-4 md:p-5"
            data-cy="recognition-detail-summary-card"
          >
            <div
              className="flex items-center gap-3"
              data-cy="recognition-detail-recipient-row"
            >
              <Avatar
                src={recipientUser?.profileImage}
                icon={<UserOutlined />}
                size={44}
              />
              <div
                className="min-w-0"
                data-cy="recognition-detail-recipient-text"
              >
                <div
                  className="text-sm font-semibold truncate"
                  data-cy="recognition-detail-recipient-name"
                >
                  {formatName(recipientUser)}
                </div>
                <div
                  className="text-xs text-gray-400 truncate"
                  data-cy="recognition-detail-recipient-email"
                >
                  {recipientUser?.email ?? '-'}
                </div>
              </div>
            </div>

            <div
              className="mt-5 grid grid-cols-2 gap-4 md:grid-cols-4"
              data-cy="recognition-detail-meta-grid"
            >
              <div
                className="col-span-1 min-w-0"
                data-cy="recognition-detail-meta-recognized-by"
              >
                <div
                  className="mb-1 text-xs text-gray-400"
                  data-cy="recognition-detail-label-recognized-by"
                >
                  Recognized By
                </div>
                <EmployeePill empId={issuerId} />
              </div>
              <div
                className="col-span-1 min-w-0"
                data-cy="recognition-detail-meta-issued-date"
              >
                <div
                  className="mb-1 text-xs text-gray-400"
                  data-cy="recognition-detail-label-issued-date"
                >
                  Issued Date
                </div>
                <div
                  className="text-sm font-medium"
                  data-cy="recognition-detail-value-issued-date"
                >
                  {issuedDate}
                </div>
              </div>
              <div
                className="col-span-2 md:col-span-1"
                data-cy="recognition-detail-meta-detail"
              >
                <div
                  className="mb-1 text-xs text-gray-400"
                  data-cy="recognition-detail-label-detail"
                >
                  Detail
                </div>
                <div
                  className="text-sm font-medium"
                  data-cy="recognition-detail-value-detail"
                >
                  {detailText}
                </div>
              </div>
              <div
                className="col-span-2 md:col-span-1"
                data-cy="recognition-detail-meta-final-score"
              >
                <div
                  className="mb-1 text-xs text-gray-400"
                  data-cy="recognition-detail-label-final-score"
                >
                  Final Score
                </div>
                <div
                  className="text-2xl font-semibold md:text-sm md:font-medium"
                  data-cy="recognition-detail-value-final-score"
                >
                  {Number.isFinite(totalScore)
                    ? totalScore?.toLocaleString()
                    : '-'}
                </div>
              </div>
            </div>
          </div>

          <div
            className="mt-6 max-h-[min(45vh,260px)] overflow-y-auto scrollbar-none md:h-[200px] md:max-h-none"
            data-cy="recognition-detail-criteria-table-wrap"
          >
            <Table
              columns={columns}
              dataSource={criteriaRows}
              pagination={false}
              size={isNarrow ? 'small' : 'middle'}
              className="rounded-xl overflow-hidden text-black/70"
              tableLayout={isNarrow ? 'fixed' : 'auto'}
            />
          </div>

          <div
            className="mt-6 rounded-xl border border-[#E5E7EB] bg-white p-4 md:p-5"
            data-cy="recognition-detail-scoring-breakdown"
          >
            <div
              className="text-sm font-bold text-black/70 mb-4"
              data-cy="recognition-detail-scoring-title"
            >
              Scoring Breakdown
            </div>

            <div
              className="rounded-xl border border-[#E5E7EB] bg-white p-3 md:p-4"
              data-cy="recognition-detail-formula-card"
            >
              <div
                className="flex flex-col items-stretch gap-3 md:flex-row md:items-start md:justify-between md:gap-4"
                data-cy="recognition-detail-formula-row"
              >
                <div
                  className="min-w-0"
                  data-cy="recognition-detail-formula-left"
                >
                  <div
                    className="mb-3 flex flex-wrap items-center justify-between gap-2 text-sm font-bold text-black/70 md:block"
                    data-cy="recognition-detail-formula-subtitle"
                  >
                    <span data-cy="recognition-detail-formula-breakdown-label">
                      Formula Breakdown
                    </span>
                    <span
                      className="inline-flex shrink-0 items-center rounded-md border border-[#BFDBFE] bg-[#EFF6FF] px-3 py-1 text-xs font-medium text-[#2563EB] md:hidden"
                      data-cy="recognition-detail-total-score-chip-mobile"
                    >
                      Total Score:{' '}
                      {Number.isFinite(totalScore)
                        ? totalScore?.toLocaleString()
                        : '-'}
                    </span>
                  </div>
                  <div
                    className="flex flex-wrap items-center gap-2 text-xs md:text-sm"
                    data-cy="recognition-detail-formula-chips"
                  >
                    <span
                      className="text-black/70 rounded-md border border-[#E5E7EB] bg-[#F9FAFB] px-2 py-1"
                      data-cy="recognition-detail-formula-chip-criteria"
                    >
                      Criteria
                    </span>
                    <span
                      className="text-black/70 rounded-md border border-[#E5E7EB] bg-[#F9FAFB] px-2 py-1"
                      data-cy="recognition-detail-formula-chip-operator"
                    >
                      Operator
                    </span>
                    <span
                      className="text-black/70 rounded-md border border-[#E5E7EB] bg-[#F9FAFB] px-2 py-1"
                      data-cy="recognition-detail-formula-chip-weight"
                    >
                      (Weight × 100 / 1)
                    </span>
                    <span
                      className="text-black/70 rounded-md border border-[#E5E7EB] bg-[#F9FAFB] px-2 py-1"
                      data-cy="recognition-detail-formula-chip-equals"
                    >
                      =
                    </span>
                    <span
                      className="rounded-md border border-[#BFDBFE] bg-[#EFF6FF] px-2 py-1 text-[#2563EB]"
                      data-cy="recognition-detail-formula-chip-score"
                    >
                      Score
                    </span>
                  </div>
                </div>

                <div
                  className="hidden shrink-0 md:block"
                  data-cy="recognition-detail-total-chip-wrap"
                >
                  <span
                    className="inline-flex items-center rounded-md border border-[#BFDBFE] bg-[#EFF6FF] px-3 py-1 text-xs font-medium text-[#2563EB]"
                    data-cy="recognition-detail-total-score-chip"
                  >
                    Total Score:{' '}
                    {Number.isFinite(totalScore)
                      ? totalScore?.toLocaleString()
                      : '-'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
