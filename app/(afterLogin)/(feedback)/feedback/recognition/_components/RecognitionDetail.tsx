import { LoadingOutlined, UserOutlined } from '@ant-design/icons';
import { useGetEmployee } from '@/store/server/features/employees/employeeManagment/queries';
import { Avatar, Button, Card, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import React, { useMemo } from 'react';
import { HiOutlineXMark } from 'react-icons/hi2';

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

  if (!empId) return <span>-</span>;
  if (isLoading) return <LoadingOutlined />;

  const user = userDetails as EmployeeMini | undefined;
  return (
    <div className="flex items-center gap-2">
      <Avatar src={user?.profileImage} icon={<UserOutlined />} size={24} />
      <div className="text-sm font-medium">{formatName(user)}</div>
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

  const columns: ColumnsType<any> = useMemo(
    () => [
      {
        title: 'Critatria',
        dataIndex: 'name',
        key: 'criteria',
        render: (value) => (
          <span className="inline-flex items-center rounded-md border border-[#E5E7EB] bg-[#F9FAFB] px-3 py-1 text-sm">
            {value ?? '-'}
          </span>
        ),
      },
      { title: 'Weight', dataIndex: 'weight', key: 'weight' },
      { title: 'Operator', dataIndex: 'operator', key: 'operator' },
      { title: 'Condition', dataIndex: 'condition', key: 'condition' },
      { title: 'Value', dataIndex: 'value', key: 'value' },
      {
        title: 'Score',
        dataIndex: 'score',
        key: 'score',
        render: (value) => (
          <span className="text-sm font-medium">
            {Number.isFinite(value) ? value?.toLocaleString() : '-'}
          </span>
        ),
      },
    ],
    [],
  );

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
    <div className="w-full ">
      <Card
        className="border-none rounded-none p-0 shadow-none"
        bordered={false}
        loading={loading || recipientLoading}
        bodyStyle={{ padding: 0 }}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="text-base font-semibold">Recognition Detail</div>
          <Button
            type="text"
            onClick={onClose}
            icon={<HiOutlineXMark size={18} />}
          />
        </div>

        <div className="p-0  scrollbar-none">
          <div className="rounded-xl border border-[#E5E7EB] bg-white p-5">
            <div className="flex items-center gap-3">
              <Avatar
                src={recipientUser?.profileImage}
                icon={<UserOutlined />}
                size={44}
              />
              <div className="min-w-0">
                <div className="text-sm font-semibold truncate">
                  {formatName(recipientUser)}
                </div>
                <div className="text-xs text-gray-400 truncate">
                  {recipientUser?.email ?? '-'}
                </div>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-4">
              <div>
                <div className="text-xs text-gray-400 mb-1">Recognized By</div>
                <EmployeePill empId={issuerId} />
              </div>
              <div>
                <div className="text-xs text-gray-400 mb-1">Issued Date</div>
                <div className="text-sm font-medium">{issuedDate}</div>
              </div>
              <div>
                <div className="text-xs text-gray-400 mb-1">Final Score</div>
                <div className="text-sm font-medium">
                  {Number.isFinite(totalScore)
                    ? totalScore?.toLocaleString()
                    : '-'}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-400 mb-1">Detail</div>
                <div className="text-sm font-medium">{detailText}</div>
              </div>
            </div>
          </div>

          <div className="mt-6 h-[200px] overflow-y-auto scrollbar-none">
            <Table
              columns={columns}
              dataSource={criteriaRows}
              pagination={false}
              className="rounded-xl overflow-hidden text-black/70"
            />
          </div>

          <div className="mt-6 rounded-xl border border-[#E5E7EB] bg-white p-5">
            <div className="text-sm font-bold text-black/70 mb-4">
              Scoring Breakdown
            </div>

            <div className="rounded-xl border border-[#E5E7EB] bg-white p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-sm font-bold text-black/70 mb-3">
                    Formula Breakdown
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    <span className="text-black/70 rounded-md border border-[#E5E7EB] bg-[#F9FAFB] px-2 py-1">
                      Criteria
                    </span>
                    <span className="text-black/70 rounded-md border border-[#E5E7EB] bg-[#F9FAFB] px-2 py-1">
                      Operator
                    </span>
                    <span className="text-black/70 rounded-md border border-[#E5E7EB] bg-[#F9FAFB] px-2 py-1">
                      (Weight × 100 / 1)
                    </span>
                    <span className="text-black/70 rounded-md border border-[#E5E7EB] bg-[#F9FAFB] px-2 py-1">
                      =
                    </span>
                    <span className="rounded-md border border-[#BFDBFE] bg-[#EFF6FF] px-2 py-1 text-[#2563EB]">
                      Score
                    </span>
                  </div>
                </div>

                <div className="shrink-0">
                  <span className="inline-flex items-center rounded-md border border-[#BFDBFE] bg-[#EFF6FF] px-3 py-1 text-xs font-medium text-[#2563EB]">
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
