'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { MdMilitaryTech, MdReportGmailerrorred } from 'react-icons/md';
import { Skeleton } from 'antd';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { useRecentFeedbacksActiveMonth } from '@/store/server/features/feedback/recentFeedbacksActiveMonth/queries';
import type { RecentFeedbackRecordItemDto } from '@/store/server/features/feedback/recentFeedbacksActiveMonth/interface';
import { DATE_FORMAT } from '@/utils/constants';

dayjs.extend(relativeTime);

export type RecentFeedbackItem = {
  id: string;
  type: 'appreciation' | 'reprimand';
  title: string;
  dateRange: string;
  relativeTime: string;
  category: string;
};

function mapDtoToItem(dto: RecentFeedbackRecordItemDto): RecentFeedbackItem {
  const type = dto.variant === 'appreciation' ? 'appreciation' : 'reprimand';
  const created = dayjs(dto.createdAt);
  const dateRange = created.isValid() ? created.format(DATE_FORMAT) : '';
  const rel = created.isValid() ? created.fromNow() : '';
  const title = dto.description?.trim() || dto.feedbackName?.trim() || '—';

  return {
    id: dto.id,
    type,
    title,
    dateRange,
    relativeTime: rel,
    category: dto.category,
  };
}

function FeedbackTypeIcon({ type }: { type: RecentFeedbackItem['type'] }) {
  if (type === 'appreciation') {
    return <MdMilitaryTech className="w-6 h-6 text-success" />;
  }
  return <MdReportGmailerrorred className="w-6 h-6 text-error" />;
}

export type RecentFeedbacksCardProps = {
  /** When set, skips the API and renders these items (e.g. tests). */
  items?: RecentFeedbackItem[];
  viewAllHref?: string;
  className?: string;
};

export default function RecentFeedbacksCard({
  items: itemsProp,
  viewAllHref = '/performance',
  className = '',
}: RecentFeedbacksCardProps) {
  const userId = useAuthenticationStore((s) => s.userId);
  const { data, isLoading } = useRecentFeedbacksActiveMonth(
    itemsProp !== undefined ? undefined : userId || undefined,
  );

  const items = useMemo(() => {
    if (itemsProp !== undefined) return itemsProp;
    if (!data?.items?.length) return [];
    return data.items.map(mapDtoToItem);
  }, [itemsProp, data]);

  const showSkeleton =
    itemsProp === undefined && (!userId || (isLoading && !data));

  if (showSkeleton) {
    return (
      <div
        className={`bg-white rounded-lg border border-[#E5E7EB] shadow-none p-3 h-full min-h-[272px] ${className}`.trim()}
        data-cy="dashboard-recent-feedbacks"
      >
        <div
          className="flex items-center justify-between mb-4"
          data-cy="dashboard-recent-feedbacks-header"
        >
          <Skeleton.Button
            active
            size="small"
            style={{ width: 140, height: 22 }}
          />
          <Skeleton.Button
            active
            size="small"
            style={{ width: 64, height: 20 }}
          />
        </div>
        <Skeleton active paragraph={{ rows: 4 }} title={false} />
      </div>
    );
  }

  return (
    <div
      className={`bg-white rounded-lg border border-[#E5E7EB] shadow-none p-3 h-full min-h-[272px] ${className}`.trim()}
      data-cy="dashboard-recent-feedbacks"
    >
      <div
        className="flex items-center justify-between mb-4"
        data-cy="dashboard-recent-feedbacks-header"
      >
        <h2
          className="text-base font-bold text-black"
          data-cy="dashboard-recent-feedbacks-title"
        >
          Recent Feedbacks
        </h2>
        <Link
          href={viewAllHref}
          className="text-sm font-normal text-blue-600 hover:text-blue-700"
          data-cy="dashboard-recent-feedbacks-view-all"
        >
          View All
        </Link>
      </div>

      <ul
        className="flex flex-col gap-3 list-none p-0 m-0 h-[200px] overflow-y-auto scrollbar-none"
        data-cy="dashboard-recent-feedbacks-list"
      >
        {items.length === 0 ? (
          <li
            className="text-sm text-gray-500 text-center py-6"
            data-cy="dashboard-recent-feedbacks-empty"
          >
            No recent feedback in the active month.
          </li>
        ) : (
          items.map((item, index) => (
            <li
              key={`${item.id}-${index}`}
              data-cy={`dashboard-recent-feedbacks-list-item-${item.id}-${index}`}
            >
              <div
                className="flex flex-row items-center gap-3 rounded-lg border border-[#E5E7EB] bg-white px-2 py-2"
                data-cy={`dashboard-recent-feedbacks-item-${item.id}-${index}`}
              >
                <FeedbackTypeIcon type={item.type} />
                <div
                  className="min-w-0 flex-1"
                  data-cy={`dashboard-recent-feedbacks-item-body-${item.id}-${index}`}
                >
                  <p
                    className="text-sm font-bold text-gray-900 leading-snug"
                    data-cy={`dashboard-recent-feedbacks-item-title-${item.id}-${index}`}
                  >
                    {item.title?.length > 70
                      ? `${item.title.slice(0, 70)}...`
                      : item.title}
                  </p>
                  <p
                    className="text-xs text-gray-500 mt-1"
                    data-cy={`dashboard-recent-feedbacks-item-meta-${item.id}-${index}`}
                  >
                    {item.dateRange}{' '}
                    <span
                      className="text-gray-500"
                      data-cy={`dashboard-recent-feedbacks-item-relative-${item.id}-${index}`}
                    >
                      ({item.relativeTime})
                    </span>
                  </p>
                </div>
                <span
                  className="shrink-0 rounded-md border border-[#E5E7EB] bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600"
                  data-cy={`dashboard-recent-feedbacks-category-${item.id}-${index}`}
                >
                  {item.category}
                </span>
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
