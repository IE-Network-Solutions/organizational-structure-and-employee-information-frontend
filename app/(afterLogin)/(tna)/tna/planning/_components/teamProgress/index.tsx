'use client';

import React, { useMemo } from 'react';
import { Button, Progress, Skeleton, Tag } from 'antd';
import { LuDownload } from 'react-icons/lu';
import dayjs from 'dayjs';
import EmptyState from '@/components/empty';
import { useGetTeamGrowthProgress } from '@/store/server/features/tna/growthPlan/queries';
import { DATE_FORMAT } from '@/utils/constants';

/**
 * Manager team progress + CSV export.
 * Pattern found: My Plans / Approvals bordered cards.
 */
const TeamProgressPanel = () => {
  const { data, isLoading } = useGetTeamGrowthProgress();
  const rows = data ?? [];

  const csv = useMemo(() => {
    const header = [
      'Employee',
      'Category',
      'Status',
      'Completed',
      'Total',
      'Percent',
      'Overdue',
    ];
    const lines = rows.map((r) =>
      [
        r.userName,
        r.categoryName ?? '',
        r.status,
        r.completedGoals,
        r.totalGoals,
        r.percent,
        r.overdueGoals,
      ]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(','),
    );
    return [header.join(','), ...lines].join('\n');
  }, [rows]);

  const downloadCsv = () => {
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `growth-team-progress-${dayjs().format('YYYY-MM-DD')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return <Skeleton active paragraph={{ rows: 3 }} />;
  }

  if (!rows.length) {
    return (
      <EmptyState
        compact
        title="No team plans yet"
        description="Approved or pending growth plans from your team will appear here."
        data-cy="pgp-team-progress-empty"
      />
    );
  }

  return (
    <div className="flex flex-col gap-3" data-cy="pgp-team-progress">
      <div
        data-cy="tna-planning-teamprogress-index-div-72"
        className="flex justify-end"
      >
        <Button
          icon={<LuDownload />}
          onClick={downloadCsv}
          data-cy="pgp-team-progress-export"
        >
          Export CSV
        </Button>
      </div>
      <div
        data-cy="tna-planning-teamprogress-index-div-81"
        className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3"
      >
        {rows.map((row) => (
          <div
            key={row.planId}
            className="rounded-lg border border-[#E5E7EB] bg-white p-4 shadow-none"
            data-cy={`pgp-team-progress-card-${row.planId}`}
          >
            <div
              data-cy="tna-planning-teamprogress-index-div-88"
              className="mb-2 flex flex-wrap items-center justify-between gap-2"
            >
              <span
                data-cy="tna-planning-teamprogress-index-span-89"
                className="text-[15px] font-semibold text-[#262626]"
              >
                {row.userName}
              </span>
              <Tag>{row.status.replace(/_/g, ' ')}</Tag>
            </div>
            <p
              data-cy="tna-planning-teamprogress-index-p-94"
              className="mb-2 text-xs text-[#8c8c8c]"
            >
              {row.categoryName || 'Growth plan'}
              {row.overdueGoals > 0 ? ` · ${row.overdueGoals} overdue` : ''}
            </p>
            <div
              data-cy="tna-planning-teamprogress-index-div-98"
              className="mb-1 flex justify-between text-[11px] text-gray-500"
            >
              <span data-cy="tna-planning-teamprogress-index-span-99">
                {row.completedGoals}/{row.totalGoals} complete
              </span>
              <span data-cy="tna-planning-teamprogress-index-span-102">
                {row.percent}%
              </span>
            </div>
            <Progress
              percent={row.percent}
              size="small"
              strokeColor="#1E40AF"
              showInfo={false}
            />
            <p
              data-cy="tna-planning-teamprogress-index-p-110"
              className="mb-0 mt-2 text-[11px] text-[#8c8c8c]"
            >
              Exported {dayjs().format(DATE_FORMAT)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TeamProgressPanel;
