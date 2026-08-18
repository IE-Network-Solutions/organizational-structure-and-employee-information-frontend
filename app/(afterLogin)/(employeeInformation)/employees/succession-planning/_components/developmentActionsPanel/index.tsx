'use client';
import React, { useEffect, useState } from 'react';
import { Button, Empty, Select, Table } from 'antd';
import type { TableColumnsType } from 'antd';
import dayjs from 'dayjs';
import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import DeleteModal from '@/components/common/deleteConfirmationModal';
import type {
  CompetencyGap,
  DevelopmentAction,
  DevelopmentActionStatus,
} from '../successionTypes';
import DevelopmentActionModal, {
  type DevelopmentActionFormValues,
} from '../developmentActionModal';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';

const ACTION_STATUS_OPTIONS: {
  value: DevelopmentActionStatus;
  label: string;
}[] = [
  { value: 'Not Started', label: 'Not Started' },
  { value: 'In Progress', label: 'In Progress' },
  { value: 'Completed', label: 'Completed' },
  { value: 'Overdue', label: 'Overdue' },
];

interface DevelopmentActionsPanelProps {
  actions: DevelopmentAction[];
  gaps: CompetencyGap[];
  onAdd: (action: Omit<DevelopmentAction, 'id'>) => void;
  onUpdate: (actionId: string, patch: Partial<DevelopmentAction>) => void;
  onDelete: (actionId: string) => void;
  /** Hide the in-panel Add button when the parent renders it in the tab bar. */
  hideAddButton?: boolean;
  /** Increment to open the create modal from outside (e.g. tab bar). */
  openCreateKey?: number;
}

const DevelopmentActionsPanel: React.FC<DevelopmentActionsPanelProps> = ({
  actions,
  gaps,
  onAdd,
  onUpdate,
  onDelete,
  hideAddButton = false,
  openCreateKey = 0,
}) => {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<DevelopmentAction | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const canManageSuccessorDevelopment = AccessGuard.checkAccess({
    permissions: [Permissions.ManageSuccessorDevelopment],
  });

  const openCreate = () => {
    if (!canManageSuccessorDevelopment) return;

    setEditing(null);
    setOpen(true);
  };

  useEffect(() => {
    if (canManageSuccessorDevelopment && openCreateKey > 0) {
      setEditing(null);
      setOpen(true);
    }
  }, [openCreateKey, canManageSuccessorDevelopment]);

  const openEdit = (action: DevelopmentAction) => {
    if (!canManageSuccessorDevelopment) return;

    setEditing(action);
    setOpen(true);
  };

  const handleSave = (payload: DevelopmentActionFormValues) => {
    if (!canManageSuccessorDevelopment) return;

    const withCompletion: DevelopmentActionFormValues =
      payload.status === 'Completed'
        ? {
            ...payload,
            completionDate:
              payload.completionDate ?? dayjs().format('YYYY-MM-DD'),
          }
        : { ...payload, completionDate: undefined };

    if (editing) {
      onUpdate(editing.id, withCompletion);
    } else {
      onAdd(withCompletion);
    }
    setOpen(false);
    setEditing(null);
  };

  const handleStatusChange = (
    action: DevelopmentAction,
    status: DevelopmentActionStatus,
  ) => {
    if (!canManageSuccessorDevelopment) return;

    if (status === 'Completed') {
      onUpdate(action.id, {
        status: 'Completed',
        completionDate: dayjs().format('YYYY-MM-DD'),
      });
      return;
    }
    onUpdate(action.id, {
      status,
      completionDate: undefined,
    });
  };

  const confirmDelete = () => {
    if (!canManageSuccessorDevelopment) return;

    if (deleteTargetId) {
      onDelete(deleteTargetId);
    }
    setDeleteTargetId(null);
  };

  const gapLabel = (gapId?: string) =>
    gaps.find((g) => g.id === gapId)?.competencyName;

  const columns: TableColumnsType<DevelopmentAction> = [
    {
      title: (
        <span className="text-[#4d4d4d] text-sm font-bold">Action Item</span>
      ),
      dataIndex: 'actionItem',
      ellipsis: true,
      render: (value: string, record) => (
        <div>
          {canManageSuccessorDevelopment ? (
            <button
              type="button"
              className="text-left text-sm font-medium text-primary hover:underline"
              onClick={() => openEdit(record)}
            >
              {value}
            </button>
          ) : (
            <span
              className="text-sm font-medium text-[#4d4d4d]"
              data-cy={`development-action-readonly-${record.id}`}
            >
              {value}
            </span>
          )}
          {record.gapId ? (
            <div className="text-xs text-gray-400 mt-0.5">
              Gap: {gapLabel(record.gapId) ?? 'Linked'}
            </div>
          ) : null}
        </div>
      ),
    },
    {
      title: (
        <span className="text-[#4d4d4d] text-sm font-bold">Responsible</span>
      ),
      dataIndex: 'responsiblePersonName',
      width: 140,
      render: (value: string) => (
        <span className="text-sm text-[#4d4d4d]">{value}</span>
      ),
    },
    {
      title: <span className="text-[#4d4d4d] text-sm font-bold">Target</span>,
      dataIndex: 'targetCompletionDate',
      width: 110,
      render: (value: string) => (
        <span className="text-sm text-[#4d4d4d] tabular-nums">
          {value || '—'}
        </span>
      ),
    },
    {
      title: <span className="text-[#4d4d4d] text-sm font-bold">Status</span>,
      key: 'status',
      width: 150,
      render: (_: unknown, record) => (
        <Select
          size="small"
          className="w-full min-w-[130px]"
          value={record.status}
          disabled={!canManageSuccessorDevelopment}
          onChange={(status) => handleStatusChange(record, status)}
          options={ACTION_STATUS_OPTIONS}
          data-cy={`action-status-${record.id}`}
        />
      ),
    },
    {
      title: (
        <span className="text-[#4d4d4d] text-sm font-bold">Completed</span>
      ),
      dataIndex: 'completionDate',
      width: 110,
      render: (value?: string) => (
        <span className="text-sm text-[#4d4d4d] tabular-nums">
          {value || '—'}
        </span>
      ),
    },
    ...(canManageSuccessorDevelopment
      ? [
          {
            title: '',
            key: 'delete',
            dataIndex: 'id',
            width: 48,
            render: (actionId: string) => (
              <Button
                type="text"
                danger
                size="small"
                icon={<DeleteOutlineOutlinedIcon style={{ fontSize: 18 }} />}
                onClick={() => {
                  if (canManageSuccessorDevelopment) {
                    setDeleteTargetId(actionId);
                  }
                }}
                aria-label="Delete action"
                data-cy={`delete-action-${actionId}`}
              />
            ),
          },
        ]
      : []),
  ];

  return (
    <div className="flex flex-col gap-3" data-cy="development-actions-panel">
      {!hideAddButton && canManageSuccessorDevelopment ? (
        <div className="flex justify-end">
          <Button
            type="primary"
            size="small"
            icon={<AddCircleOutlineOutlinedIcon style={{ fontSize: 16 }} />}
            onClick={openCreate}
            className="h-8 font-normal"
            data-cy="add-development-action-btn"
          >
            Add action
          </Button>
        </div>
      ) : null}
      <Table
        columns={columns}
        dataSource={actions}
        rowKey="id"
        pagination={false}
        size="small"
        locale={{
          emptyText: (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                canManageSuccessorDevelopment
                  ? 'No development actions yet. Define actions from Gaps or add one here.'
                  : 'No development actions have been defined.'
              }
            />
          ),
        }}
        rowClassName={(_, index) =>
          index % 2 === 0 ? 'bg-white' : 'bg-[#FAFAFA]'
        }
        data-cy="development-actions-table"
      />

      <DevelopmentActionModal
        open={open && canManageSuccessorDevelopment}
        editing={editing}
        gaps={gaps}
        onClose={() => {
          setOpen(false);
          setEditing(null);
        }}
        onSave={handleSave}
      />

      <DeleteModal
        open={canManageSuccessorDevelopment && deleteTargetId !== null}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTargetId(null)}
        title="Delete Development Action"
        deleteMessage="Are you sure you want to delete this development action? This action cannot be undone."
        hideImage
        danger
        loading={false}
        data-cy="development-action-delete-modal"
      />
    </div>
  );
};

export default DevelopmentActionsPanel;
