'use client';

import React from 'react';
import { Steps } from 'antd';
import Link from 'next/link';
import {
  MdArrowUpward,
  MdAutorenew,
  MdCardGiftcard,
  MdDescription,
  MdOutlinePersonAdd,
  MdOutlineTextSnippet,
  MdPersonAddAlt1,
  MdSwapHoriz,
  MdTrendingUp,
} from 'react-icons/md';

type RecentHrAction = {
  id: string;
  title: string;
  description: string;
  time: string;
  icon: React.ReactNode;
  iconBgClassName: string;
  iconClassName: string;
};

const RECENT_HR_ACTIONS: RecentHrAction[] = [
  {
    id: 'new-hire-onboarding',
    title: 'New Hire Onboarding Started',
    description: 'Jordan Lee joined as UX Designer in Product team',
    time: '2 hours ago',
    icon: <MdOutlinePersonAdd className="w-4 h-4" />,
    iconBgClassName: 'bg-greenlight',
    iconClassName: 'text-greenbg',
  },
  {
    id: 'promotion',
    title: 'Promotion',
    description: 'Michael Demeke promoted to Sr. Engineering Lead',
    time: '4 hours ago',
    icon: <MdArrowUpward className="w-4 h-4" />,
    iconBgClassName: 'bg-blue/30',
    iconClassName: 'text-blue',
  },
  {
    id: 'department-transfer',
    title: 'Department Transfer',
    description: 'Nahon Bekle moved from Sales to Account Management',
    time: 'Yesterday',
    icon: <MdAutorenew className="w-4 h-4" />,
    iconBgClassName: 'bg-light_purple',
    iconClassName: 'text-purple',
  },
  {
    id: 'policy-update',
    title: 'Policy Update',
    description: 'Remote work Policy Update',
    time: 'Yesterday',
    icon: <MdOutlineTextSnippet className="w-4 h-4" />,
    iconBgClassName: 'bg-gray-100',
    iconClassName: 'text-gray-600',
  },
  {
    id: 'benefits-enrollment',
    title: 'Benefits enrollment open',
    description: 'Q2 benefits enrollment window open',
    time: '2 days ago',
    icon: <MdCardGiftcard className="w-4 h-4" />,
    iconBgClassName: 'bg-pink-100',
    iconClassName: 'text-pink-700',
  },
];

export default function RecentHrActions() {
  return (
    <div
      className="border border-gray-200 rounded-lg p-4 bg-white"
      id="recent-hr-actions-card"
      data-cy="recent-hr-actions-card"
    >
      <div
        className="flex items-start justify-between gap-4 mb-3"
        id="recent-hr-actions-header"
        data-cy="recent-hr-actions-header"
      >
        <div className="flex items-center gap-2 min-w-0">
          <MdTrendingUp size={24} className="text-gray-900" />
          <h3 className="text-[14px] font-bold text-gray-900 truncate">
            Recent HR Actions
          </h3>
        </div>

        import Link from "next/link";

        <Link
          href="/audit-log"
          className="text-sm font-medium text-blue hover:underline whitespace-nowrap"
          id="recent-hr-actions-view-all"
          data-cy="recent-hr-actions-view-all"
          aria-label="View all recent HR actions"
        >
          View All
        </Link>
      </div>

      <div
        id="recent-hr-actions-timeline"
        data-cy="recent-hr-actions-timeline"
      >
        <Steps
          direction="vertical"
          items={RECENT_HR_ACTIONS.map((action) => ({
            key: action.id,
            status: 'wait',
            icon: (
              <span
                className={[
                  'w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0',
                  action.iconBgClassName,
                  action.iconClassName,
                ].join(' ')}
                id={`recent-hr-actions-icon-${action.id}`}
                data-cy={`recent-hr-actions-icon-${action.id}`}
              >
                {action.icon}
              </span>
            ),
            title: (
              <div
                className="text-sm font-bold text-black leading-5"
                data-cy={`recent-hr-actions-title-${action.id}`}
              >
                {action.title}
              </div>
            ),
            description: (
              <div
                className="min-w-0"
                data-cy={`recent-hr-actions-desc-${action.id}`}
              >
                <div className="text-xs font-normal text-gray-500 leading-4">
                  {action.description}
                </div>
                <div className="text-xs font-normal text-gray-400 leading-4 mt-1">
                  {action.time}
                </div>
              </div>
            ),
          }))}
        />
      </div>
    </div>
  );
}

