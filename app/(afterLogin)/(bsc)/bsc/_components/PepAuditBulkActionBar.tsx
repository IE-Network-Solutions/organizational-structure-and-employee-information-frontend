'use client';

import React from 'react';
import { Button } from 'antd';
import { CheckOutlined } from '@ant-design/icons';

type Props = {
  selectedCount: number;
  onApprove: () => void;
  onClear: () => void;
  loading?: boolean;
  dataCy?: string;
  variant?: 'bar' | 'inline';
  /** Match Export toolbar button (default outlined + icon). */
  approveAppearance?: 'primary' | 'toolbar';
};

export default function PepAuditBulkActionBar({
  selectedCount,
  onApprove,
  onClear,
  loading = false,
  dataCy = 'bsc-pep-audit-bulk-bar',
  variant = 'bar',
  approveAppearance = 'primary',
}: Props) {
  if (selectedCount <= 0) return null;

  const approveButton =
    approveAppearance === 'toolbar' ? (
      <Button
        icon={<CheckOutlined />}
        loading={loading}
        onClick={onApprove}
        data-cy={`${dataCy}-approve`}
      >
        Approve ({selectedCount})
      </Button>
    ) : (
      <Button
        type="primary"
        loading={loading}
        onClick={onApprove}
        className="bg-okr-primary border-okr-primary"
        data-cy={`${dataCy}-approve`}
      >
        Approve selected ({selectedCount})
      </Button>
    );

  const actions = (
    <>
      {approveButton}
      <Button onClick={onClear} disabled={loading} data-cy={`${dataCy}-clear`}>
        Clear
      </Button>
    </>
  );

  if (variant === 'inline') {
    return actions;
  }

  return (
    <div
      className="flex flex-wrap items-center justify-end gap-2"
      data-cy={dataCy}
    >
      {actions}
    </div>
  );
}
