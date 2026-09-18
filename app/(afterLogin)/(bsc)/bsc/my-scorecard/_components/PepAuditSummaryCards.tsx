'use client';

import React, { useMemo } from 'react';
import { Card } from 'antd';
import {
  MdFlag,
  MdHourglassEmpty,
  MdCheckCircle,
  MdCancel,
} from 'react-icons/md';
import { okrHeaderCardShellClass } from '@/app/(afterLogin)/dashboard/_components/header/cards/shared';
import { KpiApprovalStatus, PepAuditFlag, PepAuditRow } from '@/types/bsc';

type SummaryCardProps = {
  label: string;
  value: number;
  icon: React.ReactNode;
  iconBgClassName: string;
  dataCy: string;
};

function SummaryCard({
  label,
  value,
  icon,
  iconBgClassName,
  dataCy,
}: SummaryCardProps) {
  return (
    <Card
      bordered={false}
      bodyStyle={{ padding: 0 }}
      className={okrHeaderCardShellClass}
      data-cy={dataCy}
    >
      <div className="flex items-center justify-between">
        <div
          className={`flex h-[34px] w-[34px] items-center justify-center rounded-[4px] ${iconBgClassName}`}
        >
          {icon}
        </div>
        <div className="text-[27px] font-semibold leading-7 text-gray-900">{value}</div>
      </div>
      <p className="m-0 mt-3 text-base font-normal text-gray-500">{label}</p>
    </Card>
  );
}

type Props = {
  rows: PepAuditRow[];
};

export default function PepAuditSummaryCards({ rows }: Props) {
  const summary = useMemo(() => {
    return rows.reduce(
      (acc, row) => {
        if (row.approvalStatus === KpiApprovalStatus.Rejected) {
          acc.returned += 1;
        }
        if (row.pepAuditFlag === PepAuditFlag.Unrealistic) acc.unrealistic += 1;
        else if (row.pepAuditFlag === PepAuditFlag.PendingReview) {
          acc.pendingReview += 1;
        } else acc.realistic += 1;
        return acc;
      },
      { unrealistic: 0, pendingReview: 0, realistic: 0, returned: 0 },
    );
  }, [rows]);

  return (
    <div
      className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4"
      data-cy="bsc-pep-audit-summary-cards"
    >
      <SummaryCard
        label="Unrealistic"
        value={summary.unrealistic}
        icon={<MdFlag className="text-lg text-red-600" />}
        iconBgClassName="bg-red-50"
        dataCy="bsc-pep-audit-summary-unrealistic"
      />
      <SummaryCard
        label="Pending review"
        value={summary.pendingReview}
        icon={<MdHourglassEmpty className="text-lg text-amber-600" />}
        iconBgClassName="bg-amber-50"
        dataCy="bsc-pep-audit-summary-pending"
      />
      <SummaryCard
        label="Approved"
        value={summary.realistic}
        icon={<MdCheckCircle className="text-lg text-green-600" />}
        iconBgClassName="bg-green-50"
        dataCy="bsc-pep-audit-summary-realistic"
      />
      <SummaryCard
        label="Rejected"
        value={summary.returned}
        icon={<MdCancel className="text-lg text-red-600" />}
        iconBgClassName="bg-red-50"
        dataCy="bsc-pep-audit-summary-returned"
      />
    </div>
  );
}
