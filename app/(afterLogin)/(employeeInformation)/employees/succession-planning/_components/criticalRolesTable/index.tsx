'use client';
import React, { useMemo, useState } from 'react';
import { Button, Dropdown, Empty, Table, Tag } from 'antd';
import type { MenuProps, TableColumnsType } from 'antd';
import ChecklistOutlinedIcon from '@mui/icons-material/ChecklistOutlined';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import DeleteModal from '@/components/common/deleteConfirmationModal';
import { CustomMobilePagination } from '@/components/customPagination/mobilePagination';
import CustomPagination from '@/components/customPagination';
import { useIsMobile } from '@/hooks/useIsMobile';
import { CriticalRole } from '../criticalRoleModal';
import { priorityColor } from '../tagColors';
import { roleSuccessorCount } from '../successionKpis';

interface CriticalRolesTableProps {
  roles: CriticalRole[];
  loading?: boolean;
  onEdit: (role: CriticalRole) => void;
  onDelete: (id: string) => void;
  onRowClick?: (role: CriticalRole) => void;
}

const headerClass = 'text-[#4d4d4d] text-base font-bold whitespace-nowrap';
const PAGE_SIZE = 10;

const CriticalRolesTable: React.FC<CriticalRolesTableProps> = ({
  roles,
  loading = false,
  onEdit,
  onDelete,
  onRowClick,
}) => {
  const { isMobile, isTablet } = useIsMobile();
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE);

  const confirmDelete = () => {
    if (deleteTargetId) {
      onDelete(deleteTargetId);
    }
    setDeleteTargetId(null);
  };

  const getActionMenuItems = (record: CriticalRole): MenuProps['items'] => [
    {
      key: 'edit',
      label: (
        <div
          className="flex items-center gap-2"
          onClick={() => onEdit(record)}
          data-cy={`critical-role-edit-menu-item-${record.id}`}
        >
          <EditOutlinedIcon className="text-gray-600" fontSize="small" />
          <span className="text-sm text-gray-700">Edit</span>
        </div>
      ),
    },
    {
      key: 'delete',
      label: (
        <div
          className="flex items-center gap-2 text-red-600"
          onClick={() => setDeleteTargetId(record.id)}
          data-cy={`critical-role-delete-menu-item-${record.id}`}
        >
          <DeleteOutlineOutlinedIcon fontSize="small" />
          <span className="text-sm">Delete</span>
        </div>
      ),
    },
  ];

  const baseColumns: TableColumnsType<CriticalRole> = useMemo(
    () => [
      {
        title: <span className={headerClass}>Role Name</span>,
        dataIndex: 'roleName',
        key: 'roleName',
        ellipsis: true,
        width: '18%',
        render: (value: string) => (
          <span
            className="text-gray-800 text-sm font-medium hover:text-primary"
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
        width: '14%',
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
        title: <span className={headerClass}>Priority</span>,
        dataIndex: 'priority',
        key: 'priority',
        width: '12%',
        render: (value: CriticalRole['priority']) => (
          <Tag color={priorityColor[value]} className="m-0">
            <span data-cy="critical-role-row-priority">{value}</span>
          </Tag>
        ),
      },
      {
        title: <span className={headerClass}>Competencies</span>,
        key: 'competencies',
        dataIndex: 'competencies',
        width: '12%',
        render: (_: unknown, record: CriticalRole) => (
          <div
            className="flex items-center gap-1.5 text-[#4d4d4d] text-sm"
            data-cy="critical-role-row-competencies"
          >
            <ChecklistOutlinedIcon fontSize="small" className="text-gray-400" />
            <span>{record.competencies?.length ?? 0}</span>
          </div>
        ),
      },
      {
        title: <span className={headerClass}>Successors</span>,
        key: 'successors',
        dataIndex: 'successors',
        width: '12%',
        render: (_: unknown, record: CriticalRole) => (
          <div
            className="flex items-center gap-1.5 text-[#4d4d4d] text-sm"
            data-cy="critical-role-row-successors"
          >
            <PeopleAltOutlinedIcon fontSize="small" className="text-gray-400" />
            <span>
              {roleSuccessorCount(record)}
            </span>
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
        title: (
          <span
            className="text-[#4d4d4d] text-xs font-bold whitespace-nowrap"
            title="Actions"
          >
            Actions
          </span>
        ),
        key: 'actions',
        width: 52,
        align: 'center' as const,
        className: 'critical-roles-actions-col',
        onHeaderCell: () => ({
          className: 'critical-roles-actions-col',
        }),
        onCell: () => ({
          className: 'critical-roles-actions-col',
        }),
        render: (_: unknown, record: CriticalRole) => (
          <div
            className="flex justify-center"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
            data-cy={`critical-role-actions-${record.id}`}
          >
            <Dropdown
              menu={{ items: getActionMenuItems(record) }}
              trigger={['click']}
              placement="bottomRight"
            >
              <Button
                type="text"
                icon={<MoreHorizIcon style={{ fontSize: 18 }} />}
                className="!w-8 !h-8 !p-0 leading-none flex items-center justify-center !bg-transparent [&_.ant-btn-icon]:m-0 [&_.ant-btn-icon]:leading-none"
                aria-label="More actions"
                data-cy={`critical-role-menu-btn-${record.id}`}
              />
            </Dropdown>
          </div>
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [onEdit],
  );

  const columns = isMobile
    ? baseColumns.filter((col) => {
        if (!('dataIndex' in col) || !col.dataIndex) {
          return col.key === 'actions';
        }
        return (
          col.dataIndex === 'roleName' ||
          col.dataIndex === 'department' ||
          col.dataIndex === 'priority'
        );
      })
    : baseColumns;

  const pagedRoles = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return roles.slice(start, start + pageSize);
  }, [roles, currentPage, pageSize]);

  // Reset to page 1 when filter results shrink below current page
  React.useEffect(() => {
    const maxPage = Math.max(1, Math.ceil(roles.length / pageSize) || 1);
    if (currentPage > maxPage) {
      setCurrentPage(maxPage);
    }
  }, [roles.length, pageSize, currentPage]);

  const onPageChange = (page: number, nextPageSize?: number) => {
    setCurrentPage(page);
    if (nextPageSize) {
      setPageSize(nextPageSize);
    }
  };

  return (
    <div className="mt-2" data-cy="critical-roles-table-wrapper">
      <Table
        className="critical-roles-table"
        columns={columns}
        dataSource={pagedRoles}
        rowKey="id"
        loading={loading}
        pagination={false}
        tableLayout="fixed"
        scroll={isMobile ? { x: 'max-content' } : undefined}
        onRow={
          onRowClick
            ? (record) => ({
                onClick: () => onRowClick(record),
                className: 'cursor-pointer',
              })
            : undefined
        }
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
      <style>{`
        .critical-roles-table .critical-roles-actions-col {
          width: 52px !important;
          min-width: 52px !important;
          max-width: 52px !important;
          padding-left: 4px !important;
          padding-right: 4px !important;
          white-space: nowrap;
          overflow: hidden;
        }
      `}</style>

      {roles.length > 0 &&
        (isMobile || isTablet ? (
          <CustomMobilePagination
            totalResults={roles.length}
            pageSize={pageSize}
            currentPage={currentPage}
            onChange={onPageChange}
            onShowSizeChange={onPageChange}
            data-cy="critical-roles-mobile-pagination"
          />
        ) : (
          <CustomPagination
            current={currentPage}
            total={roles.length}
            pageSize={pageSize}
            onChange={onPageChange}
            onShowSizeChange={(size) => {
              setPageSize(size);
              setCurrentPage(1);
            }}
            data-cy="critical-roles-desktop-pagination"
          />
        ))}

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
