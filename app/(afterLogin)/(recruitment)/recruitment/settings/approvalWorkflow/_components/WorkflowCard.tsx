'use client';

import { GENDER_NEUTRAL_AVATAR_URL } from '@/constants/publicImageUrls';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import { Dropdown } from 'antd';
import type { MenuProps } from 'antd';
import { MoreHorizontal, Pencil, Plus, Trash2 } from 'lucide-react';
import Image from 'next/image';
import React from 'react';
import { ApprovalWorkflowItem } from './types';

interface WorkflowCardProps {
  workflow: ApprovalWorkflowItem;
  onMenuAction?: (
    key: 'add' | 'edit' | 'delete',
    workflow: ApprovalWorkflowItem,
  ) => void;
}

const WorkflowCard: React.FC<WorkflowCardProps> = ({
  workflow,
  onMenuAction,
}) => {
  const canAdd = AccessGuard.checkAccess({
    permissions: [Permissions.CreateApprover],
  });
  const canEdit = AccessGuard.checkAccess({
    permissions: [Permissions.UpdateApprover],
  });
  const canDelete = AccessGuard.checkAccess({
    permissions: [Permissions.DeleteApprover],
  });

  const menuItems: MenuProps['items'] = [
    canAdd
      ? {
          key: 'add',
          label: 'Add Approver',
          icon: <Plus size={14} />,
        }
      : null,
    canEdit
      ? {
          key: 'edit',
          label: 'Edit Approver',
          icon: <Pencil size={14} />,
        }
      : null,
    canDelete
      ? {
          key: 'delete',
          label: 'Delete Workflow',
          icon: <Trash2 size={14} />,
          danger: true,
        }
      : null,
  ].filter(Boolean) as MenuProps['items'];

  const showMenu = (menuItems?.length ?? 0) > 0 && onMenuAction;

  return (
    <div
      className="bg-white p-4 w-full rounded-2xl border-[1px] border-[#D9D9D9]"
      data-cy={`recruitment-approval-workflow-card-${workflow.id}`}
    >
      <div
        data-cy="recruitment-approval-workflow-card-header"
        className="flex items-start justify-between gap-3"
      >
        <div
          className="font-bold text-black opacity-70 text-sm"
          data-cy={`recruitment-approval-workflow-card-title-${workflow.id}`}
        >
          {workflow.name}
        </div>

        {showMenu ? (
          <Dropdown
            trigger={['click']}
            placement="bottomRight"
            overlayClassName="recruitment-settings-dropdown-overlay"
            menu={{
              items: menuItems,
              onClick: ({ key }) => {
                onMenuAction(key as 'add' | 'edit' | 'delete', workflow);
              },
            }}
          >
            <button
              type="button"
              className="recruitment-settings-more-btn p-1 text-gray-500 shrink-0"
              data-cy={`recruitment-approval-workflow-card-menu-${workflow.id}`}
              aria-label="More options"
            >
              <MoreHorizontal size={18} />
            </button>
          </Dropdown>
        ) : null}
      </div>

      <div
        data-cy="recruitment-approval-workflow-card-footer"
        className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
      >
        <span
          className="text-black opacity-70 shrink-0 font-normal text-xs border border-[#D9D9D9] p-1 rounded-md"
          data-cy={`recruitment-approval-workflow-card-level-${workflow.id}`}
        >
          Level: {workflow.level}
        </span>
        <div
          className="flex flex-wrap gap-2 sm:justify-end"
          data-cy={`recruitment-approval-workflow-card-assignees-${workflow.id}`}
        >
          {workflow.assignees.map((assignee) => (
            <span
              key={assignee.id}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-[#f8f8f8] px-2 py-1"
              data-cy={`recruitment-approval-workflow-card-assignee-${workflow.id}-${assignee.id}`}
            >
              <span
                data-cy="recruitment-approval-workflow-card-assignee-avatar"
                className="relative h-5 w-5 overflow-hidden rounded-full shrink-0"
              >
                <Image unoptimized
                  src={GENDER_NEUTRAL_AVATAR_URL}
                  alt={assignee.name}
                  fill
                  className="object-cover"
                />
              </span>
              <span
                data-cy="recruitment-approval-workflow-card-assignee-name"
                className="text-sm text-gray-900 whitespace-nowrap"
              >
                {assignee.name}
              </span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WorkflowCard;
