'use client';

import React from 'react';
import Link from 'next/link';
import { MdMilitaryTech, MdReportGmailerrorred } from 'react-icons/md';

export type RecentFeedbackItem = {
  id: string;
  type: 'appreciation' | 'reprimand';
  title: string;
  dateRange: string;
  relativeTime: string;
  category: string;
};

const DEFAULT_ITEMS: RecentFeedbackItem[] = [
  {
    id: '1',
    type: 'appreciation',
    title: 'For completing all designs on time',
    dateRange: 'Mar 15 - Mar 19, 2026',
    relativeTime: '40 minutes ago',
    category: 'Engagement',
  },
  {
    id: '2',
    type: 'reprimand',
    title: 'For failing to achieve all Q1 deliverables',
    dateRange: 'Mar 15 - Mar 19, 2026',
    relativeTime: '30 minutes ago',
    category: 'KPI',
  },
  {
    id: '3',
    type: 'appreciation',
    title: 'For outstanding teamwork in the sprint',
    dateRange: 'Mar 15 - Mar 19, 2026',
    relativeTime: '25 minutes ago',
    category: 'Engagement',
  },
  {
    id: '3',
    type: 'appreciation',
    title: 'For outstanding teamwork in the sprint',
    dateRange: 'Mar 15 - Mar 19, 2026',
    relativeTime: '25 minutes ago',
    category: 'Engagement',
  },
  {
    id: '3',
    type: 'appreciation',
    title: 'For outstanding teamwork in the sprint',
    dateRange: 'Mar 15 - Mar 19, 2026',
    relativeTime: '25 minutes ago',
    category: 'Engagement',
  },
  {
    id: '3',
    type: 'appreciation',
    title: 'For outstanding teamwork in the sprint',
    dateRange: 'Mar 15 - Mar 19, 2026',
    relativeTime: '25 minutes ago',
    category: 'Engagement',
  },
  {
    id: '3',
    type: 'appreciation',
    title: 'For outstanding teamwork in the sprint',
    dateRange: 'Mar 15 - Mar 19, 2026',
    relativeTime: '25 minutes ago',
    category: 'Engagement',
  },
  {
    id: '3',
    type: 'appreciation',
    title: 'For outstanding teamwork in the sprint',
    dateRange: 'Mar 15 - Mar 19, 2026',
    relativeTime: '25 minutes ago',
    category: 'Engagement',
  },
];

function FeedbackTypeIcon({ type }: { type: RecentFeedbackItem['type'] }) {
  if (type === 'appreciation') {
    return <MdMilitaryTech className="w-6 h-6 text-success" />;
  }
  return <MdReportGmailerrorred className="w-6 h-6 text-error" />;
}

export type RecentFeedbacksCardProps = {
  items?: RecentFeedbackItem[];
  viewAllHref?: string;
  className?: string;
};

export default function RecentFeedbacksCard({
  items = DEFAULT_ITEMS,
  viewAllHref = '/performance',
  className = '',
}: RecentFeedbacksCardProps) {
  return (
    <div
      className={`bg-white rounded-lg border border-[#E5E7EB] shadow-none p-3 h-[272px] ${className}`.trim()}
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
        {items.map((item, index) => (
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
                  {item.title}
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
        ))}
      </ul>
    </div>
  );
}
