'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Button,
  Input,
  Modal,
  Popconfirm,
  Table,
  Tag,
  notification,
} from 'antd';
import { CheckOutlined } from '@ant-design/icons';
import type { TableColumnsType } from '@/types/table/table';
import CustomPagination from '@/components/customPagination';
import {
  type MockApprovalRow,
  type MockApprovalStatus,
} from '@/config/homeApprovalsMock';
import dayjs from 'dayjs';

const STATUS_THEME: Record<
  MockApprovalStatus,
  { label: string; color: string }
> = {
  pending: { label: 'Pending', color: 'gold' },
  approved: { label: 'Approved', color: 'green' },
  rejected: { label: 'Rejected', color: 'red' },
};

type ActionVariant = 'payroll' | 'inbox';

type MockApprovalInboxTableProps = {
  rows: MockApprovalRow[];
  inboxLabel: string;
  dataCyPrefix: string;
  hidePrototypeNote?: boolean;
  actionVariant?: ActionVariant;
};

type PendingAction = {
  row: MockApprovalRow;
};

export default function MockApprovalInboxTable({
  rows,
  inboxLabel,
  dataCyPrefix,
  hidePrototypeNote = false,
  actionVariant = 'inbox',
}: MockApprovalInboxTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [localRows, setLocalRows] = useState(rows);
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(
    null,
  );
  const [rejectComment, setRejectComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setLocalRows(rows);
  }, [rows]);

  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return localRows.slice(start, start + pageSize);
  }, [localRows, currentPage, pageSize]);

  const payrollApprovableRowId = useMemo(() => {
    if (actionVariant !== 'payroll') return null;
    return localRows.find((row) => row.status === 'pending')?.id ?? null;
  }, [actionVariant, localRows]);

  const requestLabel = actionVariant === 'payroll' ? 'payroll run' : 'request';

  const closeModal = () => {
    setPendingAction(null);
    setRejectComment('');
    setIsSubmitting(false);
  };

  const applyStatus = (rowId: string, status: MockApprovalStatus) => {
    setLocalRows((prev) =>
      prev.map((row) => (row.id === rowId ? { ...row, status } : row)),
    );
  };

  const handleApprove = (row: MockApprovalRow) => {
    setIsSubmitting(true);
    applyStatus(row.id, 'approved');
    notification.success({
      message:
        actionVariant === 'payroll' ? 'Payroll Approved' : 'Request Approved',
      description:
        actionVariant === 'payroll'
          ? `${row.employeeName} has been approved.`
          : `${row.employeeName}'s ${requestLabel} has been approved.`,
    });
    closeModal();
  };

  const handleReject = (row: MockApprovalRow) => {
    if (!rejectComment.trim()) return;

    setIsSubmitting(true);
    applyStatus(row.id, 'rejected');
    notification.success({
      message:
        actionVariant === 'payroll' ? 'Payroll Rejected' : 'Request Rejected',
      description:
        actionVariant === 'payroll'
          ? `${row.employeeName} has been rejected.`
          : `${row.employeeName}'s ${requestLabel} has been rejected.`,
    });
    closeModal();
  };

  const renderPayrollActions = (row: MockApprovalRow) => {
    if (row.id !== payrollApprovableRowId) {
      return (
        <span
          className="text-sm text-gray-400"
          data-cy={`${dataCyPrefix}-cell-actions-empty-${row.id}`}
        >
          —
        </span>
      );
    }

    return (
      <div
        className="flex flex-wrap gap-2"
        data-cy={`${dataCyPrefix}-cell-actions-${row.id}`}
      >
        <Button
          type="primary"
          icon={<CheckOutlined />}
          className="!h-9"
          onClick={() => setPendingAction({ row })}
          data-cy={`${dataCyPrefix}-approve-button-${row.id}`}
        >
          Approve
        </Button>
      </div>
    );
  };

  const renderInboxActions = (row: MockApprovalRow) => (
    <div
      className="flex flex-wrap gap-4"
      data-cy={`${dataCyPrefix}-cell-actions-${row.id}`}
    >
      <Popconfirm
        title="Approve Request"
        description={`Are you sure to approve this ${requestLabel}?`}
        onConfirm={() => handleApprove(row)}
        okText="Approve"
        cancelText="Cancel"
        data-cy={`${dataCyPrefix}-approve-popconfirm-${row.id}`}
      >
        <Button
          type="primary"
          data-cy={`${dataCyPrefix}-approve-button-${row.id}`}
        >
          Approve
        </Button>
      </Popconfirm>
      <Popconfirm
        title="Reject Request"
        description={
          <>
            <p data-cy={`${dataCyPrefix}-reject-popconfirm-text-${row.id}`}>
              {`Are you sure you want to reject this ${requestLabel}?`}
            </p>
            <Input
              placeholder="Add a comment"
              value={rejectComment}
              onChange={(event) => setRejectComment(event.target.value)}
              className="mt-2"
              data-cy={`${dataCyPrefix}-reject-comment-${row.id}`}
            />
          </>
        }
        onConfirm={() => {
          if (!rejectComment.trim()) return;
          handleReject(row);
        }}
        onCancel={() => setRejectComment('')}
        okText="Reject"
        cancelText="Cancel"
        okButtonProps={{ disabled: !rejectComment.trim() }}
        data-cy={`${dataCyPrefix}-reject-popconfirm-${row.id}`}
      >
        <Button danger data-cy={`${dataCyPrefix}-reject-button-${row.id}`}>
          Reject
        </Button>
      </Popconfirm>
    </div>
  );

  const columns: TableColumnsType<MockApprovalRow> = [
    {
      title: 'Employee',
      dataIndex: 'employeeName',
      key: 'employeeName',
      render: (name: string) => (
        <span
          className="text-sm font-medium text-gray-900"
          data-cy={`${dataCyPrefix}-cell-employee`}
        >
          {name}
        </span>
      ),
    },
    {
      title: 'Type',
      dataIndex: 'typeLabel',
      key: 'typeLabel',
      width: 140,
      render: (type: string) => (
        <span
          className="text-sm text-gray-600"
          data-cy={`${dataCyPrefix}-cell-type`}
        >
          {type}
        </span>
      ),
    },
    {
      title: 'Summary',
      dataIndex: 'summary',
      key: 'summary',
      render: (summary: string) => (
        <span
          className="text-sm text-gray-700"
          data-cy={`${dataCyPrefix}-cell-summary`}
        >
          {summary}
        </span>
      ),
    },
    {
      title: 'Requested',
      dataIndex: 'requestedAt',
      key: 'requestedAt',
      width: 130,
      render: (date: string) => (
        <span
          className="text-sm text-gray-600 whitespace-nowrap"
          data-cy={`${dataCyPrefix}-cell-requested`}
        >
          {dayjs(date).format('MMM D, YYYY')}
        </span>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 110,
      render: (status: MockApprovalStatus) => (
        <Tag
          color={STATUS_THEME[status].color}
          data-cy={`${dataCyPrefix}-cell-status`}
        >
          {STATUS_THEME[status].label}
        </Tag>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      width: actionVariant === 'payroll' ? 140 : 200,
      render: (unusedAction: unknown, row) =>
        row.status === 'pending' ? (
          actionVariant === 'payroll' ? (
            renderPayrollActions(row)
          ) : (
            renderInboxActions(row)
          )
        ) : (
          <Tag
            color={STATUS_THEME[row.status].color}
            className="m-0"
            data-cy={`${dataCyPrefix}-cell-action-status-${row.id}`}
          >
            {STATUS_THEME[row.status].label}
          </Tag>
        ),
    },
  ];

  const activeRow = pendingAction?.row;

  return (
    <>
      <div
        className="min-w-0 max-w-full w-full rounded-lg border border-[#E5E7EB] bg-white shadow-none"
        data-cy={`${dataCyPrefix}-wrap`}
      >
        <div
          className="border-b border-[#E5E7EB] px-4 py-3"
          data-cy={`${dataCyPrefix}-header`}
        >
          <p
            className="text-sm font-semibold text-gray-900"
            data-cy={`${dataCyPrefix}-title`}
          >
            {inboxLabel}
          </p>
          {!hidePrototypeNote ? (
            <p
              className="text-xs text-gray-500"
              data-cy={`${dataCyPrefix}-subtitle`}
            >
              Prototype inbox — actions update locally until backend is
              connected
            </p>
          ) : null}
        </div>
        <Table<MockApprovalRow>
          rowKey="id"
          columns={columns}
          dataSource={paginatedRows}
          pagination={false}
          scroll={{ x: 960 }}
          className="px-1 pb-2"
          data-cy={`${dataCyPrefix}-table`}
        />
        <div className="px-3 pb-3" data-cy={`${dataCyPrefix}-pagination-wrap`}>
          <CustomPagination
            current={currentPage}
            total={localRows.length}
            pageSize={pageSize}
            onChange={(page, size) => {
              setCurrentPage(page);
              setPageSize(size);
            }}
            onShowSizeChange={(size) => {
              setPageSize(size);
              setCurrentPage(1);
            }}
            data-cy={`${dataCyPrefix}-pagination`}
          />
        </div>
      </div>

      <Modal
        open={Boolean(activeRow && actionVariant === 'payroll')}
        onCancel={closeModal}
        footer={null}
        centered
        width={600}
        data-cy={`${dataCyPrefix}-approve-modal`}
      >
        <div
          className="flex flex-col items-center justify-center gap-4"
          data-cy={`${dataCyPrefix}-approve-modal-content`}
        >
          <h2
            className="text-2xl font-bold"
            data-cy={`${dataCyPrefix}-approve-modal-title`}
          >
            Approve Payroll
          </h2>
          <p
            className="text-lg text-gray-600 text-center"
            data-cy={`${dataCyPrefix}-approve-modal-description`}
          >
            Do you wish to approve payroll for {activeRow?.employeeName}?
          </p>
          <div
            className="mt-4 flex w-full justify-center gap-4"
            data-cy={`${dataCyPrefix}-approve-modal-actions`}
          >
            <Button
              className="h-12 w-full text-lg font-semibold"
              onClick={closeModal}
              data-cy={`${dataCyPrefix}-approve-modal-cancel`}
            >
              Cancel
            </Button>
            <Button
              type="primary"
              className="h-12 w-full bg-primary text-lg font-semibold"
              onClick={() => activeRow && handleApprove(activeRow)}
              loading={isSubmitting}
              data-cy={`${dataCyPrefix}-approve-modal-confirm`}
            >
              Approve
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
