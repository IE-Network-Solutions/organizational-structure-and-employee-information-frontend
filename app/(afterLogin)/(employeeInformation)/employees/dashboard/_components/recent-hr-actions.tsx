'use client';

import React from 'react';
import { Steps } from 'antd';
import Link from 'next/link';
import { AuditLog } from '@/types/tenant-management';
import {
  MdAlbum,
  MdAccountBalance,
  MdAccountBalanceWallet,
  MdCardGiftcard,
  MdChatBubble,
  MdDeleteOutline,
  MdFactCheck,
  MdPersonSearch,
  MdSchool,
  MdTrendingDown,
  MdTrendingUp,
  MdUpdate,
  MdWorkspacesOutline,
  MdOutlineAccessTimeFilled,
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

type RecentHrActionsProps = {
  auditLogs?: AuditLog[];
  isLoading?: boolean;
  auditLogModules?: string[];
  height?: string;
};

const SKELETON_ITEMS_COUNT = 5;

const formatTime = (date?: string) => {
  if (!date) return '--';
  const dateObject = new Date(date);
  if (Number.isNaN(dateObject.getTime())) return '--';
  return dateObject.toLocaleString();
};

const normalizeText = (value?: string) =>
  (value || '').toLowerCase().replace(/[\s_-]+/g, '');

const getActionTitle = (action?: string) => {
  const actionLower = action?.toLowerCase();
  if (
    actionLower === 'create' ||
    actionLower === 'created' ||
    actionLower === 'creation'
  )
    return 'Creation';
  if (actionLower === 'update' || actionLower === 'updated') return 'Update';
  if (actionLower === 'delete' || actionLower === 'deleted') return 'Delete';
  return action || 'Activity';
};

const getIconDataByAction = (action?: string, module?: string) => {
  const actionLower = action?.toLowerCase();
  const moduleKey = module;

  if (
    actionLower === 'create' ||
    actionLower === 'created' ||
    actionLower === 'creation'
  ) {
    if (moduleKey === 'PensionAuditLog') {
      return {
        icon: <MdAccountBalance className="w-4 h-4" />,
        iconBgClassName: 'bg-[#1E40AF]/15',
        iconClassName: 'text-[#1E40AF]',
      };
    }
    if (moduleKey === 'PayrollAuditLog') {
      return {
        icon: <MdAccountBalanceWallet className="w-4 h-4" />,
        iconBgClassName: 'bg-[#323232]/15',
        iconClassName: 'text-[#323232]',
      };
    }
    if (moduleKey === 'IncentiveAuditLog') {
      return {
        icon: <MdCardGiftcard className="w-4 h-4" />,
        iconBgClassName: 'bg-[#EB2F96]/15',
        iconClassName: 'text-[#EB2F96]',
      };
    }
    if (moduleKey === 'DeductionAuditLog') {
      return {
        icon: <MdTrendingDown className="w-4 h-4" />,
        iconBgClassName: 'bg-[#FF4D4F]/15',
        iconClassName: 'text-[#FF4D4F]',
      };
    }
    if (moduleKey === 'AllowanceAuditLog') {
      return {
        icon: <MdTrendingUp className="w-4 h-4" />,
        iconBgClassName: 'bg-[#52C41A]/15',
        iconClassName: 'text-[#52C41A]',
      };
    }
    if (moduleKey === 'OrgAndEmpAuditLog') {
      return {
        icon: <MdFactCheck className="w-4 h-4" />,
        iconBgClassName: 'bg-[#FFEC3D]/20',
        iconClassName: 'text-[#FFEC3D]',
      };
    }
    if (moduleKey === 'PayrollAuditLog') {
      return {
        icon: <MdWorkspacesOutline className="w-4 h-4" />,
        iconBgClassName: 'bg-[#4096FF]/15',
        iconClassName: 'text-[#4096FF]',
      };
    }
    if (moduleKey === 'OKRAuditLog') {
      return {
        icon: <MdAlbum className="w-4 h-4" />,
        iconBgClassName: 'bg-[#1E40AF]/15',
        iconClassName: 'text-[#1E40AF]',
      };
    }
    if (moduleKey === 'TimesheetAuditLog') {
      return {
        icon: <MdOutlineAccessTimeFilled  className="w-4 h-4" />,
        iconBgClassName: 'bg-[#4096FF]/15',
        iconClassName: 'text-[#4096FF]',
      };
    }
    if (moduleKey === 'RecruitmentAuditLog') {
      return {
        icon: <MdPersonSearch className="w-4 h-4" />,
        iconBgClassName: 'bg-[#52C41A]/15',
        iconClassName: 'text-[#52C41A]',
      };
    }
    if (moduleKey === 'CFRAuditLog') {
      return {
        icon: <MdChatBubble className="w-4 h-4" />,
        iconBgClassName: 'bg-[#FFEC3D]/20',
        iconClassName: 'text-[#FFEC3D]',
      };
    }
    if (moduleKey === 'TNAAuditLog') {
      return {
        icon: <MdSchool className="w-4 h-4" />,
        iconBgClassName: 'bg-[#323232]/15',
        iconClassName: 'text-[#323232]',
      };
    }
    return {
      icon: <MdCardGiftcard className="w-4 h-4" />,
      iconBgClassName: 'bg-[#4096FF]/15',
      iconClassName: 'text-[#4096FF]',
    };
  }
  if (actionLower === 'update' || actionLower === 'updated') {
    return {
      icon: <MdUpdate className="w-4 h-4" />,
      iconBgClassName: 'bg-[#722ED1]/15',
      iconClassName: 'text-[#722ED1]',
    };
  }
  if (actionLower === 'delete' || actionLower === 'deleted') {
    return {
      icon: <MdDeleteOutline className="w-4 h-4" />,
      iconBgClassName: 'bg-[#FF4D4F]/15',
      iconClassName: 'text-[#FF4D4F]',
    };
  }
  return {
    icon: <MdCardGiftcard className="w-4 h-4" />,
    iconBgClassName: 'bg-[#4096FF]/15',
    iconClassName: 'text-[#4096FF]',
  };
};

export default function RecentHrActions({
  auditLogs = [],
  isLoading = false,
  auditLogModules = [],
  height,
}: RecentHrActionsProps) {
  const hasServerData = Array.isArray(auditLogs) && auditLogs.length > 0;

  const actionItems: RecentHrAction[] = hasServerData
    ? auditLogs.map((log) => {
        const iconData = getIconDataByAction(log.action, log.module);
        const userName = log.performedByUser
          ? `${log.performedByUser.firstName || ''} ${log.performedByUser.lastName || ''}`.trim()
          : '';
        const performedByText = userName || log.performedBy || 'Unknown User';

        return {
          id: log.id,
          title: getActionTitle(log.action),
          description:
            log.remarks ||
            `${performedByText} ${log.action?.toLowerCase() || 'performed action'} in ${log.module || 'module'}`,
          time: formatTime(log.performedAt || log.createdAt),
          icon: iconData.icon,
          iconBgClassName: iconData.iconBgClassName,
          iconClassName: iconData.iconClassName,
        };
      })
    : [];

  return (
    <div
      className={`border border-gray-200 rounded-lg p-4 bg-white h-[${height}]`}
      id="recent-hr-actions-card"
      data-cy="recent-hr-actions-card"
    >
      <div
        className="flex items-start justify-between gap-4 mb-3"
        id="recent-hr-actions-header"
        data-cy="recent-hr-actions-header"
      >
        <div
          className="flex items-center gap-2 min-w-0"
          data-cy="recent-hr-actions-title-row"
          id="recent-hr-actions-title-row"
        >
          <MdTrendingUp
            size={24}
            className="text-gray-900"
            data-cy="recent-hr-actions-title-icon"
            id="recent-hr-actions-title-icon"
          />
          <h3
            className="text-[16px] font-bold text-gray-900 truncate"
            data-cy="recent-hr-actions-title"
            id="recent-hr-actions-title"
          >
            Recent HR Actions
          </h3>
        </div>
        
        <Link
          href={`/audit-log?modules=${encodeURIComponent(auditLogModules?.join(',') ?? '')}`}
          className="text-sm font-medium text-blue hover:underline whitespace-nowrap"
          id="recent-hr-actions-view-all"
          data-cy="recent-hr-actions-view-all"
          aria-label="View all recent HR actions"
        >
          View All
        </Link>
      </div>

      <div id="recent-hr-actions-timeline" data-cy="recent-hr-actions-timeline">
        {isLoading ? (
          <div
            className="space-y-4"
            data-cy="recent-hr-actions-loading-skeleton"
          >
            {Array.from({ length: SKELETON_ITEMS_COUNT }).map((_, index) => (
              <div
                key={`recent-hr-actions-skeleton-${index}`}
                className="flex items-start gap-3"
              >
                <div className="w-7 h-7 rounded-full bg-gray-200 animate-pulse flex-shrink-0" />
                <div className="flex-1 min-w-0 space-y-2 pt-1">
                  <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
                  <div className="h-3 w-11/12 bg-gray-200 rounded animate-pulse" />
                  <div className="h-3 w-24 bg-gray-200 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <Steps
            direction="vertical"
            items={actionItems.map((action) => ({
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
                  className="text-sm font-bold text-black/70 leading-5"
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
                  <div
                    className="text-sm font-normal text-black/45 leading-4"
                    data-cy={`recent-hr-actions-desc-text-${action.id}`}
                    id={`recent-hr-actions-desc-text-${action.id}`}
                  >
                    {action.description}
                  </div>
                  <div
                    className="text-sm font-normal text-black/25 leading-4 mt-1"
                    data-cy={`recent-hr-actions-time-${action.id}`}
                    id={`recent-hr-actions-time-${action.id}`}
                  >
                    {action.time}
                  </div>
                </div>
              ),
            }))}
          />
        )}
      </div>
    </div>
  );
}
