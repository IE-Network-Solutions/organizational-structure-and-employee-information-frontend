'use client';
import React, { useState } from 'react';
import { Table, Empty } from 'antd';
import type { TableColumnsType } from 'antd';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import StatusBadge, {
  StatusBadgeTheme,
} from '@/components/common/statusBadge/statusBadge';
import ActionButtons from '@/components/common/actionButton/actionButtons';
import DeleteModal from '@/components/common/deleteConfirmationModal';
import { CriticalRole } from '../criticalRoleModal';

interface CriticalRolesTableProps {
  roles: CriticalRole[];
  loading?: boolean;
  onEdit: (role: CriticalRole) => void;
  onDelete: (id: string) => void;
}

/** Map risk → StatusBadgeTheme */
const riskTheme: Record<CriticalRole['riskLevel'], StatusBadgeTheme> = {
  High: StatusBadgeTheme.danger,
  Medium: StatusBadgeTheme.warning,
  Low: StatusBadgeTheme.success,
};

const headerClass = 'text-[#4d4d4d] text-sm font-bold';

const CriticalRolesTable: React.FC<CriticalRolesTableProps> = ({
  roles,
  loading = false,
  onEdit,
  onDelete,
}) => {
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const confirmDelete = () => {
    if (deleteTargetId) {
      onDelete(deleteTargetId);
    }
    setDeleteTargetId(null);
  };

  const columns: TableColumnsType<CriticalRole> = [
    {
      title: <span className={headerClass}>Role Name</span>,
      dataIndex: 'roleName',
      key: 'roleName',
      ellipsis: true,
      render: (value: string) => (
        <span
          className="text-gray-800 text-sm font-medium"
          data-cy="critical-role-row-name"
        >
          {value}
        </span>
      ),
    },
    {
      title: <span className={headerClass}>Department</span>,
      dataIndex: 'department',
      key: 'department',
      ellipsis: true,
      render: (value: string) => (
        <span
          className="text-[#4d4d4d] text-sm"
          data-cy="critical-role-row-department"
        >
          {value}
        </span>
      ),
    },
    {
      title: <span className={headerClass}>Risk Level</span>,
      dataIndex: 'riskLevel',
      key: 'riskLevel',
      width: 120,
      render: (value: CriticalRole['riskLevel']) => (
        <StatusBadge theme={riskTheme[value]}>
          <span data-cy="critical-role-row-risk">{value}</span>
        </StatusBadge>
      ),
    },
    {
      title: <span className={headerClass}>Successors</span>,
      dataIndex: 'successorCount',
      key: 'successorCount',
      width: 120,
      render: (value: number) => (
        <div
          className="flex items-center gap-1.5 text-[#4d4d4d] text-sm"
          data-cy="critical-role-row-successors"
        >
          <PeopleAltOutlinedIcon fontSize="small" className="text-gray-400" />
          <span>{value}</span>
        </div>
      ),
    },
    {
      title: <span className={headerClass}>Notes</span>,
      dataIndex: 'notes',
      key: 'notes',
      ellipsis: true,
      render: (value: string) => (
        <span
          className="text-gray-500 text-sm"
          data-cy="critical-role-row-notes"
        >
          {value || '—'}
        </span>
      ),
    },
    {
      title: <span className={headerClass}>Actions</span>,
      key: 'actions',
      width: 100,
      fixed: 'right' as const,
      render: (_: unknown, record: CriticalRole) => (
        <ActionButtons
          id={record.id}
          onEdit={() => onEdit(record)}
          onDelete={() => setDeleteTargetId(record.id)}
        />
      ),
    },
  ];

  return (
    <div data-cy="critical-roles-table-wrapper">
      <Table
        columns={columns}
        dataSource={roles}
        rowKey="id"
        loading={loading}
        pagination={
          roles.length > 10
            ? { pageSize: 10, showSizeChanger: false, size: 'small' }
            : false
        }
        scroll={{ x: 800 }}
        locale={{
          emptyText: (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <span
                  className="text-gray-400 text-sm"
                  data-cy="critical-roles-table-empty"
                >
                  No critical roles defined yet. Add one to get started.
                </span>
              }
            />
          ),
        }}
        rowClassName={(_, index) =>
          index % 2 === 0 ? 'bg-white' : 'bg-[#FAFAFA]'
        }
        data-cy="critical-roles-table"
      />

      {/* Delete confirmation — uses the project's shared DeleteModal */}
      <DeleteModal
        open={deleteTargetId !== null}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTargetId(null)}
        title="Delete Critical Role"
        deleteMessage="Are you sure you want to delete this critical role? This action cannot be undone."
        hideImage
        danger
        loading={false}
        data-cy="critical-role-delete-modal"
      />
    </div>
  );
};

export default CriticalRolesTable;
